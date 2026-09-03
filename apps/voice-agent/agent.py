"""
ZeroDesk Voice AI Agent
========================
Picks up phone calls via LiveKit SIP, listens with Sarvam AI STT,
reasons with OpenAI GPT-4o, and speaks with ElevenLabs Voice Clone.
"""

import os
import asyncio
import aiohttp
from typing import Annotated
from dotenv import load_dotenv

from livekit.agents import (
    AgentSession,
    Agent,
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    function_tool,
)
from livekit.plugins import openai, sarvam, elevenlabs, silero

# Load .env variables
load_dotenv()

ZERODESK_API = os.getenv("ZERODESK_API_URL", "http://localhost:4000")
VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "90ipbRoKi4CpHXvKVtl0")
INTERNAL_VOICE_SECRET = os.getenv("INTERNAL_VOICE_SECRET", "zerodesk-internal-voice-key-2026")

# Dynamic contextual tenant reference set at session entrypoint
ACTIVE_TENANT_ID = os.getenv("DEFAULT_TENANT_ID", "")


# ==========================================
# FUNCTION TOOLS (Backend Interactivity)
# ==========================================

@function_tool()
async def book_appointment(
    customer_name: Annotated[str, "Patient's or caller's full name"],
    service_name: Annotated[str, "Treatment, procedure, or service requested"],
    preferred_date: Annotated[str, "Date in YYYY-MM-DD format (or 'tomorrow')"],
    preferred_time: Annotated[str, "Time in HH:MM format (e.g. '14:00' or '10:30')"],
):
    """Book an appointment for the caller."""
    try:
        tenant_id = ACTIVE_TENANT_ID or os.getenv("DEFAULT_TENANT_ID", "")
        headers = {
            "x-internal-voice-key": INTERNAL_VOICE_SECRET,
            "x-tenant-id": tenant_id,
            "Content-Type": "application/json",
        }
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{ZERODESK_API}/v1/appointments/voice-book",
                headers=headers,
                json={
                    "customerName": customer_name,
                    "serviceName": service_name,
                    "date": preferred_date,
                    "time": preferred_time,
                    "source": "VOICE_AI",
                },
                timeout=aiohttp.ClientTimeout(total=6)
            ) as resp:
                if resp.status in (200, 201):
                    result = await resp.json()
                    return f"Appointment booked successfully for {customer_name} on {preferred_date} at {preferred_time}! A confirmation SMS/WhatsApp has been sent."
                error_body = await resp.text()
                return "I could not confirm that specific slot right now. Let me connect you with our frontdesk team."
    except Exception as e:
        return "I am unable to reach the booking system right now. Transferring you to our desk."


@function_tool()
async def get_pricing(
    service_name: Annotated[str, "Name of the clinic service or treatment"],
):
    """Look up pricing for a specific treatment or clinic service."""
    try:
        tenant_id = ACTIVE_TENANT_ID or os.getenv("DEFAULT_TENANT_ID", "")
        headers = {
            "x-internal-voice-key": INTERNAL_VOICE_SECRET,
            "x-tenant-id": tenant_id,
        }
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{ZERODESK_API}/v1/services/search",
                headers=headers,
                params={"query": service_name},
                timeout=aiohttp.ClientTimeout(total=5)
            ) as resp:
                if resp.status == 200:
                    services = await resp.json()
                    if isinstance(services, list) and len(services) > 0:
                        lines = [f"{s.get('name')}: ₹{s.get('price')} ({s.get('duration', 30)} mins)" for s in services[:3]]
                        return "\n".join(lines)
                    return f"Our {service_name} starts with a consultation fee of ₹800. For exact treatment options, I can connect you with the doctor."
                return f"I do not have specific pricing for '{service_name}'. I can connect you with staff for details."
    except Exception:
        return "I cannot check prices at this moment."


@function_tool()
async def transfer_to_human(
    reason: Annotated[str, "Reason for human transfer"] = "Customer request",
):
    """Transfer caller to human staff."""
    return f"Transferring your call to our human frontdesk team for {reason}. Please stay on the line."


# ==========================================
# MAIN AGENT ENTRYPOINT
# ==========================================

async def entrypoint(ctx: JobContext):
    """Triggered on every incoming call dispatched by LiveKit."""
    global ACTIVE_TENANT_ID

    # Extract tenant_id from room metadata if provided by LiveKit dispatch
    if ctx.room and ctx.room.metadata:
        try:
            import json
            meta = json.loads(ctx.room.metadata)
            if "tenant_id" in meta:
                ACTIVE_TENANT_ID = meta["tenant_id"]
        except Exception:
            pass

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Dynamic system prompt
    system_prompt = """You are a warm, highly professional AI receptionist for the clinic/business.

CAPABILITIES:
- Book appointments (book_appointment)
- Check service pricing & details (get_pricing)
- Transfer to human staff (transfer_to_human)

STRICT GUIDELINES:
- Keep answers concise and natural for voice conversation (1-2 sentences maximum).
- If the patient speaks in Telugu, Hindi, or any Indian regional language, reply fluently in the SAME language.
- Confirm patient name, date, and service clearly before booking.
- Always maintain empathy, politeness, and high clarity.
"""

    # Configurable STT provider with graceful fallback cascade
    selected_stt = None
    if os.getenv("SARVAM_API_KEY"):
        try:
            selected_stt = sarvam.STT(language="hi-IN", model="saaras:v2")
        except Exception as e:
            print(f"Warning: Sarvam STT init failed ({e}), falling back...")

    if not selected_stt and os.getenv("OPENAI_API_KEY"):
        selected_stt = openai.STT()

    # Configurable TTS provider with graceful fallback
    selected_tts = None
    if os.getenv("ELEVENLABS_API_KEY"):
        try:
            selected_tts = elevenlabs.TTS(
                model_id="eleven_turbo_v2_5",
                voice_id=VOICE_ID,
            )
        except Exception as e:
            print(f"Warning: ElevenLabs TTS init failed ({e}), falling back to OpenAI...")

    if not selected_tts:
        selected_tts = openai.TTS(voice="alloy")

    # Tuned Silero VAD parameters for Indian PSTN telephony latency & noise suppression
    vad_instance = silero.VAD.load(
        min_speech_duration=0.25,
        min_silence_duration=0.45,
    )

    session = AgentSession(
        stt=selected_stt,
        llm=openai.LLM(model="gpt-4o"),
        tts=selected_tts,
        vad=vad_instance,
    )

    @ctx.room.on("disconnected")
    def on_disconnected():
        print(f"Voice call ended cleanly for room {ctx.room.name}, tenant: {ACTIVE_TENANT_ID}")

    await session.start(
        room=ctx.room,
        agent=Agent(
            instructions=system_prompt,
            tools=[book_appointment, get_pricing, transfer_to_human],
        ),
    )

    # Greeting
    await session.say("Hello! Welcome to our clinic. How may I help you today?")


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
