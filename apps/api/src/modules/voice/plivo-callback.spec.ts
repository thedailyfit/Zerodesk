import { createHmac } from 'crypto';
import { validPlivoSignature, plivoFollowUpStatus } from './plivo-callback';
import { VoiceService } from './voice.service';

describe('Durable Plivo follow-ups', () => {
  function lifecycle() {
    const row = { id: 'followup', tenantId: 'tenant', phoneNumber: '+15551234567', status: 'PENDING', dispatchStartedAt: null as Date | null, callUuid: null as string | null, providerRequestId: null as string | null };
    const updateMany = jest.fn(async ({ where, data }) => {
      if (where.dispatchStartedAt === null && row.dispatchStartedAt !== null) return { count: 0 };
      if (typeof where.status === 'string' && row.status !== where.status) return { count: 0 };
      if (where.status?.in && !where.status.in.includes(row.status)) return { count: 0 };
      if (where.callUuid === null && row.callUuid !== null) return { count: 0 };
      if (where.OR && !where.OR.some((entry: { callUuid: string | null }) => entry.callUuid === row.callUuid)) return { count: 0 };
      Object.assign(row, data);
      return { count: 1 };
    });
    const service = Object.create(VoiceService.prototype) as VoiceService;
    Object.assign(service, {
      prisma: { outboundFollowUp: { findFirst: jest.fn(async () => ({ ...row })), findUnique: jest.fn(async () => ({ ...row })), updateMany, update: jest.fn(async ({ data }) => Object.assign(row, data)) }, customer: { findFirst: jest.fn().mockResolvedValue(null) } },
      configService: { get: (key: string) => ({ API_URL: 'https://api.example.test', PLIVO_AUTH_ID: 'account', PLIVO_AUTH_TOKEN: 'secret' })[key] },
      getConfig: jest.fn().mockResolvedValue({ isActive: true, plivoPhoneNumber: '+15557654321' }), logger: { error: jest.fn() },
    });
    async function callback(status: string, uuid = 'call-1') {
      const body: Record<string, string> = { CallStatus: status, CallUUID: uuid, BillDuration: '30' };
      const url = 'https://api.example.test/v1/voice/webhook/plivo-status?followUpId=followup';
      const signature = createHmac('sha256', 'secret').update(url + '.' + Object.keys(body).sort().map(key => key + body[key]).join('') + '.nonce').digest('base64');
      return service.handlePlivoStatus(row.id, body, 'nonce', signature);
    }
    return { service, row, callback, updateMany };
  }
  afterEach(() => jest.restoreAllMocks());

  it('retains terminal callbacks that arrive before the REST receipt and persists both UUIDs', async () => {
    const { service, row, callback } = lifecycle();
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(async () => {
      await callback('completed');
      return { ok: true, json: async () => ({ request_uuid: 'request-1' }) } as Response;
    });
    await service.executeOutboundCall('tenant', row.phoneNumber, 'follow-up', row.id);
    expect(row).toMatchObject({ status: 'COMPLETED', callUuid: 'call-1', providerRequestId: 'request-1' });
    await callback('ringing');
    expect(row.status).toBe('COMPLETED');
    await expect(callback('completed', 'wrong-call')).rejects.toThrow('Unknown call');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const request = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(request.hangup_url).toContain('/voice/webhook/plivo-status?followUpId=followup');
  });
  it('keeps ambiguous dispatch claimed and never retries external I/O', async () => {
    const { service, row } = lifecycle();
    const fetchMock = jest.spyOn(global, 'fetch').mockRejectedValue(new Error('timeout'));
    await expect(service.executeOutboundCall('tenant', row.phoneNumber, undefined, row.id)).rejects.toThrow('reconciliation');
    expect(row.status).toBe('PENDING');
    expect(row.dispatchStartedAt).toBeInstanceOf(Date);
    await service.executeOutboundCall('tenant', row.phoneNumber, undefined, row.id);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('records provider rejection as FAILED without inventing a call UUID', async () => {
    const { service, row } = lifecycle();
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false } as Response);
    await expect(service.executeOutboundCall('tenant', row.phoneNumber, undefined, row.id)).rejects.toThrow();
    expect(row).toMatchObject({ status: 'FAILED', callUuid: null, providerRequestId: null });
  });
  it('records invalid callback configuration as FAILED before any external call', async () => {
    const { service, row } = lifecycle();
    Object.assign(service, { configService: { get: (key: string) => ({ PLIVO_AUTH_ID: 'account', PLIVO_AUTH_TOKEN: 'secret' })[key] } });
    const fetchMock = jest.spyOn(global, 'fetch');
    await expect(service.executeOutboundCall('tenant', row.phoneNumber, undefined, row.id)).rejects.toThrow('API_URL');
    expect(row).toMatchObject({ status: 'FAILED', dispatchStartedAt: null });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('does not overwrite a concurrently dispatched call when configuration is disabled', async () => {
    const { service, row } = lifecycle();
    Object.assign(service, { getConfig: jest.fn(async () => {
      row.status = 'COMPLETED';
      row.dispatchStartedAt = new Date();
      return null;
    }) });
    await expect(service.executeOutboundCall('tenant', row.phoneNumber, undefined, row.id)).rejects.toThrow('disabled');
    expect(row.status).toBe('COMPLETED');
  });
  it('authenticates body, callback URL and nonce, including rotating signatures', () => {
    const url = 'https://api.example.test/v1/voice/webhook/plivo-status?followUpId=123';
    const body = { CallUUID: 'call-123', CallStatus: 'completed' };
    const signature = createHmac('sha256', 'secret').update(url + '.CallStatuscompletedCallUUIDcall-123.nonce').digest('base64');
    expect(validPlivoSignature(url, body, 'nonce', `old,${signature}`, 'secret')).toBe(true);
    expect(validPlivoSignature(url, { ...body, CallStatus: 'failed' }, 'nonce', signature, 'secret')).toBe(false);
    expect(validPlivoSignature(url + '4', body, 'nonce', signature, 'secret')).toBe(false);
    expect(validPlivoSignature(url, body, '', signature, 'secret')).toBe(false);
  });
  it('does not confuse ringing or zero-duration hangup with completed conversations', () => {
    expect(plivoFollowUpStatus({ CallStatus: 'ringing' })).toBe('DISPATCHED');
    expect(plivoFollowUpStatus({ CallStatus: 'busy' })).toBe('UNREACHABLE');
    expect(plivoFollowUpStatus({ CallStatus: 'completed', BillDuration: '0' })).toBe('UNREACHABLE');
    expect(plivoFollowUpStatus({ CallStatus: 'completed', BillDuration: '12' })).toBe('COMPLETED');
    expect(plivoFollowUpStatus({ CallStatus: 'failed' })).toBe('FAILED');
  });
  it('never dispatches a previously claimed request again', async () => {
    const service = Object.create(VoiceService.prototype) as VoiceService;
    const record = { id: 'followup', status: 'PENDING', dispatchStartedAt: new Date() };
    Object.assign(service, { prisma: { outboundFollowUp: { findFirst: jest.fn().mockResolvedValue(record) } } });
    await expect(service.executeOutboundCall('tenant', '+15551234567', 'follow-up', 'followup')).resolves.toBe(record);
  });
  it('rejects cross-tenant follow-up reads', async () => {
    const service = Object.create(VoiceService.prototype) as VoiceService;
    const findFirst = jest.fn().mockResolvedValue(null);
    Object.assign(service, { prisma: { outboundFollowUp: { findFirst } } });
    await expect(service.getOutboundJob('tenant-a', 'other-record')).rejects.toThrow('Outbound job not found');
    expect(findFirst).toHaveBeenCalledWith({ where: { id: 'other-record', tenantId: 'tenant-a' } });
  });
});
