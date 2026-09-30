import { VoiceService } from './voice.service';

describe('voice cumulative resource accounting', () => {
  function setup() {
    const ledger = new Map<string, { amount: number }>();
    const subscription = { voiceMinutesUsed: 0, llmTokensUsed: 0, voiceMinutesLimit: 100 };
    const tx = {
      $executeRaw: jest.fn(),
      usageLedger: {
        findUnique: jest.fn(async ({ where }) => ledger.get(JSON.stringify(where))),
        upsert: jest.fn(async ({ where, create, update }) => ledger.set(JSON.stringify(where), { amount: ledger.has(JSON.stringify(where)) ? update.amount : create.amount })),
      },
      subscription: {
        findUnique: jest.fn(async () => ({ ...subscription })),
        update: jest.fn(async ({ data }) => {
          subscription.voiceMinutesUsed += data.voiceMinutesUsed.increment;
          subscription.llmTokensUsed += data.llmTokensUsed.increment;
        }),
      },
    };
    const service: any = Object.create(VoiceService.prototype);
    service.prisma = { $transaction: async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx) };
    service.logger = { log: jest.fn(), warn: jest.fn() };
    service.eventEmitter = { emit: jest.fn() };
    return { service, subscription, tx };
  }

  it('meters later tokens after minutes and ignores repeated or stale totals', async () => {
    const { service, subscription, tx } = setup();
    await service.recordIdempotentUsage('tenant', 'call', 61, 0);
    await service.recordIdempotentUsage('tenant', 'call', 61, 100);
    await service.recordIdempotentUsage('tenant', 'call', 61, 100);
    await service.recordIdempotentUsage('tenant', 'call', 60, 50);
    expect(subscription).toMatchObject({ voiceMinutesUsed: 2, llmTokensUsed: 100 });
    expect(tx.$executeRaw).toHaveBeenCalledTimes(4);
  });

  it('uses room name for the LiveKit SID callback, matching the Python callback', async () => {
    const { service } = setup();
    service.recordCallCompletion = jest.fn();
    await service.handleVoiceCallEnded({ provider: 'livekit', tenantId: 'tenant', callId: 'RM_sid', duration: 61, metadata: { roomName: 'tenant_room' } });
    expect(service.recordCallCompletion.mock.calls[0][3]).toBe('tenant_room');
  });

  it('rejects missing identifiers and nonfinite totals without transactions', async () => {
    const { service, tx } = setup();
    await expect(service.recordIdempotentUsage('tenant', '', 60, 0)).rejects.toThrow('stable call identifier');
    await expect(service.recordIdempotentUsage('tenant', 'call', 60, NaN)).rejects.toThrow('Invalid');
    expect(tx.$executeRaw).not.toHaveBeenCalled();
  });

  it('hides jobs from other tenants and never equates dispatch with call completion', async () => {
    const service: any = Object.create(VoiceService.prototype);
    service.outboundQueue = { getJob: jest.fn(async () => ({ id: 'job', data: { tenantId: 'a' }, getState: async () => 'completed' })) };
    await expect(service.getOutboundJob('b', 'job')).rejects.toThrow('Outbound job not found');
    expect(await service.getOutboundJob('a', 'job')).toMatchObject({ status: 'dispatch_finished', callCompletionVerified: false });
  });
});
