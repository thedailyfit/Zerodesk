import { AutomationController } from './automation.controller';
import { N8nService } from './n8n.service';

describe('automation execution boundary', () => {
  const create = jest.fn(async ({ data }) => data);
  const update = jest.fn(async ({ data }) => data);
  const findFirst = jest.fn();
  const runForTenant = jest.fn(async tenantId => ({ tenantId }));
  const n8n = { hasWorkflowRoute: jest.fn(() => false), triggerTenantWorkflow: jest.fn() };
  const controller = new AutomationController(n8n as any, { runForTenant } as any, { automationWorkflow: { create, update, findFirst } } as any, { validateDefinition: jest.fn() } as any);
  beforeEach(() => jest.clearAllMocks());

  it('creates inactive tenant-owned drafts', async () => {
    const result = await controller.createAutomation('tenant-a', { name: 'Draft', triggerType: 'MANUAL' } as any);
    expect(result).toMatchObject({ tenantId: 'tenant-a', isActive: false });
  });
  it('does not activate an unconfigured graph', async () => {
    findFirst.mockResolvedValue({ definition: { kind: 'sequence' }, triggerType: 'MANUAL' });
    await expect(controller.updateAutomation('tenant-a', 'flow', { isActive: true })).rejects.toThrow('No executable route');
    expect(update).not.toHaveBeenCalled();
  });
  it('deactivates an edited definition until explicitly enabled', async () => {
    expect(await controller.updateAutomation('tenant-a', 'flow', { definition: { kind: 'sequence' } })).toMatchObject({ isActive: false });
    expect(update.mock.calls[0][0].where).toEqual({ id: 'flow', tenantId: 'tenant-a' });
  });
  it('runs only the authenticated tenant and refuses another tenant workflow', async () => {
    await controller.runSequencesManually('tenant-a');
    expect(runForTenant).toHaveBeenCalledWith('tenant-a');
    findFirst.mockResolvedValue(null);
    await expect(controller.trigger('tenant-a', { workflowId: 'other', requestId: 'request' })).rejects.toThrow('Active workflow not found');
    expect(n8n.triggerTenantWorkflow).not.toHaveBeenCalled();
  });
  it('requires a deployment-owned route and rejects reserved payload keys', async () => {
    const service = new N8nService({ get: (key: string, fallback: string) => key === 'N8N_WORKFLOW_ROUTES' ? JSON.stringify({ a: { flow: 'safe-route' } }) : fallback } as any);
    expect(service.hasWorkflowRoute('b', 'flow')).toBe(false);
    expect(service.hasWorkflowRoute('a', 'flow')).toBe(true);
    expect(await service.triggerTenantWorkflow('b', 'flow', {})).toMatchObject({ success: false });
    await expect(service.triggerTenantWorkflow('a', 'flow', { tenantId: 'b' })).rejects.toThrow('Reserved');
  });
});
