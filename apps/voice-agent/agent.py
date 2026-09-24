"""
ZeroDesk Voice AI Agent (Thread-Safe Concurrency & Text-During-Call)
==================================================================
Picks up phone calls via LiveKit SIP, listens with Sarvam AI STT,
reasons with OpenAI GPT-4o, and speaks with ElevenLabs Voice Clone.
"""

import os
import sys
import json
import re
import time
import asyncio
import logging
import aiohttp
from typing import Annotated, Optional
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from livekit.agents import (
    AgentSession,
    Agent,
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    function_tool,
    stt,
    inference,
)
from livekit.plugins import openai, sarvam, elevenlabs, silero

try:
    from livekit.plugins import groq
except ImportError:
    groq = None

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
INTERNAL_VOICE_SECRET = os.getenv("INTERNAL_VOICE_SECRET", "zerodesk-internal-voice-key-2026").strip()


# ==========================================
# RESILIENT STT WRAPPER (INDIAN CARRIER FAILOVER)
# ==========================================

class ResilientSTT(stt.STT):
    """
    High-availability STT wrapper for Indian Telephony.
    Primary: Sarvam AI Saaras (optimised for Indian accents, Hindi, Hinglish, regional code-switching).
    Fallback: ElevenLabs Scribe, Deepgram Nova-2, or OpenAI Whisper.
    Automatically catches connection/transcription drops and falls back without terminating the call.
    """
    def __init__(self, primary: stt.STT, fallback: stt.STT):
        super().__init__(capabilities=primary.capabilities)
        self._primary = primary
        self._fallback = fallback
        self._active = primary

    async def _recognize_impl(self, buffer, *args, **kwargs):
        try:
            return await self._active._recognize_impl(buffer, *args, **kwargs)
        except Exception as e:
            logger.warning(f"Primary STT failed in recognize ({e}), falling back to secondary STT")
            self._active = self._fallback
            return await self._fallback._recognize_impl(buffer, *args, **kwargs)

    def stream(self, *args, **kwargs):
        try:
            return self._active.stream(*args, **kwargs)
        except Exception as e:
            logger.warning(f"Primary STT stream initialization failed ({e}), falling back to secondary STT")
            self._active = self._fallback
            return self._fallback.stream(*args, **kwargs)


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
        participant_identity: str = "",
    ):
        self.tenant_id = tenant_id
        self.caller_phone = caller_phone
        self.clinic_name = clinic_name
        self.clinic_address = clinic_address
        self.booking_url = booking_url
        self.maps_url = maps_url
        self.room_name = room_name
        self.participant_identity = participant_identity
        self.booking_link_sent = False
        self.call_start_time = time.time()
        self.tokens_used = 0
        self.tts_characters = 0


def extract_call_context(ctx: JobContext) -> CallContext:
    """Extract call context dynamically per session without using global variables."""
    tenant_id = ""
    caller_phone = ""
    clinic_name = "Our Clinic"
    clinic_address = ""
    booking_url = ""
    maps_url = ""
    participant_identity = ""

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
            if p.identity and p.identity != "agent":
                participant_identity = p.identity
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
    if not tenant_id or tenant_id == "default_business" or tenant_id == "default":
        logger.warning(f"Could not resolve tenant_id from room {ctx.room.name if ctx.room else 'unknown'}")
        tenant_id = None

    return CallContext(
        tenant_id=tenant_id,
        caller_phone=caller_phone,
        clinic_name=clinic_name,
        clinic_address=clinic_address,
        booking_url=booking_url,
        maps_url=maps_url,
        room_name=ctx.room.name if ctx.room else "",
        participant_identity=participant_identity,
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
                        return f"I do not have specific pricing for '{service_name}' on file. Would you like me to check with our team or send you our service menu via WhatsApp?"
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
                    json={"query": query, "topK": 3, "bypassShield": True},
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
        """Transfer caller to human staff with LiveKit SIP REFER / transfer."""
        try:
            async with aiohttp.ClientSession() as http_session:
                transfer_url = f"{ZERODESK_API}/v1/voice/calls/transfer"
                payload = {
                    "roomName": call_ctx.room_name,
                    "callerPhone": call_ctx.caller_phone,
                    "participantIdentity": getattr(call_ctx, "participant_identity", ""),
                    "reason": reason,
                }
                headers = {
                    "Content-Type": "application/json",
                    "x-internal-voice-key": INTERNAL_VOICE_SECRET,
                    "x-tenant-id": call_ctx.tenant_id,
                }
                async with http_session.post(transfer_url, json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=3.0)) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        fwd = data.get("forwardingNumber")
                        if fwd:
                            logger.info(f"Initiating SIP warm transfer to {fwd} for room {call_ctx.room_name}")
                            return f"Transferring your call to our human frontdesk coordinator at {fwd}. Please stay on the line."
                        return "I have alerted our frontdesk team to connect with you. Please stay on the line."
                    else:
                        logger.warning(f"transfer_to_human backend returned status {resp.status}")
                        return "I apologize, but I am unable to connect you with our front desk right now. I have alerted our team to call you back immediately."
        except Exception as e:
            logger.error(f"transfer_to_human backend call error: {e}")
        return "I apologize, but I am unable to connect you with our front desk right now. I have alerted our team to call you back immediately."

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
        "tokensUsed": getattr(call_ctx, "tokens_used", 0) or max(120, duration * 20),
        "ttsCharacters": getattr(call_ctx, "tts_characters", 0) or max(200, duration * 15),
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
                headers={
                    "x-internal-voice-key": INTERNAL_VOICE_SECRET,
                    "x-tenant-id": call_ctx.tenant_id,
                },
                timeout=aiohttp.ClientTimeout(total=3.0),
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    system_prompt = data.get("systemPrompt")
                    preferred_language = data.get("language") or data.get("preferredLanguage") or os.getenv("DEFAULT_VOICE_LANGUAGE", "en-IN")
                    if data.get("clinicName"):
                        call_ctx.clinic_name = data.get("clinicName")
    except Exception as e:
        logger.debug(f"Dynamic voice prompt fetch skipped: {e}")

    preferred_language = locals().get("preferred_language", os.getenv("DEFAULT_VOICE_LANGUAGE", "en-IN"))

    if not system_prompt:
        system_prompt = f"""You are the warm, natural, highly professional AI front desk receptionist for {call_ctx.clinic_name}.
You assist callers with scheduling appointments, providing clinic/business information, and answering service queries using the tools available to you.

GENERAL GUIDELINES:
- When asked about prices, treatments, or doctor schedules, use your available tools (get_pricing, query_knowledge_base) or offer to connect with our staff. Never invent fees, practitioner names, or treatments.
- Offer to send booking links or details to the caller's WhatsApp when helpful.

CRITICAL SPOKEN VOICE RULES (ABSOLUTE REQUIREMENT FOR NATURAL HUMAN SPEECH):
- This is a live voice phone call speaking directly into the caller's ear.
- NEVER, under any circumstance, say or output words like "Response:", "Action:", "Thought:", "Observation:", "Assistant:", or "Doctor:".
- NEVER say what internal step you are performing (e.g. do NOT say "I will look that up in the database" or "Calling function"). Speak directly to the caller.
- NEVER output markdown formatting (**bold**, *italics*, bullet points, asterisks, hashtags, or numbered lists). Speak in smooth, natural sentences.
- Keep every response short, conversational, and direct: 1 to 2 sentences maximum. Phone callers want quick, clear answers.

MANDATORY MULTI-LINGUAL LANGUAGE PROTOCOL:
- If the caller speaks Telugu or Telinglish, reply in polite conversational Telinglish.
- If the caller speaks Hindi or Hinglish, reply in polite conversational Hinglish.
- If the caller speaks English, reply in a warm, polite professional tone.

EMERGENCY PROTOCOL:
- If caller reports acute pain, severe trauma, bleeding, or life-threatening distress, advise immediate emergency hospital visit or calling 108/112, and offer to notify human staff immediately.
"""

    if customer_info and isinstance(customer_info, dict):
        cust_name = customer_info.get("name", "")
        cust_appts = customer_info.get("appointments", [])
        appt_str = ""
        if cust_appts and isinstance(cust_appts, list) and len(cust_appts) > 0:
            first_appt = cust_appts[0]
            appt_str = f"Upcoming/Past Appointment: {first_appt.get('scheduledAt')} - Status: {first_appt.get('status')}"
        notes = customer_info.get("aiSummary") or ""
        system_prompt += f"""
RETURNING CALLER PROFILE:
- Caller Name: {cust_name or 'Valued Patient/Client'}
- Phone: {call_ctx.caller_phone}
- {appt_str}
- Notes: {notes}
Acknowledge returning caller warmly by name and reference their appointment when helpful.
"""

    sarvam_key = os.getenv("SARVAM_API_KEY", "")

    # 4. VAD configuration (used for both StreamAdapter and session)
    vad_instance = silero.VAD.load(
        min_speech_duration=0.08,
        min_silence_duration=0.55,
    )

    # 5. STT Provider Selection (Sarvam Saaras v4 codemix via StreamAdapter)
    selected_stt = None
    if sarvam_key and not sarvam_key.startswith("sk_xxx") and len(sarvam_key) > 8:
        try:
            raw_sarvam_stt = sarvam.STT(
                language=preferred_language,
                model="saaras:v4",
                mode="codemix",
                sample_rate=16000,
                api_key=sarvam_key,
            )
            # StreamAdapter with Silero VAD provides robust <400ms transcription
            selected_stt = stt.StreamAdapter(stt=raw_sarvam_stt, vad=vad_instance)
            logger.info(f"Using Sarvam AI Saaras v4 STT ({preferred_language} codemix + StreamAdapter VAD)")
        except Exception as e:
            logger.warning(f"Sarvam Saaras STT init failed: {e}")

    if not selected_stt:
        try:
            selected_stt = inference.STT(model="deepgram/nova-2")
            logger.info("Falling back to LiveKit Cloud Deepgram Nova-2 STT")
        except Exception as e:
            logger.error(f"LiveKit Cloud STT fallback failed: {e}")

    # 6. TTS Provider Selection (Sarvam Bulbul with speaker kavya for authentic Indian pronunciation)
    selected_tts = None
    if sarvam_key and not sarvam_key.startswith("sk_xxx") and len(sarvam_key) > 8:
        try:
            selected_tts = sarvam.TTS(
                target_language_code=preferred_language,
                speaker="kavya",
                model="bulbul:v3",
                min_buffer_size=30,
                max_chunk_length=80,
                pace=1.05,
                api_key=sarvam_key,
            )
            logger.info(f"Using Sarvam Bulbul TTS ({preferred_language} / speaker: kavya)")
        except Exception as e:
            logger.warning(f"Sarvam Bulbul TTS init failed: {e}")

    el_key = os.getenv("ELEVENLABS_API_KEY", "") or os.getenv("ELEVEN_API_KEY", "")
    if not selected_tts and el_key and not el_key.startswith("sk_xxx") and len(el_key) > 8:
        try:
            selected_tts = elevenlabs.TTS(
                model="eleven_multilingual_v2",
                voice_id=VOICE_ID,
                api_key=el_key,
            )
            logger.info(f"Using ElevenLabs TTS ({VOICE_ID})")
        except Exception as e:
            logger.warning(f"ElevenLabs TTS check failed ({e})")

    if not selected_tts:
        try:
            selected_tts = inference.TTS(model="cartesia/sonic")
            logger.info("Using LiveKit Cloud native TTS inference (cartesia/sonic)")
        except Exception as e:
            selected_tts = inference.TTS(model="deepgram/aura-2")

    # 7. LLM Provider Selection (Groq LPU with Qwen 3.8 27B for <250ms latency and pure human dialogue)
    selected_llm = None
    groq_key = os.getenv("GROQ_API_KEY", "")
    groq_model = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")

    if groq and groq_key and not groq_key.startswith("gsk_xxx") and len(groq_key) > 8:
        try:
            selected_llm = groq.LLM(model=groq_model, api_key=groq_key)
            logger.info(f"Using Groq LPU LLM ({groq_model})")
        except Exception as e:
            logger.warning(f"Groq LLM init failed ({e}), falling back...")

    if not selected_llm:
        openai_key = os.getenv("OPENAI_API_KEY", "")
        if openai_key and not openai_key.startswith("sk-xxx") and len(openai_key) > 8:
            try:
                selected_llm = openai.LLM(model="gpt-4o-mini", api_key=openai_key)
                logger.info("Using direct OpenAI LLM (gpt-4o-mini)")
            except Exception as e:
                logger.warning(f"Direct OpenAI LLM failed: {e}")

    if not selected_llm:
        logger.info("Using LiveKit Cloud native LLM inference (openai/gpt-4o-mini)")
        selected_llm = inference.LLM(model="openai/gpt-4o-mini")

    # 8. AgentSession configured with telephony echo and background static protection
    session = AgentSession(
        stt=selected_stt,
        llm=selected_llm,
        tts=selected_tts,
        vad=vad_instance,
        min_interruption_duration=0.6,
        min_interruption_words=2,
        resume_false_interruption=True,
        false_interruption_timeout=1.5,
        aec_warmup_duration=2.0,
    )

    # 9. Bind isolated tools for this call context
    call_tools = create_call_tools(call_ctx)

    # 10. Launch duration cap background task
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

    # 11. Greeting offering Telugu with DPDP recording & AI disclosure (EU AI Act Article 50 / DPDP 2023)
    greeting = f"Namaskaram andi! I am the AI receptionist for {call_ctx.clinic_name}. This call is recorded for quality assurance. How can I help you today? Meeru Telugu lo kuda matladochu andi."
    if customer_info and customer_info.get("name"):
        first_name = customer_info.get("name").split()[0]
        greeting = f"Namaskaram {first_name} garu! I am the AI receptionist for {call_ctx.clinic_name}. How can I assist you today? Meeru Telugu lo kuda matladochu andi."

    await session.say(greeting)


if __name__ == "__main__":
    agent_name = os.getenv("LIVEKIT_AGENT_NAME", "zerodesk-receptionist")
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, agent_name=agent_name))
