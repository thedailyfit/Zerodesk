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

  private getClient(provider: LLMProvider): OpenAI {
    switch (provider) {
      case 'gemini': return this.gemini;
      case 'anthropic': return this.anthropic;
      default: return this.openai;
    }
  }

  private getDefaultModel(provider: LLMProvider): string {
    switch (provider) {
      case 'openai': return this.configService.get('OPENAI_MODEL', 'gpt-4o-mini');
      case 'gemini': return this.configService.get('GEMINI_MODEL', 'gemini-2.0-flash');
      case 'anthropic': return this.configService.get('ANTHROPIC_MODEL', 'claude-sonnet-4-20250514');
      default: return 'gpt-4o-mini';
    }
  }

  private getFallbackOrder(primary: LLMProvider): LLMProvider[] {
    const all: LLMProvider[] = ['openai', 'gemini', 'anthropic'];
    return [primary, ...all.filter((p) => p !== primary)];
  }

  /**
   * Generate embeddings using OpenAI (primary) or Gemini as fallback.
   */
  async embed(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch {
      this.logger.warn('OpenAI embedding failed, trying Gemini');
      const response = await this.gemini.embeddings.create({
        model: 'text-embedding-004',
        input: text,
      });
      return response.data[0].embedding;
    }
  }
}
