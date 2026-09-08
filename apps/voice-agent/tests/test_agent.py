"""
Unit and integration test suite for ZeroDesk Voice AI Agent.
Tests CallContext extraction, function tools, and fallback adapters.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from agent import CallContext, create_call_tools, extract_call_context


def test_call_context_session_isolation():
    """Verify that multiple concurrent call contexts maintain isolated tenant and caller state."""
    ctx1 = CallContext(
        tenant_id="tenant-dental-1",
        caller_phone="+919876543210",
        clinic_name="Smile Dental Clinic",
        room_name="room-1",
    )
    ctx2 = CallContext(
        tenant_id="tenant-derma-2",
        caller_phone="+919123456780",
        clinic_name="Glow Derma Clinic",
        room_name="room-2",
    )

    assert ctx1.tenant_id == "tenant-dental-1"
    assert ctx2.tenant_id == "tenant-derma-2"
    assert ctx1.clinic_name != ctx2.clinic_name
    assert ctx1.booking_link_sent is False
    assert ctx2.booking_link_sent is False


def test_create_call_tools_registration():
    """Verify that create_call_tools registers all 5 required tools including query_knowledge_base."""
    ctx = CallContext(
        tenant_id="tenant-test",
        caller_phone="+919999988888",
        clinic_name="Apollo Clinic",
    )
    tools = create_call_tools(ctx)
    tool_names = [t.__name__ for t in tools]

    assert "book_appointment" in tool_names
    assert "get_pricing" in tool_names
    assert "query_knowledge_base" in tool_names
    assert "send_whatsapp_info" in tool_names
    assert "transfer_to_human" in tool_names
    assert len(tools) == 5


@pytest.mark.asyncio
async def test_transfer_to_human_tool():
    """Verify transfer_to_human produces valid transfer guidance."""
    ctx = CallContext(tenant_id="tenant-test", caller_phone="+919999988888")
    tools = create_call_tools(ctx)
    transfer_fn = next(t for t in tools if t.__name__ == "transfer_to_human")

    result = await transfer_fn(reason="Severe pain")
    assert "human frontdesk team" in result
    assert "Severe pain" in result


@pytest.mark.asyncio
async def test_query_knowledge_base_mock():
    """Verify query_knowledge_base handles successful backend RAG responses."""
    ctx = CallContext(tenant_id="tenant-test", caller_phone="+919999988888")
    tools = create_call_tools(ctx)
    query_kb_fn = next(t for t in tools if t.__name__ == "query_knowledge_base")

    mock_resp_data = [
        {"chunkText": "HydraFacial Deluxe costs Rs 5,500 and lasts 45 minutes with zero downtime."},
    ]

    with patch("aiohttp.ClientSession.post") as mock_post:
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json = AsyncMock(return_value=mock_resp_data)
        mock_post.return_value.__aenter__.return_value = mock_response

        result = await query_kb_fn(query="HydraFacial price and duration")
        assert "HydraFacial Deluxe" in result
        assert "5,500" in result
