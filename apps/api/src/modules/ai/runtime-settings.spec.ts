import { resolveRuntimeSettings, validateLlmSettings } from './runtime-settings';
import { LlmService } from './llm.service';

describe('Configured AI runtime', () => {
  it('rejects disabled channels and unregistered models', async () => {
    await expect(resolveRuntimeSettings({}, { settings: {} }, 'whatsapp')).rejects.toThrow('disabled');
    await expect(resolveRuntimeSettings({ globalLlmRegistry: { findFirst: async () => null } }, { settings: { llmSettings: { whatsappAiEnabled: true, primaryModel: 'missing' } } }, 'whatsapp')).rejects.toThrow('unavailable');
    expect(() => validateLlmSettings({ voiceAiEnabled: 'true' })).toThrow();
    expect(() => validateLlmSettings({ voiceAiTemperature: NaN })).toThrow();
  });
  it('resolves active registry model and per-channel temperature', async () => {
    const prisma = { globalLlmRegistry: { findFirst: jest.fn().mockImplementation(({ where }) => ({ modelId: where.modelId, provider: where.modelId === 'primary' ? 'openai' : 'groq' })) } };
    const result = await resolveRuntimeSettings(prisma, { settings: { llmSettings: { primaryModel: 'primary', fallbackModel: 'secondary', whatsappAiEnabled: true, whatsappAiTemperature: 0.4 } } }, 'WHATSAPP');
    expect(result).toMatchObject({ model: 'primary', provider: 'openai', temperature: 0.4, strictRouting: true, fallback: { provider: 'groq', model: 'secondary' } });
  });
  it('uses each configured fallback model without leaking the primary model ID to another provider', async () => {
    const service = new LlmService({ get: (_: string, fallback: any) => fallback || 'test' } as any);
    const call = jest.spyOn(service as any, 'callProvider').mockRejectedValueOnce(new Error('timeout')).mockResolvedValueOnce({ content: 'ok' });
    await service.chat([], { provider: 'openai', model: 'primary', fallback: { provider: 'groq', model: 'secondary' }, strictRouting: true });
    expect(call.mock.calls.map(c => [c[0], (c[2] as any).model])).toEqual([['openai', 'primary'], ['groq', 'secondary']]);
  });
});
