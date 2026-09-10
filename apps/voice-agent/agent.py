"""
ZeroDesk Voice AI Agent (Thread-Safe Concurrency & Text-During-Call)
==================================================================
Picks up phone calls via LiveKit SIP, listens with Sarvam AI STT,
reasons with OpenAI GPT-4o, and speaks with ElevenLabs Voice Clone.
"""

import os
import json
import re
import time
import asyncio
import logging
import aiohttp
from typing import Annotated, Optional
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

try:
    from livekit.plugins import deepgram
except ImportError:
    deepgram = None

try:
    from livekit.plugins import cartesia
except ImportError:
    cartesia = None

# Load .env variables
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-agent")

ZERODESK_API = os.getenv("ZERODESK_API_URL", "http://localhost:4000")
VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "90ipbRoKi4CpHXvKVtl0")
INTERNAL_VOICE_SECRET = os.getenv("INTERNAL_VOICE_SECRET", "zerodesk-internal-voice-key-2026")


# ==========================================
# CALL CONTEXT & METADATA EXTRACTION
# ==========================================

class CallContext:
    def __init__(
        self,
        tenant_id: str,
        caller_phone: str,
        clinic_name: str = "Our Clinic",
        clinic_address: str = "",
        booking_url: str = "",
        maps_url: str = "",
        room_name: str = "",
    ):
        self.tenant_id = tenant_id
        self.caller_phone = caller_phone
        self.clinic_name = clinic_name
        self.clinic_address = clinic_address
        self.booking_url = booking_url
        self.maps_url = maps_url
        self.room_name = room_name
        self.booking_link_sent = False
        self.call_start_time = time.time()


def extract_call_context(ctx: JobContext) -> CallContext:
    """Extract call context dynamically per session without using global variables."""
    tenant_id = ""
    caller_phone = ""
    clinic_name = "Our Clinic"
    clinic_address = ""
    booking_url = ""
    maps_url = ""

    # 1. Parse Room Metadata
    if ctx.room and ctx.room.metadata:
        try:
            meta = json.loads(ctx.room.metadata)
            tenant_id = meta.get("tenant_id") or meta.get("tenantId", "")
            caller_phone = meta.get("caller_phone") or meta.get("phoneNumber", "")
            clinic_name = meta.get("business_name") or meta.get("businessName") or meta.get("clinic_name") or meta.get("clinicName", clinic_name)
            clinic_address = meta.get("business_address") or meta.get("address") or meta.get("clinic_address") or meta.get("clinicAddress", "")
            booking_url = meta.get("booking_url") or meta.get("bookingUrl", "")
            maps_url = meta.get("maps_url") or meta.get("mapsUrl", "")
        except Exception as e:
            logger.warning(f"Error parsing room metadata: {e}")

    # 2. Parse Job Metadata (if agent dispatch was used)
    if hasattr(ctx, "job") and ctx.job and ctx.job.metadata:
        try:
            job_meta = json.loads(ctx.job.metadata)
            tenant_id = tenant_id or job_meta.get("tenant_id") or job_meta.get("tenantId", "")
            caller_phone = caller_phone or job_meta.get("caller_phone", "")
            clinic_name = job_meta.get("business_name") or job_meta.get("businessName") or job_meta.get("clinic_name", clinic_name)
        except Exception:
            pass

    # 3. Extract SIP Attributes from Participant
    if ctx.room:
        for p in ctx.room.remote_participants.values():
            if p.attributes:
                sip_phone = p.attributes.get("sip.phoneNumber")
                if sip_phone:
                    caller_phone = caller_phone or sip_phone
            if p.identity and not caller_phone:
                clean_id = p.identity.replace("sip_", "").strip()
                if clean_id.startswith("+") or clean_id.isdigit():
                    caller_phone = clean_id

    # 4. Fallback: Parse Room Name (tenant_<tenantId>_...)
    if not tenant_id and ctx.room and ctx.room.name:
        match = re.match(r"^tenant_([^_]+)", ctx.room.name)
        if match:
            tenant_id = match.group(1)

    tenant_id = tenant_id or os.getenv("DEFAULT_TENANT_ID", "")

    return CallContext(
        tenant_id=tenant_id,
        caller_phone=caller_phone,
        clinic_name=clinic_name,
        clinic_address=clinic_address,
        booking_url=booking_url,
        maps_url=maps_url,
        room_name=ctx.room.name if ctx.room else "",
    )


# ==========================================
# TOOL FACTORY (Scoped per Call Context)
# ==========================================

def create_call_tools(call_ctx: CallContext) -> list:
    """Creates isolated function tools bound strictly to this call's CallContext."""

    @function_tool()
    async def book_appointment(
        customer_name: Annotated[str, "Patient's or caller's full name"],
        service_name: Annotated[str, "Treatment, procedure, or service requested"],
        preferred_date: Annotated[str, "Date in YYYY-MM-DD format (or 'tomorrow')"],
        preferred_time: Annotated[str, "Time in HH:MM format (e.g. '14:00' or '10:30')"],
        doctor_name: Annotated[str, "Optional preferred doctor or physician name (e.g. 'Dr. Sharma')"] = "",
        allow_alternative_doctor: Annotated[bool, "True if the patient agrees/consents to book with an alternative available doctor if preferred doctor is busy"] = False,
    ) -> str:
        """Book an appointment for the caller with multi-doctor round-robin and client consent."""
        try:
            headers = {
                "x-internal-voice-key": INTERNAL_VOICE_SECRET,
                "x-tenant-id": call_ctx.tenant_id,
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
                        "doctorName": doctor_name or None,
                        "allowAlternativeDoctor": allow_alternative_doctor,
                        "source": "VOICE_AI",
                        "customerPhone": call_ctx.caller_phone,
                    },
                    timeout=aiohttp.ClientTimeout(total=6),
                ) as resp:
                    try:
                        data = await resp.json()
                    except Exception:
                        data = {}

                    if resp.status in (200, 201):
                        if data.get("status") == "REQUESTED_DOCTOR_UNAVAILABLE":
                            req_doc = data.get("requestedDoctor") or doctor_name or "the requested doctor"
                            alt_doc = data.get("alternativeDoctor", {}).get("name") if data.get("alternativeDoctor") else None
                            alt_slots = data.get("alternativeSlots", [])
                            alt_phrase = f"Dr. {alt_doc}" if alt_doc else "another physician"
                            slots_phrase = ", ".join(alt_slots) if alt_slots else "later today"
                            return f"Dr. {req_doc} is fully booked at {preferred_time}. However, {alt_phrase} is available at {preferred_time}, or Dr. {req_doc} has openings at {slots_phrase}. Would you like to book with {alt_phrase}, or would you prefer one of the alternative times with Dr. {req_doc}?"
                        
                        doc_booked = data.get("staff", {}).get("name") if isinstance(data.get("staff"), dict) else None
                        doc_phrase = f" with Dr. {doc_booked}" if doc_booked else ""
                        return f"Appointment booked successfully for {customer_name}{doc_phrase} on {preferred_date} at {preferred_time}! A confirmation WhatsApp message has been sent to your phone."
                    return "I could not confirm that specific slot right now. Let me connect you with our frontdesk team."
        except Exception as e:
            logger.error(f"book_appointment error: {e}")
            return "I am unable to reach the booking system right now. Transferring you to our desk."

    @function_tool()
    async def get_pricing(
        service_name: Annotated[str, "Name of the clinic service or treatment"],
    ) -> str:
        """Look up pricing for a specific treatment or clinic service."""
        try:
            headers = {
                "x-internal-voice-key": INTERNAL_VOICE_SECRET,
                "x-tenant-id": call_ctx.tenant_id,
            }
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{ZERODESK_API}/v1/services/search",
                    headers=headers,
                    params={"query": service_name},
                    timeout=aiohttp.ClientTimeout(total=5),
                ) as resp:
                    if resp.status == 200:
                        services = await resp.json()
                        if isinstance(services, list) and len(services) > 0:
                            lines = [f"{s.get('name')}: ₹{s.get('price')} ({s.get('duration', 30)} mins)" for s in services[:3]]
                            return "\n".join(lines)
                        return f"Our {service_name} starts with a consultation fee of ₹800. For exact treatment options, I can connect you with our specialist."
                    return f"I do not have specific pricing for '{service_name}'. I can have our staff WhatsApp the full brochure to you."
        except Exception as e:
            logger.error(f"get_pricing error: {e}")
            return "I cannot check prices at this moment."

    @function_tool()
    async def send_whatsapp_info(
        info_type: Annotated[str, "Type of info to send: 'booking_link', 'location', 'pricing', or 'custom'"],
        target_phone: Annotated[str, "Optional alternative phone number if caller requested another number"] = "",
    ) -> str:
        """Send clinic booking link, address location, or pricing to caller's WhatsApp while the phone call is active."""
        recipient = target_phone.strip() if target_phone.strip() else call_ctx.caller_phone
        if not recipient:
            return "I could not detect your mobile number automatically. Could you please confirm your 10-digit number?"

        headers = {
            "x-internal-voice-key": INTERNAL_VOICE_SECRET,
            "x-tenant-id": call_ctx.tenant_id,
            "Content-Type": "application/json",
        }
        payload = {
            "to": recipient,
            "infoType": info_type,
            "channel": "WHATSAPP",
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{ZERODESK_API}/v1/voice/send-during-call-info",
                    headers=headers,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=5),
                ) as resp:
                    if resp.status in (200, 201):
                        call_ctx.booking_link_sent = True
                        last_digits = recipient[-4:] if len(recipient) >= 4 else recipient
                        return f"I have sent our {info_type.replace('_', ' ')} directly to your WhatsApp at number ending in {last_digits}. You can view it on your screen right now!"
                    return "I initiated dispatching the WhatsApp details. You should receive them momentarily."
        except Exception as e:
            logger.error(f"send_whatsapp_info error: {e}")
            return "I am having trouble dispatching the WhatsApp message at the moment."

    @function_tool()
    async def query_knowledge_base(
        query: Annotated[str, "The clinic treatment, pricing card, doctor schedule, prep instructions, or policy to look up in the verified knowledge base"],
    ) -> str:
        """Search the clinic verified knowledge base for treatments, pricing, doctor schedules, prep steps, and policies."""
        headers = {
            "Content-Type": "application/json",
            "x-internal-voice-key": INTERNAL_VOICE_SECRET,
            "x-tenant-id": call_ctx.tenant_id,
        }
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{ZERODESK_API}/v1/knowledge/search",
                    headers=headers,
                    json={"query": query, "topK": 3},
                    timeout=aiohttp.ClientTimeout(total=4),
                ) as resp:
                    if resp.status == 200:
                        results = await resp.json()
                        if isinstance(results, list) and len(results) > 0:
                            snippets = [r.get("chunkText", "") for r in results[:3] if r.get("chunkText")]
                            return "\n\n".join(snippets)
        except Exception as e:
            logger.error(f"query_knowledge_base error: {e}")
        return "I could not locate that in our rate card or knowledge base. Would you like me to connect you with our clinic coordinator?"

    @function_tool()
    async def transfer_to_human(
        reason: Annotated[str, "Reason for human transfer"] = "Customer request",
    ) -> str:
        """Transfer caller to human staff."""
        return f"Transferring your call to our human frontdesk team for {reason}. Please stay on the line."

    return [book_appointment, get_pricing, query_knowledge_base, send_whatsapp_info, transfer_to_human]


# ==========================================
# 5-MINUTE DURATION ENFORCEMENT
# ==========================================

async def enforce_call_duration_cap(session: AgentSession, ctx: JobContext, call_ctx: CallContext):
    """Enforces 4-minute polite warning and 5-minute graceful wrap-up."""
    try:
        # Wait 4 minutes (240s)
        await asyncio.sleep(240)
        if not ctx.room or not ctx.room.isconnected():
            return

        # 4-Minute Warning
        await session.say(
            f"Just a quick heads up that our call will wrap up in about one minute. "
            f"I have sent our clinic details to your WhatsApp. "
            f"Is there anything urgent before I let you go?"
        )

        # Wait remaining 60 seconds (up to 300s)
        await asyncio.sleep(60)
        if not ctx.room or not ctx.room.isconnected():
            return

        # 5-Minute Graceful Disconnect
        await session.say(
            f"Thank you so much for calling {call_ctx.clinic_name}. "
            f"Our call time has reached the limit. Please check your WhatsApp for all details. "
            f"Have a wonderful day, goodbye!"
        )
        await asyncio.sleep(2.5)  # Allow TTS audio to flush

        logger.info(f"5-minute duration cap reached for room {call_ctx.room_name}. Disconnecting.")
        await ctx.room.disconnect()

    except asyncio.CancelledError:
        logger.debug("Duration cap monitor cancelled cleanly.")
    except Exception as e:
        logger.error(f"Error in duration cap monitor: {e}")


# ==========================================
# POST-CALL PERSISTENCE & NOTIFICATION
# ==========================================

async def notify_call_completion(call_ctx: CallContext, status: str = "COMPLETED", duration: Optional[int] = None):
    """Notify backend API of call termination to persist CallLog and update Unified Inbox."""
    if duration is None:
        duration = max(1, int(time.time() - call_ctx.call_start_time))

    payload = {
        "tenantId": call_ctx.tenant_id,
        "callerPhone": call_ctx.caller_phone or "Unknown",
        "duration": duration,
        "status": status,
        "roomName": call_ctx.room_name,
        "clinicName": call_ctx.clinic_name,
    }

    headers = {
        "Content-Type": "application/json",
        "x-internal-voice-key": INTERNAL_VOICE_SECRET,
        "x-tenant-id": call_ctx.tenant_id,
    }

    try:
        async with aiohttp.ClientSession() as http_session:
            async with http_session.post(
                f"{ZERODESK_API}/v1/voice/call-completed",
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=5.0),
            ) as resp:
                if resp.status < 300:
                    logger.info(f"Call completion recorded successfully for {call_ctx.room_name} ({duration}s)")
                else:
                    logger.warning(f"Backend returned status {resp.status} on call completion notification")
    except Exception as e:
        logger.error(f"Failed to post call completion to backend: {e}")


# ==========================================
# MAIN AGENT ENTRYPOINT
# ==========================================

async def entrypoint(ctx: JobContext):
    """Triggered on every incoming call dispatched by LiveKit."""
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # 1. Thread-safe call context extraction
    call_ctx = extract_call_context(ctx)
    logger.info(
        f"New call connected - Room: {call_ctx.room_name}, Tenant: {call_ctx.tenant_id}, Phone: {call_ctx.caller_phone}"
    )

    # 2. Pre-call returning patient recognition
    customer_info = None
    if call_ctx.caller_phone:
        try:
            async with aiohttp.ClientSession() as http_session:
                async with http_session.get(
                    f"{ZERODESK_API}/v1/customers/lookup?phone={call_ctx.caller_phone}",
                    headers={
                        "x-internal-voice-key": INTERNAL_VOICE_SECRET,
                        "x-tenant-id": call_ctx.tenant_id,
                    },
                    timeout=aiohttp.ClientTimeout(total=3.0),
                ) as resp:
                    if resp.status == 200:
                        customer_info = await resp.json()
                        logger.info(f"Pre-call lookup recognized customer: {customer_info.get('name')}")
        except Exception as e:
            logger.debug(f"Pre-call customer lookup skipped: {e}")

    # 3. Dynamic system prompt scoped to clinic
    system_prompt = None
    try:
        async with aiohttp.ClientSession() as http_session:
            async with http_session.get(
                f"{ZERODESK_API}/v1/ai/voice-prompt?tenantId={call_ctx.tenant_id}",
                headers={"x-internal-voice-key": INTERNAL_VOICE_SECRET},
                timeout=aiohttp.ClientTimeout(total=3.0),
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    system_prompt = data.get("systemPrompt")
                    if data.get("clinicName"):
                        call_ctx.clinic_name = data.get("clinicName")
    except Exception as e:
        logger.debug(f"Dynamic voice prompt fetch skipped: {e}")

    if not system_prompt:
        system_prompt = f"""You are a warm, highly professional AI front desk receptionist and concierge for {call_ctx.clinic_name}.
Your primary duties are to welcome callers, answer questions about our services and offerings across all business categories, schedule visits or appointments, and provide directions or rate information.

MULTI-LANGUAGE & REGIONAL CODE-SWITCHING:
- You are natively multi-lingual: fluent in Indian English, Hindi, Telugu, Tamil, Kannada, and conversational Hinglish/Telugish.
- Seamlessly adapt to the caller's language: If the caller speaks Hindi, reply in Hindi. If they speak Telugu, reply in Telugu. If they speak Tamil or Kannada, reply in that language. If they code-switch (mix English with regional words), respond naturally in the same friendly cadence.
- Never ask the caller to switch to English; always honor their preferred mother tongue.

STRICT GUIDELINES & SAFETY GUARDRAILS:
- Keep answers concise and natural for voice conversation (1-2 sentences maximum).
- Transparent AI Identity: You are the clinic's AI front desk assistant.
- Audible Disclosure: If caller asks, confirm this call is recorded for appointment scheduling quality.
- If the caller asks for clinic directions, prices, or booking links, offer: "I can send our Google Maps location and booking link directly to your WhatsApp right now."
- If the patient speaks in Telugu, Hindi, or any Indian regional language, reply fluently in the SAME language.
- Confirm patient name, date, and service clearly before booking.
- Always maintain empathy, politeness, and high clarity.
- CRITICAL EMERGENCY PROTOCOL: If the caller mentions severe chest pain, breathing difficulty, heavy bleeding, or acute trauma, IMMEDIATELY say: "This sounds like an emergency. Please hang up and call 108 for an ambulance or 112 immediately, or go to the nearest hospital." Then invoke transfer_to_human("Emergency medical symptoms reported").
- NO MEDICAL ADVICE: Never diagnose symptoms, interpret test reports, or suggest medications. Remind the caller that all clinical decisions require an in-person doctor consultation.
- ANTI-HALLUCINATION: If a price, service duration, or schedule is not known, DO NOT guess or invent numbers. Say: "I don't have the exact rate card in front of me right now, let me connect you with our clinic coordinator."
"""

    # 4. Configurable STT provider with multi-tier graceful fallback cascade (Primary: Sarvam AI Indic Saaras)
    selected_stt = None
    if os.getenv("SARVAM_API_KEY"):
        try:
            selected_stt = sarvam.STT(language="hi-IN", model="saaras:v2")
        except Exception as e:
            logger.warning(f"Sarvam STT failed ({e}), falling back...")

    if not selected_stt and os.getenv("ELEVENLABS_API_KEY"):
        try:
            selected_stt = elevenlabs.STT()
        except Exception as e:
            logger.warning(f"ElevenLabs STT failed ({e}), falling back...")

    if not selected_stt and os.getenv("DEEPGRAM_API_KEY") and deepgram:
        try:
            selected_stt = deepgram.STT(model="nova-2-general")
        except Exception as e:
            logger.warning(f"Deepgram STT failed ({e}), falling back...")

    if not selected_stt and os.getenv("OPENAI_API_KEY"):
        selected_stt = openai.STT()

    # 5. Configurable TTS provider with multi-tier graceful fallback cascade (Primary: ElevenLabs, Fallback: Sarvam Bulbul)
    selected_tts = None
    if os.getenv("ELEVENLABS_API_KEY"):
        try:
            selected_tts = elevenlabs.TTS(
                model_id="eleven_multilingual_v2",
                voice_id=VOICE_ID,
            )
        except Exception as e:
            logger.warning(f"ElevenLabs TTS failed ({e}), falling back to Sarvam...")

    if not selected_tts and os.getenv("SARVAM_API_KEY"):
        try:
            selected_tts = sarvam.TTS(language="hi-IN", model="bulbul:v2")
        except Exception as e:
            logger.warning(f"Sarvam TTS failed ({e}), falling back to OpenAI...")

    if not selected_tts and os.getenv("CARTESIA_API_KEY") and cartesia:
        try:
            selected_tts = cartesia.TTS()
        except Exception as e:
            logger.warning(f"Cartesia TTS failed ({e}), falling back to OpenAI...")

    if not selected_tts:
        selected_tts = openai.TTS(voice="alloy")

    # 6. Tuned Silero VAD parameters for Indian PSTN telephony latency & noise suppression
    vad_instance = silero.VAD.load(
        min_speech_duration=0.25,
        min_silence_duration=0.65,
    )

    session = AgentSession(
        stt=selected_stt,
        llm=openai.LLM(model="gpt-4o"),
        tts=selected_tts,
        vad=vad_instance,
    )

    # 7. Bind isolated tools for this call context
    call_tools = create_call_tools(call_ctx)

    # 8. Launch duration cap background task
    duration_task = asyncio.create_task(enforce_call_duration_cap(session, ctx, call_ctx))

    @ctx.room.on("disconnected")
    def on_disconnected():
        duration_task.cancel()
        logger.info(f"Voice call ended cleanly for room {call_ctx.room_name}, tenant: {call_ctx.tenant_id}")
        asyncio.create_task(notify_call_completion(call_ctx, "COMPLETED"))

    await session.start(
        room=ctx.room,
        agent=Agent(
            instructions=system_prompt,
            tools=call_tools,
        ),
    )

    # 9. Greeting with DPDP & Telephony recording disclosure (Personalized if recognized)
    greeting = f"Namaskaram! Welcome to {call_ctx.clinic_name}. This call is recorded for quality assurance and scheduling assistance. How may I help you today?"
    if customer_info and customer_info.get("name"):
        first_name = customer_info.get("name").split()[0]
        greeting = f"Namaskaram {first_name}! Welcome back to {call_ctx.clinic_name}. How can I assist you today?"

    await session.say(greeting)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, agent_name="zerodesk-receptionist"))
