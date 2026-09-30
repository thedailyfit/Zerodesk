import { GovernanceService } from './governance.service';

describe('Governance measurements', () => {
  it('returns no fabricated owners or metrics when no evidence exists', async () => {
    const db = {
      subscription: { findUnique: jest.fn().mockResolvedValue(null) },
      actionTrace: { count: jest.fn().mockResolvedValue(0) },
      agentEstate: { count: jest.fn().mockResolvedValue(0), findMany: jest.fn().mockResolvedValue([]) },
    };
    const service = new GovernanceService(db as any);
    expect(await service.getEstate('tenant-a')).toEqual([]);
    const result = await service.getFrontierHealth('tenant-a');
    expect(result.metrics24h).toEqual({ totalActions: 0, failedActions: 0, successRate: null, activeAgents: 0 });
    expect(result.trilogy.devops.status).toBe('UNKNOWN');
    expect(result.trilogy.finops.voiceMinutesPercent).toBeNull();
    expect(result.trilogy.appsec.unredactedLogLeaks).toBeNull();
    expect(db.agentEstate.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { tenantId: 'tenant-a' } }));
  });
  it('counts committed actions rather than treating rejected actions as successful', async () => {
    const db = {
      subscription: { findUnique: jest.fn().mockResolvedValue({ voiceMinutesUsed: 0, voiceMinutesLimit: 0, whatsappMessagesUsed: 10, whatsappMessagesLimit: 100 }) },
      actionTrace: { count: jest.fn().mockResolvedValueOnce(10).mockResolvedValueOnce(2).mockResolvedValueOnce(5) },
      agentEstate: { count: jest.fn().mockResolvedValue(3) },
    };
    const result = await new GovernanceService(db as any).getFrontierHealth('tenant-a');
    expect(result.metrics24h.successRate).toBe(50);
    expect(result.metrics24h.activeAgents).toBe(3);
    expect(result.trilogy.finops.voiceMinutesPercent).toBeNull();
    expect(result.trilogy.finops.whatsappMessagesPercent).toBe(10);
  });
});
