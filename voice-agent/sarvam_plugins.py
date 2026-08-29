"""
Sarvam AI STT Plugin for LiveKit Agents
Implements native Indian language transcription (Telugu, Hindi, Tamil, etc.)
using Sarvam AI's saaras:v3 model.
"""
import io
import wave
import logging
import aiohttp
from typing import Optional

from livekit.agents import stt, utils, DEFAULT_API_CONNECT_OPTIONS, APIConnectOptions

logger = logging.getLogger("sarvam-stt")

SARVAM_LANG_MAP = {
    "te-IN": "Telugu",
    "hi-IN": "Hindi",
    "en-IN": "English",
    "ta-IN": "Tamil",
    "kn-IN": "Kannada",
    "ml-IN": "Malayalam",
    "bn-IN": "Bengali",
    "gu-IN": "Gujarati",
    "mr-IN": "Marathi",
}


class SarvamSTT(stt.STT):
    """Custom LiveKit STT using Sarvam AI - natively transcribes Indian languages."""

    def __init__(self, *, api_key, model="saaras:v3", language_code="unknown", mode="transcribe"):
        super().__init__(
            capabilities=stt.STTCapabilities(streaming=False, interim_results=False)
        )
        self._api_key = api_key
        self._model = model
        self._language_code = language_code
        self._mode = mode
        self._detected_language = None

    @property
    def detected_language(self):
        return self._detected_language

    def _audio_buffer_to_wav_bytes(self, buffer):
        frame = utils.merge_frames(buffer)
        wav_buf = io.BytesIO()
        with wave.open(wav_buf, "wb") as wf:
            wf.setnchannels(frame.num_channels)
            wf.setsampwidth(2)
            wf.setframerate(frame.sample_rate)
            wf.writeframes(frame.data)
        wav_buf.seek(0)
        return wav_buf.read()

    async def _recognize_impl(self, buffer, *, language=None, conn_options=DEFAULT_API_CONNECT_OPTIONS):
        wav_bytes = self._audio_buffer_to_wav_bytes(buffer)
        lang_code = language or self._language_code

        async with aiohttp.ClientSession() as session:
            form = aiohttp.FormData()
            form.add_field("file", wav_bytes, filename="audio.wav", content_type="audio/wav")
            form.add_field("language_code", lang_code)
            form.add_field("model", self._model)
            form.add_field("mode", self._mode)

            async with session.post(
                "https://api.sarvam.ai/speech-to-text",
                headers={"api-subscription-key": self._api_key},
                data=form,
            ) as resp:
                if resp.status != 200:
                    error_text = await resp.text()
                    logger.error("Sarvam STT error: %s %s", resp.status, error_text)
                    return stt.SpeechEvent(
                        type=stt.SpeechEventType.FINAL_TRANSCRIPT,
                        alternatives=[stt.SpeechData(text="", language="en", confidence=0.0)],
                    )

                data = await resp.json()
                transcript = data.get("transcript", "")
                detected_lang = data.get("language_code", "en-IN")
                confidence = data.get("language_probability", 0.0)
                self._detected_language = detected_lang
                short_lang = detected_lang.split("-")[0] if detected_lang else "en"
                logger.info("Sarvam STT: transcript='%s' lang=%s conf=%.2f", transcript, detected_lang, confidence)

                return stt.SpeechEvent(
                    type=stt.SpeechEventType.FINAL_TRANSCRIPT,
                    alternatives=[stt.SpeechData(text=transcript, language=short_lang, confidence=confidence)],
                )


class SarvamTranslate:
    """Helper to translate text using Sarvam AI Translate API."""

    def __init__(self, api_key, model="mayura:v1"):
        self._api_key = api_key
        self._model = model

    async def translate(self, text, source_language_code="en-IN", target_language_code="te-IN"):
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://api.sarvam.ai/translate",
                headers={
                    "api-subscription-key": self._api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "input": text,
                    "source_language_code": source_language_code,
                    "target_language_code": target_language_code,
                    "model": self._model,
                },
            ) as resp:
                if resp.status != 200:
                    error_text = await resp.text()
                    logger.error("Sarvam Translate error: %s %s", resp.status, error_text)
                    return text
                data = await resp.json()
                translated = data.get("translated_text", text)
                logger.info("Sarvam Translate: '%s' -> '%s'", text[:50], translated[:50])
                return translated