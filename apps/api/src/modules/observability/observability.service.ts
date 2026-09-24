import { Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { redactPii } from './pii-sanitizer';

@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger(ObservabilityService.name);

  constructor(
    private prisma: PrismaService,
    @Optional() @InjectQueue('ai-evaluation-queue') private evalQueue?: Queue,
  ) {}

  async getBadAnswers(tenantId: string, status?: string, severity?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const [data, total] = await Promise.all([
      this.prisma.badAnswerFlag.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          trace: {
            include: {
              evaluation: true,
            },
          },
        },
      }),
      this.prisma.badAnswerFlag.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async updateFlagStatus(tenantId: string, flagId: string, status: string, suggestedFix?: string, userId?: string) {
    const flag = await this.prisma.badAnswerFlag.findFirst({
      where: { id: flagId, tenantId },
    });
    if (!flag) {
      throw new NotFoundException('Flag not found');
    }

    return this.prisma.badAnswerFlag.update({
      where: { id: flagId },
      data: {
        status,
        suggestedFix: suggestedFix !== undefined ? suggestedFix : flag.suggestedFix,
        resolvedByUserId: userId || null,
        resolvedAt: status === 'RESOLVED' || status === 'FALSE_POSITIVE' ? new Date() : null,
      },
    });
  }

  async getMetrics(tenantId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalTraces, pendingFlags, criticalFlags, evals, traces] = await Promise.all([
      this.prisma.llmTrace.count({ where: { tenantId, createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.badAnswerFlag.count({ where: { tenantId, status: 'PENDING' } }),
      this.prisma.badAnswerFlag.count({ where: { tenantId, severity: 'CRITICAL', status: 'PENDING' } }),
      this.prisma.evaluationScore.findMany({
        where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
        select: {
          contextRelevance: true,
          faithfulness: true,
          answerRelevance: true,
          hallucinationScore: true,
        },
        take: 500,
      }),
      this.prisma.llmTrace.findMany({
        where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
        select: { latencyMs: true, inputTokens: true, outputTokens: true },
        orderBy: { latencyMs: 'asc' },
        take: 500,
      }),
    ]);

    const hasEvals = evals.length > 0;
    const avgFaithfulness = hasEvals
      ? Number((evals.reduce((sum, e) => sum + e.faithfulness, 0) / evals.length).toFixed(3))
      : null;
    const avgContextRelevance = hasEvals
      ? Number((evals.reduce((sum, e) => sum + e.contextRelevance, 0) / evals.length).toFixed(3))
      : null;
    const avgAnswerRelevance = hasEvals
      ? Number((evals.reduce((sum, e) => sum + e.answerRelevance, 0) / evals.length).toFixed(3))
      : null;

    const latencies = traces.map((t) => t.latencyMs);
    const p50LatencyMs = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.5)] : 0;
    const p95LatencyMs = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] : 0;
    const p99LatencyMs = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.99)] : 0;
    const totalTokensUsed = traces.reduce((acc, t) => acc + (t.inputTokens + t.outputTokens), 0);

    return {
      totalTraces,
      pendingFlags,
      criticalFlags,
      p95LatencyMs,
      latency: {
        p50: p50LatencyMs,
        p95: p95LatencyMs,
        p99: p99LatencyMs,
      },
      tokens: {
        totalUsed: totalTokensUsed,
      },
      ragTriad: {
        avgFaithfulness,
        avgContextRelevance,
        avgAnswerRelevance,
      },
    };
  }

  /**
   * Records an LLM trace and automatically enqueues asynchronous 3-tier evaluation.
   */
  async recordTraceAndEnqueue(data: {
    tenantId: string;
    conversationId?: string;
    channel: string;
    userQuery: string;
    rawResponse: string;
    provider?: string;
    modelId?: string;
    latencyMs: number;
    ttftMs?: number;
    inputTokens?: number;
    outputTokens?: number;
    retrievedChunkIds?: string[];
    frozenContext?: any;
    toolCalls?: any[];
    sessionGoal?: string;
    goalAchieved?: boolean;
  }) {
    const sanitizedQuery = redactPii(data.userQuery);
    const trace = await this.prisma.llmTrace.create({
      data: {
        tenantId: data.tenantId,
        conversationId: data.conversationId || null,
        channel: data.channel,
        userQuery: data.userQuery,
        rawResponse: data.rawResponse,
        sanitizedQuery,
        provider: data.provider || 'groq',
        modelId: data.modelId || 'llama-3.3-70b-versatile',
        latencyMs: data.latencyMs,
        ttftMs: data.ttftMs || null,
        inputTokens: data.inputTokens || 0,
        outputTokens: data.outputTokens || 0,
        retrievedChunkIds: data.retrievedChunkIds || [],
        frozenContext: data.frozenContext || [],
      },
    });

    const chunks: string[] = Array.isArray(data.frozenContext)
      ? data.frozenContext.map((c: any) => (typeof c === 'string' ? c : c.chunkText || c.content || ''))
      : [];

    if (this.evalQueue) {
      await this.evalQueue.add(
        'eval-trace',
        {
          traceId: trace.id,
          tenantId: data.tenantId,
          query: sanitizedQuery,
          response: data.rawResponse,
          contextChunks: chunks,
          toolCalls: data.toolCalls || [],
          sessionGoal: data.sessionGoal,
          goalAchieved: data.goalAchieved,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      );
    }

    return trace;
  }

  /**
   * Promotes a BadAnswerFlag into a persistent GoldenTestCase to guard against regressions in CI/CD.
   */
  async promoteToGoldenTestCase(
    tenantId: string,
    flagId: string,
    referenceAnswer?: string,
    category = 'CLINIC_GENERAL',
  ) {
    const flag = await this.prisma.badAnswerFlag.findFirst({
      where: { id: flagId, tenantId },
      include: { trace: true },
    });
    if (!flag || !flag.trace) {
      throw new NotFoundException('Flag or associated trace not found');
    }

    const testCase = await this.prisma.goldenTestCase.create({
      data: {
        tenantId,
        category,
        query: flag.trace.sanitizedQuery || flag.trace.userQuery,
        channel: flag.trace.channel,
        expectedContextIds: flag.trace.retrievedChunkIds || [],
        expectedEntities: [],
        forbiddenKeywords: [flag.reason],
        expectedIntent: 'GENERAL_QUERY',
        referenceAnswer: referenceAnswer || flag.suggestedFix || 'Ground answer strictly in clinic rate card.',
        isActive: true,
      },
    });

    await this.prisma.badAnswerFlag.update({
      where: { id: flagId },
      data: {
        status: 'INVESTIGATING',
        suggestedFix: `${flag.suggestedFix ? flag.suggestedFix + ' | ' : ''}Promoted to Golden Test Case #${testCase.id}`,
      },
    });

    return testCase;
  }

  async getGoldenTestCases(tenantId: string) {
    return this.prisma.goldenTestCase.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Evaluates weekly model drift (Rule 6 from Agentic Observability Guide).
   * Compares the current 7-day window with the prior 7-day baseline to detect accuracy or latency degradation.
   */
  async evaluateWeeklyModelDrift(tenantId: string) {
    const now = new Date();
    const currentWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const priorWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [currentTraces, priorTraces, currentEvals, priorEvals, currentFlags, priorFlags] = await Promise.all([
      this.prisma.llmTrace.count({ where: { tenantId, createdAt: { gte: currentWeekStart } } }),
      this.prisma.llmTrace.count({ where: { tenantId, createdAt: { gte: priorWeekStart, lt: currentWeekStart } } }),
      this.prisma.evaluationScore.findMany({
        where: { tenantId, createdAt: { gte: currentWeekStart } },
        select: { faithfulness: true, hallucinationScore: true },
      }),
      this.prisma.evaluationScore.findMany({
        where: { tenantId, createdAt: { gte: priorWeekStart, lt: currentWeekStart } },
        select: { faithfulness: true, hallucinationScore: true },
      }),
      this.prisma.badAnswerFlag.count({ where: { tenantId, createdAt: { gte: currentWeekStart } } }),
      this.prisma.badAnswerFlag.count({ where: { tenantId, createdAt: { gte: priorWeekStart, lt: currentWeekStart } } }),
    ]);

    const calcAvg = (items: any[], key: string, fallback: number) =>
      items.length > 0 ? items.reduce((acc, curr) => acc + curr[key], 0) / items.length : fallback;

    const currentAvgFaith = calcAvg(currentEvals, 'faithfulness', 0.94);
    const priorAvgFaith = calcAvg(priorEvals, 'faithfulness', 0.95);

    const currentAvgHallucination = calcAvg(currentEvals, 'hallucinationScore', 0.06);
    const priorAvgHallucination = calcAvg(priorEvals, 'hallucinationScore', 0.05);

    const currentFlagRate = currentTraces > 0 ? currentFlags / currentTraces : 0;
    const priorFlagRate = priorTraces > 0 ? priorFlags / priorTraces : 0;

    const faithfulnessDiffPercent = Number((((currentAvgFaith - priorAvgFaith) / (priorAvgFaith || 1)) * 100).toFixed(2));
    const flagRateDiffPercent = Number((((currentFlagRate - priorFlagRate) / (priorFlagRate || 0.01)) * 100).toFixed(2));

    let driftStatus: 'STABLE' | 'DRIFT_DETECTED' | 'CRITICAL_DRIFT' = 'STABLE';
    if (faithfulnessDiffPercent < -5 || flagRateDiffPercent > 15) {
      driftStatus = 'DRIFT_DETECTED';
    }
    if (faithfulnessDiffPercent < -10 || flagRateDiffPercent > 30) {
      driftStatus = 'CRITICAL_DRIFT';
    }

    return {
      status: driftStatus,
      sampledTracesCurrentWeek: currentTraces,
      sampledTracesPriorWeek: priorTraces,
      metrics: {
        faithfulness: {
          current: Number(currentAvgFaith.toFixed(3)),
          prior: Number(priorAvgFaith.toFixed(3)),
          deltaPercent: faithfulnessDiffPercent,
        },
        hallucinationScore: {
          current: Number(currentAvgHallucination.toFixed(3)),
          prior: Number(priorAvgHallucination.toFixed(3)),
        },
        flagRate: {
          current: Number(currentFlagRate.toFixed(3)),
          prior: Number(priorFlagRate.toFixed(3)),
          deltaPercent: flagRateDiffPercent,
        },
      },
      evaluatedAt: now,
    };
  }
}
