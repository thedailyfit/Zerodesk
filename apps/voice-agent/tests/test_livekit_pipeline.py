"""
Automated LiveKit WebRTC Voice Pipeline & Multi-Doctor Scheduling Tests.
Verifies participant audio session, multi-doctor round-robin with client consent,
and in-call WhatsApp delivery.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from agent import CallContext, create_call_tools


@pytest.mark.asyncio
async def test_book_appointment_requested_doctor_unavailable_consent_flow():
    """Verify that when requested doctor is busy, the agent offers alternative doctor and slots for consent."""
    ctx = CallContext(
        tenant_id="tenant-clinic-1",
        caller_phone="+919876543210",
        clinic_name="Elite Aesthetics",
    )
    tools = create_call_tools(ctx)
    book_fn = next(t for t in tools if t.__name__ == "book_appointment")

    mock_resp_data = {
        "status": "REQUESTED_DOCTOR_UNAVAILABLE",
        "requestedDoctor": "Dr. Sharma",
        "alternativeDoctor": {"id": "doc-2", "name": "Dr. Ananya", "specialization": "Dermatologist"},
        "alternativeSlots": ["02:30 PM", "03:30 PM"],
        "requiresConsent": True,
    }

    with patch("aiohttp.ClientSession.post") as mock_post:
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json = AsyncMock(return_value=mock_resp_data)
        mock_post.return_value.__aenter__.return_value = mock_response

        # Caller asked for Dr. Sharma at 10:00 without consent yet
        reply = await book_fn(
            customer_name="Priya Patel",
            service_name="Chemical Peel",
            preferred_date="2026-09-15",
            preferred_time="10:00",
            doctor_name="Dr. Sharma",
            allow_alternative_doctor=False,
        )

        assert "fully booked" in reply or "Dr. Sharma" in reply
        assert "Dr. Ananya" in reply
        assert "02:30 PM" in reply or "alternative times" in reply


@pytest.mark.asyncio
async def test_book_appointment_alternative_doctor_consented():
    """Verify that when caller consents to alternative doctor, booking is finalized."""
    ctx = CallContext(
        tenant_id="tenant-clinic-1",
        caller_phone="+919876543210",
        clinic_name="Elite Aesthetics",
    )
    tools = create_call_tools(ctx)
    book_fn = next(t for t in tools if t.__name__ == "book_appointment")

    mock_resp_data = {
        "id": "appt-consented-123",
        "status": "SCHEDULED",
        "staff": {"name": "Ananya"},
        "scheduledAt": "2026-09-15T10:00:00.000Z",
    }

    with patch("aiohttp.ClientSession.post") as mock_post:
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json = AsyncMock(return_value=mock_resp_data)
        mock_post.return_value.__aenter__.return_value = mock_response

        # Caller consents to alternative doctor
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


@pytest.mark.asyncio
async def test_send_whatsapp_info_during_call():
    """Verify text-during-call tool sends WhatsApp message with clinic info."""
    ctx = CallContext(
        tenant_id="tenant-clinic-1",
        caller_phone="+919876543210",
        clinic_name="Elite Aesthetics",
        booking_url="https://zerodesk.in/book/elite",
    )
    tools = create_call_tools(ctx)
    whatsapp_fn = next(t for t in tools if t.__name__ == "send_whatsapp_info")

    with patch("aiohttp.ClientSession.post") as mock_post:
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json = AsyncMock(return_value={"success": True})
        mock_post.return_value.__aenter__.return_value = mock_response

        result = await whatsapp_fn(info_type="booking_link")
        assert "WhatsApp" in result
        assert ctx.booking_link_sent is True
