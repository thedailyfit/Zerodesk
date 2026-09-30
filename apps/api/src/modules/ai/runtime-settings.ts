import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import type { LLMOptions, LLMProvider } from './llm.service';

export const supportedProviders = ['openai', 'groq', 'gemini', 'sarvam'];
export const defaultLlmSettings = {
  primaryModel: '', fallbackModel: '', fallbackLatencyThresholdMs: 10000,
  voiceAiEnabled: false, whatsappAiEnabled: false, websiteAiEnabled: false,
  voiceAiTemperature: 0.3, whatsappAiTemperature: 0.7, websiteAiTemperature: 0.5,
  autoFailoverAlert: false,
};

export function validateLlmSettings(input: any) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new BadRequestException('Invalid AI settings');
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!(key in defaultLlmSettings)) throw new BadRequestException(`Unsupported AI setting: ${key}`);
    if (key.endsWith('Enabled') || key === 'autoFailoverAlert') {
      if (typeof value !== 'boolean') throw new BadRequestException(`${key} must be boolean`);
    } else if (key.endsWith('Temperature')) {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 2) throw new BadRequestException('Temperature must be between 0 and 2');
    } else if (key === 'fallbackLatencyThresholdMs') {
      if (!Number.isInteger(value) || Number(value) < 100 || Number(value) > 30000) throw new BadRequestException('Timeout must be 100-30000 ms');
    } else if (typeof value !== 'string' || value.length > 200) throw new BadRequestException('Invalid model identifier');
    result[key] = value;
  }
  return result;
}

export async function resolveRuntimeSettings(prisma: any, tenant: any, channel: string): Promise<LLMOptions> {
  const settings = { ...defaultLlmSettings, ...(tenant?.settings?.llmSettings || {}) };
  const key = channel.toLowerCase().includes('voice') ? 'voiceAi' : channel.toLowerCase().includes('whatsapp') ? 'whatsappAi' : 'websiteAi';
  if (!settings[`${key}Enabled`]) throw new ServiceUnavailableException('AI is disabled for this channel');
  const lookup = async (modelId: string) => {
    const model = modelId && await prisma.globalLlmRegistry.findFirst({ where: { modelId, isActive: true } });
    if (!model || !supportedProviders.includes(model.provider)) throw new ServiceUnavailableException('Configured AI model is unavailable');
    return { provider: model.provider as LLMProvider, model: model.modelId };
  };
  const primary = await lookup(settings.primaryModel);
  const fallback = settings.fallbackModel ? await lookup(settings.fallbackModel) : undefined;
  return { ...primary, fallback, temperature: settings[`${key}Temperature`], timeoutMs: settings.fallbackLatencyThresholdMs, strictRouting: true };
}
