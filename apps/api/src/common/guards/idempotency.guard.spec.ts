import { IdempotencyGuard } from './idempotency.guard';

describe('IdempotencyGuard', () => {
  let guard: IdempotencyGuard;
  let mockRedis: any;

  beforeEach(() => {
    mockRedis = {
      setNx: jest.fn(),
    };
    guard = new IdempotencyGuard(mockRedis);
  });

  it('should allow first-time webhook request', async () => {
    mockRedis.setNx.mockResolvedValue(true);
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          url: '/v1/whatsapp/webhook',
          headers: { 'x-hub-signature-256': 'sig-123' },
          body: { entry: [{ id: '1' }] },
        }),
        getResponse: () => ({
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        }),
      }),
    };

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should acknowledge duplicate webhook with 200 JSON to prevent Meta retry loop', async () => {
    mockRedis.setNx.mockResolvedValue(false);
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          url: '/v1/whatsapp/webhook',
          headers: { 'x-request-id': 'req-123', 'x-hub-signature-256': 'sig-123' },
          body: { id: 'msg-123' },
        }),
        getResponse: () => mockRes,
      }),
    };

    const result = await guard.canActivate(context);
    expect(result).toBe(false);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'duplicate_acknowledged' }),
    );
  });
});
