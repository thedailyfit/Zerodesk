import {
  LayoutDashboard, MessageSquare, Users, Target, Calendar, BookOpen, BarChart3, Phone,
  MessageCircle, Workflow, Settings, FileText, Receipt, TrendingUp, CreditCard,
  CalendarDays, Clock, Cpu, PhoneIncoming,
  Megaphone, Activity, Laptop, Sparkles, Bot, Link2, Headphones
} from 'lucide-react';
import type { NicheConfig } from './types';

export const AUTOMOBILE_SHOWROOM_CONFIG: NicheConfig = {
  id: 'auto',
  label: 'Automobile Showroom',
  tagline: 'AI-Powered Showroom Assistant & Sales CRM',
  icon: 'Car',
  accentColor: 'text-amber-500',
  accentColorRGB: '245, 158, 11',
  gradientFrom: 'from-amber-500',
  gradientTo: 'to-amber-600',

  terminology: {
    customer: 'Buyer',
    customers: 'Buyers & Prospects',
    appointment: 'Test Drive',
    appointments: 'Test Drives & Service Bookings',
    service: 'Service',
    services: 'Services & Packages',
    staff: 'Sales Executive',
    waitingRoom: 'Customer Lounge',
    patientFiles: 'Customer Files',
    calendar: 'Showroom Calendar',
    billing: 'Sales & Invoicing',
    overview: 'Business Health'
  },

  roles: [
    { id: 'ADMIN', label: 'Admin', description: 'Full access to business analytics, revenue, settings, and staff.', icon: 'Shield' },
    { id: 'MANAGER', label: 'Showroom Manager', description: 'Access to operations, lead management, and team performance.', icon: 'Users' },
    { id: 'FINANCE_MANAGER', label: 'Finance Manager', description: 'Access to financing, loans, and revenue operations.', icon: 'CreditCard' },
    { id: 'SALES', label: 'Sales Executive', description: 'Manage pipeline, test drives, and prospect follow-ups.', icon: 'Target' },
    { id: 'SERVICE', label: 'Service Advisor', description: 'Manage service bookings and customer updates.', icon: 'Workflow' }
  ],

  navItems: [
    { name: 'Ask AI Frontdesk', href: '/ask-ai', icon: Bot, roles: ['ADMIN'] },
    { name: 'Business Health', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER'] },
    
    { name: 'Sales & CRM', roles: ['ADMIN', 'MANAGER', 'SALES'], divider: true },
    { name: 'Automated Leads', href: '/crm', icon: Target, roles: ['ADMIN', 'MANAGER', 'SALES'] },
    { name: 'Test Drives & Bookings', href: '/appointments', icon: CalendarDays, roles: ['ADMIN', 'MANAGER', 'SALES', 'SERVICE'] },
    { name: 'Showroom Calendar', href: '/calendar', icon: Calendar, roles: ['ADMIN', 'MANAGER', 'SALES', 'SERVICE'] },
    { name: 'Book Test Drive', href: '/book-appointment', icon: BookOpen, roles: ['ADMIN', 'SALES', 'SERVICE'] },
    { name: 'Customer Lounge', href: '/waiting-room', icon: Clock, roles: ['ADMIN', 'MANAGER', 'SALES', 'SERVICE'] },
    { name: 'Buyer Management', href: '/customers', icon: Users, roles: ['ADMIN', 'MANAGER', 'SALES', 'SERVICE'] },
    { name: 'Customer Files', href: '/profiles', icon: FileText, roles: ['ADMIN', 'MANAGER', 'SALES', 'SERVICE'] },
    
    { name: 'Services & Finance', roles: ['ADMIN', 'MANAGER', 'FINANCE_MANAGER', 'SERVICE'], divider: true },
    { name: 'Booking Link', href: '/booking-link', icon: Link2, roles: ['ADMIN'] },
    { name: 'Services & Packages', href: '/services', icon: Sparkles, roles: ['ADMIN', 'MANAGER', 'SERVICE'] },
    { name: 'Quick Billing', href: '/billing', icon: Receipt, roles: ['ADMIN', 'MANAGER', 'FINANCE_MANAGER'] },
    { name: 'Invoices', href: '/invoices', icon: CreditCard, roles: ['ADMIN', 'MANAGER', 'FINANCE_MANAGER'] },

    { name: 'AI & Communications', roles: ['ADMIN', 'MANAGER'], divider: true },
    { name: 'Voice AI', href: '/voice', icon: Cpu, roles: ['ADMIN', 'MANAGER'] },
    { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle, roles: ['ADMIN', 'MANAGER', 'SALES'] },
    { name: 'WebChat', href: '/conversations', icon: MessageSquare, roles: ['ADMIN', 'MANAGER', 'SALES'] },
    { name: 'Inbound Calls', href: '/inbound-calls', icon: PhoneIncoming, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Outbound Campaigns', href: '/outbound-campaigns', icon: Megaphone, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Templates', href: '/templates', icon: FileText, roles: ['ADMIN', 'MANAGER'] },

    { name: 'Operations', roles: ['ADMIN', 'MANAGER'], divider: true },
    { name: 'Automations', href: '/automations', icon: Workflow, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Teams', href: '/teams', icon: Users, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Staff Calendar', href: '/staff-calendar', icon: CalendarDays, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Phone Numbers', href: '/phone-numbers', icon: Phone, roles: ['ADMIN', 'MANAGER'] },

    { name: 'Analytics', roles: ['ADMIN', 'MANAGER'], divider: true },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Agent Analytics', href: '/agent-analytics', icon: Activity, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Sales Overview', href: '/todays-revenue', icon: TrendingUp, roles: ['ADMIN', 'MANAGER'] },

    { name: 'Knowledge Hub', roles: ['ADMIN'], divider: true },
    { name: 'Voice AI Knowledge Hub', href: '/voice-knowledge-hub', icon: Cpu, roles: ['ADMIN'] },
    { name: 'WebChat Knowledge Hub', href: '/webchat-knowledge-hub', icon: MessageSquare, roles: ['ADMIN'] },
    { name: 'WhatsApp Knowledge Hub', href: '/whatsapp-knowledge-hub', icon: MessageCircle, roles: ['ADMIN'] }
  ],

  kpis: [
    { label: 'Total Test Drives Today', value: '12', change: '+8.5%', trend: 'up' },
    { label: 'Monthly Sales Revenue', value: '₹2.8 Cr', change: '+15.2%', trend: 'up' },
    { label: 'Walk-in Conversion', value: '34%', change: '+3.1%', trend: 'up' },
    { label: 'Active Leads', value: '156', change: '-2.0%', trend: 'down' }
  ],

  templates: [
    {
      id: 'wa-test-drive-conf',
      title: 'Test Drive Confirmation',
      category: 'Appointment',
      channel: 'WHATSAPP',
      content: 'Hi {{customer_name}}, your test drive for the {{vehicle_model}} is confirmed for {{test_drive_time}} on {{booking_date}} at {{showroom_location}}. Please bring your valid driving license.',
      isPreinstalled: true,
      variables: ['customer_name', 'vehicle_model', 'test_drive_time', 'booking_date', 'showroom_location']
    },
    {
      id: 'wa-service-reminder',
      title: 'Service Reminder',
      category: 'Service',
      channel: 'WHATSAPP',
      content: 'Hello {{customer_name}}, your {{vehicle_model}} is due for its periodic maintenance service. Please reply to this message to book your slot with your advisor {{service_advisor}}.',
      isPreinstalled: true,
      variables: ['customer_name', 'vehicle_model', 'service_advisor']
    },
    {
      id: 'wa-insurance-alert',
      title: 'Insurance Renewal Alert',
      category: 'Finance',
      channel: 'WHATSAPP',
      content: 'Hi {{customer_name}}, the insurance for your {{vehicle_model}} is expiring soon. Renew now to avoid break in policy. Contact our finance desk for the best quotes.',
      isPreinstalled: true,
      variables: ['customer_name', 'vehicle_model']
    },
    {
      id: 'wa-launch-promo',
      title: 'New Model Launch Promo',
      category: 'Marketing',
      channel: 'WHATSAPP',
      content: 'Exciting news {{customer_name}}! The all-new {{vehicle_model}} has arrived at {{showroom_location}}. Visit us this weekend for an exclusive preview and special launch offers.',
      isPreinstalled: true,
      variables: ['customer_name', 'vehicle_model', 'showroom_location']
    },
    {
      id: 'wa-emi-reminder',
      title: 'EMI Payment Reminder',
      category: 'Finance',
      channel: 'WHATSAPP',
      content: 'Dear {{customer_name}}, this is a gentle reminder regarding your upcoming EMI payment of {{emi_amount}} for your {{vehicle_model}}.',
      isPreinstalled: true,
      variables: ['customer_name', 'emi_amount', 'vehicle_model']
    },
    {
      id: 'wa-after-service',
      title: 'After-Service Feedback',
      category: 'Feedback',
      channel: 'WHATSAPP',
      content: 'Hi {{customer_name}}, thank you for servicing your {{vehicle_model}} with us! How was your experience with {{service_advisor}}? Reply with 1 (Poor) to 5 (Excellent).',
      isPreinstalled: true,
      variables: ['customer_name', 'vehicle_model', 'service_advisor']
    },
    {
      id: 'wa-festival-offer',
      title: 'Festival Special Offer',
      category: 'Marketing',
      channel: 'WHATSAPP',
      content: 'Celebrate the festive season with us, {{customer_name}}! Enjoy exclusive discounts on {{vehicle_model}} accessories and zero processing fees on loans at {{showroom_location}}.',
      isPreinstalled: true,
      variables: ['customer_name', 'vehicle_model', 'showroom_location']
    }
  ],

  knowledgeBaseDocs: [
    {
      id: 'kb-vehicle-lineup',
      title: 'Vehicle Lineup & Specs',
      category: 'SERVICE',
      content: 'Comprehensive details on all available models, trim levels, engine specifications, fuel efficiency, and key features. Includes EV range and charging times.',
      chunks: 15,
      isActive: true,
      updatedAt: '2026-08-01T10:00:00Z'
    },
    {
      id: 'kb-pricing-ex-showroom',
      title: 'Pricing & Ex-Showroom Rates',
      category: 'PRICING',
      content: 'Current ex-showroom prices for all models and variants. Do not quote on-road prices directly as they vary by registration state and chosen insurance.',
      chunks: 8,
      isActive: true,
      updatedAt: '2026-08-15T12:00:00Z'
    },
    {
      id: 'kb-finance-faq',
      title: 'Finance & EMI Options FAQ',
      category: 'FAQ',
      content: 'Details on partnered banks, current interest rates, down payment requirements, loan tenures up to 7 years, and required documentation for loan approval.',
      chunks: 10,
      isActive: true,
      updatedAt: '2026-07-20T09:00:00Z'
    },
    {
      id: 'kb-insurance-plans',
      title: 'Insurance Plans',
      category: 'FAQ',
      content: 'Information on comprehensive vs third-party insurance, zero depreciation add-ons, engine protect covers, and cashless garage networks.',
      chunks: 7,
      isActive: true,
      updatedAt: '2026-08-10T14:30:00Z'
    },
    {
      id: 'kb-service-sops',
      title: 'Service Center SOPs',
      category: 'SERVICE',
      content: 'Standard operating procedures for periodic maintenance, warranty claims, accident repairs, and general service intervals (e.g., 10,000 km or 1 year).',
      chunks: 12,
      isActive: true,
      updatedAt: '2026-06-10T11:15:00Z'
    },
    {
      id: 'kb-dealer-margins',
      title: 'Restricted: Dealer Margin Guidelines',
      category: 'RESTRICTED_GUIDELINES',
      content: 'Internal guidelines on dealer margins, maximum permissible discounts per model, and sales executive incentives. Strictly confidential.',
      chunks: 5,
      isActive: true,
      updatedAt: '2026-05-25T16:45:00Z'
    }
  ],

  automationPresets: [
    { title: 'Post-Test Drive Follow-up Sequence', trigger: 'Test Drive Completed', desc: 'Automated follow-up messages requesting feedback and offering a booking consultation.', category: 'Sales' },
    { title: 'Service Due Reminder Pipeline', trigger: '6 Months Since Service', desc: 'Multi-channel sequence (Email/WhatsApp) reminding customers to book their next service.', category: 'Service' },
    { title: 'Insurance Renewal Recovery', trigger: 'Insurance Expires in 30 Days', desc: 'Automated alerts and offers to renew insurance policies before they lapse.', category: 'Finance' },
    { title: 'Abandoned Inquiry Re-engagement', trigger: 'Lead Inactive > 14 Days', desc: 'Re-engage cold leads with a special promotional offer or an invitation for a second test drive.', category: 'Conversion' }
  ],

  initialWorkflows: [
    {
      id: 'wf-auto-1',
      name: 'Post-Test Drive Nurture',
      triggerEvent: 'Test Drive Status: Completed',
      description: 'Follow up with prospects after a test drive to secure a booking.',
      steps: [
        { type: 'TRIGGER', label: 'Test Drive Completed', detail: '' },
        { type: 'ACTION', label: 'WhatsApp', detail: 'Thank you message & feedback request' },
        { type: 'CONDITION', label: 'Wait 2 Days', detail: '' },
        { type: 'ACTION', label: 'Voice AI Call', detail: 'Check intent to book' }
      ],
      actionsCount: 2,
      isActive: true,
      lastRun: '1 hour ago',
      runs24h: 15,
      category: 'Sales'
    },
    {
      id: 'wf-auto-2',
      name: 'Service Booking Reminder',
      triggerEvent: 'Service Due Date Approaching',
      description: 'Remind customers of upcoming scheduled maintenance.',
      steps: [
        { type: 'TRIGGER', label: '14 Days Before Service Due', detail: '' },
        { type: 'ACTION', label: 'WhatsApp', detail: 'Service reminder with booking link' },
        { type: 'CONDITION', label: 'If not booked in 7 days', detail: '' },
        { type: 'ACTION', label: 'Task', detail: 'Assign to Service Advisor for follow-up' }
      ],
      actionsCount: 2,
      isActive: true,
      lastRun: '5 hours ago',
      runs24h: 30,
      category: 'Service'
    },
    {
      id: 'wf-auto-3',
      name: 'Insurance Renewal Push',
      triggerEvent: 'Policy Expiry approaching',
      description: 'Ensure customers renew insurance through the dealership.',
      steps: [
        { type: 'TRIGGER', label: '30 Days to Expiry', detail: '' },
        { type: 'ACTION', label: 'Email', detail: 'Benefits of renewing with us' },
        { type: 'CONDITION', label: 'Wait 15 days', detail: '' },
        { type: 'ACTION', label: 'WhatsApp', detail: 'Urgent renewal reminder' }
      ],
      actionsCount: 2,
      isActive: true,
      lastRun: '1 day ago',
      runs24h: 8,
      category: 'Finance'
    }
  ],

  goldenPrompt: `You are AutoAssist AI, the premier virtual assistant for a high-end Automobile Showroom.
Your role is to act as a knowledgeable, enthusiastic, and highly professional showroom concierge. 
You assist prospective buyers with vehicle inquiries, booking test drives, exploring financing options, and helping existing customers schedule services.
Always maintain a courteous and premium tone. 
Never disclose internal dealer margins, maximum discount limits, or exact on-road prices (as taxes and insurance vary); instead, quote ex-showroom prices and direct customers to a Sales Executive for a final quotation.
If a customer asks complex insurance or financing questions, provide general information from your knowledge base and offer to have the Finance Manager call them.
Before confirming any test drive, remind the customer that a valid driving license is required.
Focus on highlighting vehicle safety, performance, and the premium dealership experience.`,

  tones: [
    { id: 'tone-prof-showroom', name: 'Professional Showroom', badge: 'Default', greeting: 'Welcome to our showroom! I am your AI concierge. How may I assist you with our vehicle lineup today?' },
    { id: 'tone-friendly-sales', name: 'Friendly Sales', badge: 'Casual', greeting: 'Hi there! Ready to find your dream car? Let me know if you want to book a test drive or explore models.' },
    { id: 'tone-exec-premium', name: 'Executive Premium', badge: 'Luxury', greeting: 'Greetings. Thank you for choosing our premium dealership. It is my pleasure to assist you with our exclusive vehicles.' },
    { id: 'tone-quick-service', name: 'Quick Service', badge: 'Fast', greeting: 'Hello! Need to book a service or check on your vehicle status? Let me help you right away.' }
  ],

  aiRules: [
    { id: 'rule-auto-1', title: 'Safety: Never disclose dealer margins', description: 'Internal pricing and margins are strictly confidential.', severity: 'critical' },
    { id: 'rule-auto-2', title: 'Pricing: Always quote ex-showroom price', description: 'Do not provide exact on-road prices due to tax and insurance variations.', severity: 'warning' },
    { id: 'rule-auto-3', title: 'Insurance: Refer complex queries to finance desk', description: 'Provide basic info but avoid binding insurance advice.', severity: 'info' },
    { id: 'rule-auto-4', title: 'Test Drive: Verify driving license', description: 'Always state that a valid driving license must be presented for a test drive.', severity: 'critical' },
    { id: 'rule-auto-5', title: 'Service: Recommend authorized parts', description: 'Always emphasize the use of genuine OEM parts for services.', severity: 'info' }
  ],

  inputVariables: [
    { token: 'customer_name', label: 'Buyer Name', fallback: 'Valued Customer' },
    { token: 'vehicle_model', label: 'Vehicle Model', fallback: 'our vehicle' },
    { token: 'booking_date', label: 'Booking Date', fallback: 'your scheduled date' },
    { token: 'test_drive_time', label: 'Test Drive Time', fallback: 'your scheduled time' },
    { token: 'emi_amount', label: 'EMI Amount', fallback: 'your EMI' },
    { token: 'service_advisor', label: 'Service Advisor', fallback: 'your advisor' },
    { token: 'showroom_location', label: 'Showroom Location', fallback: 'our showroom' }
  ]
};
