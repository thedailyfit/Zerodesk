# 03. Customer Journey & Client Lifecycle Architecture

## 1. Executive Summary

The ZEROdesk customer journey architecture models the complete end-to-end lifecycle of a patient or client—from initial discovery and inbound voice intake to clinical consultation, statutory tax invoicing, and multi-month automated retention workflows.

This document details the lifecycle stages, state transition machines, sequence flows, and event-driven triggers across both digital and physical touchpoints in an Indian healthcare context.

---

## 2. End-to-End Client Lifecycle Flowchart

### 🖼️ Customer & Patient Journey Infographic
![Customer Journey Architecture](./images/03_customer_journey_architecture.jpg)

### 📐 7-Stage Client Lifecycle Vector Blueprint (SVG)
![Customer Journey Lifecycle Diagram](./diagrams/03_customer_journey_architecture.svg)

### 🗺️ Patient Lifecycle State Flow
```mermaid
flowchart TD
    subgraph Discovery["Phase 1: Discovery & Lead Ingestion"]
        AdLead["Google / Meta Ads Lead Form"]
        PhoneCall["Inbound Phone Call to Clinic DID (+91 98XXX)"]
        ChatbotLead["Website Chatbot (widget.js)"]
        WalkIn["Clinic Frontdesk Walk-in"]
    end

    subgraph Intake["Phase 2: Automated AI Intake & Triaging"]
        VoiceTriage["Voice AI Receptionist (LiveKit / agent.py)<br/>• Language Detection (Hindi, English, Telugu)<br/>• Symptoms / Inquiry Clarification"]
        WhatsAppTriage["WhatsApp AI Assistant (whatsapp-ai.listener.ts)<br/>• Natural Language Understanding<br/>• FAQ Retrieval via Indic RAG"]
    end

    Discovery --> Intake

    subgraph Booking["Phase 3: Slot Reservation & Conflict Locking"]
        PrismaLock["Prisma Transaction (appointment.service.ts)<br/>• Doctor Calendar Availability Check<br/>• Concurrent Slot Collision Locking<br/>• Creation of Appointment (Status: CONFIRMED)"]
        ConfirmMessage["Automated Instant WhatsApp Confirmation<br/>• Doctor Name & Date/Time<br/>• Clinic Google Maps Location Pin<br/>• Digital Reschedule / Cancel Button"]
    end

    Intake --> Booking

    subgraph PreVisit["Phase 4: Pre-Visit Reminders & Nudges"]
        Reminder24h["24-Hour Prior WhatsApp Reminder Nudge"]
        Reminder2h["2-Hour Prior Telephony / SMS Dispatch"]
    end

    Booking --> PreVisit

    subgraph ClinicVisit["Phase 5: Check-in & Clinical Encounter"]
        CheckIn["Receptionist Check-in (/appointments)<br/>• Patient Status: IN_PROGRESS"]
        DoctorConsult["Doctor Consultation & Diagnosis<br/>• Digital Prescription Generation<br/>• Status: COMPLETED"]
    end

    PreVisit --> ClinicVisit

    subgraph Billing["Phase 6: Invoicing & Payment Reconciliation"]
        InvoiceGen["Statutory GST Invoice Creation (/invoices)<br/>• CGST (9%) + SGST (9%) or IGST (18%)<br/>• Automated UPI QR Code Generation"]
        PaymentDone["Reconciliation (UPI / Card / Cash)<br/>• Status: PAID<br/>• WhatsApp Digital Receipt Dispatch"]
    end

    ClinicVisit --> Billing

    subgraph Retention["Phase 7: Post-Visit Retention & Automated Recalls"]
        FollowUp48h["48-Hour Recovery Follow-up (AI WhatsApp)"]
        GoogleReview["Day 7 Google Review Feedback Request"]
        Recall6m["6-Month Chronic / Preventive Health Recall (BullMQ)"]
    end

    Billing --> Retention
```

---

## 3. Appointment State Transition Machine

The lifecycle of an appointment is tracked strictly through an enum-driven finite state machine in PostgreSQL:

```mermaid
stateDiagram-v2
    [*] --> SCHEDULED: Created via Webchat / Frontdesk
    [*] --> CONFIRMED: Booked via AI Receptionist / WhatsApp

    SCHEDULED --> CONFIRMED: Staff / AI Validates Booking
    SCHEDULED --> CANCELLED: Patient / Clinic Rejection

    CONFIRMED --> IN_PROGRESS: Patient Arrives & Checks In
    CONFIRMED --> NO_SHOW: Patient Fails to Arrive (Grace Period Expired)
    CONFIRMED --> CANCELLED: Cancelled with >2hr Notice

    IN_PROGRESS --> COMPLETED: Consultation Finished & Prescription Saved
    
    NO_SHOW --> RESCHEDULED: Automated WhatsApp Recovery Nudge
    CANCELLED --> RESCHEDULED: Slot Rebooked

    COMPLETED --> [*]: Archived & Added to Retention Queue
```

---

## 4. Sequence Flow: Inbound Voice Intake to Invoiced Consultation

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient (+91 98765 43210)
    participant Carrier as Telecom Carrier (Plivo)
    participant VoiceAgent as Voice Agent Worker (agent.py)
    participant CoreAPI as NestJS API (/v1)
    participant DB as PostgreSQL (Supabase)
    participant Doctor as Doctor (Pro Dashboard)
    participant WhatsApp as Meta WhatsApp Cloud API

    Patient->>Carrier: Calls Clinic Virtual DID
    Carrier->>VoiceAgent: Connects call via LiveKit SIP
    VoiceAgent->>Patient: "Namaste! City Health Clinic mein aapka swagat hai. Main aapki kya sahayata kar sakti hoon?"
    Patient->>VoiceAgent: "I want an appointment with Dr. Sharma tomorrow at 11 AM."
    
    VoiceAgent->>CoreAPI: POST /v1/appointments/voice-book
    activate CoreAPI
    CoreAPI->>DB: Query appointments for Dr. Sharma between 11:00 AM - 11:30 AM
    DB-->>CoreAPI: Slot is FREE
    CoreAPI->>DB: INSERT into appointments (status: CONFIRMED, channel: VOICE)
    CoreAPI->>WhatsApp: Send Booking Template (Ref: #APT-8821)
    CoreAPI-->>VoiceAgent: { success: true, bookingRef: "APT-8821" }
    deactivate CoreAPI

    VoiceAgent->>Patient: "Aapka appointment Dr. Sharma ke saath kal subah 11 baje confirm ho gaya hai. Reference code APT-8821 WhatsApp par bhej diya gaya hai."
    Patient->>VoiceAgent: "Thank you!" (Call terminates)
    
    WhatsApp-->>Patient: Delivers confirmation with Google Maps location pin

    Note over Patient, Doctor: Next Day: Patient arrives at Clinic

    Doctor->>CoreAPI: PATCH /v1/appointments/:id/status { status: 'IN_PROGRESS' }
    Doctor->>CoreAPI: POST /v1/prescriptions { medicines: [...], vitals: { bp: '120/80' } }
    Doctor->>CoreAPI: PATCH /v1/appointments/:id/status { status: 'COMPLETED' }
    
    CoreAPI->>DB: INSERT into invoices (subtotal: 600, taxAmount: 0, totalAmount: 600)
    CoreAPI->>WhatsApp: Sends Digital Prescription & UPI Payment Link
    Patient->>WhatsApp: Scans UPI QR & pays ₹600
    CoreAPI->>DB: UPDATE invoices SET status = 'PAID'
```

---

## 5. Failure Scenarios & Edge Cases

| Scenario | System Behavior & Mitigation |
| :--- | :--- |
| **Doctor Unavailable at Requested Time** | The API automatically queries alternative slots for that doctor or next available specialist within the same department. The AI offers: *"Dr. Sharma is busy at 11:00 AM, but is available at 11:45 AM or Dr. Ananya is available at 11:00 AM. Which one do you prefer?"* |
| **Simultaneous Booking Collision** | Handled via Prisma transaction isolation. The second booking request encounters a conflict check and is redirected to an adjacent available slot before the voice call terminates. |
| **Call Drops Before Booking Completion** | If call drops after slot intent is recognized but before final confirmation, a BullMQ delayed job checks whether the appointment was persisted. If not, it dispatches a recovery WhatsApp message: *"We noticed your call was disconnected. Click here to confirm your 11 AM slot."* |
| **Patient Requests Rescheduling** | Handled natively via WhatsApp AI. Patient sends *"Reschedule my appointment to Friday"*; the AI identifies the booking reference, validates the new slot, updates the record, and confirms. |
