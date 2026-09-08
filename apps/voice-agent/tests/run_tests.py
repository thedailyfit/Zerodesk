import asyncio
import os
import sys
from unittest.mock import AsyncMock, patch

current_dir = os.path.dirname(os.path.abspath(__file__))
agent_dir = os.path.dirname(current_dir)
sys.path.insert(0, agent_dir)

from agent import CallContext, create_call_tools

def run_sync_tests():
    print("[1/5] Testing CallContext session isolation...")
    ctx1 = CallContext(tenant_id="tenant-dental-1", caller_phone="+919876543210", clinic_name="Smile Dental Clinic", room_name="room-1")
    ctx2 = CallContext(tenant_id="tenant-derma-2", caller_phone="+919123456780", clinic_name="Glow Derma Clinic", room_name="room-2")
    assert ctx1.tenant_id == "tenant-dental-1"
    assert ctx2.tenant_id == "tenant-derma-2"
    assert ctx1.clinic_name != ctx2.clinic_name
    assert ctx1.booking_link_sent is False
    assert ctx2.booking_link_sent is False
    print("  [OK] PASS: CallContext maintains strict isolation.")

    print("[2/5] Testing create_call_tools registration...")
    ctx = CallContext(tenant_id="tenant-test", caller_phone="+919999988888", clinic_name="Apollo Clinic")
    tools = create_call_tools(ctx)
    tool_names = [t.__name__ for t in tools]
    assert "book_appointment" in tool_names
    assert "get_pricing" in tool_names
    assert "query_knowledge_base" in tool_names
    assert "send_whatsapp_info" in tool_names
    assert "transfer_to_human" in tool_names
    assert len(tools) == 5
    print("  [OK] PASS: All 5 call tools registered successfully.")

async def run_async_tests():
    ctx = CallContext(tenant_id="tenant-clinic-1", caller_phone="+919876543210", clinic_name="Elite Aesthetics")
    tools = create_call_tools(ctx)
    book_fn = next(t for t in tools if t.__name__ == "book_appointment")

    print("[3/5] Testing Multi-Doctor Round-Robin: Requested Doctor Busy -> Consent Offer...")
    mock_busy_resp = {
        "status": "REQUESTED_DOCTOR_UNAVAILABLE",
        "requestedDoctor": "Dr. Sharma",
        "alternativeDoctor": {"id": "doc-2", "name": "Dr. Ananya", "specialization": "Dermatologist"},
        "alternativeSlots": ["02:30 PM", "03:30 PM"],
        "requiresConsent": True,
    }

    with patch("aiohttp.ClientSession.post") as mock_post:
        mock_resp = AsyncMock()
        mock_resp.status = 200
        mock_resp.json = AsyncMock(return_value=mock_busy_resp)
        mock_post.return_value.__aenter__.return_value = mock_resp

        reply = await book_fn(
            customer_name="Priya Patel",
            service_name="Chemical Peel",
            preferred_date="2026-09-15",
            preferred_time="10:00",
            doctor_name="Dr. Sharma",
            allow_alternative_doctor=False,
        )
        assert "Dr. Sharma" in reply
        assert "Dr. Ananya" in reply
        assert "02:30 PM" in reply or "alternative times" in reply
        print("  [OK] PASS: Offered Dr. Ananya and Dr. Sharma alternative slots for patient consent.")

    print("[4/5] Testing Multi-Doctor Round-Robin: Patient Consent Provided -> Booking Finalized...")
    mock_consent_resp = {
        "id": "appt-consented-123",
        "status": "SCHEDULED",
        "staff": {"name": "Ananya"},
        "scheduledAt": "2026-09-15T10:00:00.000Z",
    }

    with patch("aiohttp.ClientSession.post") as mock_post:
        mock_resp = AsyncMock()
        mock_resp.status = 200
        mock_resp.json = AsyncMock(return_value=mock_consent_resp)
        mock_post.return_value.__aenter__.return_value = mock_resp

        reply = await book_fn(
            customer_name="Priya Patel",
            service_name="Chemical Peel",
            preferred_date="2026-09-15",
            preferred_time="10:00",
            doctor_name="Dr. Sharma",
            allow_alternative_doctor=True,
        )
        assert "booked successfully" in reply or "confirmed" in reply
        assert "Dr. Ananya" in reply
        print("  [OK] PASS: Booked alternative doctor (Dr. Ananya) with client consent.")

    print("[5/5] Testing LiveKit In-Call WhatsApp Dispatch...")
    whatsapp_fn = next(t for t in tools if t.__name__ == "send_whatsapp_info")
    with patch("aiohttp.ClientSession.post") as mock_post:
        mock_resp = AsyncMock()
        mock_resp.status = 200
        mock_resp.json = AsyncMock(return_value={"success": True})
        mock_post.return_value.__aenter__.return_value = mock_resp

        result = await whatsapp_fn(info_type="booking_link")
        assert "WhatsApp" in result
        assert ctx.booking_link_sent is True
        print("  [OK] PASS: In-call WhatsApp delivery executed and tracked.")

if __name__ == "__main__":
    run_sync_tests()
    asyncio.run(run_async_tests())
    print("\n[SUCCESS] ALL 5/5 PYTHON VOICE AGENT TESTS PASSED!")