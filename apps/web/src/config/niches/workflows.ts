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
// 16 PRODUCTION WORKFLOWS PER NICHE (80 TOTAL)
// ------------------------------------------------------------

export const NICHE_WORKFLOWS: Record<ActiveNicheId, WorkflowItem[]> = {
  // ----------------------------------------------------------
  // 1. SKIN CLINIC & AESTHETIC DERMATOLOGY (16 Workflows)
  // ----------------------------------------------------------
  skin: [
    {
      id: 'wf_skin_1',
      name: 'Lead Intake Triage',
      category: 'Revenue & Sales',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Ad Lead Ingested', details: 'Meta / Google / WhatsApp' },
        { id: 's2', type: 'whatsapp', label: 'WhatsApp Welcome Kit', details: 'Doctor profile & services' },
        { id: 's3', type: 'wait', label: 'Wait 5m', details: 'Lead review delay' },
        { id: 's4', type: 'call', label: 'AI Voice Consult Call', details: 'Qualify & reserve slot' }
      ]
    },
    {
      id: 'wf_skin_2',
      name: 'Post-Laser Aftercare',
      category: 'Patient Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 98,
      steps: [
        { id: 's1', type: 'trigger', label: 'Procedure Done', details: 'Laser / Peel completed' },
        { id: 's2', type: 'whatsapp', label: 'PDF Care Sheet', details: 'Sunscreen & recovery guide' },
        { id: 's3', type: 'wait', label: 'Wait 24h', details: 'Post-op buffer' },
        { id: 's4', type: 'call', label: 'AI Voice Check-in', details: 'Check redness & comfort' }
      ]
    },
    {
      id: 'wf_skin_3',
      name: 'HydraFacial Glow Recall',
      category: 'Retention & Recalls',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: '28 Days Post-Facial', details: 'Turnover cycle reached' },
        { id: 's2', type: 'whatsapp', label: '1-Click Slot Picker', details: 'Reserve maintenance glow' },
        { id: 's3', type: 'wait', label: 'Wait 48h', details: 'Unbooked buffer' },
        { id: 's4', type: 'call', label: 'AI Voice Glow Recall', details: 'Offer complimentary LED' }
      ]
    },
    {
      id: 'wf_skin_4',
      name: 'Neurotoxin Touch-Up',
      category: 'Patient Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 99,
      steps: [
        { id: 's1', type: 'trigger', label: '14 Days Post-Botox', details: 'Peak effect reached' },
        { id: 's2', type: 'whatsapp', label: 'Symmetry Self-Check', details: 'Reply 1 for Great, 2 for Check' },
        { id: 's3', type: 'wait', label: 'Wait 4h', details: 'Response window' },
        { id: 's4', type: 'task', label: 'Doctor Touch-Up Review', details: 'Schedule 15m review if needed' }
      ]
    },
    {
      id: 'wf_skin_5',
      name: 'Cancellation Backfill',
      category: 'Clinic Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 95,
      steps: [
        { id: 's1', type: 'trigger', label: 'Slot Cancelled < 4h', details: 'Chair opening detected' },
        { id: 's2', type: 'task', label: 'Scan VIP Waitlist', details: 'Match procedure & doctor' },
        { id: 's3', type: 'whatsapp', label: 'Flash Slot Broadcast', details: 'Send 1-click claim to top 3' },
        { id: 's4', type: 'crm_update', label: 'Auto-Assign Chair', details: 'Lock slot for first claimant' }
      ]
    },
    {
      id: 'wf_skin_6',
      name: 'Patch Test Clearance',
      category: 'Patient Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Patch Test Applied', details: 'Clinical tag: patch_test' },
        { id: 's2', type: 'wait', label: 'Wait 48h', details: 'Allergy clearance window' },
        { id: 's3', type: 'whatsapp', label: 'Allergy Check Form', details: 'Verify no redness or itching' },
        { id: 's4', type: 'task', label: 'Clear for Full Session', details: 'Update clinical status' }
      ]
    },
    {
      id: 'wf_skin_7',
      name: 'Quote Follow-up Call',
      category: 'Revenue & Sales',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 92,
      steps: [
        { id: 's1', type: 'trigger', label: 'Estimate > ₹40,000 Sent', details: 'High-ticket proposal' },
        { id: 's2', type: 'wait', label: 'Wait 48h', details: 'Review window' },
        { id: 's3', type: 'call', label: 'AI Voice Package Call', details: 'Explain 0% interest EMI' },
        { id: 's4', type: 'task', label: 'Alert Clinic Manager', details: 'Custom treatment plan' }
      ]
    },
    {
      id: 'wf_skin_8',
      name: 'No-Show Recovery Rescue',
      category: 'Clinic Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 88,
      steps: [
        { id: 's1', type: 'trigger', label: 'Marked No-Show', details: 'Status = No-Show' },
        { id: 's2', type: 'wait', label: 'Wait 30m', details: 'Buffer delay' },
        { id: 's3', type: 'whatsapp', label: 'Gentle Reschedule Link', details: 'We missed you message' },
        { id: 's4', type: 'call', label: 'AI Voice Reschedule Call', details: 'Next morning outreach' }
      ]
    },
    {
      id: 'wf_skin_9',
      name: 'Birthday Glow Voucher',
      category: 'Revenue & Sales',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 96,
      steps: [
        { id: 's1', type: 'trigger', label: '7 Days Before Birthday', details: 'DOB matched in EMR' },
        { id: 's2', type: 'whatsapp', label: '₹1,500 Gift Voucher', details: 'Valid for 14 days' },
        { id: 's3', type: 'wait', label: 'Wait 5d', details: 'Countdown threshold' },
        { id: 's4', type: 'whatsapp', label: 'Voucher Expiry Reminder', details: 'Reserve birthday session' }
      ]
    },
    {
      id: 'wf_skin_10',
      name: 'Adverse Reaction Alert',
      category: 'Clinic Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Pain/Blister Keyword', details: 'WhatsApp AI triage' },
        { id: 's2', type: 'whatsapp', label: 'Cold Compress Advice', details: 'Request clear photo' },
        { id: 's3', type: 'sms', label: 'Emergency Doctor Alert', details: 'SMS to Medical Director' },
        { id: 's4', type: 'task', label: 'Priority Emergency Slot', details: 'Immediate 15m chair block' }
      ]
    },
    {
      id: 'wf_skin_11',
      name: 'Review Shield Triage',
      category: 'Retention & Recalls',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 94,
      steps: [
        { id: 's1', type: 'trigger', label: '72h Post-Treatment', details: 'Recovery check' },
        { id: 's2', type: 'survey', label: '1-Tap CSAT Rating', details: '1 to 5 Stars' },
        { id: 's3', type: 'whatsapp', label: 'Google Review Link', details: 'Sent to all consenting patients' },
        { id: 's4', type: 'task', label: 'Manager Alert if < 4★', details: 'Immediate service recovery' }
      ]
    },
    {
      id: 'wf_skin_12',
      name: 'Deposit Lock Reminder',
      category: 'Revenue & Sales',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 93,
      steps: [
        { id: 's1', type: 'trigger', label: 'Saturday Slot Booked', details: 'High-demand slot' },
        { id: 's2', type: 'invoice', label: 'Razorpay Deposit Link', details: '₹2,500 commitment deposit' },
        { id: 's3', type: 'wait', label: 'Wait 3h', details: 'Confirmation window' },
        { id: 's4', type: 'sms', label: 'Slot Release Warning', details: 'Releases to waitlist in 1h' }
      ]
    },
    {
      id: 'wf_skin_13',
      name: 'Laser Cadence Nudge',
      category: 'Retention & Recalls',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 97,
      steps: [
        { id: 's1', type: 'trigger', label: '4 Weeks Post-LHR Sitting', details: 'Anagen cycle reached' },
        { id: 's2', type: 'whatsapp', label: 'Next Session Booking Link', details: 'Maintain follicle reduction' },
        { id: 's3', type: 'wait', label: 'Wait 3d', details: 'Unbooked buffer' },
        { id: 's4', type: 'call', label: 'AI Voice Cadence Reminder', details: 'Reserve weekend sitting' }
      ]
    },
    {
      id: 'wf_skin_14',
      name: 'Dermal Filler Check',
      category: 'Patient Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: '7 Days Post-Filler', details: 'Swelling subsides' },
        { id: 's2', type: 'whatsapp', label: 'Contour & Comfort Check', details: 'Verify no firm lumps or pain' },
        { id: 's3', type: 'wait', label: 'Wait 2h', details: 'Review window' },
        { id: 's4', type: 'task', label: 'Injector Clinical Review', details: 'Flag for palpation check' }
      ]
    },
    {
      id: 'wf_skin_15',
      name: 'Sunscreen Restock Recall',
      category: 'Retention & Recalls',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 91,
      steps: [
        { id: 's1', type: 'trigger', label: '45 Days Post-Skincare', details: 'Bottle depletion cycle' },
        { id: 's2', type: 'whatsapp', label: 'Mineral Sunscreen Refill', details: 'Doorstep delivery link' },
        { id: 's3', type: 'wait', label: 'Wait 48h', details: 'Re-order buffer' },
        { id: 's4', type: 'crm_update', label: 'Log Retail Replenishment', details: 'Update patient profile' }
      ]
    },
    {
      id: 'wf_skin_16',
      name: 'VIP Concierge Boarding',
      category: 'Patient Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Spend > ₹1.5L / VIP Tag', details: 'Black Diamond tier' },
        { id: 's2', type: 'whatsapp', label: 'Director Welcome Message', details: 'Private concierge line' },
        { id: 's3', type: 'crm_update', label: 'Assign Dedicated RM', details: 'Direct priority routing' },
        { id: 's4', type: 'task', label: 'Private Suite Preparation', details: 'Zero-wait chair admission' }
      ]
    }
  ],

  // ----------------------------------------------------------
  // 2. DENTAL CLINIC & ORTHODONTICS (16 Workflows)
  // ----------------------------------------------------------
  dental: [
    {
      id: 'wf_dental_1',
      name: 'Medical History Intake',
      category: 'Clinical Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'New Patient Booked', details: 'Dental chair reserved' },
        { id: 's2', type: 'whatsapp', label: 'Digital Dental & Med Form', details: 'Pre-arrival medical check' },
        { id: 's3', type: 'wait', label: 'Wait 2h', details: 'Intake window' },
        { id: 's4', type: 'task', label: 'Flag Allergies / Cardiac', details: 'Alert treating dentist' }
      ]
    },
    {
      id: 'wf_dental_2',
      name: 'Post-Surgery Pain Check',
      category: 'Clinical Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 99,
      steps: [
        { id: 's1', type: 'trigger', label: 'Extraction Done', details: 'Surgical checkout' },
        { id: 's2', type: 'whatsapp', label: 'Soft Diet & Gauze PDF', details: 'No spitting / ice packs' },
        { id: 's3', type: 'wait', label: 'Wait 12h', details: 'Pain inflection point' },
        { id: 's4', type: 'call', label: 'AI Voice Pain Check Call', details: 'Score 1-10 & bleeding check' }
      ]
    },
    {
      id: 'wf_dental_3',
      name: 'Aligner Switch Tracker',
      category: 'Clinical Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 96,
      steps: [
        { id: 's1', type: 'trigger', label: '14-Day Cycle Elapsed', details: 'Tray switch milestone' },
        { id: 's2', type: 'whatsapp', label: 'Switch to Next Tray', details: 'Wear 22 hours daily' },
        { id: 's3', type: 'whatsapp', label: 'Upload Smile Selfie', details: 'Verify attachment seating' },
        { id: 's4', type: 'task', label: 'Ortho Tracking Review', details: 'Flag unseated aligners' }
      ]
    },
    {
      id: 'wf_dental_4',
      name: 'Hygiene Scaling Recall',
      category: 'Recalls & Hygiene',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 94,
      steps: [
        { id: 's1', type: 'trigger', label: '180 Days Since Cleaning', details: '6-month preventive recall' },
        { id: 's2', type: 'whatsapp', label: 'Scaling Recall & Slot Picker', details: 'Prevent tartar & bone loss' },
        { id: 's3', type: 'wait', label: 'Wait 3d', details: 'Follow-up buffer' },
        { id: 's4', type: 'call', label: 'AI Voice Hygiene Call', details: 'Reserve 30m chair slot' }
      ]
    },
    {
      id: 'wf_dental_5',
      name: 'Root Canal Next Step',
      category: 'Treatment Plans',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'RCT Step 1 Completed', details: 'Canals prepared' },
        { id: 's2', type: 'whatsapp', label: 'Temporary Care Sheet', details: 'Chew on opposite side' },
        { id: 's3', type: 'task', label: 'Lock Step 2 (Obturation)', details: 'Schedule within 5 to 7 days' },
        { id: 's4', type: 'invoice', label: 'Crown Estimate Preview', details: 'Zirconia / Ceramic options' }
      ]
    },
    {
      id: 'wf_dental_6',
      name: 'Implant Quote Follow-Up',
      category: 'Treatment Plans',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 91,
      steps: [
        { id: 's1', type: 'trigger', label: 'Quote > ₹40,000 Delivered', details: 'Implant / Smile makeover' },
        { id: 's2', type: 'wait', label: 'Wait 48h', details: 'Decision window' },
        { id: 's3', type: 'call', label: 'AI Voice Coordinator Call', details: 'Explain 0% interest EMI' },
        { id: 's4', type: 'task', label: 'Alert Senior Implantologist', details: 'Prepare digital scan review' }
      ]
    },
    {
      id: 'wf_dental_7',
      name: 'Prosthetic Lab Arrival',
      category: 'Practice Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 98,
      steps: [
        { id: 's1', type: 'trigger', label: 'Lab Scans Crown Delivery', details: 'Prosthetic checked into clinic' },
        { id: 's2', type: 'whatsapp', label: 'Crown Ready Alert', details: 'Permanent fitting ready' },
        { id: 's3', type: 'wait', label: 'Wait 24h', details: 'Unbooked buffer' },
        { id: 's4', type: 'call', label: 'AI Voice Cementation Call', details: 'Book 20m appointment' }
      ]
    },
    {
      id: 'wf_dental_8',
      name: 'Acute Toothache Triage',
      category: 'Practice Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Toothache / Swelling Keyword', details: 'Emergency inbound' },
        { id: 's2', type: 'whatsapp', label: 'Emergency First-Aid Tips', details: 'Cold pack, no aspirin on gum' },
        { id: 's3', type: 'sms', label: 'Dentist On-Call SMS', details: 'Urgent pain case alert' },
        { id: 's4', type: 'task', label: 'Emergency Chair Priority', details: 'Fast-track operatory slot' }
      ]
    },
    {
      id: 'wf_dental_9',
      name: 'Whitening Care Protocol',
      category: 'Clinical Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 99,
      steps: [
        { id: 's1', type: 'trigger', label: 'In-Office Whitening Done', details: 'Bleaching complete' },
        { id: 's2', type: 'whatsapp', label: '48h White Diet Sheet', details: 'No coffee, tea or turmeric' },
        { id: 's3', type: 'wait', label: 'Wait 24h', details: 'Sensitivity check buffer' },
        { id: 's4', type: 'survey', label: 'Enamel Sensitivity Poll', details: 'Rate 1 to 5 scale' }
      ]
    },
    {
      id: 'wf_dental_10',
      name: 'Kids Bravery Certificate',
      category: 'Recalls & Hygiene',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 98,
      steps: [
        { id: 's1', type: 'trigger', label: 'Pediatric Visit Complete', details: 'Child <= 12 years' },
        { id: 's2', type: 'whatsapp', label: 'Digital Bravery Certificate', details: 'Personalized PDF for parents' },
        { id: 's3', type: 'wait', label: 'Wait 90d', details: 'Quarterly checkup buffer' },
        { id: 's4', type: 'whatsapp', label: 'Fluoride & Cavity Check', details: 'Preventive pediatric visit' }
      ]
    },
    {
      id: 'wf_dental_11',
      name: 'Night Guard Review',
      category: 'Clinical Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 95,
      steps: [
        { id: 's1', type: 'trigger', label: '90 Days Post Splint Delivery', details: 'Bruxism review cycle' },
        { id: 's2', type: 'whatsapp', label: 'Jaw Soreness & Fit Check', details: 'Check morning tightness' },
        { id: 's3', type: 'wait', label: 'Wait 24h', details: 'Feedback window' },
        { id: 's4', type: 'task', label: 'Occlusal Adjustment Slot', details: 'Free 10m chair check' }
      ]
    },
    {
      id: 'wf_dental_12',
      name: 'Braces Wire Tightening',
      category: 'Recalls & Hygiene',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 96,
      steps: [
        { id: 's1', type: 'trigger', label: '28 Days Post Adjustment', details: 'Ortho movement milestone' },
        { id: 's2', type: 'whatsapp', label: 'Wire Tightening Booking', details: 'Pick Saturday chair slot' },
        { id: 's3', type: 'wait', label: 'Wait 48h', details: 'Unbooked buffer' },
        { id: 's4', type: 'call', label: 'AI Voice Ortho Reminder', details: 'Confirm adjustment sitting' }
      ]
    },
    {
      id: 'wf_dental_13',
      name: 'Dental Deposit Collector',
      category: 'Treatment Plans',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 93,
      steps: [
        { id: 's1', type: 'trigger', label: 'Surgical Operatory Booked', details: '> 60m chair allocation' },
        { id: 's2', type: 'invoice', label: '20% Commitment Deposit', details: 'Razorpay / Stripe link' },
        { id: 's3', type: 'wait', label: 'Wait 4h', details: 'Hold window' },
        { id: 's4', type: 'sms', label: 'Operatory Hold Warning', details: 'Releases in 60 minutes' }
      ]
    },
    {
      id: 'wf_dental_14',
      name: 'Dental Chair Backfill',
      category: 'Practice Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 94,
      steps: [
        { id: 's1', type: 'trigger', label: 'Chair Cancelled < 3h', details: 'Idle operatory detected' },
        { id: 's2', type: 'task', label: 'Scan Routine Recall List', details: 'Find nearby scaling leads' },
        { id: 's3', type: 'whatsapp', label: 'Broadcast Short-Notice Slot', details: 'Free fluoride polish bonus' },
        { id: 's4', type: 'crm_update', label: 'Lock Operatory Chair', details: 'Assign first responder' }
      ]
    },
    {
      id: 'wf_dental_15',
      name: 'Post-Op Bleeding Triage',
      category: 'Clinical Care',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Bleeding / Socket Pain Keyword', details: 'Post-surgical distress' },
        { id: 's2', type: 'whatsapp', label: 'Damp Tea Bag Pressure Guide', details: 'Bite firmly 30 mins' },
        { id: 's3', type: 'sms', label: 'Oral Surgeon Emergency Alert', details: 'Immediate clinical alert' },
        { id: 's4', type: 'call', label: 'Phone Bridge to Nurse', details: 'Live medical triage' }
      ]
    },
    {
      id: 'wf_dental_16',
      name: 'Dental Reputation Shield',
      category: 'Recalls & Hygiene',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 95,
      steps: [
        { id: 's1', type: 'trigger', label: '48h Post-Dental Sitting', details: 'Pain resolved' },
        { id: 's2', type: 'survey', label: '1-Tap Gentle CSAT Rating', details: 'Rate gentle touch 1-5' },
        { id: 's3', type: 'whatsapp', label: 'Google Review Link', details: 'Sent to all consenting patients' },
        { id: 's4', type: 'task', label: 'Manager Service Recovery', details: 'Call if rating < 4 Stars' }
      ]
    }
  ],

  // ----------------------------------------------------------
  // 3. LUXURY SPA & AYURVEDIC WELLNESS (16 Workflows)
  // ----------------------------------------------------------
  spa: [
    {
      id: 'wf_spa_1',
      name: 'Aromatherapy Intake',
      category: 'Guest Wellness',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Spa Booking Confirmed', details: 'Reservation created' },
        { id: 's2', type: 'whatsapp', label: 'Essential Oil Selection', details: 'Lavender, Sandalwood or Citrus' },
        { id: 's3', type: 'wait', label: 'Wait 2h', details: 'Preference sync' },
        { id: 's4', type: 'task', label: 'Pre-heat Bed & Diffuser', details: 'Therapist room setup' }
      ]
    },
    {
      id: 'wf_spa_2',
      name: 'Couples Suite Boarding',
      category: 'Packages & Upgrades',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 97,
      steps: [
        { id: 's1', type: 'trigger', label: 'Couples Package Booked', details: 'Romance package' },
        { id: 's2', type: 'whatsapp', label: 'VIP Welcome Itinerary', details: 'Jacuzzi & tea schedule' },
        { id: 's3', type: 'task', label: 'Petal Bath & Herbal Tea', details: 'Frontdesk hospitality alert' },
        { id: 's4', type: 'wait', label: 'Wait 24h', details: 'Experience preparation' }
      ]
    },
    {
      id: 'wf_spa_3',
      name: 'Post-Massage Care Tips',
      category: 'Guest Wellness',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Checkout Completed', details: 'Treatment finished' },
        { id: 's2', type: 'whatsapp', label: 'Ayurvedic Detox Guide', details: 'Hydration & herbal diet' },
        { id: 's3', type: 'wait', label: 'Wait 24h', details: 'Follow-up buffer' },
        { id: 's4', type: 'survey', label: 'Therapist Pressure Rating', details: 'Rate 1 to 5 stars' }
      ]
    },
    {
      id: 'wf_spa_4',
      name: 'Midweek Flash Offer',
      category: 'Packages & Upgrades',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 92,
      steps: [
        { id: 's1', type: 'trigger', label: 'Tuesday Morning Schedule', details: 'Off-peak room fill' },
        { id: 's2', type: 'whatsapp', label: '25% Off Flash Voucher', details: 'Broadcast to top 50 guests' },
        { id: 's3', type: 'wait', label: 'Wait 8h', details: 'Flash offer validity' },
        { id: 's4', type: 'crm_update', label: 'Close Flash Promotion', details: 'Expire promo code' }
      ]
    },
    {
      id: 'wf_spa_5',
      name: 'Membership Renewal Call',
      category: 'Loyalty & Membership',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 95,
      steps: [
        { id: 's1', type: 'trigger', label: '14 Days Before Expiry', details: 'Tier expiring' },
        { id: 's2', type: 'whatsapp', label: 'Renewal Perk Summary', details: 'Free body scrub with renewal' },
        { id: 's3', type: 'wait', label: 'Wait 3d', details: 'Member review window' },
        { id: 's4', type: 'call', label: 'AI Voice Concierge Call', details: 'Lock annual renewal dates' }
      ]
    },
    {
      id: 'wf_spa_6',
      name: 'Therapist Re-booking Nudge',
      category: 'Guest Wellness',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 94,
      steps: [
        { id: 's1', type: 'trigger', label: '21 Days Post Massage', details: 'Muscle tension recurrence' },
        { id: 's2', type: 'whatsapp', label: 'Re-book Preferred Therapist', details: '1-click favorite slot' },
        { id: 's3', type: 'wait', label: 'Wait 48h', details: 'Unbooked buffer' },
        { id: 's4', type: 'whatsapp', label: 'Complimentary Steam Pass', details: 'Weekend slot incentive' }
      ]
    },
    {
      id: 'wf_spa_7',
      name: 'Annual Member Upgrade',
      category: 'Loyalty & Membership',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 89,
      steps: [
        { id: 's1', type: 'trigger', label: 'First Visit Complete (5★)', details: 'High-satisfaction guest' },
        { id: 's2', type: 'wait', label: 'Wait 24h', details: 'Reflection window' },
        { id: 's3', type: 'whatsapp', label: 'Wellness Circle Invitation', details: 'Apply today fee as credit' },
        { id: 's4', type: 'task', label: 'Spa Director Follow-up', details: 'Offer private sauna tour' }
      ]
    },
    {
      id: 'wf_spa_8',
      name: 'Corporate Retreat Quote',
      category: 'Packages & Upgrades',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 91,
      steps: [
        { id: 's1', type: 'trigger', label: 'Corporate Query Received', details: 'Group booking > 10 pax' },
        { id: 's2', type: 'whatsapp', label: 'Corporate Tariff PDF', details: 'Executive wellness deck' },
        { id: 's3', type: 'email', label: 'Formal Event Proposal', details: 'Schedule and catering' },
        { id: 's4', type: 'call', label: 'AI Corporate Sales Call', details: 'Confirm date & headcount' }
      ]
    },
    {
      id: 'wf_spa_9',
      name: 'Birthday Pamper Voucher',
      category: 'Loyalty & Membership',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 98,
      steps: [
        { id: 's1', type: 'trigger', label: '7 Days Before Birthday', details: 'Member birthday matched' },
        { id: 's2', type: 'whatsapp', label: 'Complimentary 30m Reflexology', details: 'Valid with any 60m therapy' },
        { id: 's3', type: 'wait', label: 'Wait 5d', details: 'Reminder threshold' },
        { id: 's4', type: 'sms', label: 'Birthday Weekend Reminder', details: 'Direct booking link' }
      ]
    },
    {
      id: 'wf_spa_10',
      name: 'Room Prep Alert (30m)',
      category: 'Spa Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: '30m Before Appointment', details: 'Schedule trigger' },
        { id: 's2', type: 'task', label: 'Prepare Private Suite', details: 'Heated towels, oils & music' },
        { id: 's3', type: 'sms', label: 'Therapist Pager Alert', details: 'Guest arrival notification' },
        { id: 's4', type: 'crm_update', label: 'Room Status: Ready', details: 'Update frontdesk board' }
      ]
    },
    {
      id: 'wf_spa_11',
      name: 'Guest CSAT Review',
      category: 'Spa Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 96,
      steps: [
        { id: 's1', type: 'trigger', label: '4 Hours Post-Therapy', details: 'Relaxation period over' },
        { id: 's2', type: 'survey', label: 'Ambiance & Pressure Rating', details: 'Quick 1-tap WhatsApp poll' },
        { id: 's3', type: 'whatsapp', label: 'TripAdvisor & Google Link', details: 'Sent to all consenting guests' },
        { id: 's4', type: 'task', label: 'Alert Director if < 4★', details: 'Service recovery protocol' }
      ]
    },
    {
      id: 'wf_spa_12',
      name: 'Cancellation Slot Fill',
      category: 'Spa Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 94,
      steps: [
        { id: 's1', type: 'trigger', label: 'Weekend Slot Cancelled', details: '< 6h to start time' },
        { id: 's2', type: 'whatsapp', label: 'Broadcast Slot to Waitlist', details: '15% short-notice discount' },
        { id: 's3', type: 'wait', label: 'Wait 30m', details: 'First response claim' },
        { id: 's4', type: 'crm_update', label: 'Lock Slot for Winner', details: 'Room setup commences' }
      ]
    },
    {
      id: 'wf_spa_13',
      name: 'Seasonal Ayurvedic Detox',
      category: 'Packages & Upgrades',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 92,
      steps: [
        { id: 's1', type: 'trigger', label: 'Monsoon / Seasonal Shift', details: 'Karkidaka therapy trigger' },
        { id: 's2', type: 'whatsapp', label: '7-Day Panchakarma Deck', details: 'Traditional body purification' },
        { id: 's3', type: 'wait', label: 'Wait 3d', details: 'Review window' },
        { id: 's4', type: 'call', label: 'AI Vaidya Consultant Call', details: 'Schedule pulse diagnosis' }
      ]
    },
    {
      id: 'wf_spa_14',
      name: 'No-Show Recovery Nudge',
      category: 'Spa Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 87,
      steps: [
        { id: 's1', type: 'trigger', label: 'Guest Marked No-Show', details: 'Missed reservation' },
        { id: 's2', type: 'wait', label: 'Wait 1h', details: 'Buffer delay' },
        { id: 's3', type: 'whatsapp', label: 'We Missed You Message', details: 'Empathetic reschedule link' },
        { id: 's4', type: 'task', label: 'Release Therapist to Floor', details: 'Reassign standby guests' }
      ]
    },
    {
      id: 'wf_spa_15',
      name: 'Deposit Lock Reminder',
      category: 'Packages & Upgrades',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 95,
      steps: [
        { id: 's1', type: 'trigger', label: 'Weekend Suite Reserved', details: 'Prime Saturday/Sunday' },
        { id: 's2', type: 'invoice', label: '30% Reservation Deposit', details: 'Razorpay / Stripe link' },
        { id: 's3', type: 'wait', label: 'Wait 3h', details: 'Hold window' },
        { id: 's4', type: 'sms', label: 'Suite Release Alert', details: 'Releases in 60 minutes' }
      ]
    },
    {
      id: 'wf_spa_16',
      name: 'VIP Wellness Concierge',
      category: 'Loyalty & Membership',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Diamond Tier Achieved', details: 'High-LTV wellness guest' },
        { id: 's2', type: 'whatsapp', label: 'Private Concierge Access', details: 'Direct WhatsApp booking line' },
        { id: 's3', type: 'crm_update', label: 'Tag Custom Blended Oils', details: 'Pre-blend signature oils' },
        { id: 's4', type: 'task', label: 'Reserve Royal Bath Suite', details: 'Zero-wait luxury welcome' }
      ]
    }
  ],

  // ----------------------------------------------------------
  // 4. REAL ESTATE & PROPERTY DEVELOPERS (16 Workflows)
  // ----------------------------------------------------------
  realestate: [
    {
      id: 'wf_re_1',
      name: 'Instant Brochure Drop',
      category: 'Lead Engagement',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Ad Lead Captured', details: 'Meta / Google / 99acres' },
        { id: 's2', type: 'whatsapp', label: 'PDF Brochure & Floor Plans', details: 'Delivered in 15 seconds' },
        { id: 's3', type: 'whatsapp', label: 'Google Maps Location Pin', details: 'Site navigation pin' },
        { id: 's4', type: 'crm_update', label: 'Assign Sales Executive', details: 'Round-robin assignment' }
      ]
    },
    {
      id: 'wf_re_2',
      name: 'Free Site Visit Cab',
      category: 'Sales & Site Visits',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 98,
      steps: [
        { id: 's1', type: 'trigger', label: 'Visit Confirmed', details: 'Date & pickup address locked' },
        { id: 's2', type: 'task', label: 'Uber/Ola API Dispatch', details: 'Auto-dispatch luxury sedan' },
        { id: 's3', type: 'whatsapp', label: 'Driver Details & Tracking', details: 'Live cab location link' },
        { id: 's4', type: 'sms', label: 'Site Manager Arrival Alert', details: 'VIP buyer en route' }
      ]
    },
    {
      id: 'wf_re_3',
      name: 'Visit Reminder Call',
      category: 'Sales & Site Visits',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 95,
      steps: [
        { id: 's1', type: 'trigger', label: '24h Before Site Visit', details: 'Calendar reminder' },
        { id: 's2', type: 'call', label: 'AI Voice Confirmation Call', details: 'Confirm attendance & party' },
        { id: 's3', type: 'whatsapp', label: 'Digital Gate Entry QR', details: 'Fast-track gate pass' },
        { id: 's4', type: 'task', label: 'Reserve Model Flat Tour', details: 'Assign sales manager' }
      ]
    },
    {
      id: 'wf_re_4',
      name: 'Post-Visit Cost Sheet',
      category: 'Sales & Site Visits',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 96,
      steps: [
        { id: 's1', type: 'trigger', label: 'Site Visit Completed', details: 'Marked attended by executive' },
        { id: 's2', type: 'wait', label: 'Wait 1h', details: 'Post-visit buffer' },
        { id: 's3', type: 'whatsapp', label: 'Itemized Cost Sheet PDF', details: 'Base + amenities + GST' },
        { id: 's4', type: 'whatsapp', label: 'Available Unit Numbers', details: 'Corner & park-facing units' }
      ]
    },
    {
      id: 'wf_re_5',
      name: 'Construction Drone Update',
      category: 'Milestones & Retention',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Slab Cast Completed', details: 'Civil milestone verified' },
        { id: 's2', type: 'whatsapp', label: '4K Drone Video Broadcast', details: 'Delivered to all booked buyers' },
        { id: 's3', type: 'email', label: 'Architect & RERA Certificate', details: 'Official compliance report' },
        { id: 's4', type: 'invoice', label: 'Stage Milestone Demand Note', details: 'Payment installment' }
      ]
    },
    {
      id: 'wf_re_6',
      name: 'Home Loan Assistance',
      category: 'Operations & KYC',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 92,
      steps: [
        { id: 's1', type: 'trigger', label: 'Loan / Financing Query', details: 'Buyer expresses interest' },
        { id: 's2', type: 'whatsapp', label: 'Approved Banks Rate Sheet', details: 'SBI, HDFC, ICICI comparisons' },
        { id: 's3', type: 'task', label: 'Assign In-House Loan Desk', details: 'Coordinate document pickup' },
        { id: 's4', type: 'wait', label: 'Wait 48h', details: 'Sanction turnaround' }
      ]
    },
    {
      id: 'wf_re_7',
      name: 'Price Escalation Alert',
      category: 'Lead Engagement',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 90,
      steps: [
        { id: 's1', type: 'trigger', label: '80% Tower Phase Sold', details: 'Inventory velocity trigger' },
        { id: 's2', type: 'whatsapp', label: 'Price Rise Urgency Notice', details: '+₹350/sq.ft effective Monday' },
        { id: 's3', type: 'call', label: 'AI Voice Urgency Call', details: 'Lock price with token' },
        { id: 's4', type: 'wait', label: 'Wait 3d', details: 'Deadline countdown' }
      ]
    },
    {
      id: 'wf_re_8',
      name: 'NRI Video Tour Booking',
      category: 'Sales & Site Visits',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 94,
      steps: [
        { id: 's1', type: 'trigger', label: 'International Number Lead', details: 'Country code != +91' },
        { id: 's2', type: 'whatsapp', label: 'NRI Investment Deck & ROI', details: 'Rental yields & capital growth' },
        { id: 's3', type: 'task', label: 'Schedule 3D Virtual Tour', details: 'Timezone matched Zoom call' },
        { id: 's4', type: 'email', label: 'NRE/NRO Banking Guidelines', details: 'FEMA compliance checklist' }
      ]
    },
    {
      id: 'wf_re_9',
      name: 'Token & KYC Upload',
      category: 'Operations & KYC',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 99,
      steps: [
        { id: 's1', type: 'trigger', label: 'Booking Token Received', details: 'Escrow payment credited' },
        { id: 's2', type: 'whatsapp', label: 'Digital Token Receipt', details: 'Signed provisional receipt' },
        { id: 's3', type: 'whatsapp', label: 'Secure KYC Upload Link', details: 'PAN, Aadhaar & photos' },
        { id: 's4', type: 'crm_update', label: 'Lock Unit in Inventory', details: 'Mark as booked' }
      ]
    },
    {
      id: 'wf_re_10',
      name: 'Dormant Lead Re-engage',
      category: 'Lead Engagement',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 86,
      steps: [
        { id: 's1', type: 'trigger', label: 'No Interaction > 14 Days', details: 'Cold database lead' },
        { id: 's2', type: 'whatsapp', label: 'New Phase Launch Preview', details: 'Pre-launch pricing invite' },
        { id: 's3', type: 'wait', label: 'Wait 3d', details: 'Engagement window' },
        { id: 's4', type: 'call', label: 'AI Voice Property Check-in', details: 'Check budget & location' }
      ]
    },
    {
      id: 'wf_re_11',
      name: 'Broker Payout Alert',
      category: 'Operations & KYC',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'AFS Registered', details: 'Legal registration done' },
        { id: 's2', type: 'whatsapp', label: 'Broker Commission Advice', details: '₹1.5L payout approval notice' },
        { id: 's3', type: 'email', label: 'TDS & Payment Breakdown', details: 'Finance remittance advice' },
        { id: 's4', type: 'crm_update', label: 'Elevate Channel Partner Tier', details: 'Increase CP ranking' }
      ]
    },
    {
      id: 'wf_re_12',
      name: 'Agreement Date Alert',
      category: 'Milestones & Retention',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 98,
      steps: [
        { id: 's1', type: 'trigger', label: '10% Demand Cleared', details: 'Eligible for registration' },
        { id: 's2', type: 'whatsapp', label: 'Sub-Registrar Slot Picker', details: 'Choose registration date' },
        { id: 's3', type: 'whatsapp', label: 'Original Docs Checklist', details: 'Passports & stamp papers' },
        { id: 's4', type: 'task', label: 'Legal File Preparation', details: 'Franking & stamp printing' }
      ]
    },
    {
      id: 'wf_re_13',
      name: 'Model Flat Tour Lock',
      category: 'Sales & Site Visits',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 96,
      steps: [
        { id: 's1', type: 'trigger', label: 'HNW Lead (> ₹1.5 Cr Budget)', details: 'High-intent buyer' },
        { id: 's2', type: 'whatsapp', label: 'Sales Director Video Intro', details: 'Personal greeting & walkthrough' },
        { id: 's3', type: 'task', label: 'Model Flat Exclusive Booking', details: 'Lock private viewing hour' },
        { id: 's4', type: 'crm_update', label: 'Assign Senior Closer', details: 'Direct VP sales routing' }
      ]
    },
    {
      id: 'wf_re_14',
      name: 'Unit Drop-Out Backfill',
      category: 'Operations & KYC',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 93,
      steps: [
        { id: 's1', type: 'trigger', label: 'Prime Unit Booking Cancelled', details: 'Corner / Penthouse free' },
        { id: 's2', type: 'task', label: 'Query Qualified Waitlist', details: 'Match budget & floor' },
        { id: 's3', type: 'whatsapp', label: 'Priority Unit Claim Link', details: 'Broadcast to top 3 buyers' },
        { id: 's4', type: 'crm_update', label: 'Lock Unit for First Buyer', details: 'Update master inventory' }
      ]
    },
    {
      id: 'wf_re_15',
      name: 'Demand Note Reminder',
      category: 'Milestones & Retention',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 95,
      steps: [
        { id: 's1', type: 'trigger', label: 'Demand Overdue > 7 Days', details: 'Stage payment pending' },
        { id: 's2', type: 'whatsapp', label: 'Demand Note & Virtual Account', details: 'NEFT / RTGS payment details' },
        { id: 's3', type: 'wait', label: 'Wait 3d', details: 'Grace window' },
        { id: 's4', type: 'call', label: 'AI Voice Accounts Follow-up', details: 'Polite clearance check' }
      ]
    },
    {
      id: 'wf_re_16',
      name: 'Handover Celebration',
      category: 'Milestones & Retention',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'OC Received & Keys Ready', details: 'Possession milestone' },
        { id: 's2', type: 'whatsapp', label: 'Key Handover Welcome Kit', details: 'Homeowner guide & warranty' },
        { id: 's3', type: 'task', label: 'Assemble Welcome Hamper', details: 'Gift box & smart home setup' },
        { id: 's4', type: 'survey', label: 'Homeowner Experience Rating', details: 'Google review prompt' }
      ]
    }
  ],

  // ----------------------------------------------------------
  // 5. BOUTIQUE HOTEL & LUXURY RESORT (16 Workflows)
  // ----------------------------------------------------------
  hotel: [
    {
      id: 'wf_hotel_1',
      name: 'Room Preference Intake',
      category: 'Guest Experience',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: '48h Before Check-In', details: 'Reservation confirmed' },
        { id: 's2', type: 'whatsapp', label: 'Room Preference Form', details: 'Pillow menu, dietary & arrival' },
        { id: 's3', type: 'wait', label: 'Wait 12h', details: 'Preferences sync' },
        { id: 's4', type: 'task', label: 'Tag Housekeeping & Chef', details: 'Prep feather pillows & vegan menu' }
      ]
    },
    {
      id: 'wf_hotel_2',
      name: 'Airport Cab Dispatch',
      category: 'Frontdesk Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 99,
      steps: [
        { id: 's1', type: 'trigger', label: 'Flight Landed Status', details: 'Radar webhook trigger' },
        { id: 's2', type: 'task', label: 'Dispatch Chauffeur to Terminal', details: 'Name badge & luxury fleet' },
        { id: 's3', type: 'whatsapp', label: 'Driver Details & Pickup Pin', details: 'Pillar 4 meeting point' },
        { id: 's4', type: 'crm_update', label: 'Frontdesk: Guest En Route', details: 'Prepare express keycard' }
      ]
    },
    {
      id: 'wf_hotel_3',
      name: 'Sunset Table Reservation',
      category: 'Upsells & Dining',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 95,
      steps: [
        { id: 's1', type: 'trigger', label: 'Check-In Complete + 3h', details: 'Guest in-house' },
        { id: 's2', type: 'wait', label: 'Wait 1h', details: 'Settling in buffer' },
        { id: 's3', type: 'whatsapp', label: 'Sunset Deck Cocktail Menu', details: '1-click prime view table booking' },
        { id: 's4', type: 'task', label: 'Alert F&B Captain', details: 'Reserve best ocean-view table' }
      ]
    },
    {
      id: 'wf_hotel_4',
      name: '1-Tap Room Cleaning',
      category: 'Frontdesk Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Daily 10:00 AM Trigger', details: 'Morning schedule' },
        { id: 's2', type: 'whatsapp', label: '1-Tap Refresh Buttons', details: 'Clean Now, DND, or Extra Towels' },
        { id: 's3', type: 'task', label: 'Route to Floor Housekeeper', details: 'Instant tablet alert' },
        { id: 's4', type: 'crm_update', label: 'Update Room Status', details: 'Mark room serviced' }
      ]
    },
    {
      id: 'wf_hotel_5',
      name: 'Daily Activity Guide',
      category: 'Guest Experience',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 93,
      steps: [
        { id: 's1', type: 'trigger', label: 'Day 2 Morning 08:30 AM', details: 'Daily planner' },
        { id: 's2', type: 'whatsapp', label: 'Curated Experiences Deck', details: 'Scuba, yoga & sunset cruise' },
        { id: 's3', type: 'wait', label: 'Wait 2h', details: 'Confirmation window' },
        { id: 's4', type: 'task', label: 'Concierge Booking Lock', details: 'Confirm excursion slots' }
      ]
    },
    {
      id: 'wf_hotel_6',
      name: 'In-Room Spa Offer',
      category: 'Upsells & Dining',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 91,
      steps: [
        { id: 's1', type: 'trigger', label: 'Check-In + 4 Hours', details: 'Post-travel relaxation' },
        { id: 's2', type: 'whatsapp', label: '20% In-Room Spa Voucher', details: 'Couple massage before 6 PM' },
        { id: 's3', type: 'wait', label: 'Wait 2h', details: 'Slot availability' },
        { id: 's4', type: 'call', label: 'AI Spa Concierge Call', details: 'Confirm treatment & room timing' }
      ]
    },
    {
      id: 'wf_hotel_7',
      name: 'Express Mobile Check-out',
      category: 'Frontdesk Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 98,
      steps: [
        { id: 's1', type: 'trigger', label: '08:00 AM Departure Date', details: 'Check-out day schedule' },
        { id: 's2', type: 'whatsapp', label: 'Digital Folio & Itemized Bill', details: 'Review room + dining charges' },
        { id: 's3', type: 'invoice', label: '1-Click UPI / Card Settlement', details: 'Bypass frontdesk queue' },
        { id: 's4', type: 'task', label: 'Bellboy Luggage Dispatch', details: 'Luggage pickup at room' }
      ]
    },
    {
      id: 'wf_hotel_8',
      name: 'TripAdvisor Booster',
      category: 'Post-Stay & Loyalty',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 94,
      steps: [
        { id: 's1', type: 'trigger', label: '2 Hours Post Check-out', details: 'Guest on journey home' },
        { id: 's2', type: 'survey', label: '1-Tap Stay Rating', details: 'Rate experience 1-5' },
        { id: 's3', type: 'whatsapp', label: 'Direct TripAdvisor Link', details: 'Sent to all consenting guests' },
        { id: 's4', type: 'task', label: 'GM Alert if < 4 Stars', details: 'Personal apology & recovery' }
      ]
    },
    {
      id: 'wf_hotel_9',
      name: 'Lost & Found Recovery',
      category: 'Frontdesk Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Housekeeper Logs Left Item', details: 'Room turnover scan' },
        { id: 's2', type: 'whatsapp', label: 'Photo of Item & Courier Link', details: 'We found your item; send address' },
        { id: 's3', type: 'wait', label: 'Wait 24h', details: 'Guest reply window' },
        { id: 's4', type: 'task', label: 'Dispatch BlueDart Courier', details: 'Ship with tracking' }
      ]
    },
    {
      id: 'wf_hotel_10',
      name: 'Return Guest Anniversary',
      category: 'Post-Stay & Loyalty',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 96,
      steps: [
        { id: 's1', type: 'trigger', label: '330 Days Post-Stay', details: 'Annual holiday cycle' },
        { id: 's2', type: 'whatsapp', label: 'Welcome Back Luxury Offer', details: '25% repeat discount + villa upgrade' },
        { id: 's3', type: 'wait', label: 'Wait 7d', details: 'Trip planning buffer' },
        { id: 's4', type: 'call', label: 'AI Concierge Vacation Call', details: 'Lock preferred dates' }
      ]
    },
    {
      id: 'wf_hotel_11',
      name: 'Wedding Banquet Quote',
      category: 'Upsells & Dining',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 90,
      steps: [
        { id: 's1', type: 'trigger', label: 'Wedding / Banquet Ingested', details: 'Guest count > 100' },
        { id: 's2', type: 'whatsapp', label: 'Wedding Lookbook & Menu Deck', details: 'High-res banquet brochure' },
        { id: 's3', type: 'email', label: 'Itemized Event Quotation', details: 'Lawn + ballroom + room blocks' },
        { id: 's4', type: 'task', label: 'Assign Senior Events Director', details: 'Schedule site tasting' }
      ]
    },
    {
      id: 'wf_hotel_12',
      name: 'GST Invoice Delivery',
      category: 'Frontdesk Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 100,
      steps: [
        { id: 's1', type: 'trigger', label: 'Check-out Finalized', details: 'Folio balance cleared' },
        { id: 's2', type: 'email', label: 'Formal GST Tax Invoice PDF', details: 'Corporate billing details' },
        { id: 's3', type: 'whatsapp', label: '1-Click WhatsApp Invoice', details: 'Instant receipt download' },
        { id: 's4', type: 'crm_update', label: 'Sync to Financial Ledger', details: 'Export to accounting' }
      ]
    },
    {
      id: 'wf_hotel_13',
      name: 'Luggage Help Request',
      category: 'Frontdesk Operations',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 99,
      steps: [
        { id: 's1', type: 'trigger', label: '45m Before Check-out', details: 'Departure schedule' },
        { id: 's2', type: 'whatsapp', label: 'Luggage Assistance Button', details: 'Tap: Send Bellboy to Room' },
        { id: 's3', type: 'task', label: 'Bell Desk Floor Dispatch', details: 'Collect bags from room' },
        { id: 's4', type: 'crm_update', label: 'Mark Luggage Stored / Loaded', details: 'Update frontdesk board' }
      ]
    },
    {
      id: 'wf_hotel_14',
      name: 'Late Arrival Concierge',
      category: 'Guest Experience',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 98,
      steps: [
        { id: 's1', type: 'trigger', label: 'Arrival After 10:00 PM', details: 'Late flight or delay' },
        { id: 's2', type: 'whatsapp', label: 'Late Night Dining Menu', details: 'Pre-order warm dinner to room' },
        { id: 's3', type: 'task', label: 'Express Keycard Setup', details: 'Place key with night manager' },
        { id: 's4', type: 'wait', label: 'Wait 30m', details: 'Welcome preparation' }
      ]
    },
    {
      id: 'wf_hotel_15',
      name: 'Direct Booking Perk',
      category: 'Post-Stay & Loyalty',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 95,
      steps: [
        { id: 's1', type: 'trigger', label: 'OTA Booking Check-out', details: 'Booking.com / MMT' },
        { id: 's2', type: 'whatsapp', label: 'Direct Member Privilege Code', details: '15% off + free breakfast direct' },
        { id: 's3', type: 'wait', label: 'Wait 60d', details: 'Next vacation cycle' },
        { id: 's4', type: 'whatsapp', label: 'Direct Booking Reminder', details: 'Bypass commission portals' }
      ]
    },
    {
      id: 'wf_hotel_16',
      name: 'Suite Upgrade Offer',
      category: 'Upsells & Dining',
      active: true,
      lastRun: 'Ready',
      runCount24h: 0,
      successRate: 92,
      steps: [
        { id: 's1', type: 'trigger', label: '24h Before Check-In', details: 'Pool villa vacant' },
        { id: 's2', type: 'whatsapp', label: 'Exclusive Villa Upgrade Offer', details: 'Upgrade at 50% discount' },
        { id: 's3', type: 'wait', label: 'Wait 6h', details: 'Offer window' },
        { id: 's4', type: 'task', label: 'Assign Villa & Butler', details: 'Alert resort manager' }
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
