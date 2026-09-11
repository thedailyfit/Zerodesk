import { ActiveNicheId } from './types';

export type StepActionType =
  | 'trigger'
  | 'whatsapp'
  | 'sms'
  | 'email'
  | 'wait'
  | 'task'
  | 'crm_update'
  | 'call'
  | 'survey'
  | 'invoice';

export interface WorkflowStep {
  id: string;
  type: StepActionType;
  label: string;
  details?: string;
}

export interface WorkflowItem {
  id: string;
  name: string;
  category: string;
  active: boolean;
  steps: WorkflowStep[];
  lastRun?: string;
  runCount24h?: number;
  successRate?: number;
}

// ------------------------------------------------------------
// CATEGORY DEFINITIONS PER NICHE
// ------------------------------------------------------------

export const NICHE_CATEGORIES: Record<ActiveNicheId, string[]> = {
  skin: ['Patient Care', 'Revenue & Sales', 'Clinic Operations', 'Retention & Recalls'],
  dental: ['Clinical Care', 'Treatment Plans', 'Practice Operations', 'Recalls & Hygiene'],
  spa: ['Guest Wellness', 'Packages & Upgrades', 'Spa Operations', 'Loyalty & Membership'],
  realestate: ['Lead Engagement', 'Sales & Site Visits', 'Operations & KYC', 'Milestones & Retention'],
  hotel: ['Guest Experience', 'Upsells & Dining', 'Frontdesk Operations', 'Post-Stay & Loyalty']
};

export const CATEGORY_COLORS: Record<string, string> = {
  // Skin categories
  'Patient Care': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Revenue & Sales': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'Clinic Operations': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Retention & Recalls': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',

  // Dental categories
  'Clinical Care': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Treatment Plans': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'Practice Operations': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Recalls & Hygiene': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',

  // Spa categories
  'Guest Wellness': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'Packages & Upgrades': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'Spa Operations': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Loyalty & Membership': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',

  // Real Estate categories
  'Lead Engagement': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Sales & Site Visits': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'Operations & KYC': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Milestones & Retention': 'bg-amber-500/10 text-amber-600 border-amber-500/20',

  // Hotel categories
  'Guest Experience': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Upsells & Dining': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'Frontdesk Operations': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Post-Stay & Loyalty': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',

  // Fallbacks
  'Operations': 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  'Marketing': 'bg-blue-500/10 text-blue-600 border-blue-500/20'
};

// ------------------------------------------------------------
// 12 PRODUCTION WORKFLOWS PER NICHE (60 TOTAL)
// ------------------------------------------------------------

export const NICHE_WORKFLOWS: Record<ActiveNicheId, WorkflowItem[]> = {
  // ----------------------------------------------------------
  // 1. SKIN CLINIC & AESTHETIC DERMATOLOGY
  // ----------------------------------------------------------
  skin: [
    {
      id: 'wf_skin_1',
      name: 'New Patient Onboarding & Pre-Consult',
      category: 'Patient Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Registration Submitted', details: 'Web / Walk-in / Inbound' },
        { id: 's2', type: 'whatsapp', label: 'WhatsApp Welcome Kit', details: 'Doctor profile & clinic guide' },
        { id: 's3', type: 'wait', label: 'Wait 1h', details: 'Delay 60 minutes' },
        { id: 's4', type: 'whatsapp', label: 'Send Medical History Form', details: 'Pre-consult skin questionnaire' }
      ]
    },
    {
      id: 'wf_skin_2',
      name: 'Post-Procedure AI Voice Follow-up',
      category: 'Patient Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 98,
      steps: [
        { id: 's1', type: 'trigger', label: 'Laser/Peel Completed', details: 'Status = Complete' },
        { id: 's2', type: 'whatsapp', label: 'PDF Aftercare Sheet', details: 'Sunscreen & recovery protocol' },
        { id: 's3', type: 'wait', label: 'Wait 24h', details: 'Delay 24 hours' },
        { id: 's4', type: 'call', label: 'AI Voice Check-in', details: 'Agent: Check redness & discomfort' }
      ]
    },
    {
      id: 'wf_skin_3',
      name: 'HydraFacial Maintenance Recall',
      category: 'Retention & Recalls',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: '28 Days Post-Facial', details: 'Maintenance window reached' },
        { id: 's2', type: 'whatsapp', label: 'Maintenance Recall Alert', details: 'Includes 1-click slot booking' },
        { id: 's3', type: 'wait', label: 'Wait 48h', details: 'If unbooked' },
        { id: 's4', type: 'call', label: 'AI Frontdesk Voice Recall', details: 'Offer complimentary LED therapy' }
      ]
    },
    {
      id: 'wf_skin_4',
      name: 'Clinic Mgmt: Waitlist Slot Backfill',
      category: 'Clinic Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 95,
      steps: [
        { id: 's1', type: 'trigger', label: 'Appointment Cancelled', details: '< 4h to appointment' },
        { id: 's2', type: 'task', label: 'Scan VIP Waitlist', details: 'Find matched treatment requests' },
        { id: 's3', type: 'whatsapp', label: 'Broadcast Slot Availability', details: 'Send 1-click claim link to top 3' },
        { id: 's4', type: 'crm_update', label: 'Auto-Assign Slot', details: 'First patient to claim gets slot' }
      ]
    },
    {
      id: 'wf_skin_5',
      name: 'Patch Test & Allergy Clearance Check',
      category: 'Patient Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Patch Test Applied', details: 'Clinical tag: patch_test' },
        { id: 's2', type: 'wait', label: 'Wait 48h', details: 'Reaction evaluation delay' },
        { id: 's3', type: 'whatsapp', label: 'Allergy Reaction Questionnaire', details: 'Photo upload & itch evaluation' },
        { id: 's4', type: 'task', label: 'Clear for Full Procedure', details: 'Doctor approval in dashboard' }
      ]
    },
    {
      id: 'wf_skin_6',
      name: 'High-Value Aesthetic Proposal Follow-up',
      category: 'Revenue & Sales',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 92,
      steps: [
        { id: 's1', type: 'trigger', label: 'Proposal/Quote Generated', details: 'Value > ₹50,000' },
        { id: 's2', type: 'wait', label: 'Wait 48h', details: 'Review window' },
        { id: 's3', type: 'call', label: 'AI Aesthetic Consultant Call', details: 'Answer package & EMI queries' },
        { id: 's4', type: 'task', label: 'Escalate to Senior Doctor', details: 'If patient requests customization' }
      ]
    },
    {
      id: 'wf_skin_7',
      name: 'VIP Patient Concierge Boarding',
      category: 'Patient Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'VIP Tag Applied', details: 'Annual spend > ₹1.5L' },
        { id: 's2', type: 'whatsapp', label: 'Dedicated Concierge Welcome', details: 'Direct priority booking line' },
        { id: 's3', type: 'crm_update', label: 'Assign Dedicated RM', details: 'Route inquiries to Clinic Manager' },
        { id: 's4', type: 'task', label: 'Prepare VIP Suite & Amenities', details: 'Green tea & private recovery room' }
      ]
    },
    {
      id: 'wf_skin_8',
      name: 'Birthday Glow-Up Voucher Protocol',
      category: 'Revenue & Sales',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 96,
      steps: [
        { id: 's1', type: 'trigger', label: '7 Days Before Birthday', details: 'DOB matched in database' },
        { id: 's2', type: 'whatsapp', label: 'Send Birthday Glow Gift Card', details: '₹1,500 clinic credit voucher' },
        { id: 's3', type: 'wait', label: 'Wait 5d', details: 'Before birthday date' },
        { id: 's4', type: 'whatsapp', label: 'Expiry Reminder & Booking Link', details: 'Valid for 14 days' }
      ]
    },
    {
      id: 'wf_skin_9',
      name: 'No-Show Reschedule Concierge',
      category: 'Clinic Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 88,
      steps: [
        { id: 's1', type: 'trigger', label: 'Marked No-Show', details: 'Status = No-Show' },
        { id: 's2', type: 'wait', label: 'Wait 2h', details: 'Post appointment slot' },
        { id: 's3', type: 'whatsapp', label: 'Gentle Reschedule Link', details: 'We missed you + 1-click new slot' },
        { id: 's4', type: 'call', label: 'AI Voice Reschedule Call', details: 'Call next morning at 11 AM' }
      ]
    },
    {
      id: 'wf_skin_10',
      name: 'Post-Consult Treatment Deposit Reminder',
      category: 'Revenue & Sales',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 94,
      steps: [
        { id: 's1', type: 'trigger', label: 'Consultation Completed', details: 'Procedure prescribed' },
        { id: 's2', type: 'wait', label: 'Wait 24h', details: 'Decision grace period' },
        { id: 's3', type: 'invoice', label: 'Razorpay/Stripe Deposit Link', details: '₹5,000 slot booking deposit' },
        { id: 's4', type: 'whatsapp', label: 'Send Payment Reminder', details: 'Locks in current promotional price' }
      ]
    },
    {
      id: 'wf_skin_11',
      name: 'Automated Google Review & Consent Push',
      category: 'Retention & Recalls',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 91,
      steps: [
        { id: 's1', type: 'trigger', label: '3 Days Post-Treatment', details: 'Patient in recovery' },
        { id: 's2', type: 'survey', label: 'Quick 1-Tap Sentiment Check', details: 'Rate treatment 1 to 5 stars' },
        { id: 's3', type: 'whatsapp', label: 'Send Google Review Link', details: 'Triggered if rating is 5/5' },
        { id: 's4', type: 'task', label: 'Alert Manager if Rating < 4', details: 'Immediate service recovery' }
      ]
    },
    {
      id: 'wf_skin_12',
      name: 'Clinical Adverse Reaction Escalation',
      category: 'Clinic Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Patient Reports Redness/Swelling', details: 'WhatsApp AI detects keywords' },
        { id: 's2', type: 'whatsapp', label: 'Instant Clinical Reassurance', details: 'Cold compress guidance + photo request' },
        { id: 's3', type: 'sms', label: 'Emergency Doctor SMS Alert', details: 'Direct notification to Medical Director' },
        { id: 's4', type: 'task', label: 'Priority Emergency Slot', details: 'Block next available 15m slot' }
      ]
    }
  ],

  // ----------------------------------------------------------
  // 2. DENTAL CLINIC & ORTHODONTICS
  // ----------------------------------------------------------
  dental: [
    {
      id: 'wf_dental_1',
      name: 'New Patient Registration & Dental Charting',
      category: 'Clinical Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'New Appointment Booked', details: 'Web / Phone / WhatsApp' },
        { id: 's2', type: 'whatsapp', label: 'Digital Registration Form', details: 'Pre-arrival medical & dental history' },
        { id: 's3', type: 'wait', label: 'Wait 2h', details: 'Completion window' },
        { id: 's4', type: 'task', label: 'OPG X-Ray & Chair Prep', details: 'Alert dental assistant' }
      ]
    },
    {
      id: 'wf_dental_2',
      name: 'Post-Extraction Soft Diet & Pain Protocol',
      category: 'Clinical Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 99,
      steps: [
        { id: 's1', type: 'trigger', label: 'Extraction / Surgery Completed', details: 'Surgical checkout' },
        { id: 's2', type: 'whatsapp', label: 'Soft Diet & Gauze PDF Guide', details: 'No spitting, cold foods only' },
        { id: 's3', type: 'wait', label: 'Wait 12h', details: 'Post-anesthetic check' },
        { id: 's4', type: 'call', label: 'AI Voice Pain Check Call', details: 'Check pain score (1-10) & bleeding' }
      ]
    },
    {
      id: 'wf_dental_3',
      name: 'Clear Aligner Tray Step Check-in',
      category: 'Clinical Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 96,
      steps: [
        { id: 's1', type: 'trigger', label: '14-Day Cycle Trigger', details: 'Aligner switch day' },
        { id: 's2', type: 'whatsapp', label: 'Aligner Tray Switch Prompt', details: 'Switch to next numbered tray' },
        { id: 's3', type: 'whatsapp', label: 'Request Occlusal Selfie Photo', details: 'AI checks tray seating & tracking' },
        { id: 's4', type: 'task', label: 'Orthodontist Review Task', details: 'Flag unseated aligners' }
      ]
    },
    {
      id: 'wf_dental_4',
      name: '6-Month Preventive Scaling & Polish Recall',
      category: 'Recalls & Hygiene',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 94,
      steps: [
        { id: 's1', type: 'trigger', label: '180 Days Since Last Cleaning', details: 'Preventive hygiene recall' },
        { id: 's2', type: 'whatsapp', label: 'Scaling Recall with Slot Picker', details: 'Protect enamel & prevent tartar' },
        { id: 's3', type: 'wait', label: 'Wait 3d', details: 'Follow-up buffer' },
        { id: 's4', type: 'call', label: 'AI Voice Preventive Call', details: 'Book 30m hygiene appointment' }
      ]
    },
    {
      id: 'wf_dental_5',
      name: 'Root Canal Multi-Stage Cadence',
      category: 'Treatment Plans',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'RCT Step 1 (Bio-mech) Done', details: 'Status = Stage 1 Complete' },
        { id: 's2', type: 'whatsapp', label: 'Send Post-RCT Care Guide', details: 'Chew on opposite side' },
        { id: 's3', type: 'task', label: 'Lock Stage 2 (Obturation) Slot', details: 'Schedule within 5 to 7 days' },
        { id: 's4', type: 'whatsapp', label: 'Crown Fabrication Schedule', details: 'Confirm ziconia/ceramic choice' }
      ]
    },
    {
      id: 'wf_dental_6',
      name: 'Smile Makeover & Implant Consultation Follow-up',
      category: 'Treatment Plans',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 90,
      steps: [
        { id: 's1', type: 'trigger', label: 'High-Value Quote Delivered', details: 'Estimate > ₹40,000' },
        { id: 's2', type: 'wait', label: 'Wait 48h', details: 'Patient review window' },
        { id: 's3', type: 'call', label: 'AI Voice Treatment Coordinator', details: 'Explain 0% interest EMI options' },
        { id: 's4', type: 'task', label: 'Notify Chief Implantologist', details: 'Prepare digital smile mockup' }
      ]
    },
    {
      id: 'wf_dental_7',
      name: 'Crown & Bridge Lab Arrival Alert',
      category: 'Practice Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 98,
      steps: [
        { id: 's1', type: 'trigger', label: 'Dental Lab Delivery Scanned', details: 'Crown/bridge checked in' },
        { id: 's2', type: 'whatsapp', label: 'Prosthetic Ready Alert', details: 'Your custom crown is ready for fitment' },
        { id: 's3', type: 'wait', label: 'Wait 24h', details: 'If unconfirmed' },
        { id: 's4', type: 'call', label: 'AI Frontdesk Booking Call', details: 'Reserve 20m cementation slot' }
      ]
    },
    {
      id: 'wf_dental_8',
      name: 'Acute Dental Pain Emergency Triage',
      category: 'Practice Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Emergency Keywords Detected', details: 'Severe pain, facial swelling, trauma' },
        { id: 's2', type: 'whatsapp', label: 'Immediate Pain Mitigation Tips', details: 'Cold compress, analgesics guidance' },
        { id: 's3', type: 'sms', label: 'On-Call Dentist SMS Alert', details: 'Urgent emergency walk-in alert' },
        { id: 's4', type: 'crm_update', label: 'Fast-Track Chair Priority', details: 'Bypass standard queue' }
      ]
    },
    {
      id: 'wf_dental_9',
      name: 'Pediatric Bravery Certificate & Recall',
      category: 'Recalls & Hygiene',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 97,
      steps: [
        { id: 's1', type: 'trigger', label: 'Pediatric Visit Completed', details: 'Age < 14 years' },
        { id: 's2', type: 'whatsapp', label: 'Digital Super-Bravery Certificate', details: 'Personalized PDF for the child' },
        { id: 's3', type: 'wait', label: 'Wait 90d', details: 'Quarterly check-in' },
        { id: 's4', type: 'whatsapp', label: 'Fluoride & Cavity Check Reminder', details: 'Preventive pediatric visit' }
      ]
    },
    {
      id: 'wf_dental_10',
      name: 'Treatment Plan Deposit & EMI Schedule',
      category: 'Treatment Plans',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 93,
      steps: [
        { id: 's1', type: 'trigger', label: 'Treatment Accepted', details: 'Status = Accepted' },
        { id: 's2', type: 'invoice', label: 'Generate Down-Payment Invoice', details: '20% booking deposit' },
        { id: 's3', type: 'whatsapp', label: 'Deliver EMI Breakdown PDF', details: 'Monthly payment schedule' },
        { id: 's4', type: 'crm_update', label: 'Update Financial Ledger', details: 'Sync with practice billing' }
      ]
    },
    {
      id: 'wf_dental_11',
      name: 'Post-Whitening Sensitivity Care Check',
      category: 'Clinical Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 99,
      steps: [
        { id: 's1', type: 'trigger', label: 'Whitening Session Finished', details: 'Bleaching complete' },
        { id: 's2', type: 'whatsapp', label: 'White Diet Protocol Sheet', details: 'Avoid coffee, wine & turmeric for 48h' },
        { id: 's3', type: 'wait', label: 'Wait 24h', details: 'Sensitivity check delay' },
        { id: 's4', type: 'survey', label: 'Enamel Sensitivity Rating', details: '1 to 5 scale check' }
      ]
    },
    {
      id: 'wf_dental_12',
      name: 'Orthodontic Wire Tightening Recall',
      category: 'Recalls & Hygiene',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 95,
      steps: [
        { id: 's1', type: 'trigger', label: '28 Days Post Adjustment', details: 'Bracket adjustment due' },
        { id: 's2', type: 'whatsapp', label: 'Wire Tightening Appointment Alert', details: '1-click Saturday slot picker' },
        { id: 's3', type: 'wait', label: 'Wait 48h', details: 'If no confirmation' },
        { id: 's4', type: 'call', label: 'AI Voice Ortho Slot Reminder', details: 'Confirm attendance' }
      ]
    }
  ],

  // ----------------------------------------------------------
  // 3. LUXURY SPA & AYURVEDIC WELLNESS
  // ----------------------------------------------------------
  spa: [
    {
      id: 'wf_spa_1',
      name: 'Pre-Arrival Scent & Aromatherapy Intake',
      category: 'Guest Wellness',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Spa Reservation Booked', details: 'Confirmed appointment' },
        { id: 's2', type: 'whatsapp', label: 'Essential Oil & Scent Form', details: 'Select Lavender, Sandalwood or Lemongrass' },
        { id: 's3', type: 'wait', label: 'Wait 2h', details: 'Preference sync' },
        { id: 's4', type: 'task', label: 'Pre-heat Massage Bed & Diffuser', details: 'Therapist room setup alert' }
      ]
    },
    {
      id: 'wf_spa_2',
      name: 'Couples Retreat Experience Boarding',
      category: 'Packages & Upgrades',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 97,
      steps: [
        { id: 's1', type: 'trigger', label: 'Couples Package Booked', details: 'Romance package' },
        { id: 's2', type: 'whatsapp', label: 'VIP Welcome Itinerary', details: 'Jacuzzi & herbal tea schedule' },
        { id: 's3', type: 'task', label: 'Arrange Rose Petal Bath & Wine', details: 'Frontdesk hospitality alert' },
        { id: 's4', type: 'wait', label: 'Wait 24h', details: 'Experience preparation' }
      ]
    },
    {
      id: 'wf_spa_3',
      name: 'Post-Therapy Detox & Hydration Protocol',
      category: 'Guest Wellness',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Treatment Finished', details: 'Checkout completed' },
        { id: 's2', type: 'whatsapp', label: 'Ayurvedic Post-Session Guide', details: 'Hydration tips & detox herbal diet' },
        { id: 's3', type: 'wait', label: 'Wait 24h', details: 'Follow-up delay' },
        { id: 's4', type: 'survey', label: 'Therapist Pressure & Relaxation Rating', details: 'Rate 1 to 5 stars' }
      ]
    },
    {
      id: 'wf_spa_4',
      name: 'Midweek Relaxation Flash Drop',
      category: 'Packages & Upgrades',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 92,
      steps: [
        { id: 's1', type: 'trigger', label: 'Tuesday Morning Schedule', details: 'Off-peak slot backfill' },
        { id: 's2', type: 'whatsapp', label: 'Exclusive 25% Flash Voucher', details: 'Broadcast to top 50 loyal guests' },
        { id: 's3', type: 'wait', label: 'Wait 8h', details: 'Flash offer validity' },
        { id: 's4', type: 'crm_update', label: 'Close Flash Offer', details: 'Auto-expire promo code' }
      ]
    },
    {
      id: 'wf_spa_5',
      name: 'Quarterly Wellness Membership Renewal',
      category: 'Loyalty & Membership',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 95,
      steps: [
        { id: 's1', type: 'trigger', label: '14 Days Before Expiry', details: 'Membership tier expiring' },
        { id: 's2', type: 'whatsapp', label: 'Renewal Perk Summary', details: 'Free body scrub with annual renewal' },
        { id: 's3', type: 'wait', label: 'Wait 3d', details: 'Member review window' },
        { id: 's4', type: 'call', label: 'AI Spa Concierge Voice Call', details: 'Offer renewal perks & lock date' }
      ]
    },
    {
      id: 'wf_spa_6',
      name: 'Therapist Re-booking Cadence',
      category: 'Guest Wellness',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 94,
      steps: [
        { id: 's1', type: 'trigger', label: '21 Days Post Massage', details: 'Optimal muscle recovery interval' },
        { id: 's2', type: 'whatsapp', label: 'Re-booking Nudge with Therapist', details: 'Select previous therapist slot' },
        { id: 's3', type: 'wait', label: 'Wait 48h', details: 'Unbooked follow-up' },
        { id: 's4', type: 'whatsapp', label: 'Complimentary Steam Pass Offer', details: '1-click weekend booking' }
      ]
    },
    {
      id: 'wf_spa_7',
      name: 'Day Guest to Annual Member Conversion',
      category: 'Loyalty & Membership',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 89,
      steps: [
        { id: 's1', type: 'trigger', label: 'First Visit Completed', details: 'High satisfaction guest' },
        { id: 's2', type: 'wait', label: 'Wait 24h', details: 'Post-visit reflection' },
        { id: 's3', type: 'whatsapp', label: 'Exclusive Circle Membership Offer', details: 'Apply today visit cost as credit' },
        { id: 's4', type: 'task', label: 'Spa Manager Follow-up', details: 'Offer private sauna tour' }
      ]
    },
    {
      id: 'wf_spa_8',
      name: 'Corporate Wellness & Retreat Lead Sequence',
      category: 'Packages & Upgrades',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 91,
      steps: [
        { id: 's1', type: 'trigger', label: 'Corporate Query Received', details: 'Group booking > 10 pax' },
        { id: 's2', type: 'whatsapp', label: 'Instant Corporate Wellness Tariff', details: 'B2B brochure & package options' },
        { id: 's3', type: 'email', label: 'Detailed Event Proposal', details: 'Full day executive retreat plan' },
        { id: 's4', type: 'call', label: 'AI Corporate Relationship Call', details: 'Confirm date & headcount' }
      ]
    },
    {
      id: 'wf_spa_9',
      name: 'Birthday Pamper & Rejuvenation Gift',
      category: 'Loyalty & Membership',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 98,
      steps: [
        { id: 's1', type: 'trigger', label: '7 Days Before Birthday', details: 'Member birthday matched' },
        { id: 's2', type: 'whatsapp', label: 'Complimentary 30m Foot Reflexology', details: 'Valid with any 60m therapy' },
        { id: 's3', type: 'wait', label: 'Wait 5d', details: 'Reminder threshold' },
        { id: 's4', type: 'sms', label: 'Birthday Weekend Spa Reminder', details: 'Direct booking link' }
      ]
    },
    {
      id: 'wf_spa_10',
      name: 'Therapist Room Preparation Alert',
      category: 'Spa Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: '30m Before Appointment', details: 'Schedule trigger' },
        { id: 's2', type: 'task', label: 'Prepare Private Suite', details: 'Clean towels, fresh petals & oils' },
        { id: 's3', type: 'sms', label: 'Therapist Pager Alert', details: 'Client arrival notification' },
        { id: 's4', type: 'crm_update', label: 'Room Status: In Preparation', details: 'Update frontdesk board' }
      ]
    },
    {
      id: 'wf_spa_11',
      name: 'Mind-Body Experience Feedback Survey',
      category: 'Spa Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 96,
      steps: [
        { id: 's1', type: 'trigger', label: '4 Hours Post-Therapy', details: 'Relaxation period over' },
        { id: 's2', type: 'survey', label: 'Ambiance & Therapist Rating', details: 'Quick 1-tap WhatsApp poll' },
        { id: 's3', type: 'whatsapp', label: 'Send Google / TripAdvisor Link', details: 'Sent if rated 5 stars' },
        { id: 's4', type: 'task', label: 'Alert Spa Director if Dissatisfied', details: 'Immediate guest care recall' }
      ]
    },
    {
      id: 'wf_spa_12',
      name: 'Abandoned Cancellation Slot Backfill',
      category: 'Spa Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 94,
      steps: [
        { id: 's1', type: 'trigger', label: 'Weekend Slot Cancelled', details: '< 6h to start time' },
        { id: 's2', type: 'whatsapp', label: 'Broadcast Slot to Waitlisted Members', details: 'Exclusive 15% cancellation discount' },
        { id: 's3', type: 'wait', label: 'Wait 30m', details: 'First response claim' },
        { id: 's4', type: 'crm_update', label: 'Lock Slot & Notify Therapist', details: 'Room setup starts immediately' }
      ]
    }
  ],

  // ----------------------------------------------------------
  // 4. REAL ESTATE & PROPERTY DEVELOPERS
  // ----------------------------------------------------------
  realestate: [
    {
      id: 'wf_re_1',
      name: 'Instant Digital Brochure & Location Drop',
      category: 'Lead Engagement',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Ad Lead Form Submitted', details: 'Meta Ads / Google / 99acres' },
        { id: 's2', type: 'whatsapp', label: 'Instant PDF Brochure Drop', details: 'Floor plans, amenities & price list' },
        { id: 's3', type: 'whatsapp', label: 'Google Maps Pin & Directions', details: 'Site location coordinates' },
        { id: 's4', type: 'crm_update', label: 'Assign Sales Executive', details: 'Round-robin assignment' }
      ]
    },
    {
      id: 'wf_re_2',
      name: 'VIP Site Visit Free Cab Dispatch',
      category: 'Sales & Site Visits',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 98,
      steps: [
        { id: 's1', type: 'trigger', label: 'Site Visit Confirmed', details: 'Date & pickup address locked' },
        { id: 's2', type: 'task', label: 'Trigger Uber/Ola Cab Booking', details: 'Auto-dispatch luxury sedan' },
        { id: 's3', type: 'whatsapp', label: 'Send Driver & Vehicle Details', details: 'Live cab tracking link' },
        { id: 's4', type: 'sms', label: 'Sales Manager Site Arrival Alert', details: 'VIP client en route' }
      ]
    },
    {
      id: 'wf_re_3',
      name: '24h Site Visit Turn-Up Assurance Call',
      category: 'Sales & Site Visits',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 95,
      steps: [
        { id: 's1', type: 'trigger', label: '24h Before Site Visit', details: 'Calendar reminder trigger' },
        { id: 's2', type: 'call', label: 'AI Voice Site Visit Confirmation', details: 'Confirm party size & gate pass' },
        { id: 's3', type: 'whatsapp', label: 'Digital Gate Entry Pass', details: 'QR code for security gate entry' },
        { id: 's4', type: 'task', label: 'Reserve Model Flat Tour Slot', details: 'Assign site sales guide' }
      ]
    },
    {
      id: 'wf_re_4',
      name: 'Post-Visit Itemized Cost Sheet Push',
      category: 'Sales & Site Visits',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 96,
      steps: [
        { id: 's1', type: 'trigger', label: 'Site Visit Completed', details: 'Sales executive marks attended' },
        { id: 's2', type: 'wait', label: 'Wait 1h', details: 'Post-visit buffer' },
        { id: 's3', type: 'whatsapp', label: 'Itemized Cost Sheet Delivery', details: 'Base price + parking + clubhouse + GST' },
        { id: 's4', type: 'whatsapp', label: 'Available Unit Numbers', details: 'Live inventory floor choices' }
      ]
    },
    {
      id: 'wf_re_5',
      name: 'Construction Milestone & Slab Update',
      category: 'Milestones & Retention',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Slab Cast Completed', details: 'Engineering project milestone' },
        { id: 's2', type: 'whatsapp', label: 'Drone Video & Progress Photos', details: 'Broadcast to booked buyers' },
        { id: 's3', type: 'email', label: 'Architect Certificate & RERA Report', details: 'Official progress documentation' },
        { id: 's4', type: 'invoice', label: 'Generate Milestone Demand Note', details: 'Payment schedule installment' }
      ]
    },
    {
      id: 'wf_re_6',
      name: 'Home Loan Pre-Approval Assistance',
      category: 'Operations & KYC',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 92,
      steps: [
        { id: 's1', type: 'trigger', label: 'Lead Inquires About Financing', details: 'Keywords: loan, EMI, bank' },
        { id: 's2', type: 'whatsapp', label: 'Approved Banking Partners PDF', details: 'SBI, HDFC, ICICI interest rate sheet' },
        { id: 's3', type: 'task', label: 'Assign In-House Loan Specialist', details: 'Coordinate document pickup' },
        { id: 's4', type: 'wait', label: 'Wait 48h', details: 'Eligibility check turnaround' }
      ]
    },
    {
      id: 'wf_re_7',
      name: 'Price Revision & Fast-Selling Alert',
      category: 'Lead Engagement',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 90,
      steps: [
        { id: 's1', type: 'trigger', label: '80% Tower Inventory Sold', details: 'Sales velocity trigger' },
        { id: 's2', type: 'whatsapp', label: 'Price Escalation Notice', details: 'Prices increasing by ₹350/sq.ft on 1st' },
        { id: 's3', type: 'call', label: 'AI Voice Urgency Follow-up', details: 'Lock current pricing with token' },
        { id: 's4', type: 'wait', label: 'Wait 3d', details: 'Deadline countdown' }
      ]
    },
    {
      id: 'wf_re_8',
      name: 'NRI Virtual Video Tour Scheduler',
      category: 'Sales & Site Visits',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 94,
      steps: [
        { id: 's1', type: 'trigger', label: 'International Number Lead', details: 'Country code != +91' },
        { id: 's2', type: 'whatsapp', label: 'NRI Investment Deck & ROI Stats', details: 'Rental yields & capital appreciation' },
        { id: 's3', type: 'task', label: 'Schedule 3D Virtual Walkthrough', details: 'Timezone matched Zoom/Meet call' },
        { id: 's4', type: 'email', label: 'Send NRE/NRO Banking Guidelines', details: 'FEMA compliance checklist' }
      ]
    },
    {
      id: 'wf_re_9',
      name: 'Token Payment & KYC Document Collection',
      category: 'Operations & KYC',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 99,
      steps: [
        { id: 's1', type: 'trigger', label: 'Booking Token Received', details: 'Payment credited to escrow' },
        { id: 's2', type: 'whatsapp', label: 'Digital Token Receipt', details: 'Official signed provisional receipt' },
        { id: 's3', type: 'whatsapp', label: 'Secure KYC Upload Link', details: 'Aadhaar, PAN & photographs' },
        { id: 's4', type: 'crm_update', label: 'Lock Unit in Master Inventory', details: 'Mark as booked' }
      ]
    },
    {
      id: 'wf_re_10',
      name: 'Dormant Buyer AI Reactivation Sequence',
      category: 'Lead Engagement',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 86,
      steps: [
        { id: 's1', type: 'trigger', label: 'No Interaction > 14 Days', details: 'Unresponsive lead status' },
        { id: 's2', type: 'whatsapp', label: 'New Phase Launch Preview', details: 'Exclusive pre-launch pricing invitation' },
        { id: 's3', type: 'wait', label: 'Wait 3d', details: 'Engagement window' },
        { id: 's4', type: 'call', label: 'AI Voice Property Consultant Call', details: 'Check if budget or location changed' }
      ]
    },
    {
      id: 'wf_re_11',
      name: 'Channel Partner Commission Alert',
      category: 'Operations & KYC',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Agreement for Sale Registered', details: 'Unit registration complete' },
        { id: 's2', type: 'whatsapp', label: 'Broker Commission Advice', details: '₹1.2L payout approval notification' },
        { id: 's3', type: 'email', label: 'Send TDS & Payment Advice', details: 'Formal finance remittance statement' },
        { id: 's4', type: 'crm_update', label: 'Update Channel Partner Score', details: 'Increase tier ranking' }
      ]
    },
    {
      id: 'wf_re_12',
      name: 'Agreement for Sale (AFS) Registration Call',
      category: 'Milestones & Retention',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 98,
      steps: [
        { id: 's1', type: 'trigger', label: '10% Payment Milestones Cleared', details: 'Eligible for registration' },
        { id: 's2', type: 'whatsapp', label: 'Sub-Registrar Slot Options', details: 'Pick date for document signing' },
        { id: 's3', type: 'whatsapp', label: 'Send Checklist of Original Docs', details: 'Passports, stamp duty drafts' },
        { id: 's4', type: 'task', label: 'Legal Team File Preparation', details: 'Print stamp papers' }
      ]
    }
  ],

  // ----------------------------------------------------------
  // 5. BOUTIQUE HOTEL & LUXURY RESORT
  // ----------------------------------------------------------
  hotel: [
    {
      id: 'wf_hotel_1',
      name: 'Pre-Arrival Room Customization & Dietary Form',
      category: 'Guest Experience',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: '48h Before Check-in', details: 'Reservation confirmed' },
        { id: 's2', type: 'whatsapp', label: 'Preference Intake Form', details: 'Pillow menu, dietary & arrival time' },
        { id: 's3', type: 'wait', label: 'Wait 12h', details: 'Preferences sync' },
        { id: 's4', type: 'task', label: 'Tag Housekeeping & Kitchen', details: 'Prep feather pillows & vegan menu' }
      ]
    },
    {
      id: 'wf_hotel_2',
      name: 'Airport Chauffeur Pickup Dispatch',
      category: 'Frontdesk Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 99,
      steps: [
        { id: 's1', type: 'trigger', label: 'Flight Landed Status', details: 'Flight radar webhook trigger' },
        { id: 's2', type: 'task', label: 'Dispatch Chauffeur to Terminal', details: 'Name badge & luxury EV fleet' },
        { id: 's3', type: 'whatsapp', label: 'Send Driver Contact & Vehicle Pin', details: 'Terminal 2 pillar 4 meeting point' },
        { id: 's4', type: 'crm_update', label: 'Frontdesk Board: Guest En Route', details: 'Prepare express keycard' }
      ]
    },
    {
      id: 'wf_hotel_3',
      name: 'In-Stay Dining & Sunset Deck Table Lock',
      category: 'Upsells & Dining',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 95,
      steps: [
        { id: 's1', type: 'trigger', label: 'Guest Check-in Complete', details: 'Status = In-House' },
        { id: 's2', type: 'wait', label: 'Wait 3h', details: 'Settling in buffer' },
        { id: 's3', type: 'whatsapp', label: 'Sunset Deck Cocktail & Table Menu', details: '1-click prime view table booking' },
        { id: 's4', type: 'task', label: 'Alert F&B Captain', details: 'Reserve best ocean-view table' }
      ]
    },
    {
      id: 'wf_hotel_4',
      name: 'Mid-Stay Housekeeping & Turndown Request',
      category: 'Frontdesk Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Daily 10:00 AM Trigger', details: 'Morning housekeeping schedule' },
        { id: 's2', type: 'whatsapp', label: '1-Tap Room Refresh Button', details: 'Select: Clean Now, Do Not Disturb, or Extra Towels' },
        { id: 's3', type: 'task', label: 'Route to Floor Housekeeper', details: 'Instant tablet alert' },
        { id: 's4', type: 'crm_update', label: 'Update Room Status', details: 'Mark room serviced' }
      ]
    },
    {
      id: 'wf_hotel_5',
      name: 'Resort Activity & Excursion Boarding',
      category: 'Guest Experience',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 93,
      steps: [
        { id: 's1', type: 'trigger', label: 'Day 2 Morning 08:30 AM', details: 'Activities planner' },
        { id: 's2', type: 'whatsapp', label: 'Curated Daily Experiences', details: 'Scuba, pottery workshop & sunset cruise' },
        { id: 's3', type: 'wait', label: 'Wait 2h', details: 'Confirmation window' },
        { id: 's4', type: 'task', label: 'Concierge Booking Lock', details: 'Confirm activity slots & guide' }
      ]
    },
    {
      id: 'wf_hotel_6',
      name: 'In-Room Spa & Wellness Upsell',
      category: 'Upsells & Dining',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 91,
      steps: [
        { id: 's1', type: 'trigger', label: 'Check-in + 4 Hours', details: 'Post-travel relaxation' },
        { id: 's2', type: 'whatsapp', label: 'Exclusive In-Room Spa Voucher', details: '20% off Couple Massage before 6 PM' },
        { id: 's3', type: 'wait', label: 'Wait 2h', details: 'Slot availability' },
        { id: 's4', type: 'call', label: 'AI Spa Concierge Call', details: 'Confirm treatment & room timing' }
      ]
    },
    {
      id: 'wf_hotel_7',
      name: 'Express Mobile Check-out & Folio Delivery',
      category: 'Frontdesk Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 98,
      steps: [
        { id: 's1', type: 'trigger', label: '08:00 AM Departure Date', details: 'Check-out day schedule' },
        { id: 's2', type: 'whatsapp', label: 'Itemized Digital Folio & Bill', details: 'Review room + dining charges' },
        { id: 's3', type: 'invoice', label: '1-Click UPI / Card Settlement', details: 'Bypass frontdesk queue' },
        { id: 's4', type: 'task', label: 'Bellboy Luggage Assistance', details: 'Luggage pickup at scheduled time' }
      ]
    },
    {
      id: 'wf_hotel_8',
      name: 'Post-Stay TripAdvisor & Google Review Booster',
      category: 'Post-Stay & Loyalty',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 94,
      steps: [
        { id: 's1', type: 'trigger', label: '2 Hours Post Check-out', details: 'Guest on journey home' },
        { id: 's2', type: 'survey', label: 'Quick Stay Sentiment Rating', details: 'Rate overall experience 1-5' },
        { id: 's3', type: 'whatsapp', label: 'Send Direct TripAdvisor Link', details: 'Triggered if rated 5/5' },
        { id: 's4', type: 'task', label: 'General Manager Alert if < 4', details: 'Personal apology & recovery voucher' }
      ]
    },
    {
      id: 'wf_hotel_9',
      name: 'Lost & Found Instant Recovery Protocol',
      category: 'Frontdesk Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Housekeeper Logs Left Item', details: 'Room turnover scan' },
        { id: 's2', type: 'whatsapp', label: 'Item Photo & Courier Options', details: 'We found your item; dispatch to your address' },
        { id: 's3', type: 'wait', label: 'Wait 24h', details: 'Guest reply window' },
        { id: 's4', type: 'task', label: 'Courier Dispatch Task', details: 'Ship via BlueDart / DHL' }
      ]
    },
    {
      id: 'wf_hotel_10',
      name: 'Anniversary & Return Guest Loyalty Privileges',
      category: 'Post-Stay & Loyalty',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 96,
      steps: [
        { id: 's1', type: 'trigger', label: '330 Days Post-Stay', details: 'Annual holiday cycle' },
        { id: 's2', type: 'whatsapp', label: 'Welcome Back Luxury Invitation', details: '25% repeat guest discount + suite upgrade' },
        { id: 's3', type: 'wait', label: 'Wait 7d', details: 'Trip planning buffer' },
        { id: 's4', type: 'call', label: 'AI Concierge Vacation Call', details: 'Lock preferred villa dates' }
      ]
    },
    {
      id: 'wf_hotel_11',
      name: 'Banquet & Wedding Inquiry Cadence',
      category: 'Upsells & Dining',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 90,
      steps: [
        { id: 's1', type: 'trigger', label: 'Wedding/Banquet Form Ingested', details: 'Guest count > 100' },
        { id: 's2', type: 'whatsapp', label: 'Send Wedding Lookbook & Menu Deck', details: 'High-res banquet brochure' },
        { id: 's3', type: 'email', label: 'Itemized Event Quotation', details: 'Lawn + ballroom + room blocks' },
        { id: 's4', type: 'task', label: 'Assign Senior Events Director', details: 'Schedule in-person site tasting' }
      ]
    },
    {
      id: 'wf_hotel_12',
      name: 'Incidental Settlement & GST Invoice Delivery',
      category: 'Frontdesk Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Check-out Closed', details: 'Folio balance cleared' },
        { id: 's2', type: 'email', label: 'Formal GST Tax Invoice PDF', details: 'Company billing details included' },
        { id: 's3', type: 'whatsapp', label: 'WhatsApp Invoice Copy', details: '1-click download link' },
        { id: 's4', type: 'crm_update', label: 'Sync to Financial Ledger', details: 'Export to Tally/Zoho' }
      ]
    }
  ]
};

// ------------------------------------------------------------
// HELPER FUNCTIONS
// ------------------------------------------------------------

export function getWorkflowsForNiche(niche: ActiveNicheId): WorkflowItem[] {
  const workflows = NICHE_WORKFLOWS[niche] || NICHE_WORKFLOWS.skin;
  // Return deep copy so mutations don't corrupt the master presets
  return JSON.parse(JSON.stringify(workflows));
}

export function getCategoriesForNiche(niche: ActiveNicheId): string[] {
  return NICHE_CATEGORIES[niche] || NICHE_CATEGORIES.skin;
}
