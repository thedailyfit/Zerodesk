import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export type LLMProvider = 'groq' | 'openai' | 'sarvam' | 'gemini';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  tokensUsed: number;
}

export interface LLMOptions {
  provider?: LLMProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private groq: OpenAI; // Groq ultra-fast LPU inference (OpenAI-compatible API)
  private openai: OpenAI;
  private gemini: OpenAI; // Google Gemini via OpenAI-compatible API
  private defaultProvider: LLMProvider;

  constructor(private configService: ConfigService) {
    // Groq (Primary Ultra-Fast Voice & Chat LLM)
    this.groq = new OpenAI({
      apiKey: this.configService.get('GROQ_API_KEY', ''),
      baseURL: 'https://api.groq.com/openai/v1',
    });

    // OpenAI (Fallback)
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY') || 'sk-dummy',
    });

    // Google Gemini (Gemini via OpenAI-compatible API)
    this.gemini = new OpenAI({
      apiKey: this.configService.get('GEMINI_API_KEY', ''),
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });

    this.defaultProvider = this.configService.get<LLMProvider>('DEFAULT_LLM_PROVIDER', 'groq');
  }

  /**
   * Send a chat completion request with 4-tier fallback: Groq -> Sarvam AI -> OpenAI -> Google Gemini.
   */
  async chat(messages: LLMMessage[], options: LLMOptions = {}): Promise<LLMResponse> {
    const provider = options.provider || this.defaultProvider;
    const fallbackOrder: LLMProvider[] = this.getFallbackOrder(provider);

    for (const p of fallbackOrder) {
      try {
        return await this.callProvider(p, messages, options);
      } catch (error: any) {
        this.logger.warn(`LLM provider [${p}] failed: ${error.message || error}. Falling back to next provider...`);
      }
    }

    throw new Error('All LLM providers (Groq, Sarvam, OpenAI, Gemini) failed');
  }

  private async callProvider(
    provider: LLMProvider,
    messages: LLMMessage[],
    options: LLMOptions,
  ): Promise<LLMResponse> {
    if (provider === 'sarvam') {
      return this.callSarvam(messages, options);
    }

    const client = this.getClient(provider);
    const model = options.model || this.getDefaultModel(provider);

    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      ...(options.responseFormat === 'json'
        ? { response_format: { type: 'json_object' as const } }
        : {}),
    });

    return {
      content: completion.choices[0]?.message?.content || '',
      provider,
      model,
      tokensUsed: completion.usage?.total_tokens || 0,
    };
  }

  /**
   * Tier 2: Sarvam AI Indic Chat Completion API.
   */
  private async callSarvam(messages: LLMMessage[], options: LLMOptions): Promise<LLMResponse> {
    const apiKey = this.configService.get<string>('SARVAM_API_KEY');
    if (!apiKey) throw new Error('SARVAM_API_KEY not configured');

    const model = options.model || this.getDefaultModel('sarvam');

    const res = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.maxTokens ?? 1024,
        temperature: options.temperature ?? 0.7,
        ...(options.responseFormat === 'json'
          ? { response_format: { type: 'json_object' } }
          : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Sarvam AI API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;

    return {
      content,
      provider: 'sarvam',
      model,
      tokensUsed,
    };
  }

  private getClient(provider: LLMProvider): OpenAI {
    switch (provider) {
      case 'groq': return this.groq;
      case 'gemini': return this.gemini;
      default: return this.openai;
    }
  }

  private getDefaultModel(provider: LLMProvider): string {
    switch (provider) {
      case 'groq': return this.configService.get('GROQ_MODEL', 'openai/gpt-oss-120b');
      case 'openai': return this.configService.get('OPENAI_MODEL', 'gpt-4o');
      case 'sarvam': return this.configService.get('SARVAM_CHAT_MODEL', 'sarvam-2b-indic');
      case 'gemini': return this.configService.get('GEMINI_MODEL', 'gemini-2.0-flash');
      default: return 'openai/gpt-oss-120b';
    }
  }

  private getFallbackOrder(primary: LLMProvider): LLMProvider[] {
    const tierOrder: LLMProvider[] = ['groq', 'sarvam', 'openai', 'gemini'];
    return [primary, ...tierOrder.filter((p) => p !== primary)];
  }

  /**
   * Generate embeddings using OpenAI text-embedding-3-small (native 1536 dims).
   * Ensures output is always valid 1536 dimensions; never returns all-zero vectors.
   */
  async embed(text: string): Promise<number[]> {
    if (!text || !text.trim()) {
      throw new Error('Cannot generate embedding for empty text content');
    }

    // Try OpenAI primary with 1 retry
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: text.slice(0, 8000),
        });
        const embedding = response.data[0]?.embedding;
        if (embedding && embedding.length === 1536) {
          return embedding;
        }
      } catch (err: any) {
        this.logger.warn(`OpenAI embedding attempt ${attempt} failed: ${err.message}`);
        if (attempt === 2) {
          throw new Error(`Embedding generation failed after 2 attempts: ${err.message}`);
        }
      }
    }
    throw new Error('Unexpected embedding generation failure');
  }
}
