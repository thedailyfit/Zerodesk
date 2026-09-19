# 08. Outbound Campaign Engine & Carrier Compliance Architecture

## 1. Executive Summary

The ZEROdesk Outbound Campaign Engine enables clinics, real estate firms, and educational institutes to launch automated high-touch voice and WhatsApp outreach. It is engineered to respect Indian telecom regulations (TRAI TCCCPR), adhere strictly to permitted calling windows (9:00 AM – 9:00 PM IST), throttle outbound concurrent calls to prevent carrier line bans, and provide instant human agent transfer upon interest.

This document details audience segmentation, queue-based pacing algorithms, regulatory compliance gates, and live call conversion tracking.

---

## 2. Outbound Campaign Execution Pipeline

### 🖼️ Outbound Campaign & TRAI Compliance Infographic
![Outbound Campaign Architecture](./images/08_outbound_campaign_engine_architecture.jpg)

### 📐 TRAI 9am-9pm Gate & SIP REFER Transfer Vector Blueprint (SVG)
![Outbound Campaign Diagram](./diagrams/08_outbound_campaign_engine_architecture.svg)

### 🗺️ Campaign Pipeline Graph
```mermaid
flowchart TD
    subgraph CampaignCreation["1. Audience Filtering & Template Selection"]
        AdminUser["Practice Manager (/campaigns)"]
        AudienceFilter["Audience Segmentation Filter<br/>• Tag: 'diabetes_recall'<br/>• Last Visit > 90 Days<br/>• Status: 'active'"]
        ChannelChoice["Channel Selection:<br/>• Automated Voice Outreach (AI Receptionist)<br/>• WhatsApp Broadcast (HSM Template)"]
        
        AdminUser --> AudienceFilter --> ChannelChoice
    end

    subgraph ComplianceGate["2. TRAI Regulatory Compliance Gate"]
        TimeCheck["Calling Window Validator<br/>• Permitted: 09:00 - 21:00 IST<br/>• Suspends / Pauses Outside Window"]
        
        DndScrubber["TRAI DND Scrubbing Gate<br/>• National Customer Preference Registry<br/>• Excludes Registered Opt-Outs"]
        
        ChannelChoice --> TimeCheck --> DndScrubber
    end

    subgraph QueuePacing["3. Dynamic Pacing & Queue Distribution"]
        BullMQDispatcher["BullMQ 'outbound-calls' Queue<br/>• Dynamic Pacing: 5 Calls / Second<br/>• Prevents SIP Trunk Congestion"]
        
        DndScrubber -->|Approved Contacts| BullMQDispatcher
    end

    subgraph ExecutionNodes["4. Multi-Carrier Dialing & Live Conversation"]
        PlivoDialer["Plivo Telecom Carrier<br/>• Outbound SIP Dialing"]
        
        LiveKitRoom["LiveKit Cloud Room<br/>• Connects Answering Callee to Voice Agent"]
        
        VoiceAgent["AI Receptionist (agent.py)<br/>• Conversational Pitch & Information<br/>• Real-Time Intent & Sentiment Tracking"]
        
        BullMQDispatcher --> PlivoDialer --> LiveKitRoom <--> VoiceAgent
    end

    subgraph HumanHandoff["5. Outcome & Live Staff Transfer"]
        stateDecision{"Callee Intent?"}
        
        VoiceAgent --> stateDecision
        
        stateDecision -->|Interested / Wants Human| Transfer["Warm Transfer to Frontdesk<br/>(POST /v1/voice/calls/transfer)<br/>• Rings Clinic Receptionist Desk"]
        
        stateDecision -->|Booked Slot| AutoBook["Automatic Slot Reservation<br/>(AppointmentService.bookFromVoice)"]
        
        stateDecision -->|Uninterested / DND| OptOut["Tag Contact as Opted-Out<br/>(Supabase Customer Record)"]
    end
```

---

## 3. Regulatory Compliance Architecture (TRAI TCCCPR)

In India, commercial voice calling is heavily regulated under TRAI guidelines:

```mermaid
flowchart LR
    subgraph TRAIRules["TRAI Regulatory Requirements"]
        Window["Time Window:<br/>Strictly 09:00 AM to 09:00 PM IST"]
        DLT["DLT Principal Entity ID:<br/>Registered Header & Approved Voice Templates"]
        Consent["Explicit Consent:<br/>Existing Patient Relationship or Inbound Opt-in"]
    end

    subgraph ZEROdeskEnforcement["ZEROdesk Automated Enforcement"]
        AutoPause["Automatic Scheduler Hold<br/>If current time < 09:00 or > 21:00 IST,<br/>jobs are delayed until next 09:00 AM IST."]
        HeaderCheck["Header Validator<br/>Ensures all outbound DIDs have active DLT bindings."]
        OptOutSync["Instant Opt-Out Engine<br/>Immediate suppression upon callee refusal."]
    end

    Window --> AutoPause
    DLT --> HeaderCheck
    Consent --> OptOutSync
```

---

## 4. Key Implementation References

### 4.1 Dynamic Pacing & Rate Limiting
To prevent telecom carriers from blocking practice virtual DIDs due to sudden burst traffic:
```typescript
// Rate limiting outbound jobs to 5 per second per carrier trunk
const queue = new Queue('outbound-calls', {
  connection: redisConfig,
  limiter: {
    max: 5,
    duration: 1000, // 1 second
  },
});
```

### 4.2 Automated Human Transfer Hook
Located in [`apps/voice-agent/agent.py:340-390`](file:///c:/Users/Pc/Downloads/zerodesk/apps/voice-agent/agent.py#L340-L390):
- If the callee expresses complex questions or requests a human:
```python
async def transfer_call(call_ctx: CallContext, reason: str = "Callee requested human"):
    payload = {
        "roomName": call_ctx.room_name,
        "callerPhone": call_ctx.caller_phone,
        "reason": reason,
    }
    async with aiohttp.ClientSession() as session:
        await session.post(
            f"{ZERODESK_API}/v1/voice/calls/transfer",
            json=payload,
            headers={"x-internal-voice-key": INTERNAL_VOICE_SECRET, "x-tenant-id": call_ctx.tenant_id}
        )
```
- The backend bridges the active SIP call directly to the practice's physical reception desk.
