import { Injectable, Logger, Optional, HttpException, HttpStatus } from '@nestjs/common';
import { ContextService } from './context.service';
import { PromptService } from './prompt.service';
import { LlmService } from './llm.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import OpenAI, { toFile } from 'openai';
import { ConfigService } from '@nestjs/config';
import { PromptGuardService } from '../../common/security/prompt-guard.service';

export interface AiResponse {
  response: string;
  intent: string;
  actions: AiAction[];
  shouldTransfer: boolean;
  confidence: number;
}

export interface AiAction {
  type: 'BOOK_APPOINTMENT' | 'CREATE_LEAD' | 'UPDATE_CUSTOMER' | 'TRANSFER' | 'SEND_TEMPLATE' | 'NONE';
  params: Record<string, any>;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(
    private contextService: ContextService,
    private promptService: PromptService,
    private llmService: LlmService,
    private prisma: PrismaService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    @Optional() private promptGuardService?: PromptGuardService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY') || 'sk-dummy-key',
    });
  }

  /**
   * Transcribe incoming audio voice notes via OpenAI Whisper or Sarvam AI STT.
   */
  async transcribeAudio(buffer: Buffer, mimeType = 'audio/ogg', filename?: string): Promise<string> {
    const extMap: Record<string, string> = {
      'audio/ogg': 'voicenote.ogg',
      'audio/aac': 'voicenote.aac',
      'audio/mp4': 'voicenote.m4a',
      'audio/m4a': 'voicenote.m4a',
      'audio/mpeg': 'voicenote.mp3',
      'audio/mp3': 'voicenote.mp3',
      'audio/wav': 'voicenote.wav',
      'audio/amr': 'voicenote.amr',
    };
    const effectiveFilename = filename || extMap[mimeType] || 'voicenote.ogg';
    // 1. Try OpenAI Whisper primary
    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (apiKey && !apiKey.startsWith('sk-dummy')) {
      try {
        const file = await toFile(buffer, effectiveFilename, { type: mimeType });
        const response = await this.openai.audio.transcriptions.create({
          file,
          model: 'whisper-1',
        });
        if (response.text) {
          return response.text.trim();
        }
      } catch (err: any) {
        this.logger.warn(`OpenAI Whisper transcription error: ${err.message}. Trying Sarvam fallback...`);
      }
    }

    // 2. Try Sarvam AI Saaras Indic STT fallback
    const sarvamKey = this.configService.get('SARVAM_API_KEY');
    if (sarvamKey) {
      try {
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
        formData.append('file', blob, effectiveFilename);
        formData.append('model', 'saaras:v2');
        formData.append('language_code', 'unknown');

        const sarvamRes = await fetch('https://api.sarvam.ai/speech-to-text', {
          method: 'POST',
          headers: {
            'api-subscription-key': sarvamKey,
          },
          body: formData,
        });

        if (sarvamRes.ok) {
          const sJson = await sarvamRes.json();
          if (sJson.transcript) {
            return sJson.transcript.trim();
          }
        }
      } catch (sErr: any) {
        this.logger.warn(`Sarvam AI STT error: ${sErr.message}`);
      }
    }

    return '';
  }

  /**
   * Generate vector embeddings for text chunks using OpenAI text-embedding-3-small.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
      });
      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(`Embedding generation failed: ${error}`);
      // Fallback empty 1536-dim vector if offline / testing
      return new Array(1536).fill(0);
    }
  }

  /**
   * Generate an AI response for a customer message.
   */
  async generateResponse(
    tenantId: string,
    customerId: string,
    message: string,
    channel: string,
    conversationId?: string,
  ): Promise<AiResponse> {
    try {
      // 0. Quota Check
      const [subscription, tenant] = await Promise.all([
        this.prisma.subscription.findUnique({ where: { tenantId } }),
        this.prisma.tenant.findUnique({ where: { id: tenantId } }),
      ]);
      if (subscription && subscription.llmTokensUsed >= subscription.llmTokensLimit) {
        this.logger.warn(`[AI QUOTA] Tenant ${tenantId} exceeded LLM token limit (${subscription.llmTokensUsed}/${subscription.llmTokensLimit})`);
        throw new HttpException('LLM Token Quota Exceeded. Please upgrade your plan.', HttpStatus.PAYMENT_REQUIRED);
      }

      // 1. Sanitize user input against prompt injection attacks
      let safeMessage = message;
      if (this.promptGuardService) {
        const { sanitized, isInjected } = this.promptGuardService.sanitizeUserInput(message);
        safeMessage = sanitized;
        if (isInjected) {
          this.logger.warn(`[AI SECURITY] Blocked injection payload from customer ${customerId}`);
        }
      }

      const context = await this.contextService.assembleContext(tenantId, customerId, safeMessage);
      let systemPrompt = this.promptService.getSystemPrompt(tenantId, context, tenant?.industry);
      if (this.promptGuardService) {
        systemPrompt = this.promptGuardService.wrapSystemPromptWithGuardrails(tenant?.name || 'ZeroDesk Clinic', systemPrompt);
      }

      let conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [];
      if (conversationId) {
        const messages = await this.prisma.message.findMany({
          where: { conversationId, tenantId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });
        conversationHistory = messages.reverse().map((m: any) => ({
          role: m.role === 'CUSTOMER' ? ('user' as const) : ('assistant' as const),
          content: m.content || '',
        }));
      }

      const completion = await this.llmService.chat(
        [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: safeMessage },
        ],
        { responseFormat: 'json', temperature: 0.7, maxTokens: 1024 },
      );

      // 2. Token Metering
      const totalTokens = completion.tokensUsed || 0;
      if (totalTokens > 0) {
        this.prisma.subscription
          .updateMany({
            where: { tenantId },
            data: { llmTokensUsed: { increment: totalTokens } },
          })
          .catch((err) => this.logger.error(`Failed to meter tokens: ${err.message}`));
      }

      const raw = completion.content || '{}';
      let parsed: any = {};
      try {
        parsed = JSON.parse(raw);
      } catch (pErr) {
        this.logger.warn(`AI output was not valid JSON, using fallback: ${pErr}`);
        parsed = { response: raw, intent: 'GENERAL_QUERY', actions: [] };
      }

      // Validate AI action parameters to prevent malformed or unauthorized action emissions
      const rawActions = Array.isArray(parsed.actions) ? parsed.actions : [];
      const validatedActions: AiAction[] = [];
      const allowedActionTypes = ['BOOK_APPOINTMENT', 'CREATE_LEAD', 'UPDATE_CUSTOMER', 'TRANSFER', 'SEND_TEMPLATE', 'NONE'];
      for (const act of rawActions) {
        if (act && typeof act === 'object' && allowedActionTypes.includes(act.type)) {
          validatedActions.push({
            type: act.type,
            params: typeof act.params === 'object' && act.params !== null ? act.params : {},
          });
        } else {
          this.logger.warn(`[AI SECURITY] Rejected invalid AI action schema: ${JSON.stringify(act)}`);
        }
      }

      const result: AiResponse = {
        response: parsed.response || 'I apologize, I could not process that request.',
        intent: parsed.intent || 'GENERAL',
        actions: validatedActions,
        shouldTransfer: parsed.shouldTransfer || false,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      };

      for (const action of result.actions) {
        this.eventEmitter.emit('ai.action', { tenantId, customerId, channel, action });
      }

      this.eventEmitter.emit('analytics.event', {
        tenantId,
        eventType: 'AI_RESPONSE',
        channel,
        customerId,
        metadata: { intent: result.intent, confidence: result.confidence, resolved: !result.shouldTransfer },
      });

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`AI response generation failed: ${error}`, (error as Error).stack);
      return {
        response: 'I apologize for the inconvenience. Let me connect you with a team member who can help.',
        intent: 'ERROR',
        actions: [],
        shouldTransfer: true,
        confidence: 0,
      };
    }
  }

  /**
   * Summarize a conversation for storage in customer memory.
   */
  async summarizeConversation(conversationId: string, tenantId: string): Promise<string> {
    const messages = await this.prisma.message.findMany({
      where: { conversationId, tenantId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    if (messages.length === 0) return '';

    const transcript = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Summarize this conversation in 2-3 concise sentences. Focus on: what the customer wanted, what was resolved, and any follow-up needed.',
          },
          { role: 'user', content: transcript },
        ],
        max_tokens: 200,
      });

      return completion.choices[0]?.message?.content || '';
    } catch {
      return '';
    }
  }

  /**
   * Score a lead based on conversation analysis.
   */
  async scoreLead(tenantId: string, customerId: string): Promise<number> {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenantId },
      include: {
        conversations: { take: 5, orderBy: { createdAt: 'desc' } },
        appointments: { take: 3, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!customer) return 0;

    let score = 10;
    score += Math.min(customer.conversations.length * 5, 25);
    score += customer.appointments.length * 10;
    score += customer.lifetimeValue.toNumber() > 0 ? 15 : 0;
    score += customer.sentiment === 'POSITIVE' ? 10 : customer.sentiment === 'NEGATIVE' ? -10 : 0;
    score += customer.email ? 5 : 0;
    score += customer.name ? 5 : 0;

    return Math.min(Math.max(score, 0), 100);
  }
}
