"""Build the explicitly configured voice route; never silently use another tenant/model."""
import os

PROVIDERS = {
    'openai': ('OPENAI_API_KEY', 'https://api.openai.com/v1'),
    'groq': ('GROQ_API_KEY', 'https://api.groq.com/openai/v1'),
    'gemini': ('GEMINI_API_KEY', 'https://generativelanguage.googleapis.com/v1beta/openai/'),
}

def build_llm(runtime, factory, fallback_factory, environ=None):
    env = os.environ if environ is None else environ
    if not isinstance(runtime, dict) or not runtime.get('strictRouting'):
        raise ValueError('Verified voice runtime configuration is required')
    clients = []
    for route in [runtime] + ([runtime['fallback']] if runtime.get('fallback') else []):
        provider = route.get('provider')
        if provider not in PROVIDERS or not route.get('model'):
            raise ValueError('Unsupported voice model provider')
        key_name, endpoint = PROVIDERS[provider]
        key = env.get(key_name)
        if not key:
            raise ValueError(f'{key_name} is required for the configured route')
        clients.append(factory(model=route['model'], base_url=endpoint, api_key=key, temperature=runtime.get('temperature', 0.3)))
    return fallback_factory(clients, attempt_timeout=runtime.get('timeoutMs', 10000) / 1000, max_retry_per_llm=0, retry_on_chunk_sent=False)
