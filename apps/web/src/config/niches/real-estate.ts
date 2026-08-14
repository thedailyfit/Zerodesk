import type { NicheConfig } from './types';
import { 
  LayoutDashboard, MessageSquare, Users, Target, Calendar, BookOpen, BarChart3, Phone, 
  MessageCircle, Workflow, Settings, FileText, Rocket, Receipt, TrendingUp, CreditCard, 
  CalendarDays, Clock, Shield, IndianRupee, Heart, SmilePlus, Cpu, PhoneIncoming, 
  Megaphone, Activity, Laptop, AlertTriangle
} from 'lucide-react';

export const REAL_ESTATE_CONFIG: NicheConfig = {
  id: 'realestate',
  label: 'Real Estate',
  tagline: 'High-Conversion Property Sales OS',
  icon: 'Building2', // We will assume an icon exists in the UI but string is fine for config if not strict type
  accentColor: 'amber-600',
  accentColorRGB: '217, 119, 6',
  gradientFrom: 'amber-500',
  gradientTo: 'orange-600',

  terminology: {
    customer: 'Lead',
    customers: 'Prospects',
    appointment: 'Site Visit',
    appointments: 'Site Visits',
    service: 'Property Advisor',
    services: 'Consultations',
    staff: 'Sales Team',
    waitingRoom: 'Property Matrix',
    patientFiles: 'Lead Profiles',
    calendar: 'Site Visit Calendar',
    billing: 'Token/Booking',
    overview: 'Portfolio Overview',
  },

  roles: [
    { id: 'ADMIN', label: 'Owner (Admin)', description: 'Full access to property sales, revenue, settings, and staff.', icon: 'Shield' },
    { id: 'MANAGER', label: 'Sales Manager', description: 'Access to site visit calendar, lead pipeline, and team sales.', icon: 'Users' },
    { id: 'STAFF', label: 'Frontdesk Staff', description: 'Access to site visit bookings, lead inquiries, and chats.', icon: 'User' },
  ],

  navItems: [
    { name: 'Overview', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Teams', href: '/teams', icon: Users, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Site Visits', href: '/appointments', icon: CalendarDays, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Operational Delays', href: '/operational-delays', icon: AlertTriangle, roles: ['ADMIN', 'MANAGER'] },
    
    { name: 'Sales', roles: ['ADMIN', 'MANAGER'], divider: true },
    { name: 'Today\'s Revenue', href: '/todays-revenue', icon: IndianRupee, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Monthly Sales', href: '/monthly-sales', icon: TrendingUp, roles: ['ADMIN', 'MANAGER'] },
    
    { name: 'Properties', roles: ['ADMIN', 'STAFF'], divider: true },
    { name: 'Property Matrix', href: '/waiting-room', icon: Target, roles: ['ADMIN', 'STAFF'] },
    { name: 'Site Visit Calendar', href: '/calendar', icon: Calendar, roles: ['ADMIN', 'STAFF'] },
    { name: 'Lead Profiles', href: '/patient-files', icon: FileText, roles: ['ADMIN', 'STAFF'] },
    { name: 'Staff Calendar', href: '/staff-calendar', icon: CalendarDays, roles: ['ADMIN'] },
    
    { name: 'Frontdesk', roles: ['ADMIN', 'STAFF'], divider: true },
    { name: 'Token / Booking Bill', href: '/billing', icon: Receipt, roles: ['ADMIN', 'STAFF'] },
    { name: 'Invoices', href: '/invoices', icon: FileText, roles: ['ADMIN', 'STAFF'] },
    { name: 'Schedule Visit', href: '/appointments', icon: Clock, roles: ['ADMIN', 'STAFF'] },
    { name: 'Leads / Prospects', href: '/customers', icon: Users, roles: ['ADMIN', 'STAFF'] },
    { name: 'Conversations', href: '/conversations', icon: MessageSquare, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    
    { name: 'Automation', roles: ['ADMIN', 'MANAGER'], divider: true },
    { name: 'Automations', href: '/automations', icon: Workflow, roles: ['ADMIN'] },
    { name: 'Lead Management', href: '/crm', icon: Target, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Lead LTV', href: '/patient-ltv', icon: Heart, roles: ['ADMIN', 'MANAGER'] },
    { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Ready to Scale', href: '/scale', icon: Rocket, roles: ['ADMIN'] },

    { name: 'Voice Telephony', roles: ['ADMIN'], divider: true },
    { name: 'Voice AI Agent', href: '/voice', icon: Cpu, roles: ['ADMIN'] },
    { name: 'Phone Numbers', href: '/phone-numbers', icon: Phone, roles: ['ADMIN'] },
    { name: 'Inbound Calls', href: '/inbound-calls', icon: PhoneIncoming, roles: ['ADMIN'] },
    { name: 'Outbound Campaigns', href: '/outbound-campaigns', icon: Megaphone, roles: ['ADMIN'] },
    { name: 'Agent Analytics', href: '/agent-analytics', icon: Activity, roles: ['ADMIN'] },

    { name: 'Backend AI', roles: ['ADMIN'], divider: true },
    { name: 'Voice AI Knowledge Hub', href: '/voice-knowledge-hub', icon: Cpu, roles: ['ADMIN'] },
    { name: 'Company Knowledge Base', href: '/knowledge-base', icon: BookOpen, roles: ['ADMIN'] },
    { name: 'Templates', href: '/templates', icon: FileText, roles: ['ADMIN'] },

    { name: 'System', roles: ['ADMIN'], divider: true },
    { name: 'Windows Desktop App', href: '/desktop-app', icon: Laptop, roles: ['ADMIN'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN'] }
  ],

  kpis: [
    { label: 'Lead-to-Visit Rate', value: '32%', change: '+4.2%', trend: 'up' },
    { label: 'Visit-to-Booking Ratio', value: '12%', change: '+1.5%', trend: 'up' },
    { label: 'Avg Sales Cycle', value: '45 days', change: '-3 days', trend: 'down' },
    { label: 'Cost Per Lead', value: '₹850', change: '-₹45', trend: 'down' },
  ],

  templates: [
    {
      id: 'wa-brochure', title: 'Instant Brochure + Location', category: 'WhatsApp', channel: 'WHATSAPP',
      content: 'Hi {{lead_name}}, thank you for your interest in {{property_type}} at {{preferred_location}}. Please find the e-brochure and exact site location map attached. Let me know when you would like to schedule a site visit!',
      mediaAttachment: 'PDF', isPreinstalled: true, variables: ['lead_name', 'property_type', 'preferred_location']
    },
    {
      id: 'wa-cab-dispatch', title: 'Site Visit Cab Dispatch', category: 'WhatsApp', channel: 'WHATSAPP',
      content: 'Hello {{lead_name}}, your cab for the site visit to {{preferred_location}} has been dispatched. Driver details: Ramesh, +91-9876543210. Looking forward to showing you the property!',
      mediaAttachment: 'NONE', isPreinstalled: true, variables: ['lead_name', 'preferred_location']
    },
    {
      id: 'wa-cost-sheet', title: 'Post-Visit Cost Sheet', category: 'WhatsApp', channel: 'WHATSAPP',
      content: 'Hi {{lead_name}}, it was great meeting you today! As discussed, please find the detailed cost sheet and payment plan for the {{property_type}} within your budget range of {{budget_range}}. Let me know if you need any clarification.',
      mediaAttachment: 'PDF', isPreinstalled: true, variables: ['lead_name', 'property_type', 'budget_range']
    },
    {
      id: 'wa-milestone', title: 'Construction Milestone', category: 'WhatsApp', channel: 'WHATSAPP',
      content: 'Dear {{lead_name}}, we are thrilled to inform you that the 5th-floor slab for your future home at {{preferred_location}} has been completed successfully! See the latest site photos attached.',
      mediaAttachment: 'IMAGE', isPreinstalled: true, variables: ['lead_name', 'preferred_location']
    },
    {
      id: 'email-launch', title: 'Project Launch Invite', category: 'Email', channel: 'EMAIL',
      subject: 'Exclusive Pre-Launch Invite: Luxury {{property_type}} in {{preferred_location}}',
      content: 'Dear {{lead_name}},\n\nBe the first to experience our newest luxury project in {{preferred_location}}. We are offering exclusive pre-launch pricing for premium {{property_type}} starting in your {{budget_range}} budget.\n\nReply to this email or call us to reserve your VIP preview slot.\n\nBest,\nProperty Team',
      mediaAttachment: 'NONE', isPreinstalled: true, variables: ['lead_name', 'property_type', 'preferred_location', 'budget_range']
    },
    {
      id: 'email-cost', title: 'Cost Breakdown PDF', category: 'Email', channel: 'EMAIL',
      subject: 'Your Personalized Cost Breakdown for {{property_type}}',
      content: 'Hi {{lead_name}},\n\nFollowing our discussion, please find attached the detailed cost breakdown for the {{property_type}}, including base price, amenities, car parking, and estimated stamp duty.\n\nLooking forward to helping you secure your dream home.\n\nWarm Regards,\nSales Advisory Team',
      mediaAttachment: 'PDF', isPreinstalled: true, variables: ['lead_name', 'property_type']
    },
    {
      id: 'email-rera', title: 'RERA Documentation', category: 'Email', channel: 'EMAIL',
      subject: 'RERA Compliance & Project Details - {{preferred_location}}',
      content: 'Dear {{lead_name}},\n\nTransparency is our priority. Attached are the official RERA certificates and compliance documents for our upcoming project in {{preferred_location}}. Please review them at your convenience.\n\nRegards,\nDocumentation Team',
      mediaAttachment: 'PDF', isPreinstalled: true, variables: ['lead_name', 'preferred_location']
    },
    {
      id: 'voice-consultative', title: 'Consultative Advisor', category: 'Voice', channel: 'VOICE',
      content: 'Hello {{lead_name}}, this is your property advisor from ZeroDesk. I noticed you were exploring {{property_type}} options in {{preferred_location}}. Given your budget of {{budget_range}}, I have a few exclusive unlisted inventories that perfectly match your criteria. When is a good time for a quick 5-minute chat to discuss these?',
      isPreinstalled: true, variables: ['lead_name', 'property_type', 'preferred_location', 'budget_range']
    },
    {
      id: 'voice-weekend', title: 'Weekend Site Visit Scheduler', category: 'Voice', channel: 'VOICE',
      content: 'Hi {{lead_name}}! The weekend is approaching, and it is the perfect time to visit our newly launched {{property_type}} model apartments in {{preferred_location}}. We are also arranging complimentary pick-up and drop-off. Should I block a slot for you this Saturday or Sunday?',
      isPreinstalled: true, variables: ['lead_name', 'property_type', 'preferred_location']
    },
    {
      id: 'voice-nri', title: 'NRI Investment Inquiry', category: 'Voice', channel: 'VOICE',
      content: 'Greetings {{lead_name}}, calling from the premium investment desk. We have a highly lucrative {{property_type}} commercial asset class launching soon in {{preferred_location}} with guaranteed rental yields. Would you like to schedule a virtual tour and presentation with our investment director?',
      isPreinstalled: true, variables: ['lead_name', 'property_type', 'preferred_location']
    }
  ],

  knowledgeBaseDocs: [
    { id: 'kb-portfolio', title: 'Project Portfolio Details', category: 'SERVICE', content: 'Comprehensive list of all ongoing and completed projects, including BHK configurations, carpet area, super built-up area, and premium amenities like clubhouse, pool, and gym.', chunks: 15, isActive: true, updatedAt: '2026-08-10' },
    { id: 'kb-buyer-guide', title: 'Home Buyer Guide India', category: 'FAQ', content: 'A step-by-step guide for first-time home buyers in India, covering shortlisting, legal checks, home loans, registration, and possession processes.', chunks: 12, isActive: true, updatedAt: '2026-08-01' },
    { id: 'kb-rera', title: 'RERA Compliance', category: 'RESTRICTED_GUIDELINES', content: 'Mandatory guidelines for agents and developers under the Real Estate (Regulation and Development) Act, including rules for carpet area pricing, project delivery timelines, and penalties.', chunks: 8, isActive: true, updatedAt: '2026-07-15' },
    { id: 'kb-hyd-infra', title: 'Hyderabad Infrastructure', category: 'SERVICE', content: 'Updates on upcoming infrastructure in Hyderabad, including Metro Phase 2, Regional Ring Road (RRR), IT corridors in Gachibowli and Kokapet, and future growth prospects.', chunks: 10, isActive: true, updatedAt: '2026-08-05' },
    { id: 'kb-cancellation', title: 'Booking Cancellation Terms', category: 'SOP', content: 'Standard operating procedures and refund policies for booking cancellations, including token amount deduction percentages and processing timelines.', chunks: 5, isActive: true, updatedAt: '2026-06-20' },
    { id: 'kb-loan-eligibility', title: 'Home Loan Eligibility', category: 'FAQ', content: 'Details on major banking partners (SBI, HDFC, ICICI), current interest rates, required documents for salaried vs. self-employed, and EMI calculation formulas.', chunks: 9, isActive: true, updatedAt: '2026-08-11' },
    { id: 'kb-vastu', title: 'Vastu Compliance Guide', category: 'SERVICE', content: 'Overview of standard Vastu principles for home buyers, explaining significance of East/North facing entrances, kitchen placements, and master bedroom locations.', chunks: 7, isActive: true, updatedAt: '2026-07-30' },
    { id: 'kb-stamp-duty', title: 'Stamp Duty Calculator', category: 'PRICING', content: 'Current stamp duty and registration charge percentages across major states/cities, with specific calculations for men vs. women property ownership.', chunks: 6, isActive: true, updatedAt: '2026-08-08' },
  ],

  automationPresets: [
    { title: 'Instant Brochure Drop', trigger: 'Lead Created', desc: 'Sends PDF brochure immediately when a new lead enters the CRM.', category: 'Engagement' },
    { title: 'Site Visit Cab + Reminder', trigger: '24hrs before Site Visit', desc: 'Schedules a cab and sends a WhatsApp reminder with driver details.', category: 'Operations' },
    { title: 'Post-Visit Cost Push', trigger: 'Site Visit Completed', desc: 'Automatically dispatches a personalized cost sheet 1 hour after the visit.', category: 'Sales' },
    { title: 'Dormant Lead Re-engagement', trigger: 'No Activity > 14 days', desc: 'Sends an exclusive offer or project update to reactivate cold leads.', category: 'Marketing' },
  ],

  initialWorkflows: [
    { id: 'wf-1', name: 'New Lead Nurturing', triggerEvent: 'Lead Captured', description: 'Multi-day sequence of WhatsApp and Voice calls for fresh prospects.', steps: [{ type: 'TRIGGER', label: 'Lead Source: Facebook Ads', detail: 'Triggered when lead form is submitted' }, { type: 'ACTION', label: 'Send WhatsApp', detail: 'Instant Brochure Drop' }, { type: 'ACTION', label: 'Assign Agent', detail: 'Round-robin assignment' }], actionsCount: 3, isActive: true, lastRun: '10 mins ago', runs24h: 45, category: 'Sales' },
    { id: 'wf-2', name: 'Site Visit Confirmation', triggerEvent: 'Visit Scheduled', description: 'Ensures high turn-up rate for scheduled weekend site visits.', steps: [{ type: 'TRIGGER', label: 'Visit Added to Calendar', detail: 'Triggers on new calendar event' }, { type: 'ACTION', label: 'Send SMS', detail: 'Confirmation with map link' }, { type: 'CONDITION', label: 'If Cab Requested', detail: 'Branch logic' }], actionsCount: 4, isActive: true, lastRun: '1 hour ago', runs24h: 12, category: 'Operations' },
    { id: 'wf-3', name: 'Post-Visit Follow Up', triggerEvent: 'Visit Completed', description: 'Follow up to negotiate and close the booking after a successful visit.', steps: [{ type: 'TRIGGER', label: 'Status changed to Visited', detail: 'Agent updates CRM' }, { type: 'ACTION', label: 'Send Cost Sheet', detail: 'WhatsApp PDF attachment' }, { type: 'ACTION', label: 'Schedule Call', detail: 'Follow-up call in 2 days' }], actionsCount: 3, isActive: true, lastRun: 'Yesterday', runs24h: 8, category: 'Sales' },
    { id: 'wf-4', name: 'KYC & Booking Collection', triggerEvent: 'Token Received', description: 'Automates the collection of PAN, Aadhar, and booking forms.', steps: [{ type: 'TRIGGER', label: 'Payment Received', detail: 'Token amount credited' }, { type: 'ACTION', label: 'Send Email', detail: 'Request for KYC documents' }, { type: 'ACTION', label: 'Notify Backend', detail: 'Alert Documentation Team' }], actionsCount: 3, isActive: false, lastRun: 'Never', runs24h: 0, category: 'Operations' },
  ],

  goldenPrompt: "You are PropertyAI, a highly consultative, authoritative, and persuasive Real Estate Advisor for the Indian market, specifically Hyderabad. Your goal is to qualify leads, understand their budget, location preferences, and family size, and expertly guide them toward booking a site visit. You must never sound like a generic bot; use a professional yet warm tone. Always emphasize transparency, RERA compliance, and ROI. Do not make false promises about appreciation or discounts. If asked complex legal questions, politely suggest connecting with the legal team. Always end by suggesting a site visit as the logical next step.",

  tones: [
    { id: 'tone-professional', name: 'Professional Consultant', badge: 'Default', greeting: 'Hello, this is your property advisor. How may I assist you with your investment today?' },
    { id: 'tone-luxury', name: 'Luxury Property Expert', badge: 'HNI/NRI', greeting: 'Greetings, I am your dedicated luxury real estate director. Let us explore some exclusive premium assets.' },
    { id: 'tone-weekend', name: 'Weekend Friendly', badge: 'Casual', greeting: 'Hi there! Planning to buy a home this weekend? I can help you shortlist the best projects.' },
  ],

  aiRules: [
    { id: 'rule-rera', title: 'RERA Disclosure Mandatory', description: 'Always mention that our projects are fully RERA compliant when discussing new launches.', severity: 'critical' },
    { id: 'rule-no-false', title: 'No False Promises', description: 'Never guarantee specific percentage returns or capital appreciation. Use phrases like "historically strong growth".', severity: 'critical' },
    { id: 'rule-price-transparency', title: 'Price Transparency', description: 'Always clarify that quoted base prices exclude stamp duty, registration, and GST.', severity: 'warning' },
    { id: 'rule-push-visit', title: 'Push for Site Visit', description: 'The ultimate goal of every conversation should be scheduling a physical or virtual site visit.', severity: 'info' },
    { id: 'rule-vastu', title: 'Respect Vastu Preferences', description: 'If a user mentions Vastu, acknowledge its importance and confirm that we have compliant units available.', severity: 'info' },
  ],

  inputVariables: [
    { token: 'lead_name', label: 'Lead Name', fallback: 'Valued Client' },
    { token: 'preferred_location', label: 'Preferred Location', fallback: 'our premium locations' },
    { token: 'budget_range', label: 'Budget Range', fallback: 'your budget' },
    { token: 'property_type', label: 'Property Type', fallback: 'property' },
  ]
};
