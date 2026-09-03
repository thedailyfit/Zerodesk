import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export type LLMProvider = 'openai' | 'gemini' | 'anthropic';

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
  private anthropic: OpenAI; // Anthropic via OpenAI-compatible API
  private defaultProvider: LLMProvider;

  constructor(private configService: ConfigService) {
    // OpenAI
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });

    // Google Gemini (OpenAI-compatible endpoint)
    this.gemini = new OpenAI({
      apiKey: this.configService.get('GEMINI_API_KEY', ''),
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });

    // Anthropic (OpenAI-compatible endpoint via proxy or direct)
    this.anthropic = new OpenAI({
      apiKey: this.configService.get('ANTHROPIC_API_KEY', ''),
      baseURL: 'https://api.anthropic.com/v1/',
    });

    this.defaultProvider = this.configService.get<LLMProvider>('DEFAULT_LLM_PROVIDER', 'openai');
  }

  /**
   * Send a chat completion request to the configured LLM provider.
   * Automatically falls back to next provider on failure.
   */
  async chat(messages: LLMMessage[], options: LLMOptions = {}): Promise<LLMResponse> {
    const provider = options.provider || this.defaultProvider;
    const fallbackOrder: LLMProvider[] = this.getFallbackOrder(provider);

    for (const p of fallbackOrder) {
      try {
        return await this.callProvider(p, messages, options);
      } catch (error) {
        this.logger.warn(`LLM provider ${p} failed, trying next: ${error}`);
      }
    }

    throw new Error('All LLM providers failed');
  }

  private async callProvider(
    provider: LLMProvider,
    messages: LLMMessage[],
    options: LLMOptions,
  ): Promise<LLMResponse> {
    if (provider === 'anthropic') {
      return this.callAnthropic(messages, options);
    }

    const client = this.getClient(provider);
    const model = options.model || this.getDefaultModel(provider);

    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      ...(options.responseFormat === 'json' && provider === 'openai'
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

  private async callAnthropic(messages: LLMMessage[], options: LLMOptions): Promise<LLMResponse> {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

    const systemMessage = messages.find((m) => m.role === 'system')?.content || '';
    const nonSystemMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const model = options.model || this.getDefaultModel('anthropic');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: options.maxTokens ?? 1024,
        temperature: options.temperature ?? 0.7,
        system: systemMessage || undefined,
        messages: nonSystemMessages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const content = data.content?.[0]?.text || '';
    const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

    return {
      content,
      provider: 'anthropic',
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
      case 'gemini': return this.configService.get('GEMINI_MODEL', 'gemini-2.0-flash');
      case 'anthropic': return this.configService.get('ANTHROPIC_MODEL', 'claude-3-5-sonnet-20241022');
      default: return 'gpt-4o-mini';
    }
  }

  private getFallbackOrder(primary: LLMProvider): LLMProvider[] {
    const all: LLMProvider[] = ['openai', 'gemini', 'anthropic'];
    return [primary, ...all.filter((p) => p !== primary)];
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
