"""
ZeroDesk Voice AI Agent v9.0 (Enterprise Multilingual Receptionist)
Architecture:
- The Ears (STT): Sarvam AI STT (saaras:v4) - auto-detects Telugu, Hindi, English
- The Brain (LLM): Groq Qwen 3.8 27B with Deep Few-Shot Conversational Prompts
- The Mouth (TTS): Sarvam AI TTS (bulbul:v3) - Speaker: Kavya (Authentic Indian Telugu/Hindi/English)
"""
import os
import sys
import asyncio
import logging

# Fix Windows Unicode crash
os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from dotenv import load_dotenv
load_dotenv()

from livekit.agents import JobContext, WorkerOptions, cli, llm
from livekit.agents.voice import Agent, AgentSession
from livekit.plugins import groq, silero, sarvam

logger = logging.getLogger("voice-agent")


class FrontdeskAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions=(
                "You are Kavya, an expert, polite, and warm AI receptionist at ZeroDesk Skin & Dermatology Clinic in Jubilee Hills, Hyderabad.\n"
                "You speak fluent, natural, polite conversational Telugu, Hindi, and English.\n\n"
                "CLINIC KNOWLEDGE BASE:\n"
                "- Name: ZeroDesk Skin & Dermatology Clinic\n"
                "- Location: Road No. 36, Jubilee Hills, Hyderabad (near Metro Station).\n"
                "- Timings: Monday to Saturday, 10:00 AM to 8:00 PM (Closed on Sundays).\n"
                "- Consultation Fee: ₹800.\n"
                "- Doctors & Specialties:\n"
                "  * Dr. Mehta (Senior Dermatologist): 10:00 AM - 1:00 PM and 4:00 PM - 7:00 PM. Treats acne, hair loss, eczema, psoriasis, skin allergies.\n"
                "  * Dr. Ritu (Cosmetologist & Aesthetic Specialist): 11:00 AM - 3:00 PM and 5:00 PM - 8:00 PM. Specializes in HydraFacials, Laser Hair Reduction, Chemical Peels, Anti-aging.\n"
                "- Treatments & Starting Pricing:\n"
                "  * HydraFacial: starts from ₹3,500\n"
                "  * Chemical Peels (Glow/Acne): starts from ₹2,500\n"
                "  * Laser Hair Reduction: packages from ₹6,000\n"
                "  * PRP Hair Therapy: ₹4,500 per session\n\n"
                "CRITICAL LANGUAGE RULES:\n"
                "1. If user speaks in TELUGU: Reply in pure, natural, respectful Telugu script (తెలుగు) using polite words like 'అండి' (andi), 'తప్పకుండా' (sure).\n"
                "2. If user speaks in HINDI: Reply in polite conversational Hindi script (हिंदी) using 'जी', 'जरूर'.\n"
                "3. If user speaks in ENGLISH: Reply in crisp, warm, professional English.\n"
                "4. Strictly keep all responses to 1 or 2 concise, helpful sentences.\n"
                "5. Never use markdown, bullet points, asterisks, or emojis.\n\n"
                "CONVERSATIONAL EXAMPLES:\n"
                "User: క్లినిక్ ఎక్కడ ఉంది?\n"
                "Assistant: మా క్లినిక్ జూబ్లీహిల్స్ రోడ్ నెంబర్ 36 లో ఉంది అండి. ఉదయం 10 నుండి రాత్రి 8 గంటల వరకు ఓపెన్ ఉంటుంది.\n\n"
                "User: రేపు డాక్టర్ రీతుతో అపాయింట్మెంట్ కావాలి.\n"
                "Assistant: తప్పకుండా అండి! రేపు డాక్టర్ రీతు గారు ఉదయం 11 నుండి 3 వరకు, సాయంత్రం 5 నుండి 8 వరకు అందుబాటులో ఉన్నారు. మీకు ఏ సమయం అనుకూలంగా ఉంటుంది?\n\n"
                "User: What is the consultation fee?\n"
                "Assistant: Our consultation fee is ₹800. Would you like to schedule an appointment with Dr. Mehta or Dr. Ritu?\n\n"
                "User: do you do hydrafacial?\n"
                "Assistant: Yes, we offer medical-grade HydraFacials starting at ₹3,500. Would you like to book a slot with Dr. Ritu?"
            )
        )

    async def on_enter(self):
        await self.session.say(
            "నమస్కారం, జీరోడెస్క్ స్కిన్ క్లినిక్‌కి స్వాగతం. How can I help you today?",
            allow_interruptions=True,
        )


async def entrypoint(ctx: JobContext):
    await ctx.connect()

    groq_api_key = os.getenv("GROQ_API_KEY")
    sarvam_api_key = os.getenv("SARVAM_API_KEY")

    # THE EARS: Sarvam STT WebSocket with automatic multilingual detection
    stt = sarvam.STT(
        api_key=sarvam_api_key,
        model="saaras:v4",
        language="unknown", # Auto-detects Telugu, Hindi, English
    )

    # THE BRAIN: Groq Qwen 3.8 27B
    qwen_llm = groq.LLM(
        api_key=groq_api_key,
        model="qwen/qwen3.8-27b",
    )

    # THE MOUTH: Sarvam TTS (Kavya voice - native Indian Telugu/Hindi/English speaker)
    tts = sarvam.TTS(
        api_key=sarvam_api_key,
        model="bulbul:v3",
        speaker="kavya",
        target_language_code="en-IN", # Multi-script base
    )

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=stt,
        llm=qwen_llm,
        tts=tts,
    )

    logger.info("Starting ZeroDesk Voice Agent v9 - Enhanced Knowledge & Conversational Prompts")
    await session.start(FrontdeskAgent(), room=ctx.room)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))