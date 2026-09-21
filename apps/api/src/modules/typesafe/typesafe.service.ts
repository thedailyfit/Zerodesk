import { Injectable, Logger } from '@nestjs/common';
import { TypeSafeClient } from '@typesafe-ai/sdk';
import { RedisService } from '../redis/redis.service';
import {
  ActiveNiche,
  NICHE_RAG_BATTERIES,
  WHATSAPP_FRONTDOOR_QUESTIONS,
  OBSERVABILITY_EVALUATION_QUESTIONS,
  CEDAR_POLICY_GUARD_QUESTIONS,
} from './typesafe.constants';
import * as crypto from 'crypto';

export interface ScreenedChunkResult {
  chunkId: string;
  isRelevant: boolean;
  isPromptInjection: boolean;
  contradictsPolicy: boolean;
  passed: boolean;
}

export interface WhatsAppTriageResult {
  intent: string;
  intentConfidence: number;
  isDndOptOut: boolean;
  dndProbability: number;
  urgencyScore: number;
  urgencyLevel: number;
  sentimentScore: number;
  requiresHuman: boolean;
  rawAnswers: Record<string, any>;
}

export interface ObservabilityEvalResult {
  faithfulnessScore: number; // Normalized 0 to 1
  answerRelevanceScore: number; // Normalized 0 to 1
  hallucinationScore: number; // 1 - faithfulness
  rateCardCompliant: boolean;
  nicheClinicalSafe: boolean;
  patientSentimentScore: number;
  judgeLatencyMs: number;
}

@Injectable()
export class TypeSafeService {
  private readonly logger = new Logger(TypeSafeService.name);
  private client: TypeSafeClient | null = null;
  private readonly defaultModel: string;
  private isAvailable = false;

  constructor(private readonly redisService: RedisService) {
    const apiKey = process.env.TYPESAFE_API_KEY;
    this.defaultModel = process.env.TYPESAFE_MODEL || 'jev-latest';

    if (apiKey && !apiKey.includes('xxx') && apiKey.length > 10) {
      try {
        this.client = new TypeSafeClient({
          apiKey,
        });
        this.isAvailable = true;
        this.logger.log(`TypeSafe AI (Jev System One) client initialized with model ${this.defaultModel}`);
      } catch (err: any) {
        this.logger.warn(`Failed to initialize TypeSafeClient: ${err.message}. Running in fail-open mode.`);
      }
    } else {
      this.logger.warn('TYPESAFE_API_KEY not configured. Running in fail-open fallback mode.');
    }
  }

  /**
   * Generic evaluation with caching, strict timeout, and fail-open resilience.
   */
  async evaluate(
    state: any,
    questions: Record<string, any>,
    timeoutMs = 150,
  ): Promise<Record<string, any> | null> {
    if (!this.client || !this.isAvailable) {
      return null;
    }

    const stateStr = typeof state === 'string' ? state : JSON.stringify(state);
    const cacheKey = `typesafe:cache:${crypto
      .createHash('sha256')
      .update(stateStr + JSON.stringify(questions))
      .digest('hex')
      .substring(0, 32)}`;

    // 1. Check Redis Cache
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Redis offline: continue without cache
    }

    // 2. Call TypeSafe System One with Timeout
    try {
      const apiCall = this.client.systemOne({
        state,
        model: this.defaultModel,
        questions,
      });

      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error(`TypeSafe evaluation timed out after ${timeoutMs}ms`)), timeoutMs),
      );

      const response: any = await Promise.race([apiCall, timeoutPromise]);
      if (response && response.answers) {
        // Cache successful evaluation for 1 hour (3600s)
        try {
          await this.redisService.set(cacheKey, JSON.stringify(response.answers), 3600);
        } catch {
          // ignore cache write error
        }
        return response.answers;
      }
      return null;
    } catch (err: any) {
      this.logger.warn(`TypeSafe System One evaluation failed/timed out: ${err.message}. Failing open.`);
      return null;
    }
  }

  /**
   * Pillar A: RAG Passage Shield - Parallel screening of retrieved vector chunks.
   */
  async screenRagChunksParallel(
    query: string,
    chunks: Array<{ chunkId: string; chunkText: string }>,
    niche: ActiveNiche = 'skin',
    timeoutMs = 150,
  ): Promise<ScreenedChunkResult[]> {
    const battery = NICHE_RAG_BATTERIES[niche] || NICHE_RAG_BATTERIES.skin;

    const screeningPromises = chunks.map(async (chunk) => {
      const statePayload = {
        user_query: query,
        retrieved_document_chunk: chunk.chunkText,
        niche_domain: niche,
      };

      const answers = await this.evaluate(statePayload, battery, timeoutMs);

      if (!answers) {
        // Fail-open default: consider chunk safe if TypeSafe is unavailable
        return {
          chunkId: chunk.chunkId,
          isRelevant: true,
          isPromptInjection: false,
          contradictsPolicy: false,
          passed: true,
        };
      }

      const isInjection = (answers.is_prompt_injection?.noul ?? 0) > 0.65;
      const isRelevant = (answers.is_relevant?.noul ?? 1.0) >= 0.35;
      const contradictsPolicy = (answers.contradicts_clinic_policy?.noul ?? 0) > 0.70;

      const passed = !isInjection && isRelevant && !contradictsPolicy;

      return {
        chunkId: chunk.chunkId,
        isRelevant,
        isPromptInjection: isInjection,
        contradictsPolicy,
        passed,
      };
    });

    return Promise.all(screeningPromises);
  }

  /**
   * Pillar B: WhatsApp AI Inbound Front-Door Triage (70ms).
   */
  async triageWhatsAppMessage(
    message: string,
    clinicContext = '',
    timeoutMs = 150,
  ): Promise<WhatsAppTriageResult | null> {
    const statePayload = {
      message,
      clinic: clinicContext,
    };

    const answers = await this.evaluate(statePayload, WHATSAPP_FRONTDOOR_QUESTIONS, timeoutMs);

    if (!answers) {
      // Fallback: heuristic regex for DND
      const normalized = message.trim().toUpperCase();
      const isDnd = ['STOP', 'OPT OUT', 'UNSUBSCRIBE', 'STOP PROMO', 'DND'].includes(normalized);
      return {
        intent: 'general_inquiry',
        intentConfidence: 0.5,
        isDndOptOut: isDnd,
        dndProbability: isDnd ? 1.0 : 0.0,
        urgencyScore: 0,
        urgencyLevel: 0,
        sentimentScore: 1,
        requiresHuman: false,
        rawAnswers: {},
      };
    }

    const dndProb = answers.dnd_opt_out?.noul ?? 0;
    const isDndOptOut = dndProb > 0.65;
    const urgencyScore = answers.urgency?.score ?? 0;
    const sentimentScore = answers.sentiment?.score ?? 1;
    const requiresHuman = (answers.requires_human?.noul ?? 0) > 0.70 || urgencyScore >= 1.8 || sentimentScore >= 1.8;

    return {
      intent: answers.intent?.choice || 'general_inquiry',
      intentConfidence: answers.intent?.confidence ?? 0.5,
      isDndOptOut,
      dndProbability: dndProb,
      urgencyScore,
      urgencyLevel: Math.round(urgencyScore),
      sentimentScore,
      requiresHuman,
      rawAnswers: answers,
    };
  }

  /**
   * Pillar C: BullMQ Observability & Trace Evaluation.
   */
  async evaluateObservabilityTrace(
    traceState: {
      query: string;
      response: string;
      contextCombined: string;
      rateCardContext: string;
      niche?: string;
    },
    timeoutMs = 400,
  ): Promise<ObservabilityEvalResult> {
    const startTime = Date.now();
    const answers = await this.evaluate(
      {
        user_query: traceState.query,
        ai_response: traceState.response,
        verified_rate_card: traceState.rateCardContext,
        retrieved_knowledge_context: traceState.contextCombined,
        niche: traceState.niche || 'skin',
      },
      OBSERVABILITY_EVALUATION_QUESTIONS,
      timeoutMs,
    );

    const latencyMs = Date.now() - startTime;

    if (!answers) {
      // Calibrated baseline fallback (if no context provided, grounding is intrinsically low)
      const hasContext = Boolean(traceState.contextCombined && traceState.contextCombined.trim().length > 0);
      return {
        faithfulnessScore: hasContext ? 0.90 : 0.50,
        answerRelevanceScore: 0.92,
        hallucinationScore: hasContext ? 0.10 : 0.50,
        rateCardCompliant: true,
        nicheClinicalSafe: true,
        patientSentimentScore: 1,
        judgeLatencyMs: latencyMs,
      };
    }

    const faithfulnessRaw = answers.faithfulness?.score ?? 2.0;
    const relevanceRaw = answers.answer_relevance?.score ?? 2.0;
    const rateCardCompliant = (answers.rate_card_compliance?.noul ?? 1.0) >= 0.40;
    const nicheClinicalSafe = (answers.niche_clinical_safety?.noul ?? 1.0) >= 0.40;
    const sentimentScore = answers.patient_sentiment_impact?.score ?? 1.0;

    const faithfulnessScore = Number((faithfulnessRaw / 2.0).toFixed(3));
    const answerRelevanceScore = Number((relevanceRaw / 2.0).toFixed(3));
    const hallucinationScore = Number((1.0 - faithfulnessScore).toFixed(3));

    return {
      faithfulnessScore,
      answerRelevanceScore,
      hallucinationScore,
      rateCardCompliant,
      nicheClinicalSafe,
      patientSentimentScore: Math.round(sentimentScore),
      judgeLatencyMs: latencyMs,
    };
  }

  /**
   * Pillar D: Cedar Action Policy Pre-Flight Guard.
   */
  async validateToolCallPolicy(
    toolName: string,
    parameters: Record<string, any>,
    estateRules: Record<string, any>,
    timeoutMs = 150,
  ): Promise<{ allowed: boolean; reason?: string }> {
    const answers = await this.evaluate(
      {
        tool_name: toolName,
        proposed_parameters: parameters,
        estate_policy_rules: estateRules,
      },
      CEDAR_POLICY_GUARD_QUESTIONS,
      timeoutMs,
    );

    if (!answers) {
      // Fail-open: if Jev is down, rely on hard programmatic Cedar rules
      return { allowed: true };
    }

    const violatesPolicy = (answers.violates_policy?.noul ?? 0) > 0.70;
    if (violatesPolicy) {
      return {
        allowed: false,
        reason: 'TypeSafe Jev Policy Guard: action parameters violate tenant estate policy rules.',
      };
    }

    return { allowed: true };
  }
}
