import type { NicheConfig } from './types';
import {
  LayoutDashboard, MessageSquare, Users, Target, Calendar, BookOpen, BarChart3, Phone,
  MessageCircle, Workflow, Settings, FileText, Rocket, TrendingUp, CreditCard,
  CalendarDays, Clock, IndianRupee, Heart, Cpu, PhoneIncoming,
  Megaphone, Activity, Laptop, AlertTriangle, Sparkles, Bot, Link2, Headphones, UserCheck
} from 'lucide-react';

export const SPA_WELLNESS_CONFIG: NicheConfig = {
  id: 'spa',
  label: 'Spa & Wellness Center',
  tagline: 'Elevating Holistic Health and Wellness',
  icon: 'Heart',
  accentColor: 'text-emerald-600',
  accentColorRGB: '16, 185, 129',
  gradientFrom: 'from-emerald-500',
  gradientTo: 'to-green-600',

  terminology: {
    customer: 'Guest',
    customers: 'Guests',
    appointment: 'Therapy',
    appointments: 'Therapies',
    service: 'Therapy Offering',
    services: 'Therapies & Packages',
    staff: 'Therapist',
    waitingRoom: 'Therapy Queue',
    patientFiles: 'Guest Profiles',
    calendar: 'Therapy Suite Scheduler',
    billing: 'Membership Credits & Billing',
    overview: 'Business Health',
  },

  roles: [
    { id: 'ADMIN', label: 'Owner (Admin)', description: 'Full access to spa operations, revenue, settings, and staff.', icon: 'Shield' },
    { id: 'MANAGER', label: 'Spa Manager', description: 'Access to therapy schedules, guest management, and analytics.', icon: 'Users' },
    { id: 'STAFF', label: 'Frontdesk Host', description: 'Guest check-ins, therapy bookings, quick billing, and chats.', icon: 'User' },
  ],

  navItems: [
    { name: 'Ask AI Frontdesk', href: '/ask-ai', icon: Bot, roles: ['ADMIN'] },
    { name: 'Business Health', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Teams', href: '/teams', icon: Users, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Appointments', href: '/appointments', icon: CalendarDays, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Operational Delays', href: '/operational-delays', icon: AlertTriangle, roles: ['ADMIN', 'MANAGER'] },
    
    { name: 'Sales', roles: ['ADMIN', 'MANAGER'], divider: true },
    { name: 'Today\'s Revenue', href: '/todays-revenue', icon: IndianRupee, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Monthly Sales', href: '/monthly-sales', icon: TrendingUp, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Guest LTV', href: '/customer-value', icon: Heart, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Wellness', roles: ['ADMIN', 'STAFF'], divider: true },
    { name: 'Therapy Queue', href: '/waiting-room', icon: Clock, roles: ['ADMIN', 'STAFF'] },
    { name: 'Therapy Suites', href: '/calendar', icon: Calendar, roles: ['ADMIN', 'STAFF'] },
    { name: 'Guest Profiles', href: '/profiles', icon: Heart, roles: ['ADMIN', 'STAFF'] },
    { name: 'Staff Calendar', href: '/staff-calendar', icon: CalendarDays, roles: ['ADMIN'] },
    
    { name: 'Frontdesk', roles: ['ADMIN', 'STAFF'], divider: true },
    { name: 'Book Therapy', href: '/book-appointment', icon: CalendarDays, roles: ['ADMIN', 'STAFF'] },
    { name: 'Booking Link', href: '/booking-link', icon: Link2, roles: ['ADMIN'] },
    { name: 'Quick Bill', href: '/billing', icon: CreditCard, roles: ['ADMIN', 'STAFF'] },
    { name: 'Services', href: '/services', icon: Sparkles, roles: ['ADMIN', 'STAFF', 'MANAGER'] },
    { name: 'Invoices', href: '/invoices', icon: FileText, roles: ['ADMIN', 'STAFF'] },
    { name: 'Guests', href: '/customers', icon: Users, roles: ['ADMIN', 'STAFF'] },
    { name: 'Conversations', href: '/conversations', icon: MessageSquare, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: 'Human Handoff Requests', href: '/human-handoff-requests', icon: UserCheck, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    
    { name: 'Automation', roles: ['ADMIN', 'MANAGER'], divider: true },
    { name: 'Automations', href: '/automations', icon: Workflow, roles: ['ADMIN'] },
    { name: 'Automated Leads', href: '/crm', icon: Target, roles: ['ADMIN', 'MANAGER'] },
    { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle, roles: ['ADMIN', 'MANAGER'] },

    { name: 'Voice Telephony', roles: ['ADMIN'], divider: true },
    { name: 'Voice AI Agent', href: '/voice', icon: Cpu, roles: ['ADMIN'] },
    { name: 'Phone Numbers', href: '/phone-numbers', icon: Phone, roles: ['ADMIN'] },
    { name: 'Inbound Calls', href: '/inbound-calls', icon: PhoneIncoming, roles: ['ADMIN'] },
    { name: 'Outbound Campaigns', href: '/outbound-campaigns', icon: Megaphone, roles: ['ADMIN'] },
    { name: 'Agent Analytics', href: '/agent-analytics', icon: Activity, roles: ['ADMIN'] },

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
    { label: 'Room Occupancy Rate', value: '78%', change: '+5%', trend: 'up' },
    { label: 'Therapist Utilization', value: '82%', change: '+2%', trend: 'up' },
    { label: 'Average Ticket Value', value: '₹2,800', change: '+₹150', trend: 'up' },
    { label: 'Membership Renewal Rate', value: '71%', change: '-2%', trend: 'down' },
  ],

  templates: [
    {
      id: 'wa_pre_health',
      title: 'Pre-Therapy Health Form',
      category: 'Onboarding',
      channel: 'WHATSAPP',
      content: 'Namaste {{guest_name}} 🙏,\n\nWe look forward to welcoming you to {{spa_branch}} for your upcoming therapy with {{assigned_therapist}}.\n\nTo ensure a tailored and safe experience, please complete our quick pre-therapy health form before your arrival: [Link]\n\nWarm regards,\nThe Wellness Team',
      isPreinstalled: true,
      variables: ['guest_name', 'spa_branch', 'assigned_therapist'],
    },
    {
      id: 'wa_panchakarma_reminder',
      title: 'Panchakarma Daily Reminder',
      category: 'Reminders',
      channel: 'WHATSAPP',
      content: 'Hello {{guest_name}} 🌿,\n\nThis is a gentle reminder for Day {{panchakarma_day}} of your Panchakarma detox tomorrow at {{therapy_time}}.\n\nPlease remember to have a light dinner tonight and stay hydrated. Your therapist, {{assigned_therapist}}, awaits your arrival.\n\nSee you soon at {{spa_branch}}!',
      isPreinstalled: true,
      variables: ['guest_name', 'panchakarma_day', 'therapy_time', 'assigned_therapist', 'spa_branch'],
    },
    {
      id: 'wa_membership_rebook',
      title: 'Membership Re-Booking',
      category: 'Retention',
      channel: 'WHATSAPP',
      content: 'Dear {{guest_name}},\n\nYour wellness journey matters to us! We noticed it has been a while since your last visit on {{last_therapy_date}}.\n\nYou have {{membership_credits}} credits remaining on your account. Would you like to schedule a relaxing session this weekend?\n\nReply "YES" to book or call us at [Phone].',
      isPreinstalled: true,
      variables: ['guest_name', 'last_therapy_date', 'membership_credits'],
    },
    {
      id: 'wa_post_hydration',
      title: 'Post-Spa Hydration Care',
      category: 'Aftercare',
      channel: 'WHATSAPP',
      content: 'Namaste {{guest_name}} ✨,\n\nWe hope you enjoyed your recent therapy with {{assigned_therapist}}.\n\nFollowing your treatment, please remember to drink plenty of warm water to help flush out toxins and rest well today.\n\nIf you have any feedback or wish to rebook, just reply to this message. Have a serene day ahead!',
      isPreinstalled: true,
      variables: ['guest_name', 'assigned_therapist'],
    },
    {
      id: 'email_welcome_membership',
      title: 'Welcome to Membership',
      category: 'Onboarding',
      channel: 'EMAIL',
      subject: 'Welcome to Your Wellness Journey at {{spa_branch}}',
      content: 'Dear {{guest_name}},\n\nWelcome to our exclusive Wellness Membership!\n\nWe are thrilled to be part of your holistic health journey. With your new membership, you now have access to priority bookings, exclusive discounts on retail products, and complimentary add-ons.\n\nYour current credit balance is: {{membership_credits}}.\n\nTo view the full list of benefits, please see the attached brochure.\n\nIn health and wellness,\nThe {{spa_branch}} Team',
      mediaAttachment: 'PDF',
      isPreinstalled: true,
      variables: ['guest_name', 'spa_branch', 'membership_credits'],
    },
    {
      id: 'email_ayurvedic_consult',
      title: 'Ayurvedic Consultation Follow-up',
      category: 'Follow-up',
      channel: 'EMAIL',
      subject: 'Your Personalized Ayurvedic Wellness Plan',
      content: 'Namaste {{guest_name}},\n\nThank you for consulting with our Ayurvedic Doctor today at {{spa_branch}}.\n\nBased on your dosha assessment, we have crafted a personalized wellness plan designed to restore your natural balance. Please find your detailed diet and lifestyle guidelines attached to this email.\n\nFor your next step, we recommend scheduling your suggested therapies within the next 2 weeks.\n\nWarmly,\n{{spa_branch}} Wellness Care',
      mediaAttachment: 'PDF',
      isPreinstalled: true,
      variables: ['guest_name', 'spa_branch'],
    },
    {
      id: 'email_special_offer',
      title: 'Seasonal Rejuvenation Offer',
      category: 'Marketing',
      channel: 'EMAIL',
      subject: 'Embrace the Season with 20% Off Rejuvenation Therapies',
      content: 'Dear {{guest_name}},\n\nAs the seasons change, so do the needs of your body and mind.\n\nThis month, we are offering an exclusive 20% discount on all Abhyanga and Shirodhara therapies at {{spa_branch}} to help you stay grounded and deeply nourished.\n\nBook before the end of the month to avail this offer.\n\nStay well,\nThe Team at {{spa_branch}}',
      isPreinstalled: true,
      variables: ['guest_name', 'spa_branch'],
    },
    {
      id: 'voice_inbound_greeting',
      title: 'Soothing Inbound Receptionist',
      category: 'Voice',
      channel: 'VOICE',
      content: 'Namaste! Welcome to {{spa_branch}}. This is Wellness A I, your digital wellness concierge. How may I assist you with your booking or therapy inquiries today? Take your time, I am here to help.',
      isPreinstalled: true,
      variables: ['spa_branch'],
    },
    {
      id: 'voice_appointment_reminder',
      title: 'Therapy Reminder Call',
      category: 'Voice',
      channel: 'VOICE',
      content: 'Hello, am I speaking with {{guest_name}}? Namaste. I am calling from {{spa_branch}} to gently remind you of your upcoming therapy session scheduled for tomorrow at {{therapy_time}}. If you need to reschedule or have any special requests for {{assigned_therapist}}, please let me know now.',
      isPreinstalled: true,
      variables: ['guest_name', 'spa_branch', 'therapy_time', 'assigned_therapist'],
    },
    {
      id: 'voice_post_care',
      title: 'Post-Therapy Follow-up',
      category: 'Voice',
      channel: 'VOICE',
      content: 'Namaste {{guest_name}}, this is the wellness desk at {{spa_branch}}. I am calling to check on how you are feeling after your therapy yesterday. We hope you are feeling relaxed and rejuvenated. Do you have any feedback for us, or would you like to schedule your next session?',
      isPreinstalled: true,
      variables: ['guest_name', 'spa_branch'],
    }
  ],

  knowledgeBaseDocs: [
    {
      id: 'kb_ayurvedic_therapies',
      title: 'Ayurvedic Therapies Overview',
      category: 'SERVICE',
      content: 'Comprehensive guide covering traditional therapies: Abhyanga (full body oil massage), Shirodhara (warm oil poured over forehead), Udvartana (herbal powder massage), and Swedana (herbal steam). Details the benefits, duration (usually 60-90 mins), and specific oils used for Vata, Pitta, and Kapha doshas.',
      chunks: 15,
      isActive: true,
      updatedAt: '2026-08-01',
    },
    {
      id: 'kb_spa_etiquette',
      title: 'Spa Etiquette & Policies',
      category: 'FAQ',
      content: 'Guidelines for guests: Arrive 15 minutes prior to appointment. Mobile phones must be on silent. Voices kept to a whisper in the relaxation lounges. Details our 24-hour cancellation policy (50% charge) and no-show policy (100% charge).',
      chunks: 8,
      isActive: true,
      updatedAt: '2026-08-01',
    },
    {
      id: 'kb_contraindications',
      title: 'Safety Contraindications',
      category: 'RESTRICTED_GUIDELINES',
      content: 'Critical safety information outlining when NOT to perform therapies. Includes deep tissue massage contraindications (blood clots, severe osteoporosis, recent surgeries), essential oil sensitivities, and specific conditions like unmanaged high blood pressure. Therapists must consult the BAMS doctor if unsure.',
      chunks: 12,
      isActive: true,
      updatedAt: '2026-07-25',
    },
    {
      id: 'kb_membership_tiers',
      title: 'Membership Tiers & Pricing',
      category: 'PRICING',
      content: 'Details our 3 membership tiers: Silver (₹10,000/month - 4 basic therapies), Gold (₹20,000/month - 4 premium therapies + 10% retail discount), and Platinum (₹35,000/month - Unlimited basic therapies + 20% retail discount + priority booking). Explains credit rollover policies.',
      chunks: 10,
      isActive: true,
      updatedAt: '2026-08-10',
    },
    {
      id: 'kb_panchakarma_guide',
      title: 'Panchakarma Guide for Staff',
      category: 'SOP',
      content: 'Standard Operating Procedure for handling Panchakarma guests. Covers the 5-step detoxification process, dietary restrictions (kitchari diet), required daily doctor check-ins, and how to manage detox symptoms (fatigue, headaches) with guests compassionately.',
      chunks: 25,
      isActive: true,
      updatedAt: '2026-06-15',
    },
    {
      id: 'kb_essential_oils',
      title: 'Essential Oils Guide',
      category: 'SERVICE',
      content: 'Reference for front desk and therapists on the aromatherapy menu. Lavender for relaxation/sleep, Eucalyptus for respiratory/muscle ache, Peppermint for energy/headaches, Sandalwood for grounding. Includes blending guidelines and allergy checks.',
      chunks: 18,
      isActive: true,
      updatedAt: '2026-08-02',
    },
    {
      id: 'kb_pregnancy_safe',
      title: 'Pregnancy-Safe Treatments',
      category: 'RESTRICTED_GUIDELINES',
      content: 'Strict guidelines on pre-natal therapies. Only allowed after the first trimester. Focus on gentle Swedish techniques. Absolutely no deep tissue, hot stones, or reflexology on specific pressure points (ankles/wrists) that may induce labor. Special positioning pillows required.',
      chunks: 9,
      isActive: true,
      updatedAt: '2026-05-20',
    },
    {
      id: 'kb_post_therapy_care',
      title: 'Post-Therapy Care Instructions',
      category: 'SCRIPTS',
      content: 'Scripts for front desk to verbally share with guests upon checkout. Emphasize drinking 2-3 liters of water, avoiding caffeine/alcohol for 12 hours, and not showering immediately if medicated oils were used to allow deeper absorption.',
      chunks: 5,
      isActive: true,
      updatedAt: '2026-08-11',
    }
  ],

  automationPresets: [
    {
      title: 'New Guest Welcome',
      trigger: 'On first therapy booking creation',
      desc: 'Sends a warm WhatsApp welcome message with the pre-therapy health form link.',
      category: 'Onboarding'
    },
    {
      title: 'No-Show Follow Up',
      trigger: 'When therapy status is marked as No-Show',
      desc: 'Automatically triggers an empathetic email to reschedule and explains cancellation policies.',
      category: 'Retention'
    },
    {
      title: 'Therapist Schedule Alert',
      trigger: 'Daily at 8:00 AM',
      desc: 'Sends therapists their daily schedule and room assignments via WhatsApp.',
      category: 'Operations'
    },
    {
      title: 'Membership Renewal Reminder',
      trigger: '7 days before membership expiry',
      desc: 'Sends a sequence of Voice and WhatsApp reminders to encourage credit renewal.',
      category: 'Sales'
    }
  ],

  initialWorkflows: [
    {
      id: 'wf_booking_confirm',
      name: 'Booking Confirmation & Prep',
      triggerEvent: 'Therapy Booked',
      description: 'Ensures guests receive immediate confirmation and intake forms.',
      steps: [
        { type: 'TRIGGER', label: 'Therapy Booked', detail: 'Any suite, any therapist' },
        { type: 'CONDITION', label: 'Is First Visit?', detail: 'Check if guest has past visits' },
        { type: 'ACTION', label: 'Send WhatsApp Form', detail: 'Uses "wa_pre_health" template' }
      ],
      actionsCount: 3,
      isActive: true,
      lastRun: '2 mins ago',
      runs24h: 45,
      category: 'Guest Experience'
    },
    {
      id: 'wf_post_visit_review',
      name: 'Post-Visit Review Request',
      triggerEvent: 'Therapy Completed',
      description: 'Asks for feedback 2 hours after a session.',
      steps: [
        { type: 'TRIGGER', label: 'Therapy Completed', detail: 'Status changed to completed' },
        { type: 'ACTION', label: 'Delay', detail: 'Wait 2 hours' },
        { type: 'ACTION', label: 'Send WhatsApp', detail: 'Request Google Review' }
      ],
      actionsCount: 2,
      isActive: true,
      lastRun: '15 mins ago',
      runs24h: 38,
      category: 'Marketing'
    },
    {
      id: 'wf_high_value_alert',
      name: 'VIP Guest Arrival Alert',
      triggerEvent: 'Guest Checked In',
      description: 'Notifies management when a Platinum member arrives.',
      steps: [
        { type: 'TRIGGER', label: 'Check-in Status', detail: 'Front desk checks guest in' },
        { type: 'CONDITION', label: 'Is Platinum?', detail: 'Check membership tier' },
        { type: 'ACTION', label: 'Internal Notification', detail: 'Ping Spa Manager' }
      ],
      actionsCount: 3,
      isActive: true,
      lastRun: '4 hours ago',
      runs24h: 4,
      category: 'Operations'
    },
    {
      id: 'wf_birthday_discount',
      name: 'Birthday Rejuvenation Campaign',
      triggerEvent: 'Date matches Guest DOB',
      description: 'Sends a special birthday offer via Email.',
      steps: [
        { type: 'TRIGGER', label: 'Daily Cron', detail: 'Check all active guests for birthday' },
        { type: 'ACTION', label: 'Send Email', detail: 'Send 20% off birthday coupon' }
      ],
      actionsCount: 1,
      isActive: true,
      lastRun: '8 hours ago',
      runs24h: 12,
      category: 'Marketing'
    }
  ],

  goldenPrompt: `You are WellnessAI, the serene and empathetic virtual receptionist for {{spa_branch}}.
Your tone is deeply soothing, grounded, and polite. Always begin calls with "Namaste" and speak at a calm, unhurried pace.
Your primary goals are to assist guests with booking Therapy Suites, answering questions about Ayurvedic treatments, and managing membership inquiries.
Never diagnose medical conditions. If a guest asks about medical ailments, politely suggest they book a consultation with our BAMS Doctor.
When discussing prices, always quote in INR (₹) and gently highlight our membership value.
If a guest seems stressed, offer a compassionate remark about our relaxing environment.
Do not use harsh or highly energetic language; maintain a Zen-like presence.`,

  tones: [
    { id: 'serene_wellness', name: 'Serene Wellness', badge: 'Default', greeting: 'Namaste. Welcome to your sanctuary of peace. How may I guide your wellness journey today?' },
    { id: 'ayurvedic_tradition', name: 'Ayurvedic Traditional', badge: 'Traditional', greeting: 'Namaste. We are honored to support your path to balance. How can our healers assist you today?' },
    { id: 'modern_urban', name: 'Modern Urban Spa', badge: 'Chic', greeting: 'Hello! Welcome to your city escape. How can we help you relax and recharge today?' }
  ],

  aiRules: [
    {
      id: 'rule_no_medical_advice',
      title: 'Never Give Medical Advice',
      description: 'Strictly prohibit the AI from diagnosing or suggesting cures for serious ailments. Must redirect to the Ayurvedic Doctor.',
      severity: 'critical'
    },
    {
      id: 'rule_namaste_greeting',
      title: 'Always Greet with Namaste',
      description: 'Ensure all first interactions on voice and text begin with Namaste to maintain cultural brand identity.',
      severity: 'warning'
    },
    {
      id: 'rule_currency_inr',
      title: 'Pricing in INR',
      description: 'Always state prices using Indian Rupees (₹) and ensure taxes are mentioned if applicable.',
      severity: 'info'
    },
    {
      id: 'rule_membership_upsell',
      title: 'Gentle Membership Mention',
      description: 'If a guest quotes a high-ticket therapy, the AI should softly mention that memberships offer up to 20% savings.',
      severity: 'info'
    },
    {
      id: 'rule_pregnancy_filter',
      title: 'Pregnancy Safety Check',
      description: 'If a guest mentions pregnancy, the AI MUST explicitly state our 1st-trimester policy and restrict certain booking types.',
      severity: 'critical'
    }
  ],

  inputVariables: [
    { token: 'guest_name', label: 'Guest Name', fallback: 'Valued Guest' },
    { token: 'last_therapy_date', label: 'Last Therapy Date', fallback: 'your last visit' },
    { token: 'assigned_therapist', label: 'Assigned Therapist', fallback: 'your therapist' },
    { token: 'spa_branch', label: 'Spa Branch Name', fallback: 'our wellness center' }
  ]
};
