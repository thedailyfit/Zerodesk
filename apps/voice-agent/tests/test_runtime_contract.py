from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest
from livekit.agents import llm
from livekit.plugins import openai, sarvam, elevenlabs
from agent import entrypoint, extract_call_context
from runtime_config import build_llm


def dispatch_context():
    return SimpleNamespace(
        room=SimpleNamespace(metadata="", name="", remote_participants={}),
        job=SimpleNamespace(metadata='{"tenant_id":"tenant-test"}',
                            room=SimpleNamespace(metadata="", name="tenant_tenant-test_call")),
        connect=AsyncMock(),
    )


def test_dispatch_snapshot_available_before_connect():
    assert extract_call_context(dispatch_context()).tenant_id == "tenant-test"


@pytest.mark.asyncio
async def test_missing_internal_credential_never_joins_room():
    ctx = dispatch_context()
    with patch("agent.INTERNAL_VOICE_SECRET", ""):
        with pytest.raises(RuntimeError, match="internal API credential"):
            await entrypoint(ctx)
    ctx.connect.assert_not_awaited()


@pytest.mark.asyncio
async def test_missing_model_credentials_never_joins_room():
    ctx = dispatch_context()
    response = AsyncMock()
    response.status = 200
    response.json.return_value = {"systemPrompt": "Tenant instructions", "runtime": {
        "strictRouting": True, "provider": "openai", "model": "gpt-4o"}}
    with patch("agent.INTERNAL_VOICE_SECRET", "test"), patch.dict("os.environ", {}, clear=True), patch("aiohttp.ClientSession.get") as get:
        get.return_value.__aenter__.return_value = response
        with pytest.raises(ValueError, match="OPENAI_API_KEY"):
            await entrypoint(ctx)
    ctx.connect.assert_not_awaited()


@pytest.mark.asyncio
async def test_installed_provider_and_fallback_constructors():
    adapter = build_llm({"strictRouting": True, "provider": "openai", "model": "gpt-4o",
                         "fallback": {"provider": "groq", "model": "test-model"}},
                        openai.LLM, llm.FallbackAdapter,
                        {"OPENAI_API_KEY": "test", "GROQ_API_KEY": "test"})
    assert isinstance(adapter, llm.FallbackAdapter)
    speech = sarvam.STT(api_key="test", model="saaras:v4", mode="codemix", sample_rate=16000)
    voice = sarvam.TTS(api_key="test", model="bulbul:v3", speaker="kavya", min_buffer_size=30, max_chunk_length=80, pace=1.05)
    backup = elevenlabs.TTS(api_key="test", model="eleven_multilingual_v2", voice_id="test")
    for provider in (adapter, speech, voice, backup):
        await provider.aclose()


@pytest.mark.parametrize("timeout", [0, -1, float("inf"), 30001, "1000"])
def test_unbounded_or_invalid_timeout_rejected(timeout):
    with pytest.raises(ValueError, match="timeout"):
        build_llm({"strictRouting": True, "timeoutMs": timeout}, None, None, {})
