import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger, Optional } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { redactPii } from './pii-sanitizer';
import { TypeSafeService, ObservabilityEvalResult } from '../typesafe/typesafe.service';

export interface ToolCallData {
  toolName: string;
  parameters: Record<string, any>;
  result?: any;
  error?: string;
  durationMs?: number;
}

export interface EvalJobData {
  traceId: string;
  tenantId: string;
  query: string;
  response: string;
  contextChunks: string[];
  toolCalls?: ToolCallData[];
  sessionGoal?: string;
  goalAchieved?: boolean;
}

@Processor('ai-evaluation-queue')
@Injectable()
export class EvalProcessor extends WorkerHost {
  private readonly logger = new Logger(EvalProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly typeSafeService?: TypeSafeService,
  ) {
    super();
  }

  async process(job: Job<EvalJobData>): Promise<any> {
    const { traceId, tenantId, query, response, contextChunks, toolCalls, sessionGoal, goalAchieved } = job.data;
    this.logger.log(`Evaluating AI trace ${traceId} (3-Tier Framework) for tenant ${tenantId}`);

    try {
      // 1. Price Consistency Audit: Check if response mentions Indian Rupee amount (₹ or Rs.)
      const priceRegex = /(?:₹|Rs\.?|INR)\s*([0-9,]+)/gi;
      const quotedPrices: number[] = [];
      let match;
      while ((match = priceRegex.exec(response)) !== null) {
        const num = parseInt(match[1].replace(/,/g, ''), 10);
        if (!isNaN(num)) quotedPrices.push(num);
      }

      let priceMismatchFlag = false;
      let matchedService: any = null;
      let rateCardContext = '';

      const tenantServices = await this.prisma.service.findMany({
        where: { tenantId },
        select: { name: true, price: true },
      });

      if (tenantServices.length > 0) {
        rateCardContext = tenantServices.map((s) => `${s.name}: ₹${s.price}`).join(', ');
      }

      if (quotedPrices.length > 0 && tenantServices.length > 0) {
        for (const price of quotedPrices) {
          const matching = tenantServices.find((s) => Number(s.price) === price);
          if (!matching) {
            priceMismatchFlag = true;
          } else {
            matchedService = matching;
          }
        }
      }

      // 2. Execute TypeSafe AI Jev (System One) Evaluation
      const contextCombined = (contextChunks || []).join('\n\n');
      let evalResult: ObservabilityEvalResult = {
        isEvaluated: false,
        status: 'UNAVAILABLE',
        judgeModel: 'unjudged:deterministic-only',
        faithfulnessScore: 0.0,
        answerRelevanceScore: 0.0,
        hallucinationScore: 0.0,
        rateCardCompliant: !priceMismatchFlag,
        nicheClinicalSafe: true,
        patientSentimentScore: 1,
        judgeLatencyMs: 0,
      };

      if (this.typeSafeService) {
        try {
          evalResult = await this.typeSafeService.evaluateObservabilityTrace(
            {
              query,
              response,
              contextCombined,
              rateCardContext,
            },
            400,
          );
        } catch (err: any) {
          this.logger.warn(`TypeSafe observability evaluation fallback triggered: ${err.message}`);
        }
      }

      const faithfulness = evalResult.faithfulnessScore;
      const contextRelevance = evalResult.answerRelevanceScore;
      const answerRelevance = evalResult.answerRelevanceScore;
      const hallucinationScore = evalResult.hallucinationScore;

      // 3. Persist EvaluationScore with honest provenance
      await this.prisma.evaluationScore.create({
        data: {
          traceId,
          tenantId,
          contextRelevance: Number(contextRelevance.toFixed(3)),
          faithfulness: Number(faithfulness.toFixed(3)),
          answerRelevance: Number(answerRelevance.toFixed(3)),
          hallucinationScore: Number(hallucinationScore.toFixed(3)),
          judgeModel: evalResult.judgeModel,
          judgeLatencyMs: evalResult.judgeLatencyMs || 0,
          claimsAnalysis: {
            isEvaluated: evalResult.isEvaluated,
            evalStatus: evalResult.status,
            quotedPrices,
            priceMismatch: priceMismatchFlag || !evalResult.rateCardCompliant,
            rateCardCompliant: evalResult.rateCardCompliant,
            nicheClinicalSafe: evalResult.nicheClinicalSafe,
            patientSentiment: evalResult.patientSentimentScore,
            contextChunkCount: contextChunks?.length || 0,
            toolCallsCount: toolCalls?.length || 0,
            sessionGoal: sessionGoal || null,
            goalAchieved: goalAchieved ?? null,
          },
        },
      });

      // 4. Raise Automated BadAnswerFlag if thresholds breached
      // A. Price Mutation Flag
      if (priceMismatchFlag || !evalResult.rateCardCompliant) {
        await this.prisma.badAnswerFlag.create({
          data: {
            traceId,
            tenantId,
            flagType: 'PRICE_MUTATION',
            severity: 'CRITICAL',
            status: 'PENDING',
            reason: redactPii(`TypeSafe Jev: AI quoted prices (${quotedPrices.map((p) => '₹' + p).join(', ')}) that violate the tenant's verified service rate card.`),
            suggestedFix: `Update service catalog or correct knowledge base chunk to reflect current treatment fees.`,
          },
        });
        this.logger.warn(`CRITICAL: Automated PRICE_MUTATION flag raised for trace ${traceId}`);
      }

      // B. Clinical Safety Violation Flag
      if (!evalResult.nicheClinicalSafe) {
        await this.prisma.badAnswerFlag.create({
          data: {
            traceId,
            tenantId,
            flagType: 'CLINICAL_SAFETY_VIOLATION',
            severity: 'CRITICAL',
            status: 'PENDING',
            reason: redactPii(`TypeSafe Jev: AI output exceeded receptionist bounds by offering unauthorized clinical advice or legal guarantees.`),
            suggestedFix: `Reinforce strict system prompt boundaries to prohibit medical or financial guarantees.`,
          },
        });
        this.logger.warn(`CRITICAL: Automated CLINICAL_SAFETY_VIOLATION flag raised for trace ${traceId}`);
      }

      // C. Ungrounded Hallucination Audit
      if (faithfulness < 0.75) {
        await this.prisma.badAnswerFlag.create({
          data: {
            traceId,
            tenantId,
            flagType: 'UNGROUNDED_FABRICATION',
            severity: 'HIGH',
            status: 'PENDING',
            reason: `TypeSafe Jev: Faithfulness score (${faithfulness.toFixed(2)}) is below clinical threshold of 0.75. Potential ungrounded hallucination.`,
            suggestedFix: `Review query against clinic knowledge base documents and add missing treatment guidelines.`,
          },
        });
        this.logger.warn(`HIGH: Automated UNGROUNDED_FABRICATION flag raised for trace ${traceId}`);
      }

      // C. Span / Tool Level: Tool Parameter Accuracy & Execution Audit (Mitigates Waterfall Cascade)
      if (toolCalls && toolCalls.length > 0) {
        for (const tool of toolCalls) {
          if (tool.error) {
            await this.prisma.badAnswerFlag.create({
              data: {
                traceId,
                tenantId,
                flagType: 'TOOL_EXECUTION_FAILURE',
                severity: 'CRITICAL',
                status: 'PENDING',
                reason: redactPii(`Tool '${tool.toolName}' execution failed: ${tool.error}`),
                suggestedFix: `Check backend API connectivity and parameter requirements for ${tool.toolName}.`,
              },
            });
            this.logger.error(`CRITICAL: Automated TOOL_EXECUTION_FAILURE flag raised for tool ${tool.toolName}`);
          } else if (tool.toolName === 'book_appointment') {
            const p = tool.parameters || {};
            if (!p.serviceName || !p.preferredDate || !p.preferredTime) {
              await this.prisma.badAnswerFlag.create({
                data: {
                  traceId,
                  tenantId,
                  flagType: 'TOOL_PARAMETER_ERROR',
                  severity: 'HIGH',
                  status: 'PENDING',
                  reason: `Tool 'book_appointment' called with missing required parameters (serviceName, date, or time).`,
                  suggestedFix: `Reinforce prompt tool schema definitions and zero-shot parameter extraction rules.`,
                },
              });
              this.logger.warn(`HIGH: Automated TOOL_PARAMETER_ERROR flag raised for book_appointment`);
            }
          }
        }
      }

      // D. Session Level: Multi-Turn Goal Completion Audit
      if (sessionGoal && goalAchieved === false) {
        await this.prisma.badAnswerFlag.create({
          data: {
            traceId,
            tenantId,
            flagType: 'SESSION_GOAL_DROPPED',
            severity: 'MEDIUM',
            status: 'PENDING',
            reason: `Session goal '${sessionGoal}' was not achieved before dialogue termination.`,
            suggestedFix: `Optimize conversational funnel and reduce friction in multi-turn booking steps.`,
          },
        });
        this.logger.log(`MEDIUM: Automated SESSION_GOAL_DROPPED flag raised for goal ${sessionGoal}`);
      }

      return { faithfulness, hallucinationScore, priceMismatch: priceMismatchFlag };
    } catch (err: any) {
      this.logger.error(`Evaluation job failed for trace ${traceId}: ${err.message}`, err.stack);
      throw err;
    }
  }
}
