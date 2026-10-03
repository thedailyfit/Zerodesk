"""Build the explicitly configured voice route; never silently use another tenant/model."""
import os
import math

PROVIDERS = {
    'openai': ('OPENAI_API_KEY', 'https://api.openai.com/v1'),
    'groq': ('GROQ_API_KEY', 'https://api.groq.com/openai/v1'),
    'gemini': ('GEMINI_API_KEY', 'https://generativelanguage.googleapis.com/v1beta/openai/'),
}

def build_llm(runtime, factory, fallback_factory, environ=None):
    env = os.environ if environ is None else environ
    if not isinstance(runtime, dict) or runtime.get('strictRouting') is not True:
        raise ValueError('Verified voice runtime configuration is required')
    timeout = runtime.get('timeoutMs', 10000)
    temperature = runtime.get('temperature', 0.3)
    if isinstance(timeout, bool) or not isinstance(timeout, (int, float)) or not math.isfinite(timeout) or not 100 <= timeout <= 30000:
        raise ValueError('Voice timeout must be between 100 and 30000 ms')
    if isinstance(temperature, bool) or not isinstance(temperature, (int, float)) or not math.isfinite(temperature) or not 0 <= temperature <= 2:
        raise ValueError('Voice temperature must be between 0 and 2')
    routes = []
    for route in [runtime] + ([runtime['fallback']] if runtime.get('fallback') else []):
        if not isinstance(route, dict):
            raise ValueError('Invalid voice fallback route')
        provider = route.get('provider')
        if provider not in PROVIDERS or not isinstance(route.get('model'), str) or not route['model'].strip():
            raise ValueError('Unsupported voice model provider')
        key_name, endpoint = PROVIDERS[provider]
        key = env.get(key_name, '').strip()
        if not key:
            raise ValueError(f'{key_name} is required for the configured route')
        routes.append(dict(model=route['model'], base_url=endpoint, api_key=key, temperature=temperature))
    clients = [factory(**route) for route in routes]
    return fallback_factory(clients, attempt_timeout=timeout / 1000, max_retry_per_llm=0, retry_on_chunk_sent=False)
