import { AutomationRunService } from './automation-run.service';

describe('durable automation dispatch', () => {
  const workflow = { id: 'flow', definition: { kind: 'sequence', sequence: { nodes: [] } } };
  function setup() {
    const rows = new Map<string, any>();
    const prisma: any = {
      automationRun: {
        create: jest.fn(async ({ data }) => {
          const key = `${data.tenantId}:${data.requestId}`;
          if (rows.has(key)) throw { code: 'P2002' };
          const row = JSON.parse(JSON.stringify({ ...data, id: key, status: 'PENDING' }));
          rows.set(key, row); return row;
        }),
        findUnique: jest.fn(async ({ where }) => rows.get(`${where.tenantId_requestId.tenantId}:${where.tenantId_requestId.requestId}`)),
        update: jest.fn(async ({ where, data }) => Object.assign(rows.get(where.id), data)),
      },
      automationWorkflow: { update: jest.fn() },
    };
    prisma.$transaction = async (fn: any) => fn(prisma);
    const adapter = { hasWorkflowRoute: jest.fn(() => true), triggerTenantWorkflow: jest.fn(async () => ({ success: true })) };
    return { service: new AutomationRunService(prisma, adapter as any), prisma, adapter, rows };
  }
  it('claims durably before dispatch, carries the definition snapshot, and suppresses concurrent duplicates', async () => {
    const { service, adapter, prisma } = setup();
    const results = await Promise.all([service.dispatch('tenant-a', workflow, 'request', {}), service.dispatch('tenant-a', workflow, 'request', {})]);
    expect(adapter.triggerTenantWorkflow).toHaveBeenCalledTimes(1);
    expect(adapter.triggerTenantWorkflow).toHaveBeenCalledWith('tenant-a', 'flow', { execution: { runId: 'tenant-a:request', definition: workflow.definition } });
    expect(results[0]).toMatchObject({ status: 'ACCEPTED', deliveryConfirmed: false });
    expect(prisma.automationWorkflow.update).toHaveBeenCalledTimes(1);
  });
  it('does not retry a timeout or a process-crash claim', async () => {
    const { service, adapter, rows } = setup();
    adapter.triggerTenantWorkflow.mockRejectedValueOnce(new Error('timeout'));
    expect(await service.dispatch('a', workflow, 'one', {})).toMatchObject({ status: 'UNCERTAIN', success: false });
    await service.dispatch('a', workflow, 'one', {});
    rows.set('a:crashed', { id: 'a:crashed', workflowId: 'flow', payload: {}, status: 'PENDING' });
    expect(await service.dispatch('a', workflow, 'crashed', {})).toMatchObject({ status: 'PENDING', success: false });
    expect(adapter.triggerTenantWorkflow).toHaveBeenCalledTimes(1);
  });
  it('isolates request IDs by tenant and refuses payload mutation or routing fields', async () => {
    const { service, adapter } = setup();
    await service.dispatch('a', workflow, 'one', { b: 2, a: 1 });
    await service.dispatch('a', workflow, 'one', { a: 1, b: 2 });
    await service.dispatch('b', workflow, 'one', {});
    expect(adapter.triggerTenantWorkflow).toHaveBeenCalledTimes(2);
    await expect(service.dispatch('a', workflow, 'one', { a: 3 })).rejects.toThrow('different request');
    await expect(service.dispatch('a', workflow, 'two', { tenantId: 'b' })).rejects.toThrow('Reserved');
    await expect(service.dispatch('a', workflow, 'two', { execution: {} })).rejects.toThrow('Reserved');
  });
  it('rejects missing adapters and credential-bearing or oversized definitions before persistence', async () => {
    const { service, adapter, prisma } = setup();
    adapter.hasWorkflowRoute.mockReturnValueOnce(false);
    await expect(service.dispatch('a', workflow, 'one', {})).rejects.toThrow('No executable route');
    await expect(service.dispatch('a', { ...workflow, definition: { apiKeys: { whatsappApiKey: 'secret' } } }, 'two', {})).rejects.toThrow('credentials');
    await expect(service.dispatch('a', workflow, 'three', { message: 'x'.repeat(16001) })).rejects.toThrow('oversized');
    await expect(service.dispatch('a', { ...workflow, definition: { sequence: { nodes: [{ config: { url: 'http://127.0.0.1/admin' } }] } } }, 'four', {})).rejects.toThrow('network destinations');
    expect(prisma.automationRun.create).not.toHaveBeenCalled();
  });
});
