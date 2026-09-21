import { GovernanceService } from '../src/modules/governance/governance.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Governance & Agent Estate Board E2E Integration Suite', () => {
  let service: GovernanceService;
  let mockPrisma: any;

  const mockEstateStore: any[] = [];
  const mockTraceStore: any[] = [];

  beforeEach(() => {
    mockEstateStore.length = 0;
    mockTraceStore.length = 0;

    mockPrisma = {
      agentEstate: {
        findMany: jest.fn().mockImplementation((args) => {
          return Promise.resolve(mockEstateStore.filter((e) => e.tenantId === args.where.tenantId));
        }),
        findUnique: jest.fn().mockImplementation((args) => {
          const { tenantId, agentKey } = args.where.tenantId_agentKey;
          return Promise.resolve(mockEstateStore.find((e) => e.tenantId === tenantId && e.agentKey === agentKey) || null);
        }),
        create: jest.fn().mockImplementation((args) => {
          const item = { id: `estate-${mockEstateStore.length + 1}`, ...args.data };
          mockEstateStore.push(item);
          return Promise.resolve(item);
        }),
        update: jest.fn().mockImplementation((args) => {
          const idx = mockEstateStore.findIndex((e) => e.id === args.where.id);
          if (idx >= 0) {
            mockEstateStore[idx] = { ...mockEstateStore[idx], ...args.data };
            return Promise.resolve(mockEstateStore[idx]);
          }
          return Promise.resolve(null);
        }),
      },
      actionTrace: {
        create: jest.fn().mockImplementation((args) => {
          const item = { id: `trace-${mockTraceStore.length + 1}`, createdAt: new Date(), ...args.data };
          mockTraceStore.push(item);
          return Promise.resolve(item);
        }),
        findMany: jest.fn().mockImplementation((args) => {
          return Promise.resolve(mockTraceStore.filter((t) => t.tenantId === args.where.tenantId));
        }),
        count: jest.fn().mockImplementation((args) => {
          return Promise.resolve(mockTraceStore.filter((t) => t.tenantId === args.where.tenantId).length);
        }),
      },
      subscription: {
        findUnique: jest.fn().mockResolvedValue({
          voiceMinutesUsed: 25,
          voiceMinutesLimit: 100,
          whatsappMessagesUsed: 150,
          whatsappMessagesLimit: 500,
        }),
      },
    };

    service = new GovernanceService(mockPrisma as unknown as PrismaService);
  });

  it('should auto-seed default 4 practice agents on initial estate retrieval', async () => {
    const tenantId = 'tenant-dermatology-1';
    const estates = await service.getEstate(tenantId);

    expect(estates).toHaveLength(4);
    expect(estates.map((e) => e.agentKey)).toEqual([
      'VOICE_RECEPTIONIST',
      'WHATSAPP_AI',
      'OUTBOUND_CAMPAIGNER',
      'TRIAGE_AGENT',
    ]);
    expect(mockPrisma.agentEstate.create).toHaveBeenCalledTimes(4);
  });

  it('should update human owner and hard blast radius limits for an agent', async () => {
    const tenantId = 'tenant-dermatology-1';
    await service.getEstate(tenantId);

    const updated = await service.updateEstateAgent(tenantId, 'VOICE_RECEPTIONIST', {
      humanOwnerName: 'Dr. Priya Sharma MD',
      hardLimits: { maxBookingDaysAhead: 15, maxDiscountAllowedPct: 0, maxCallsPerHour: 30 },
    });

    expect(updated.humanOwnerName).toBe('Dr. Priya Sharma MD');
    expect((updated.hardLimits as any).maxBookingDaysAhead).toBe(15);
  });

  it('should record immutable Action Traces for database mutations', async () => {
    const tenantId = 'tenant-dermatology-1';
    const trace = await service.recordActionTrace({
      tenantId,
      agentKey: 'WHATSAPP_AI',
      channel: 'WHATSAPP',
      actionName: 'BOOK_APPOINTMENT',
      targetResource: 'AppointmentSlot',
      parameters: { doctor: 'Dr. Ananya Rao', service: 'HydraFacial Deluxe' },
      policyDecision: 'ALLOWED',
      executionStatus: 'COMMITTED',
      entityId: 'appt-uuid-999',
      latencyMs: 120,
    });

    expect(trace.id).toBeDefined();
    expect(trace.executionStatus).toBe('COMMITTED');
    expect(trace.actionName).toBe('BOOK_APPOINTMENT');
    expect(mockTraceStore).toHaveLength(1);
  });

  it('should aggregate real-time health across the Healthcare Frontier Agent Trilogy', async () => {
    const tenantId = 'tenant-dermatology-1';
    const health = await service.getFrontierHealth(tenantId);

    expect(health.trilogy.devops.status).toBe('HEALTHY');
    expect(health.trilogy.finops.voiceMinutesPercent).toBe(25.0);
    expect(health.trilogy.finops.whatsappMessagesPercent).toBe(30.0);
    expect(health.trilogy.appsec.status).toBe('ENFORCED');
    expect(health.metrics24h.activeAgents).toBe(4);
  });
});
