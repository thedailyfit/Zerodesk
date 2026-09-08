import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export type LLMProvider = 'openai' | 'sarvam' | 'gemini';

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
  private openai: OpenAI;
  private gemini: OpenAI; // Google Gemini via OpenAI-compatible API
  private defaultProvider: LLMProvider;

  constructor(private configService: ConfigService) {
    // OpenAI (Tier 1: ChatGPT)
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY') || 'sk-dummy',
    });

    // Google Gemini (Tier 3: Gemini via OpenAI-compatible API)
    this.gemini = new OpenAI({
      apiKey: this.configService.get('GEMINI_API_KEY', ''),
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });

    this.defaultProvider = this.configService.get<LLMProvider>('DEFAULT_LLM_PROVIDER', 'openai');
  }

  /**
   * Send a chat completion request with 3-tier fallback: OpenAI -> Sarvam AI -> Google Gemini.
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

    throw new Error('All 3 LLM providers (OpenAI, Sarvam, Gemini) failed');
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
      case 'gemini': return this.gemini;
      default: return this.openai;
    }
  }

  private getDefaultModel(provider: LLMProvider): string {
    switch (provider) {
      case 'openai': return this.configService.get('OPENAI_MODEL', 'gpt-4o-mini');
      case 'sarvam': return this.configService.get('SARVAM_CHAT_MODEL', 'sarvam-105b-conversations');
      case 'gemini': return this.configService.get('GEMINI_MODEL', 'gemini-2.0-flash');
      default: return 'gpt-4o-mini';
    }
  }

  private getFallbackOrder(primary: LLMProvider): LLMProvider[] {
    const tierOrder: LLMProvider[] = ['openai', 'sarvam', 'gemini'];
    return [primary, ...tierOrder.filter((p) => p !== primary)];
  }

  private normalizeVector1536(vec: number[]): number[] {
    if (vec.length === 1536) return vec;
    if (vec.length < 1536) {
      return [...vec, ...new Array(1536 - vec.length).fill(0)];
    }
    return vec.slice(0, 1536);
  }

  /**
   * Generate embeddings using OpenAI (primary) or Gemini as fallback.
   * Always ensures output is exactly 1536 dimensions matching vector(1536).
   */
  async embed(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return this.normalizeVector1536(response.data[0].embedding);
    } catch {
      this.logger.warn('OpenAI embedding failed, trying Gemini fallback');
      try {
        const response = await this.gemini.embeddings.create({
          model: 'text-embedding-004',
          input: text,
        });
        return this.normalizeVector1536(response.data[0].embedding);
      } catch {
        return new Array(1536).fill(0);
      }
    }
  }
}
