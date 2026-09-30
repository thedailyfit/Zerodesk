import { ObservabilityService } from './observability.service';
import { ObservabilityController } from './observability.controller';
import { PATH_METADATA } from '@nestjs/common/constants';

describe('complete-window observability', () => {
  function setup(traces: any[] = [], evals: any[] = []) {
    const prisma = {
      llmTrace: { count: jest.fn().mockResolvedValue(traces.length), findMany: jest.fn().mockResolvedValue(traces) },
      badAnswerFlag: { count: jest.fn().mockResolvedValue(0) },
      evaluationScore: { findMany: jest.fn().mockResolvedValue(evals) },
    };
    return { prisma, service: new ObservabilityService(prisma as any) };
  }
  it('includes a slow tail beyond 500 traces and all token consumption', async () => {
    const { service, prisma } = setup(Array.from({ length: 1000 }, (_, i) => ({ latencyMs: i + 1, inputTokens: 2, outputTokens: 3 })));
    const result = await service.getMetrics('tenant');
    expect(result.latency).toEqual({ p50: 500, p95: 950, p99: 990 });
    expect(result.tokens.totalUsed).toBe(5000);
    expect(result.sampleCount).toBe(1000);
    expect(prisma.llmTrace.findMany.mock.calls[0][0]).not.toHaveProperty('take');
    expect(prisma.evaluationScore.findMany.mock.calls[0][0].where.AND).toContainEqual({ claimsAnalysis: { path: ['isEvaluated'], equals: true } });
  });
  it('reports unavailable metrics for no observations', async () => {
    const { service } = setup();
    const result = await service.getMetrics('tenant');
    expect(result.latency.p95).toBeNull();
    expect(result.ragTriad.avgFaithfulness).toBeNull();
    expect(result.evaluatedCount).toBe(0);
  });
  it('leaves v1 ownership to the global prefix', () => {
    expect(Reflect.getMetadata(PATH_METADATA, ObservabilityController)).toBe('observability');
  });
});
