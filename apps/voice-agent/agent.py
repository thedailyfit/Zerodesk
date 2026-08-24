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

ZERODESK_API = os.getenv("ZERODESK_API_URL", "https://zerodesk-api-production.up.railway.app")
VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "90ipbRoKi4CpHXvKVtl0")


# ==========================================
# FUNCTION TOOLS (Backend Interactivity)
# ==========================================

@function_tool()
async def book_appointment(
    customer_name: Annotated[str, "Patient's full name"],
    service_name: Annotated[str, "Treatment or service requested"],
    preferred_date: Annotated[str, "Date in YYYY-MM-DD format"],
    preferred_time: Annotated[str, "Time in HH:MM format"],
):
    """Book an appointment for the caller."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{ZERODESK_API}/v1/appointments",
                json={
                    "customerName": customer_name,
                    "serviceName": service_name,
                    "date": preferred_date,
                    "time": preferred_time,
                    "source": "VOICE_AI",
                },
                timeout=5
            ) as resp:
                if resp.status == 201:
                    return "Appointment booked successfully! A WhatsApp confirmation will be sent shortly."
                return "I could not book the slot right now. Let me connect you with our receptionist."
    except Exception:
        return "I am unable to reach the booking system right now. Transferring you to our desk."


@function_tool()
async def get_pricing(
    service_name: Annotated[str, "Name of the clinic service or treatment"],
):
    """Look up pricing for a specific treatment or clinic service."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{ZERODESK_API}/v1/services/search",
                params={"query": service_name},
                timeout=5
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    services = data.get("services", [])
                    if services:
                        lines = [f"{s.get('name')}: ₹{s.get('price')}" for s in services[:3]]
                        return "\n".join(lines)
                return f"I do not have specific pricing for '{service_name}'. I can connect you with staff for details."
    except Exception:
        return "I cannot check prices at this moment."


@function_tool()
async def transfer_to_human(
    reason: Annotated[str, "Reason for human transfer"] = "Customer request",
):
    """Transfer caller to human staff."""
    return f"Transferring your call to our human representative for {reason}. Please stay on the line."


# ==========================================
# MAIN AGENT ENTRYPOINT
# ==========================================

async def entrypoint(ctx: JobContext):
    """Triggered on every incoming call dispatched by LiveKit."""
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

    session = AgentSession(
        stt=sarvam.STT(
            language="hi-IN",
            model="saaras:v2",
        ),
        llm=openai.LLM(model="gpt-4o"),
        tts=elevenlabs.TTS(
            model_id="eleven_turbo_v2_5",
            voice_id=VOICE_ID,
        ),
        vad=silero.VAD.load(),
    )

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
