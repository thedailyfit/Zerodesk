import { ActionPolicyGuard } from './action-policy.guard';
import { PrismaService } from '../../prisma/prisma.service';

describe('ActionPolicyGuard (Cedar Default-Deny Policy Engine Suite)', () => {
  let guard: ActionPolicyGuard;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      agentEstate: {
        findUnique: jest.fn(),
      },
    };
    guard = new ActionPolicyGuard(mockPrisma as unknown as PrismaService);
  });

  it('should deny execution when tool is not in allowedTools', async () => {
    mockPrisma.agentEstate.findUnique.mockResolvedValue({
      isActive: true,
      allowedTools: ['book_appointment', 'get_pricing'],
      hardLimits: { maxBookingDaysAhead: 30 },
    });

    const decision = await guard.evaluate({
      tenantId: 'tenant-1',
      agentKey: 'VOICE_RECEPTIONIST',
      actionName: 'delete_patient_records',
      targetResource: 'PatientDB',
      parameters: {},
    });

    expect(decision.allowed).toBe(false);
    expect(decision.ruleId).toBe('DENY_TOOL_NOT_PERMITTED');
  });

  it('should deny bookings that exceed maximum booking horizon', async () => {
    mockPrisma.agentEstate.findUnique.mockResolvedValue({
      isActive: true,
      allowedTools: ['book_appointment'],
      hardLimits: { maxBookingDaysAhead: 14, maxDiscountAllowedPct: 0 },
    });

    // 45 days in future
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);

    const decision = await guard.evaluate({
      tenantId: 'tenant-1',
      agentKey: 'WHATSAPP_AI',
      actionName: 'book_appointment',
      targetResource: 'AppointmentSlot',
      parameters: { date: futureDate.toISOString() },
    });

    expect(decision.allowed).toBe(false);
    expect(decision.ruleId).toBe('DENY_EXCEEDED_BOOKING_HORIZON');
  });

  it('should deny unauthorized discounts exceeding hardLimits', async () => {
    mockPrisma.agentEstate.findUnique.mockResolvedValue({
      isActive: true,
      allowedTools: ['book_appointment'],
      hardLimits: { maxBookingDaysAhead: 30, maxDiscountAllowedPct: 0 },
    });

    const decision = await guard.evaluate({
      tenantId: 'tenant-1',
      agentKey: 'WHATSAPP_AI',
      actionName: 'book_appointment',
      targetResource: 'AppointmentSlot',
      parameters: { date: new Date().toISOString(), discountPct: 20 },
    });

    expect(decision.allowed).toBe(false);
    expect(decision.ruleId).toBe('DENY_UNAUTHORIZED_DISCOUNT');
  });

  it('should permit valid appointments matching all policy conditions', async () => {
    mockPrisma.agentEstate.findUnique.mockResolvedValue({
      isActive: true,
      allowedTools: ['book_appointment'],
      hardLimits: { maxBookingDaysAhead: 30, maxDiscountAllowedPct: 0 },
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const decision = await guard.evaluate({
      tenantId: 'tenant-1',
      agentKey: 'VOICE_RECEPTIONIST',
      actionName: 'book_appointment',
      targetResource: 'AppointmentSlot',
      parameters: { date: tomorrow.toISOString() },
    });

    expect(decision.allowed).toBe(true);
    expect(decision.ruleId).toBe('PERMIT_CLINIC_STANDARD_POLICY');
  });
});
