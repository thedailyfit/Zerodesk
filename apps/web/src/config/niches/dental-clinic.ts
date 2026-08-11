import {
  LayoutDashboard, MessageSquare, Users, Target, Calendar, BookOpen, BarChart3, Phone,
  MessageCircle, Workflow, Settings, FileText, Rocket, Receipt, TrendingUp, CreditCard,
  CalendarDays, Clock, Shield, IndianRupee, Heart, SmilePlus, Cpu, PhoneIncoming,
  Megaphone, Activity, Laptop, AlertTriangle
} from './types';
import type { NicheConfig } from './types';

export const DENTAL_CLINIC_CONFIG: NicheConfig = {
  id: 'dental',
  label: 'Dental Clinic',
  tagline: 'Streamlined practice management for modern dental clinics.',
  icon: 'SmilePlus',
  accentColor: 'text-cyan-600',
  accentColorRGB: '8, 145, 178',
  gradientFrom: 'from-cyan-600',
  gradientTo: 'to-teal-500',

  terminology: {
    customer: 'Patient',
    customers: 'Patients',
    appointment: 'Visit',
    appointments: 'Visits',
    service: 'Treatment',
    services: 'Treatments',
    staff: 'Dentist',
    waitingRoom: 'Lounge',
    patientFiles: 'Dental Records',
    calendar: 'Chair Scheduler',
    billing: 'Invoices',
    overview: 'Overview'
  },

  roles: [
    { id: 'chief_dentist', label: 'Chief Dentist', description: 'Full access to business analytics and practice operations.', icon: 'Shield' },
    { id: 'associate_dentist', label: 'Associate Dentist', description: 'Access to patient records, charts, and daily schedule.', icon: 'Activity' },
    { id: 'dental_assistant', label: 'Dental Assistant', description: 'Manage chair turnarounds, sterilization logs, and lab orders.', icon: 'Laptop' },
    { id: 'front_desk', label: 'Front Desk', description: 'Handle patient check-ins, calls, billing, and insurance.', icon: 'SmilePlus' },
    { id: 'treatment_coordinator', label: 'Treatment Coordinator', description: 'Present treatment plans, manage financing, and follow up.', icon: 'MessageCircle' }
  ],

  navItems: [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['chief_dentist', 'associate_dentist'] },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, roles: ['chief_dentist'] },
    { name: 'Teams', href: '/dashboard/teams', icon: Users, roles: ['chief_dentist'] },
    { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarDays, roles: ['chief_dentist', 'front_desk', 'associate_dentist'] },
    { name: 'Operational Delays', href: '/dashboard/delays', icon: AlertTriangle, roles: ['chief_dentist', 'front_desk'] },
    
    { name: 'Sales', roles: ['chief_dentist'], divider: true },
    { name: 'Today\'s Revenue', href: '/dashboard/sales/today', icon: IndianRupee, roles: ['chief_dentist', 'front_desk'] },
    { name: 'Monthly Sales', href: '/dashboard/sales/monthly', icon: TrendingUp, roles: ['chief_dentist'] },
    
    { name: 'Clinical', roles: ['associate_dentist', 'dental_assistant'], divider: true },
    { name: 'Waiting Room', href: '/dashboard/clinical/waiting', icon: Clock, roles: ['front_desk', 'dental_assistant'] },
    { name: 'Chair Scheduler', href: '/dashboard/clinical/slots', icon: Calendar, roles: ['associate_dentist', 'front_desk'] },
    { name: 'Dental Records', href: '/dashboard/clinical/files', icon: FileText, roles: ['associate_dentist'] },
    { name: 'Lab Orders', href: '/dashboard/clinical/lab', icon: Target, roles: ['associate_dentist', 'dental_assistant'] },
    
    { name: 'Frontdesk', roles: ['front_desk', 'treatment_coordinator'], divider: true },
    { name: 'Quick Bill', href: '/dashboard/frontdesk/quickbill', icon: Receipt, roles: ['front_desk'] },
    { name: 'Invoices', href: '/dashboard/frontdesk/invoices', icon: CreditCard, roles: ['front_desk'] },
    { name: 'Book Appointment', href: '/dashboard/frontdesk/book', icon: BookOpen, roles: ['front_desk'] },
    { name: 'Customers/Patients', href: '/dashboard/frontdesk/patients', icon: Users, roles: ['front_desk'] },
    { name: 'Conversations', href: '/dashboard/frontdesk/conversations', icon: MessageSquare, roles: ['front_desk', 'treatment_coordinator'] },

    { name: 'Automation', roles: ['chief_dentist'], divider: true },
    { name: 'Automations', href: '/dashboard/automation/list', icon: Workflow, roles: ['chief_dentist'] },
    { name: 'Hygiene Recall', href: '/dashboard/automation/recall', icon: Heart, roles: ['chief_dentist', 'front_desk'] },
    { name: 'Lead Management', href: '/dashboard/automation/leads', icon: Target, roles: ['chief_dentist', 'treatment_coordinator'] },
    { name: 'Patient Sentiment', href: '/dashboard/automation/sentiment', icon: SmilePlus, roles: ['chief_dentist'] },
    { name: 'WhatsApp', href: '/dashboard/automation/whatsapp', icon: MessageCircle, roles: ['chief_dentist'] },
    { name: 'Ready to Scale', href: '/dashboard/automation/scale', icon: Rocket, roles: ['chief_dentist'] },

    { name: 'Voice Telephony', roles: ['chief_dentist'], divider: true },
    { name: 'Voice AI Agent', href: '/dashboard/voice/agent', icon: Cpu, roles: ['chief_dentist'] },
    { name: 'Phone Numbers', href: '/dashboard/voice/numbers', icon: Phone, roles: ['chief_dentist'] },
    { name: 'Inbound Calls', href: '/dashboard/voice/inbound', icon: PhoneIncoming, roles: ['chief_dentist', 'front_desk'] },
    { name: 'Outbound Campaigns', href: '/dashboard/voice/outbound', icon: Megaphone, roles: ['chief_dentist', 'treatment_coordinator'] },
    { name: 'Agent Analytics', href: '/dashboard/voice/analytics', icon: Activity, roles: ['chief_dentist'] },

    { name: 'Backend AI', roles: ['chief_dentist'], divider: true },
    { name: 'Voice AI Knowledge Hub', href: '/dashboard/ai/hub', icon: Cpu, roles: ['chief_dentist'] },
    { name: 'Company Knowledge Base', href: '/dashboard/ai/kb', icon: BookOpen, roles: ['chief_dentist'] },
    { name: 'Templates', href: '/dashboard/ai/templates', icon: FileText, roles: ['chief_dentist'] },

    { name: 'System', roles: ['chief_dentist'], divider: true },
    { name: 'Desktop App', href: '/dashboard/system/desktop', icon: Laptop, roles: ['chief_dentist'] },
    { name: 'Settings', href: '/dashboard/system/settings', icon: Settings, roles: ['chief_dentist'] }
  ],

  kpis: [
    { label: 'Chair Utilization', value: '82%', change: '+4%', trend: 'up' },
    { label: 'Treatment Acceptance', value: '65%', change: '+10%', trend: 'up' },
    { label: 'Revenue Per Chair', value: '₹12,400', change: '+2%', trend: 'up' },
    { label: '6-Month Recall Rate', value: '45%', change: '-5%', trend: 'down' }
  ],

  templates: [
    {
      id: 'wa-post-extraction',
      title: 'Post-extraction Care',
      category: 'Follow Up',
      channel: 'WHATSAPP',
      content: 'Hi {{patient_name}}, hope you are feeling okay after your extraction today. Remember to bite down on the gauze, avoid hot liquids, and do not use a straw for 24 hours. Call us if bleeding persists.',
      isPreinstalled: true,
      variables: ['patient_name']
    },
    {
      id: 'wa-crown-ready',
      title: 'Crown Ready Alert',
      category: 'Lab Updates',
      channel: 'WHATSAPP',
      content: 'Hello {{patient_name}}, great news! Your crown/cap has arrived from the lab. Please reply to schedule your fitting appointment with {{assigned_dentist}} at {{clinic_branch}}.',
      isPreinstalled: true,
      variables: ['patient_name', 'assigned_dentist', 'clinic_branch']
    },
    {
      id: 'wa-hygiene-recall',
      title: '6-Month Hygiene Recall',
      category: 'Recall',
      channel: 'WHATSAPP',
      content: 'Hi {{patient_name}}, it\'s been 6 months since your last cleaning on {{last_visit_date}}. Regular cleanings prevent cavities and keep your smile bright! Reply to book your next visit.',
      isPreinstalled: true,
      variables: ['patient_name', 'last_visit_date']
    },
    {
      id: 'wa-post-rct',
      title: 'Post-RCT Care',
      category: 'Follow Up',
      channel: 'WHATSAPP',
      content: 'Hi {{patient_name}}, following your Root Canal Treatment, some tenderness is normal. Please take the prescribed medication. Avoid chewing on that side until your final crown is placed.',
      isPreinstalled: true,
      variables: ['patient_name']
    },
    {
      id: 'email-treatment-plan',
      title: 'Treatment Plan Estimate',
      category: 'Financial',
      channel: 'EMAIL',
      subject: 'Your Dental Treatment Plan & Estimate',
      content: 'Dear {{patient_name}},\n\nFollowing your consultation with {{assigned_dentist}}, please find attached your comprehensive treatment plan and cost estimate.\n\nOur Treatment Coordinator will call you tomorrow to discuss EMI options.\n\nWarmly,\nThe Dental Team',
      mediaAttachment: 'PDF',
      isPreinstalled: true,
      variables: ['patient_name', 'assigned_dentist']
    },
    {
      id: 'email-invoice-ins',
      title: 'Invoice & Insurance',
      category: 'Billing',
      channel: 'EMAIL',
      subject: 'Your Invoice & Claim Documents',
      content: 'Dear {{patient_name}},\n\nPlease find attached the invoice for your visit on {{last_visit_date}}. We have also included the necessary documents for your insurance claim.\n\nThank you for choosing us.\n\nBest,\nThe Dental Team',
      mediaAttachment: 'PDF',
      isPreinstalled: true,
      variables: ['patient_name', 'last_visit_date']
    },
    {
      id: 'email-preventive-care',
      title: 'Preventive Care Newsletter',
      category: 'Marketing',
      channel: 'EMAIL',
      subject: '5 Tips for a Healthier Smile',
      content: 'Hello {{patient_name}},\n\nDid you know flossing daily adds years to your life? Read our latest tips on maintaining optimal oral hygiene between your 6-month visits.\n\nKeep smiling!\nThe Dental Team',
      isPreinstalled: true,
      variables: ['patient_name']
    },
    {
      id: 'voice-general-inquiry',
      title: 'General Inquiry',
      category: 'Inbound',
      channel: 'VOICE',
      content: 'Welcome to our dental clinic. I am DentAI. Whether you need a routine cleaning, are experiencing tooth pain, or want to know our clinic timings, I am here to help. How can I assist you today?',
      isPreinstalled: true,
      variables: []
    },
    {
      id: 'voice-emergency',
      title: 'Emergency Dental',
      category: 'Inbound',
      channel: 'VOICE',
      content: 'I understand you are experiencing dental pain. I can schedule you for an emergency appointment today. May I know which tooth is hurting and if there is any swelling?',
      isPreinstalled: true,
      variables: []
    },
    {
      id: 'voice-ortho-consult',
      title: 'Orthodontic Consultation',
      category: 'Outbound',
      channel: 'VOICE',
      content: 'Hello {{patient_name}}, this is the AI assistant calling from {{clinic_branch}}. I saw your inquiry about Invisible Aligners. Would you like to schedule a free 3D scan and consultation with our Orthodontist?',
      isPreinstalled: true,
      variables: ['patient_name', 'clinic_branch']
    }
  ],

  knowledgeBaseDocs: [
    {
      id: 'kb-post-op-ext',
      title: 'Post-op Care: Extraction',
      category: 'SOP',
      content: 'Instructions for patients after tooth extraction. Includes biting on gauze for 45 mins, no spitting or using straws, soft diet for 2 days, and taking painkillers as prescribed.',
      chunks: 8,
      isActive: true,
      updatedAt: '2026-07-15T10:00:00Z'
    },
    {
      id: 'kb-post-op-rct',
      title: 'Post-op Care: RCT',
      category: 'SOP',
      content: 'Guidelines post root canal treatment. Explains that the tooth may be tender for a few days, avoid chewing hard food on that side, and importance of getting a crown to prevent fracture.',
      chunks: 7,
      isActive: true,
      updatedAt: '2026-06-20T12:00:00Z'
    },
    {
      id: 'kb-treatment-costs',
      title: 'Treatment Costs & EMI Options',
      category: 'PRICING',
      content: 'Standard pricing: Consultation (₹500), Scaling (₹1500), RCT (₹4500+). EMI options available via Bajaj Finserv for treatments above ₹20,000.',
      chunks: 5,
      isActive: true,
      updatedAt: '2026-08-01T09:00:00Z'
    },
    {
      id: 'kb-pediatric',
      title: 'Pediatric Dentistry Info',
      category: 'FAQ',
      content: 'Information on treating children. Pit and fissure sealants, fluoride treatments, and behavior management techniques used in the clinic.',
      chunks: 10,
      isActive: true,
      updatedAt: '2026-05-10T14:30:00Z'
    },
    {
      id: 'kb-emergencies',
      title: 'Handling Dental Emergencies',
      category: 'RESTRICTED_GUIDELINES',
      content: 'Protocol for knocked-out teeth (keep in milk), severe swelling (needs antibiotics urgently), and uncontrolled bleeding. Must escalate to dentist immediately.',
      chunks: 6,
      isActive: true,
      updatedAt: '2026-07-05T11:15:00Z'
    },
    {
      id: 'kb-crown-types',
      title: 'Crown Types Comparison',
      category: 'SERVICE',
      content: 'Comparison of PFM (Porcelain Fused to Metal), Zirconia, and E-max crowns. Pros, cons, and pricing for each to help patients choose.',
      chunks: 12,
      isActive: true,
      updatedAt: '2026-07-25T16:45:00Z'
    },
    {
      id: 'kb-aligners',
      title: 'Aligner Treatment Guide',
      category: 'SERVICE',
      content: 'Process for clear aligners: 3D scan, treatment planning, delivery of trays. Emphasize wearing them for 22 hours a day.',
      chunks: 9,
      isActive: true,
      updatedAt: '2026-06-05T08:20:00Z'
    },
    {
      id: 'kb-insurance',
      title: 'Insurance & Cashless Info',
      category: 'FAQ',
      content: 'List of accepted insurance providers for cashless treatments and the documentation required from the patient.',
      chunks: 4,
      isActive: true,
      updatedAt: '2026-08-05T13:10:00Z'
    }
  ],

  automationPresets: [
    { title: 'Post-extraction Care', trigger: 'Service Completed: Extraction', desc: 'Automatically send post-op instructions via WhatsApp 2 hours after extraction.', category: 'Patient Care' },
    { title: 'Crown Ready Notification', trigger: 'Lab Case Status: Received', desc: 'Notify patient when their crown/prosthesis arrives from the lab.', category: 'Operations' },
    { title: '6-Month Recall', trigger: '6 Months Since Last Visit', desc: 'Send automated reminders for routine scaling and checkup.', category: 'Retention' },
    { title: 'Unfinished Treatment Recovery', trigger: 'Treatment Plan Accepted but not Booked', desc: 'Follow up with patients who agreed to a plan but haven\'t scheduled the first session.', category: 'Conversion' }
  ],

  initialWorkflows: [
    {
      id: 'wf-d1',
      name: 'New Patient Onboarding',
      triggerEvent: 'New Patient Registered',
      description: 'Welcome sequence and digital intake forms.',
      steps: [
        { type: 'TRIGGER', label: 'Patient Type: New', detail: '' },
        { type: 'ACTION', label: 'WhatsApp', detail: 'Welcome + Link to Medical History Form' },
        { type: 'CONDITION', label: 'Wait until form completed', detail: '' },
        { type: 'ACTION', label: 'Update EMR', detail: 'Mark forms as received' }
      ],
      actionsCount: 2,
      isActive: true,
      lastRun: '30 mins ago',
      runs24h: 15,
      category: 'Operations'
    },
    {
      id: 'wf-d2',
      name: 'Implant Follow-up Sequence',
      triggerEvent: 'Implant Placement Completed',
      description: 'Long-term follow up during the osseointegration phase.',
      steps: [
        { type: 'TRIGGER', label: 'Service: Implant Stage 1', detail: '' },
        { type: 'ACTION', label: 'WhatsApp', detail: 'Day 1 Post-op Care' },
        { type: 'CONDITION', label: 'Wait 3 Months', detail: '' },
        { type: 'ACTION', label: 'WhatsApp', detail: 'Book Stage 2 / Crown Measurement' }
      ],
      actionsCount: 2,
      isActive: true,
      lastRun: '1 day ago',
      runs24h: 2,
      category: 'Patient Care'
    },
    {
      id: 'wf-d3',
      name: 'Missed Appointment Reactivation',
      triggerEvent: 'Appointment No-Show',
      description: 'Attempt to rebook missed dental visits.',
      steps: [
        { type: 'TRIGGER', label: 'Status: No-Show', detail: '' },
        { type: 'ACTION', label: 'WhatsApp', detail: 'We missed you, here is a link to reschedule.' },
        { type: 'CONDITION', label: 'Wait 24h', detail: '' },
        { type: 'ACTION', label: 'Task', detail: 'Front desk to call patient' }
      ],
      actionsCount: 2,
      isActive: true,
      lastRun: '3 hours ago',
      runs24h: 5,
      category: 'Retention'
    },
    {
      id: 'wf-d4',
      name: 'Lab Case Tracking',
      triggerEvent: 'Lab Order Sent',
      description: 'Track lab cases to ensure they return before the patient visit.',
      steps: [
        { type: 'TRIGGER', label: 'Lab Status: Sent', detail: '' },
        { type: 'CONDITION', label: 'Wait 5 Days', detail: '' },
        { type: 'ACTION', label: 'Notification', detail: 'Alert assistant if not received' }
      ],
      actionsCount: 1,
      isActive: true,
      lastRun: '5 hours ago',
      runs24h: 10,
      category: 'Operations'
    }
  ],

  goldenPrompt: `You are DentAI, a gentle, comforting, and highly professional virtual receptionist for a modern Dental Clinic.
Your main goals are to relieve dental anxiety, assist with booking appointments, and answer basic queries based on the knowledge base.
You must NEVER provide a dental diagnosis or suggest a specific treatment plan over the phone.
If a patient reports severe pain, swelling, or trauma, prioritize booking them as an emergency and escalate appropriately.
Always politely inquire if the patient has any significant medical history (like diabetes or heart conditions) when booking surgical procedures.
Maintain a soothing, confident demeanor at all times.`,

  tones: [
    { id: 'tone-gentle', name: 'Gentle Comfort', badge: 'Default', greeting: 'Hello, welcome to our dental practice. I am here to ensure you have a comfortable and easy experience. How may I assist you?' },
    { id: 'tone-clinical', name: 'Clinical Precision', badge: 'Fast', greeting: 'Hello. I can assist you with scheduling, records, or billing. How can I help you today?' },
    { id: 'tone-family', name: 'Family Friendly', badge: 'Warm', greeting: 'Hi there! Welcome to our family dental clinic. Are you calling for yourself or a family member today?' }
  ],

  aiRules: [
    { id: 'rule-d1', title: 'No Dental Diagnosis', description: 'Do not diagnose toothaches, lesions, or recommend specific treatments like RCT or extraction. Always book a consult.', severity: 'critical' },
    { id: 'rule-d2', title: 'Emergency Escalation', description: 'Immediate escalation for dental trauma (avulsed tooth) or facial swelling causing difficulty breathing or swallowing.', severity: 'critical' },
    { id: 'rule-d3', title: 'Medical History Prompt', description: 'Always ask "Are there any medical conditions we should be aware of?" when booking new patients.', severity: 'warning' },
    { id: 'rule-d4', title: 'Cost Estimates', description: 'Only provide starting prices as listed in the KB. Emphasize that exact costs require clinical examination.', severity: 'info' },
    { id: 'rule-d5', title: 'Relieve Anxiety', description: 'Use comforting language. Never use words like "painful", "scary", or "drill".', severity: 'info' }
  ],

  inputVariables: [
    { token: 'patient_name', label: 'Patient Name', fallback: 'Patient' },
    { token: 'last_visit_date', label: 'Last Visit Date', fallback: 'your last appointment' },
    { token: 'assigned_dentist', label: 'Assigned Dentist', fallback: 'your dentist' },
    { token: 'clinic_branch', label: 'Clinic Branch', fallback: 'our clinic' }
  ]
};
