import unittest
from runtime_config import build_llm

class RuntimeConfigTests(unittest.TestCase):
    def test_explicit_routes_and_timeout(self):
        runtime = dict(provider='openai', model='primary', strictRouting=True, timeoutMs=2000, fallback=dict(provider='groq', model='secondary'))
        result = build_llm(runtime, lambda **kw: kw, lambda clients, **kw: (clients, kw), dict(OPENAI_API_KEY='test', GROQ_API_KEY='test'))
        self.assertEqual([c['model'] for c in result[0]], ['primary', 'secondary'])
        self.assertEqual(result[1]['attempt_timeout'], 2)
        self.assertFalse(result[1]['retry_on_chunk_sent'])
    def test_missing_config_and_credentials_fail_closed(self):
        for config in [{}, dict(provider='openai', model='primary', strictRouting=True)]:
            with self.assertRaises(ValueError): build_llm(config, None, None, {})

if __name__ == '__main__': unittest.main()
