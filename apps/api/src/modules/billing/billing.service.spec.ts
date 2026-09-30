import { BillingService } from './billing.service';

describe('BillingService transactional webhook recovery', () => {
  let service: BillingService;
  let tx: any;
  let prisma: any;
  let event: any;
  beforeEach(() => {
    tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ key: 'claimed' }]),
      subscription: {
        findFirst: jest.fn().mockResolvedValue({ id: 'sub-local' }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        upsert: jest.fn().mockResolvedValue({}),
      },
      tenant: { update: jest.fn().mockResolvedValue({}) },
    };
    prisma = { $transaction: jest.fn((work: any) => work(tx)) };
    service = new BillingService({ get: () => 'test-key' } as any, prisma);
    event = {
      id: 'evt-1', type: 'invoice.payment_succeeded', data: { object: {
        id: 'inv-1', subscription: 'sub-1', billing_reason: 'subscription_cycle',
        lines: { data: [{ period: { start: 100, end: 200 } }] },
      } },
    };
    (service as any).stripe = { webhooks: { constructEvent: () => event } };
  });

  it('does not acknowledge a failed effect; retry performs the transaction again', async () => {
    tx.subscription.updateMany.mockRejectedValueOnce(new Error('database unavailable'));
    await expect(service.handleWebhook('body', 'sig')).rejects.toThrow('database unavailable');
    await expect(service.handleWebhook('body', 'sig')).resolves.toEqual({ received: true });
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    expect(tx.subscription.updateMany).toHaveBeenCalledTimes(2);
  });

  it('acknowledges a committed duplicate without replaying its effect', async () => {
    tx.$queryRaw.mockResolvedValueOnce([]);
    await expect(service.handleWebhook('body', 'sig')).resolves.toMatchObject({ deduplicated: true });
    expect(tx.subscription.updateMany).not.toHaveBeenCalled();
  });

  it('deduplicates separate event IDs representing the same invoice', async () => {
    tx.$queryRaw.mockResolvedValueOnce([{ key: 'event:new' }]).mockResolvedValueOnce([]);
    await service.handleWebhook('body', 'sig');
    expect(tx.subscription.updateMany).not.toHaveBeenCalled();
  });

  it('conditions period advancement atomically and never reactivates a cancelled subscription', async () => {
    await service.handleWebhook('body', 'sig');
    const args = tx.subscription.updateMany.mock.calls[0][0];
    expect(args.where).toEqual({ stripeSubId: 'sub-1', OR: [
      { currentPeriodStart: null }, { currentPeriodStart: { lt: new Date(100000) } },
    ] });
    expect(args.data.status).toBeUndefined();
  });

  it('leaves an out-of-order renewal retryable until its subscription exists', async () => {
    tx.subscription.findFirst.mockResolvedValue(null);
    await expect(service.handleWebhook('body', 'sig')).rejects.toMatchObject({ status: 503 });
    expect(tx.subscription.updateMany).not.toHaveBeenCalled();
  });

  it('rejects missing period rather than resetting usage using the current date', async () => {
    event.data.object.lines = undefined;
    await expect(service.handleWebhook('body', 'sig')).rejects.toMatchObject({ status: 400 });
    expect(tx.subscription.updateMany).not.toHaveBeenCalled();
  });

  it('rolls checkout failure out to the caller after the subscription write', async () => {
    event.type = 'checkout.session.completed';
    event.data.object = { metadata: { tenantId: 'tenant-1', plan: 'pro' }, subscription: 'sub-1' };
    tx.tenant.update.mockRejectedValueOnce(new Error('tenant write failed'));
    await expect(service.handleWebhook('body', 'sig')).rejects.toThrow('tenant write failed');
    expect(tx.subscription.upsert).toHaveBeenCalled();
    expect(tx.tenant.update).toHaveBeenCalled();
  });
});
