import {
  LayoutDashboard, MessageSquare, Users, Target, Calendar, BookOpen, BarChart3, Phone,
  MessageCircle, Workflow, Settings, FileText, Rocket, Receipt, TrendingUp, CreditCard,
  CalendarDays, Clock, IndianRupee, Heart, Cpu, PhoneIncoming,
  Megaphone, Activity, Laptop, AlertTriangle, Sparkles, Bot, Link2, Headphones, UserCheck, GitBranch,
  Inbox
} from 'lucide-react';
import type { NicheConfig } from './types';

export const SKIN_CLINIC_CONFIG: NicheConfig = {
  id: 'skin',
  label: 'Skin Clinic',
  tagline: 'Comprehensive management for your dermatology practice.',
  icon: 'Heart',
  accentColor: 'text-blue-600',
  accentColorRGB: '37, 99, 235',
  gradientFrom: 'from-blue-600',
  gradientTo: 'to-blue-800',

  terminology: {
    customer: 'Patient',
    customers: 'Patients',
    appointment: 'Sitting',
    appointments: 'Sittings',
    service: 'Treatment',
    services: 'Treatments',
    staff: 'Dermatologist',
    waitingRoom: 'Treatment Room',
    patientFiles: 'EMR/Case Sheet',
    calendar: 'Staff Calendar',
    billing: 'Invoices',
    overview: 'Business Health'
  },

  roles: [
    { id: 'ADMIN', label: 'Owner (Admin)', description: 'Full access to business analytics, revenue, settings, and staff.', icon: 'Shield' },
    { id: 'MANAGER', label: 'Clinic Manager', description: 'Access to operations, lead management, and patient care.', icon: 'Users' },
    { id: 'STAFF', label: 'Frontdesk Staff', description: 'Access to appointments, frontdesk billing, and patient chats.', icon: 'User' },
  ],

  navItems: [
    { name: 'Ask AI Frontdesk', href: '/ask-ai', icon: Bot, roles: ['ADMIN'] },
    { name: 'The Unified Inbox', href: '/unified-inbox', icon: Inbox, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: 'Business Health', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Teams', href: '/teams', icon: Users, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Appointments', href: '/appointments', icon: CalendarDays, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Operational Delays', href: '/operational-delays', icon: AlertTriangle, roles: ['ADMIN', 'MANAGER'] },
    
    { name: 'Sales', roles: ['ADMIN', 'MANAGER'], divider: true },
    { name: 'Today\'s Revenue', href: '/todays-revenue', icon: IndianRupee, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Monthly Sales', href: '/monthly-sales', icon: TrendingUp, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Patient LTV', href: '/customer-value', icon: Heart, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Clinical', roles: ['ADMIN', 'STAFF'], divider: true },
    { name: 'Waiting Room', href: '/waiting-room', icon: Clock, roles: ['ADMIN', 'STAFF'] },
    { name: 'Shift Doctor Slot', href: '/calendar', icon: Calendar, roles: ['ADMIN', 'STAFF'] },
    { name: 'Doctor\'s Calendar', href: '/doctor-calendar', icon: CalendarDays, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Patient Files', href: '/profiles', icon: FileText, roles: ['ADMIN', 'STAFF'] },
    { name: 'Staff Calendar', href: '/staff-calendar', icon: CalendarDays, roles: ['ADMIN', 'MANAGER'] },
    
    { name: 'Frontdesk', roles: ['ADMIN', 'STAFF'], divider: true },
    { name: 'Book Appointment', href: '/book-appointment', icon: BookOpen, roles: ['ADMIN', 'STAFF'] },
    { name: 'Booking Link', href: '/booking-link', icon: Link2, roles: ['ADMIN'] },
    { name: 'Quick Bill', href: '/billing', icon: Receipt, roles: ['ADMIN', 'STAFF'] },
    { name: 'Services', href: '/services', icon: Sparkles, roles: ['ADMIN', 'STAFF', 'MANAGER'] },
    { name: 'Invoices', href: '/invoices', icon: CreditCard, roles: ['ADMIN', 'STAFF'] },
    { name: 'Customers / Patients', href: '/customers', icon: Users, roles: ['ADMIN', 'STAFF'] },
    { name: 'Conversations', href: '/conversations', icon: MessageSquare, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: 'Human Handoff Requests', href: '/human-handoff-requests', icon: UserCheck, roles: ['ADMIN', 'MANAGER', 'STAFF'] },

    { name: 'Automation', roles: ['ADMIN', 'MANAGER'], divider: true },
    { name: 'Automations', href: '/automations', icon: Workflow, roles: ['ADMIN'] },
    { name: 'Build Sequence', href: '/build-sequence', icon: GitBranch, roles: ['ADMIN'] },
    { name: 'Outbound Campaigns', href: '/outbound-campaigns', icon: Megaphone, roles: ['ADMIN'] },
    { name: 'Automated Leads', href: '/crm', icon: Target, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Ads CRM Management', href: '/meta-ads-crm', icon: Megaphone, roles: ['ADMIN', 'MANAGER'] },
    { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle, roles: ['ADMIN', 'MANAGER'] },

    { name: 'Voice Telephony', roles: ['ADMIN'], divider: true },
    { name: 'Voice AI Agent', href: '/voice', icon: Cpu, roles: ['ADMIN'] },
    { name: 'Phone Numbers', href: '/phone-numbers', icon: Phone, roles: ['ADMIN'] },
    { name: 'Inbound Calls', href: '/inbound-calls', icon: PhoneIncoming, roles: ['ADMIN'] },

    { name: 'Backend AI', roles: ['ADMIN'], divider: true },
    {
      name: 'AI Knowledge Hub',
      icon: Cpu,
      roles: ['ADMIN'],
      children: [
        { name: 'Voice AI', href: '/voice-knowledge-hub' },
        { name: 'WhatsApp AI', href: '/whatsapp-knowledge-hub' },
        { name: 'Webchat AI', href: '/webchat-knowledge-hub' },
      ],
    },
    {
      name: 'Knowledge Base',
      icon: BookOpen,
      roles: ['ADMIN'],
      children: [
        { name: 'Company KB', href: '/knowledge-base' },
        { name: 'Test your Knowledge Base', href: '/test-knowledge-base' },
      ],
    },
    {
      name: 'Templates',
      icon: FileText,
      roles: ['ADMIN'],
      children: [
        { name: 'Create Template', href: '/templates/create' },
        { name: 'Pre-installed Templates', href: '/templates/pre-installed' },
        { name: 'Email Templates/Scripts', href: '/templates/email' },
      ],
    },
    {
      name: 'Human Hand-off',
      icon: UserCheck,
      roles: ['ADMIN'],
      children: [
        { name: 'Prompts', href: '/human-handoff/prompts' },
        { name: 'Tone Check', href: '/human-handoff/tone-check' },
      ],
    }
  ],

  kpis: [
    { label: 'Avg Revenue Per Patient', value: '₹4,250', change: '+12%', trend: 'up' },
    { label: 'Package Conversion Rate', value: '34%', change: '+5%', trend: 'up' },
    { label: 'No-Show Rate', value: '8%', change: '-2%', trend: 'down' },
    { label: 'AI Resolution Rate', value: '78%', change: '+15%', trend: 'up' }
  ],

  templates: [
    {
      id: 'wa-pre-procedure',
      title: 'Pre-procedure Reminder',
      category: 'Appointment',
      channel: 'WHATSAPP',
      content: 'Hi {{customer_name}}, this is a friendly reminder for your upcoming sitting with {{assigned_doctor}} at {{clinic_branch}} tomorrow. Please remember to avoid direct sun exposure and skip retinol tonight.',
      isPreinstalled: true,
      variables: ['customer_name', 'assigned_doctor', 'clinic_branch']
    },
    {
      id: 'wa-post-visit',
      title: 'Post-visit Care',
      category: 'Follow Up',
      channel: 'WHATSAPP',
      content: 'Hello {{customer_name}}, thank you for visiting us! Apply sunscreen diligently and use the prescribed soothing cream. Reach out if you experience any unexpected redness.',
      isPreinstalled: true,
      variables: ['customer_name']
    },
    {
      id: 'wa-interval-recall',
      title: 'Sitting Interval Recall',
      category: 'Recall',
      channel: 'WHATSAPP',
      content: 'Hi {{customer_name}}, it has been 4 weeks since your last treatment on {{last_treatment_date}}. It is time for your next session to ensure the best results. Reply to book!',
      isPreinstalled: true,
      variables: ['customer_name', 'last_treatment_date']
    },
    {
      id: 'wa-missed-call',
      title: 'Missed Call Recovery',
      category: 'Lead Gen',
      channel: 'WHATSAPP',
      content: 'Hi {{customer_name}}, we missed your call! How can our front desk assist you today? Looking to book a consultation or a specific treatment at {{clinic_branch}}?',
      isPreinstalled: true,
      variables: ['customer_name', 'clinic_branch']
    },
    {
      id: 'email-appointment-conf',
      title: 'Appointment Confirmation',
      category: 'Appointment',
      channel: 'EMAIL',
      subject: 'Your Upcoming Dermatology Consultation Confirmed',
      content: 'Dear {{customer_name}},\n\nYour appointment with {{assigned_doctor}} at {{clinic_branch}} is confirmed.\n\nPlease arrive 10 minutes early to fill out your intake forms.\n\nWarm regards,\nThe Skin Clinic Team',
      isPreinstalled: true,
      variables: ['customer_name', 'assigned_doctor', 'clinic_branch']
    },
    {
      id: 'email-invoice',
      title: 'Invoice Delivery',
      category: 'Billing',
      channel: 'EMAIL',
      subject: 'Your Invoice for Recent Visit',
      content: 'Dear {{customer_name}},\n\nPlease find attached the invoice for your treatments on {{last_treatment_date}}.\n\nThank you for choosing us.\n\nThe Skin Clinic Team',
      mediaAttachment: 'PDF',
      isPreinstalled: true,
      variables: ['customer_name', 'last_treatment_date']
    },
    {
      id: 'email-win-back',
      title: 'Win-back Offer',
      category: 'Marketing',
      channel: 'EMAIL',
      subject: 'We miss you! Special offer inside.',
      content: 'Hello {{customer_name}},\n\nIt\'s been a while since we saw you! Enjoy 15% off your next HydraFacial or Chemical Peel if you book this week.\n\nBest,\nThe Skin Clinic Team',
      isPreinstalled: true,
      variables: ['customer_name']
    },
    {
      id: 'voice-consult-lead',
      title: 'Consultation Lead Outreach',
      category: 'Outbound',
      channel: 'VOICE',
      content: 'Namaskaram {{customer_name}}, this is the AI assistant from {{clinic_branch}}. I saw you inquired about acne scar treatments. Would you like to schedule a free initial consultation with {{assigned_doctor}} this week?',
      isPreinstalled: true,
      variables: ['customer_name', 'clinic_branch', 'assigned_doctor']
    },
    {
      id: 'voice-pre-booking',
      title: 'Pre-procedure Booking',
      category: 'Outbound',
      channel: 'VOICE',
      content: 'Hi {{customer_name}}, checking in to see if you are ready to book your next laser hair reduction session? Your last sitting was on {{last_treatment_date}}.',
      isPreinstalled: true,
      variables: ['customer_name', 'last_treatment_date']
    },
    {
      id: 'voice-hyd-greeting',
      title: 'Hyderabadi Greeting',
      category: 'Inbound',
      channel: 'VOICE',
      content: 'Namaskaram and Welcome to the clinic! I am DermAI. Are you calling to book a new appointment or check on an existing one?',
      isPreinstalled: true,
      variables: []
    }
  ],

  knowledgeBaseDocs: [
    {
      id: 'kb-laser-sop',
      title: 'Laser Hair Reduction SOP',
      category: 'SOP',
      content: 'Detailed protocol for Diode and Nd:YAG laser treatments. Includes safety checks, cooling mechanisms, pre-shave requirements, and post-care aloe vera application guidelines.',
      chunks: 12,
      isActive: true,
      updatedAt: '2026-07-01T10:00:00Z'
    },
    {
      id: 'kb-chem-peel',
      title: 'Chemical Peel Protocol',
      category: 'SOP',
      content: 'Guidelines for Salicylic, Glycolic, and TCA peels. Step-by-step application process, neutralization techniques, and post-peel epidermal repair instructions.',
      chunks: 8,
      isActive: true,
      updatedAt: '2026-06-15T12:00:00Z'
    },
    {
      id: 'kb-pricing-menu',
      title: 'Pricing Menu & Packages',
      category: 'PRICING',
      content: 'Comprehensive pricing for consultations (₹800), individual peels (₹2500+), laser packages (₹15,000 for 6 sessions), and PRP therapy.',
      chunks: 5,
      isActive: true,
      updatedAt: '2026-08-01T09:00:00Z'
    },
    {
      id: 'kb-botox-safety',
      title: 'Botox & Fillers Safety Guidelines',
      category: 'RESTRICTED_GUIDELINES',
      content: 'Contraindications for injectables. Must check for pregnancy, neuromuscular disorders, and allergies. Strict aseptic techniques required.',
      chunks: 10,
      isActive: true,
      updatedAt: '2026-05-20T14:30:00Z'
    },
    {
      id: 'kb-objection-handling',
      title: 'Sales Objection Handling',
      category: 'SCRIPTS',
      content: 'Scripts for handling cost objections, pain concerns during laser, and addressing expected downtimes realistically to manage patient expectations.',
      chunks: 7,
      isActive: true,
      updatedAt: '2026-07-10T11:15:00Z'
    },
    {
      id: 'kb-derm-faq',
      title: 'Dermatology General FAQ',
      category: 'FAQ',
      content: 'Answers to common patient queries: "Will laser cause cancer?" (No), "Can I wash my face after a peel?" (Wait 12 hrs), etc.',
      chunks: 15,
      isActive: true,
      updatedAt: '2026-07-25T16:45:00Z'
    },
    {
      id: 'kb-acne-roadmap',
      title: 'Acne Treatment Roadmap',
      category: 'SERVICE',
      content: 'Overview of the 3-month acne clearance journey. Combining oral medications, topical retinoids, and monthly in-clinic cleanups/peels.',
      chunks: 9,
      isActive: true,
      updatedAt: '2026-06-05T08:20:00Z'
    },
    {
      id: 'kb-prp-guide',
      title: 'PRP Hair Restoration Guide',
      category: 'SERVICE',
      content: 'Information on Platelet-Rich Plasma therapy for hair loss. Blood draw protocol, centrifugation settings, and post-injection care.',
      chunks: 6,
      isActive: true,
      updatedAt: '2026-08-05T13:10:00Z'
    }
  ],

  automationPresets: [
    { title: 'Missed Call Recovery', trigger: 'Missed Inbound Call', desc: 'Instantly send a WhatsApp message to missed callers with booking options.', category: 'Lead Gen' },
    { title: 'Post-Call Booking Link', trigger: 'Call Ended - Unbooked', desc: 'Send an SMS/WhatsApp with a scheduling link if no appointment was made on the call.', category: 'Conversion' },
    { title: 'Pre-procedure Care', trigger: 'Appointment T-24h', desc: 'Send automated pre-care instructions 24 hours before sitting.', category: 'Patient Care' },
    { title: '90-Day Win-Back', trigger: 'No Visit > 90 Days', desc: 'Trigger a promotional email and WhatsApp message to patients who haven\'t visited in 3 months.', category: 'Retention' }
  ],

  initialWorkflows: [
    {
      id: 'wf-1',
      name: 'Acne Follow-up Sequence',
      triggerEvent: 'Acne Consultation Completed',
      description: 'Multi-step sequence to ensure patient adherence to acne medication.',
      steps: [
        { type: 'TRIGGER', label: 'Consult Completed', detail: 'Tag: Acne' },
        { type: 'ACTION', label: 'WhatsApp', detail: 'Send prescription summary & diet guide' },
        { type: 'CONDITION', label: 'Wait 7 days', detail: '' },
        { type: 'ACTION', label: 'WhatsApp', detail: 'Check-in on skin purging/dryness' }
      ],
      actionsCount: 2,
      isActive: true,
      lastRun: '1 hour ago',
      runs24h: 12,
      category: 'Patient Care'
    },
    {
      id: 'wf-2',
      name: 'Laser Package Upsell',
      triggerEvent: 'Single Session Completed',
      description: 'Upsell a 6-session laser package after a successful single session.',
      steps: [
        { type: 'TRIGGER', label: 'Service: Laser', detail: 'Billing: Single Session' },
        { type: 'CONDITION', label: 'Wait 24 hours', detail: '' },
        { type: 'ACTION', label: 'Email', detail: 'Send 15% discount on package' },
        { type: 'ACTION', label: 'Task', detail: 'Assign to Patient Coordinator' }
      ],
      actionsCount: 2,
      isActive: true,
      lastRun: '4 hours ago',
      runs24h: 5,
      category: 'Sales'
    },
    {
      id: 'wf-3',
      name: 'Botox Review Booking',
      triggerEvent: 'Botox Service Completed',
      description: 'Schedule the 2-week review appointment.',
      steps: [
        { type: 'TRIGGER', label: 'Service: Botox', detail: '' },
        { type: 'CONDITION', label: 'Wait 10 days', detail: '' },
        { type: 'ACTION', label: 'WhatsApp', detail: 'Book 2-week touch-up review' }
      ],
      actionsCount: 1,
      isActive: true,
      lastRun: '1 day ago',
      runs24h: 3,
      category: 'Recall'
    },
    {
      id: 'wf-4',
      name: 'No-Show Recovery',
      triggerEvent: 'Appointment Marked No-Show',
      description: 'Try to salvage a no-show appointment.',
      steps: [
        { type: 'TRIGGER', label: 'Status: No-Show', detail: '' },
        { type: 'ACTION', label: 'WhatsApp', detail: 'Sorry we missed you! Rebook link' },
        { type: 'CONDITION', label: 'If no response in 2h', detail: '' },
        { type: 'ACTION', label: 'Voice AI Call', detail: 'Polite rebooking check' }
      ],
      actionsCount: 2,
      isActive: true,
      lastRun: '2 hours ago',
      runs24h: 8,
      category: 'Operations'
    }
  ],

  goldenPrompt: `You are DermAI, the advanced front-desk virtual assistant for a premium Skin & Dermatology Clinic in Hyderabad. 
Your goal is to provide warm, empathetic, and highly professional assistance. 
You are speaking to patients who may be self-conscious about their skin. Always reassure them.
Do NOT provide medical diagnoses or prescribe medications. Suggest consulting the dermatologist.
Understand local Hyderabadi context (e.g., concerns about hard water, pollution, and sun damage).
Guide them to book sittings, explain general clinic timings, and provide basic pricing from the knowledge base.
If a patient asks about post-procedure complications, escalate immediately to a human doctor.`,

  tones: [
    { id: 'tone-warmth', name: 'Warmth', badge: 'Default', greeting: 'Namaskaram, welcome to our clinic! How can I help you achieve your skin goals today?' },
    { id: 'tone-it-express', name: 'IT Express', badge: 'Fast', greeting: 'Hello! I can quickly help you book your next sitting or check timings. What do you need?' },
    { id: 'tone-luxury', name: 'Luxury Concierge', badge: 'Premium', greeting: 'Welcome to our premium dermatology center. It would be my absolute pleasure to assist you today.' }
  ],

  aiRules: [
    { id: 'rule-1', title: 'No Medical Diagnosis', description: 'Never attempt to diagnose a skin condition based on descriptions. Always advise a consultation.', severity: 'critical' },
    { id: 'rule-2', title: 'Escalate Burns/Adverse Reactions', description: 'If a patient mentions burns, severe swelling, or pain post-laser, escalate to human staff immediately.', severity: 'critical' },
    { id: 'rule-3', title: 'Adhere to Knowledge Base Pricing', description: 'Only quote prices exactly as listed in the KB. Do not offer unauthorized discounts.', severity: 'warning' },
    { id: 'rule-4', title: 'Protect Patient Privacy', description: 'Do not confirm if another person is a patient at the clinic under any circumstances.', severity: 'critical' },
    { id: 'rule-5', title: 'Use Empathy for Acne/Hair Loss', description: 'Speak with heightened empathy when patients discuss acne or hair loss, as these are sensitive topics.', severity: 'info' }
  ],

  inputVariables: [
    { token: 'customer_name', label: 'Patient Name', fallback: 'Valued Patient' },
    { token: 'last_treatment_date', label: 'Last Treatment Date', fallback: 'your last visit' },
    { token: 'assigned_doctor', label: 'Assigned Doctor', fallback: 'our specialist' },
    { token: 'clinic_branch', label: 'Clinic Branch', fallback: 'our clinic' }
  ]
};
