import { Injectable, Logger, Optional } from '@nestjs/common';
import { ContextService } from './context.service';
import { PromptService } from './prompt.service';
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
  async transcribeAudio(buffer: Buffer, mimeType = 'audio/ogg', filename = 'voicenote.ogg'): Promise<string> {
    // 1. Try OpenAI Whisper primary
    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (apiKey && !apiKey.startsWith('sk-dummy')) {
      try {
        const file = await toFile(buffer, filename, { type: mimeType });
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
        formData.append('file', blob, filename);
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
      const systemPrompt = this.promptService.getSystemPrompt(tenantId, context);

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

      const completion = await this.openai.chat.completions.create({
        model: this.configService.get('AI_MODEL', 'gpt-4o-mini'),
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: safeMessage },
        ],
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      });

      const raw = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(raw);

      const result: AiResponse = {
        response: parsed.response || 'I apologize, I could not process that request.',
        intent: parsed.intent || 'GENERAL',
        actions: parsed.actions || [],
        shouldTransfer: parsed.shouldTransfer || false,
        confidence: parsed.confidence || 0.5,
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
