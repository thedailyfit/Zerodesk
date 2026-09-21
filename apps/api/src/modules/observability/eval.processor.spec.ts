import { EvalProcessor } from './eval.processor';

describe('EvalProcessor', () => {
  let processor: EvalProcessor;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      service: {
        findMany: jest.fn(),
      },
      evaluationScore: {
        create: jest.fn().mockResolvedValue({ id: 'score-1' }),
      },
      badAnswerFlag: {
        create: jest.fn().mockResolvedValue({ id: 'flag-1' }),
      },
    };
    processor = new EvalProcessor(mockPrisma);
  });

  it('should raise PRICE_MUTATION flag if AI quotes price not in tenant service catalog', async () => {
    mockPrisma.service.findMany.mockResolvedValue([
      { name: 'Root Canal Treatment', price: 4500 },
      { name: 'Teeth Cleaning', price: 1500 },
    ]);

    const job: any = {
      data: {
        traceId: 'trace-1',
        tenantId: 'tenant-1',
        query: 'How much is root canal treatment?',
        response: 'Root canal treatment is ₹9,500 at our clinic.',
        contextChunks: ['Root Canal Treatment is priced at ₹4,500.'],
      },
    };

    const result = await processor.process(job);

    expect(result.priceMismatch).toBe(true);
    expect(mockPrisma.badAnswerFlag.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          flagType: 'PRICE_MUTATION',
          severity: 'CRITICAL',
        }),
      })
    );
  });

  it('should not raise PRICE_MUTATION if AI quotes accurate price from catalog', async () => {
    mockPrisma.service.findMany.mockResolvedValue([
      { name: 'Root Canal Treatment', price: 4500 },
      { name: 'Teeth Cleaning', price: 1500 },
    ]);

    const job: any = {
      data: {
        traceId: 'trace-2',
        tenantId: 'tenant-1',
        query: 'How much is root canal?',
        response: 'Root canal treatment is ₹4,500 at our clinic.',
        contextChunks: ['Root Canal Treatment is priced at ₹4,500.'],
      },
    };

    const result = await processor.process(job);

    expect(result.priceMismatch).toBe(false);
    expect(mockPrisma.badAnswerFlag.create).not.toHaveBeenCalled();
    expect(mockPrisma.evaluationScore.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          traceId: 'trace-2',
          faithfulness: expect.any(Number),
        }),
      })
    );
  });

  it('should raise UNGROUNDED_FABRICATION if context is empty and faithfulness is low', async () => {
    mockPrisma.service.findMany.mockResolvedValue([]);

    const job: any = {
      data: {
        traceId: 'trace-3',
        tenantId: 'tenant-1',
        query: 'Can you guarantee 100% cure for arthritis without surgery?',
        response: 'Yes, our clinic guarantees 100% permanent cure in 2 days with secret herbal medicine.',
        contextChunks: [],
      },
    };

    const result = await processor.process(job);

    expect(result.faithfulness).toBeLessThan(0.80);
    expect(mockPrisma.badAnswerFlag.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          flagType: 'UNGROUNDED_FABRICATION',
          severity: 'HIGH',
        }),
      })
    );
  });

  it('should raise TOOL_EXECUTION_FAILURE and redact PII if tool call threw an error', async () => {
    mockPrisma.service.findMany.mockResolvedValue([]);

    const job: any = {
      data: {
        traceId: 'trace-tool-fail',
        tenantId: 'tenant-1',
        query: 'Book my appointment',
        response: 'Attempting to book your appointment now.',
        contextChunks: ['Clinic is open 9am to 5pm.'],
        toolCalls: [
          {
            toolName: 'book_appointment',
            parameters: { phone: '+919876543210', date: '2026-10-15' },
            error: 'Database timeout connecting to Plivo trunk for +919876543210',
          },
        ],
      },
    };

    await processor.process(job);

    expect(mockPrisma.badAnswerFlag.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          flagType: 'TOOL_EXECUTION_FAILURE',
          severity: 'CRITICAL',
          reason: expect.stringContaining('[REDACTED_PHONE]'),
        }),
      })
    );
  });

  it('should raise TOOL_PARAMETER_ERROR if required booking parameters are missing', async () => {
    mockPrisma.service.findMany.mockResolvedValue([]);

    const job: any = {
      data: {
        traceId: 'trace-tool-param',
        tenantId: 'tenant-1',
        query: 'Book me tomorrow',
        response: 'Booking your visit.',
        contextChunks: ['Clinic is open 9am to 5pm.'],
        toolCalls: [
          {
            toolName: 'book_appointment',
            parameters: { customerName: 'Rohan' }, // Missing serviceName, preferredDate, preferredTime
          },
        ],
      },
    };

    await processor.process(job);

    expect(mockPrisma.badAnswerFlag.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          flagType: 'TOOL_PARAMETER_ERROR',
          severity: 'HIGH',
        }),
      })
    );
  });

  it('should raise SESSION_GOAL_DROPPED if session goal was not achieved', async () => {
    mockPrisma.service.findMany.mockResolvedValue([]);

    const job: any = {
      data: {
        traceId: 'trace-session-drop',
        tenantId: 'tenant-1',
        query: 'Never mind, I will call later',
        response: 'Thank you for reaching out.',
        contextChunks: [],
        sessionGoal: 'APPOINTMENT_BOOKING',
        goalAchieved: false,
      },
    };

    await processor.process(job);

    expect(mockPrisma.badAnswerFlag.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          flagType: 'SESSION_GOAL_DROPPED',
          severity: 'MEDIUM',
        }),
      })
    );
  });
});
