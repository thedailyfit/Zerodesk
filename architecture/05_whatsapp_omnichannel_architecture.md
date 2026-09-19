# 05. WhatsApp Omnichannel Architecture

## 1. Executive Summary

WhatsApp is the dominant communication channel for Indian healthcare and local commerce. ZEROdesk integrates natively with the **Meta WhatsApp Cloud API (Graph API v21.0)** to provide 24/7 automated appointment booking, prescription delivery, payment links, and contextual customer support in Hindi, English, and regional languages.

This document details the webhook lifecycle, cryptographic payload validation, idempotency guards, intent routing, and Prisma transaction execution.

---

## 2. WhatsApp Ingestion & Execution Pipeline

### 🖼️ WhatsApp Omnichannel Gateway Infographic
![WhatsApp Omnichannel Architecture](./images/05_whatsapp_omnichannel_architecture.jpg)

### 📐 Cryptographic HMAC & ACID Booking Vector Blueprint (SVG)
![WhatsApp Architecture Diagram](./diagrams/05_whatsapp_omnichannel_architecture.svg)

### 🗺️ Omnichannel Pipeline Graph
```mermaid
flowchart TD
    subgraph MetaEdge["1. Meta Cloud Infrastructure"]
        Patient["Patient Mobile Phone<br/>(WhatsApp App)"]
        MetaGraph["Meta WhatsApp Cloud API<br/>• Graph API v21.0<br/>• Webhook WebSub Dispatcher"]
        
        Patient -->|Text / Voice Note / Location| MetaGraph
    end

    subgraph SecurityIngress["2. Ingress Security & Idempotency Layer"]
        WebhookEndpoint["POST /v1/whatsapp/webhook<br/>(apps/api/src/modules/whatsapp/whatsapp.controller.ts)"]
        
        HMACCheck["SHA-256 Signature Verification<br/>• Header: x-hub-signature-256<br/>• Secret: WHATSAPP_APP_SECRET"]
        
        IdempotencyCheck["IdempotencyGuard<br/>(apps/api/src/common/guards/idempotency.guard.ts)<br/>• Redis Key: idempotency:whatsapp:messageId<br/>• Blocks Meta's 3x Duplicate Retries"]
        
        MetaGraph --> WebhookEndpoint --> HMACCheck --> IdempotencyCheck
    end

    subgraph ProcessingPipeline["3. Context Extraction & AI Intent Engine"]
        MessageParser["WhatsappService.handleIncomingMessage<br/>• Resolves Tenant by Business Phone Number<br/>• Upserts Customer (E.164 Phone)"]
        
        AiEngine["AiService.processMessage<br/>• Grounded Indic RAG Context Assembly<br/>• Intent Classification:<br/>   - BOOK_APPOINTMENT<br/>   - RESCHEDULE<br/>   - CANCEL<br/>   - GENERAL_INQUIRY"]
        
        IdempotencyCheck --> MessageParser --> AiEngine
    end

    subgraph BookingExecution["4. Real Booking Execution (Prisma Transaction)"]
        EventListener["WhatsappAiListener<br/>(apps/api/src/modules/whatsapp/whatsapp-ai.listener.ts)"]
        
        AppointmentTx["AppointmentService.bookFromVoice / bookFromWhatsApp<br/>• Prisma DB Transaction (SERIALIZABLE)<br/>• Doctor Calendar Availability Check<br/>• Slot Collision Prevention<br/>• Inserts Appointment (Status: CONFIRMED)"]
        
        AiEngine -->|Emit ai.appointment.book| EventListener --> AppointmentTx
    end

    subgraph DispatchOutbound["5. Outbound Delivery & Confirmation"]
        TemplateDispatcher["WhatsappService.sendTemplateMessage<br/>• Booking Confirmation (#APT-XXXX)<br/>• Doctor Name & Date/Time<br/>• Interactive Buttons: [Reschedule] [Cancel]<br/>• Google Maps Location Pin"]
        
        AppointmentTx --> TemplateDispatcher --> MetaGraph --> Patient
    end
```

---

## 3. Conversational Booking State Machine

When a patient texts to book an appointment, the conversation follows a deterministic multi-turn dialogue state machine:

```mermaid
stateDiagram-v2
    [*] --> IDLE: Inbound Message Received

    IDLE --> INTENT_DETECTED: Intent: "I want an appointment"
    IDLE --> FAQ_ANSWERED: Intent: "What is your consultation fee?"
    FAQ_ANSWERED --> [*]: Query Resolved via RAG

    INTENT_DETECTED --> AWAITING_SPECIALIST: Doctor/Specialty not specified
    AWAITING_SPECIALIST --> AWAITING_DATETIME: Patient chooses "Cardiologist"
    
    INTENT_DETECTED --> AWAITING_DATETIME: Doctor specified ("Dr. Sharma")
    
    AWAITING_DATETIME --> CHECKING_SLOT: Patient: "Tomorrow at 10 AM"
    
    state SlotDecision <<choice>>
    CHECKING_SLOT --> SlotDecision
    
    SlotDecision --> CONFLICT_ALTERNATIVE: Slot Booked / Doctor on Leave
    SlotDecision --> BOOKING_CONFIRMED: Slot Available
    
    CONFLICT_ALTERNATIVE --> AWAITING_DATETIME: Offers: "10:30 AM or 11:30 AM"
    
    BOOKING_CONFIRMED --> PERSISTED_IN_DB: Prisma Transaction Executed
    PERSISTED_IN_DB --> DISPATCH_TICKETS: WhatsApp Confirmation Sent (#APT-XXXX)
    DISPATCH_TICKETS --> [*]
```

---

## 4. Key Implementation References

### 4.1 Idempotency Guard (Deduplication)
Located in [`apps/api/src/common/guards/idempotency.guard.ts`](file:///c:/Users/Pc/Downloads/zerodesk/apps/api/src/common/guards/idempotency.guard.ts):
- Meta WhatsApp Cloud API retries webhooks up to 3 times if an acknowledgment (`200 OK`) is not received in 5 seconds.
- `IdempotencyGuard` hashes the incoming `entry[0].changes[0].value.messages[0].id` and stores an atomic lock in Redis with a 24-hour TTL (`SET key 1 EX 86400 NX`).
- Duplicate deliveries receive an immediate `200 OK` acknowledgment without re-running the AI dialogue or creating duplicate appointments.

### 4.2 Real Booking Execution into PostgreSQL
Located in [`apps/api/src/modules/whatsapp/whatsapp-ai.listener.ts:111-145`](file:///c:/Users/Pc/Downloads/zerodesk/apps/api/src/modules/whatsapp/whatsapp-ai.listener.ts#L111-L145):
- Upon receiving `BOOK_APPOINTMENT` intent from `AiService`, `WhatsappAiListener` extracts doctor name, target date/time, customer phone, and notes.
- Executes `AppointmentService.bookFromVoice(...)` inside an atomic Prisma transaction.
- Returns a unique booking confirmation reference (e.g. `#APT-7729`) and dispatches it directly back to the patient's WhatsApp thread.

### 4.3 24-Hour Messaging Window Compliance
- **Inside 24-Hour Window**: Free-form AI conversational messages, rich interactive list pickers, and dynamic quick-reply buttons.
- **Outside 24-Hour Window**: Meta strictly enforces pre-approved HSM templates (`appointment_reminder_v1`, `prescription_ready_v1`, `payment_invoice_v1`) to prevent spam penalties and account suspension.
