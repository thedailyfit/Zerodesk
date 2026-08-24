import type { NicheConfig } from './types';
import { 
  LayoutDashboard, MessageSquare, Users, Target, Calendar, BookOpen, BarChart3, Phone, 
  MessageCircle, Workflow, Settings, FileText, Rocket, Receipt, TrendingUp, 
  CalendarDays, Clock, IndianRupee, Heart, Cpu, PhoneIncoming, 
  Megaphone, Activity, Laptop, AlertTriangle, Sparkles, Bot, Link2, Headphones, UserCheck
} from 'lucide-react';

export const HOTEL_RESORT_CONFIG: NicheConfig = {
  id: 'hotel',
  label: 'Hotel',
  tagline: 'Next-Gen Hospitality Operations OS',
  icon: 'Building', // Using Building as approximation
  accentColor: 'text-blue-600',
  accentColorRGB: '37, 99, 235',
  gradientFrom: 'from-blue-600',
  gradientTo: 'to-blue-800',

  terminology: {
    customer: 'Guest',
    customers: 'Guests',
    appointment: 'Reservation',
    appointments: 'Reservations',
    service: 'Service / Amenity',
    services: 'Services & Amenities',
    staff: 'Hotel Staff',
    waitingRoom: 'Check-in Lobby',
    patientFiles: 'Guest Profiles',
    calendar: 'Room Occupancy Chart',
    billing: 'Folio',
    overview: 'Business Health',
  },

  roles: [
    { id: 'ADMIN', label: 'Owner (Admin)', description: 'Full access to property operations, revenue, settings, and staff.', icon: 'Shield' },
    { id: 'MANAGER', label: 'General Manager', description: 'Access to bookings, room occupancy, guest management, and analytics.', icon: 'Users' },
    { id: 'STAFF', label: 'Frontdesk Staff', description: 'Access to check-ins, room bookings, folios, and guest chats.', icon: 'User' },
  ],

  navItems: [
    { name: 'Ask AI Frontdesk', href: '/ask-ai', icon: Bot, roles: ['ADMIN'] },
    { name: 'Business Health', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Teams', href: '/teams', icon: Users, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Reservations', href: '/appointments', icon: CalendarDays, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Operational Delays', href: '/operational-delays', icon: AlertTriangle, roles: ['ADMIN', 'MANAGER'] },
    
    { name: 'Sales', roles: ['ADMIN', 'MANAGER'], divider: true },
    { name: 'Today\'s Revenue', href: '/todays-revenue', icon: IndianRupee, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Monthly Sales', href: '/monthly-sales', icon: TrendingUp, roles: ['ADMIN', 'MANAGER'] },
    
    { name: 'Hospitality', roles: ['ADMIN', 'STAFF'], divider: true },
    { name: 'Room Rack (Tape Chart)', href: '/room-rack', icon: CalendarDays, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: 'Housekeeping', href: '/housekeeping', icon: Sparkles, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: 'Check-in Lobby', href: '/waiting-room', icon: Clock, roles: ['ADMIN', 'STAFF'] },
    { name: 'Room Occupancy Chart', href: '/calendar', icon: Calendar, roles: ['ADMIN', 'STAFF'] },
    { name: 'Guest Profiles', href: '/profiles', icon: FileText, roles: ['ADMIN', 'STAFF'] },
    { name: 'Staff Calendar', href: '/staff-calendar', icon: CalendarDays, roles: ['ADMIN'] },
    
    { name: 'Frontdesk', roles: ['ADMIN', 'STAFF'], divider: true },
    { name: 'Booking Link', href: '/booking-link', icon: Link2, roles: ['ADMIN'] },
    { name: 'Quick Bill / Folio', href: '/billing', icon: Receipt, roles: ['ADMIN', 'STAFF'] },
    { name: 'Services & Amenities', href: '/services', icon: Sparkles, roles: ['ADMIN', 'STAFF', 'MANAGER'] },
    { name: 'Invoices', href: '/invoices', icon: FileText, roles: ['ADMIN', 'STAFF'] },
    { name: 'Book Room', href: '/book-appointment', icon: BookOpen, roles: ['ADMIN', 'STAFF'] },
    { name: 'Guests', href: '/customers', icon: Users, roles: ['ADMIN', 'STAFF'] },
    { name: 'Conversations', href: '/conversations', icon: MessageSquare, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    
    { name: 'Automation', roles: ['ADMIN', 'MANAGER'], divider: true },
    { name: 'Automations', href: '/automations', icon: Workflow, roles: ['ADMIN'] },
    { name: 'Automated Leads', href: '/crm', icon: Target, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Guest LTV', href: '/customer-value', icon: Heart, roles: ['ADMIN', 'MANAGER'] },
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
    { label: 'Occupancy Rate', value: '76%', change: '+5%', trend: 'up' },
    { label: 'RevPAR', value: '₹4,850', change: '+₹320', trend: 'up' },
    { label: 'ADR', value: '₹6,200', change: '+₹150', trend: 'up' },
    { label: 'Direct Booking Ratio', value: '42%', change: '+3%', trend: 'up' },
  ],

  templates: [
    {
      id: 'wa-pre-arrival', title: 'Pre-arrival digital check-in', category: 'WhatsApp', channel: 'WHATSAPP',
      content: 'Dear {{guest_name}}, we eagerly await your arrival on {{check_in_date}}. Beat the queue by completing your digital check-in and uploading ID proofs securely here: [Link]. We have reserved a beautiful {{room_type}} for you.',
      mediaAttachment: 'NONE', isPreinstalled: true, variables: ['guest_name', 'check_in_date', 'room_type']
    },
    {
      id: 'wa-in-stay', title: 'In-stay concierge + WiFi', category: 'WhatsApp', channel: 'WHATSAPP',
      content: 'Welcome to your {{room_type}}, {{guest_name}}! Connect to our complimentary WiFi using the password: STAYWITHUS. If you need room service, housekeeping, or any concierge assistance, just reply to this message.',
      mediaAttachment: 'NONE', isPreinstalled: true, variables: ['guest_name', 'room_type']
    },
    {
      id: 'wa-express-checkout', title: 'Express checkout folio', category: 'WhatsApp', channel: 'WHATSAPP',
      content: 'Good morning {{guest_name}}, we hope you enjoyed your stay! To save time, please review your express checkout folio attached. You can pay securely via the link inside. Have a safe onward journey!',
      mediaAttachment: 'PDF', isPreinstalled: true, variables: ['guest_name']
    },
    {
      id: 'wa-review', title: 'Post-stay review request', category: 'WhatsApp', channel: 'WHATSAPP',
      content: 'Dear {{guest_name}}, thank you for choosing our hotel. We strive to provide exceptional experiences. Could you please take 1 minute to rate your stay with us? [Link]',
      mediaAttachment: 'NONE', isPreinstalled: true, variables: ['guest_name']
    },
    {
      id: 'email-booking-conf', title: 'Booking confirmation', category: 'Email', channel: 'EMAIL',
      subject: 'Booking Confirmation: We look forward to welcoming you, {{guest_name}}!',
      content: 'Dear {{guest_name}},\n\nYour reservation for a {{room_type}} arriving on {{check_in_date}} is confirmed. Please find your booking details and hotel policies attached. We are delighted you chose to stay with us through {{booking_source}}.\n\nWarm Regards,\nReservations Team',
      mediaAttachment: 'PDF', isPreinstalled: true, variables: ['guest_name', 'room_type', 'check_in_date', 'booking_source']
    },
    {
      id: 'email-itinerary', title: 'Pre-arrival itinerary', category: 'Email', channel: 'EMAIL',
      subject: 'Enhance your upcoming stay on {{check_in_date}}',
      content: 'Hi {{guest_name}},\n\nTo make your upcoming stay memorable, our concierge has curated a list of must-do activities and dining experiences at our property. Would you like to pre-book a spa session or a dinner reservation?\n\nBest,\nConcierge Desk',
      mediaAttachment: 'NONE', isPreinstalled: true, variables: ['guest_name', 'check_in_date']
    },
    {
      id: 'email-thankyou', title: 'Post-stay thank you', category: 'Email', channel: 'EMAIL',
      subject: 'Thank you for staying with us, {{guest_name}}',
      content: 'Dear {{guest_name}},\n\nIt was a pleasure hosting you. We hope our hospitality met your expectations. As a token of our appreciation, please find a 15% discount voucher for your next direct booking attached.\n\nSincerely,\nGeneral Manager',
      mediaAttachment: 'PDF', isPreinstalled: true, variables: ['guest_name']
    },
    {
      id: 'voice-concierge', title: 'Warm hotel concierge', category: 'Voice', channel: 'VOICE',
      content: 'Namaste {{guest_name}}, this is the virtual concierge desk. I see you are checking in on {{check_in_date}} for your {{room_type}}. Can I assist you in arranging an airport pickup, or perhaps making a dinner reservation at our specialty restaurant for your first evening?',
      isPreinstalled: true, variables: ['guest_name', 'check_in_date', 'room_type']
    },
    {
      id: 'voice-corporate', title: 'Corporate booking', category: 'Voice', channel: 'VOICE',
      content: 'Hello {{guest_name}}, calling from the corporate reservations desk. Thank you for booking via {{booking_source}}. We have noted your preference for an early check-in. Our business center and meeting rooms are fully operational if you need to host clients during your stay.',
      isPreinstalled: true, variables: ['guest_name', 'booking_source']
    },
    {
      id: 'voice-banquet', title: 'Wedding/banquet inquiry', category: 'Voice', channel: 'VOICE',
      content: 'Greetings {{guest_name}}, thank you for inquiring about our banquet spaces. Whether it is a grand wedding or a corporate offsite, our expansive lawns and halls can cater to your needs. When is a good time for our event coordinator to call you and discuss customized packages?',
      isPreinstalled: true, variables: ['guest_name']
    }
  ],

  knowledgeBaseDocs: [
    { id: 'kb-checkin', title: 'Check-in/out policies', category: 'SOP', content: 'Standard check-in time is 2:00 PM and check-out is 12:00 PM. Early check-in or late check-out is subject to availability and may incur additional charges. Mandatory presentation of valid Govt ID.', chunks: 5, isActive: true, updatedAt: '2026-08-01' },
    { id: 'kb-rooms', title: 'Room categories & amenities', category: 'SERVICE', content: 'Details of Standard, Deluxe, Club Rooms, and Suites. Includes square footage, bed configurations, view types (pool/city), and standard amenities like minibar, safe, and WiFi.', chunks: 12, isActive: true, updatedAt: '2026-08-05' },
    { id: 'kb-dining', title: 'Dining outlets', category: 'SERVICE', content: 'Information on the All-Day Dining restaurant, specialty Indian restaurant, and the lobby bar. Includes operating hours, dress codes, and average cost for two.', chunks: 8, isActive: true, updatedAt: '2026-07-20' },
    { id: 'kb-banquet', title: 'Banquet/event spaces', category: 'SERVICE', content: 'Capacities for the Grand Ballroom, meeting rooms, and outdoor lawn. Seating styles (cluster, theater, U-shape) and AV equipment availability.', chunks: 10, isActive: true, updatedAt: '2026-08-10' },
    { id: 'kb-id-rules', title: 'Government ID regulations', category: 'RESTRICTED_GUIDELINES', content: 'Mandatory ID rules per local police guidelines. Passports and Visas mandatory for foreign nationals. Aadhar, Voter ID, or Driving License accepted for Indian nationals. PAN card is NOT a valid ID for check-in.', chunks: 6, isActive: true, updatedAt: '2026-06-15' },
    { id: 'kb-airport', title: 'Airport shuttle', category: 'FAQ', content: 'Complimentary shuttle timings and pickup points. Paid private transfers via luxury sedans. Booking procedures and cancellation policies for transfers.', chunks: 4, isActive: true, updatedAt: '2026-07-30' },
    { id: 'kb-tourist', title: 'Tourist attractions', category: 'FAQ', content: 'Curated list of local tourist spots, distance from the hotel, entry timings, and recommended local transport options.', chunks: 7, isActive: true, updatedAt: '2026-08-02' },
    { id: 'kb-wedding', title: 'Wedding package pricing', category: 'PRICING', content: 'Base pricing for silver, gold, and platinum wedding packages. Includes menu options, basic decor, complimentary suite for the couple, and minimum guarantee clauses.', chunks: 9, isActive: true, updatedAt: '2026-08-11' },
  ],

  automationPresets: [
    { title: 'Pre-arrival check-in', trigger: '48hrs before Arrival', desc: 'Sends digital check-in link and requests ID uploads.', category: 'Front Office' },
    { title: 'In-stay WiFi push', trigger: 'Guest Checked In', desc: 'Automatically sends WiFi credentials and welcome message on WhatsApp.', category: 'Guest Services' },
    { title: 'Housekeeping SLA dispatch', trigger: 'Room Status = Dirty', desc: 'Alerts housekeeping staff to clean room upon checkout.', category: 'Operations' },
    { title: 'Express departure folio', trigger: 'Night before Checkout', desc: 'Emails the draft folio to the guest for express review.', category: 'Billing' },
  ],

  initialWorkflows: [
    { id: 'hwf-1', name: 'Digital Pre-Check-In', triggerEvent: 'Booking Confirmed', description: 'Guides guest to complete digital check-in formalities before arrival.', steps: [{ type: 'TRIGGER', label: 'Booking Sync', detail: 'From PMS/OTA' }, { type: 'ACTION', label: 'Send Email', detail: 'Booking confirmation' }, { type: 'ACTION', label: 'Send WhatsApp', detail: 'Digital check-in link' }], actionsCount: 3, isActive: true, lastRun: '15 mins ago', runs24h: 120, category: 'Front Office' },
    { id: 'hwf-2', name: 'In-Stay Issue Escalation', triggerEvent: 'Guest Complaint Logged', description: 'Escalates unaddressed guest complaints to the Duty Manager.', steps: [{ type: 'TRIGGER', label: 'Ticket Created', detail: 'Guest reports issue' }, { type: 'CONDITION', label: 'Wait 15 mins', detail: 'Check if resolved' }, { type: 'ACTION', label: 'SMS Duty Manager', detail: 'Escalation alert' }], actionsCount: 3, isActive: true, lastRun: '2 hours ago', runs24h: 5, category: 'Operations' },
    { id: 'hwf-3', name: 'Post-Stay Feedback Loop', triggerEvent: 'Guest Checked Out', description: 'Collects feedback and pushes positive reviews to TripAdvisor/Google.', steps: [{ type: 'TRIGGER', label: 'Status = Checked Out', detail: 'PMS update' }, { type: 'ACTION', label: 'Send WhatsApp', detail: 'Feedback form link' }, { type: 'CONDITION', label: 'If Rating > 4', detail: 'Request public review' }], actionsCount: 4, isActive: true, lastRun: 'Today', runs24h: 45, category: 'Marketing' },
    { id: 'hwf-4', name: 'VIP Guest Arrival Alert', triggerEvent: 'VIP Check-In Today', description: 'Alerts HODs about VIP arrivals to ensure amenities are placed.', steps: [{ type: 'TRIGGER', label: 'Arrival List Check', detail: 'Daily morning scan' }, { type: 'CONDITION', label: 'Guest Tag = VIP', detail: 'Filter VIPs' }, { type: 'ACTION', label: 'Notify Team', detail: 'Alert GM & F&B' }], actionsCount: 3, isActive: true, lastRun: '8:00 AM', runs24h: 1, category: 'Guest Services' },
  ],

  goldenPrompt: "You are HotelAI, a warm, courteous, and luxurious digital concierge for a premium hotel. Your philosophy is 'Atithi Devo Bhava' (Guest is God). Always assist guests politely with their room bookings, check-in queries, dining recommendations, and special requests. Emphasize comfort, luxury, and seamless service. Ensure strict compliance with ID regulations and do not promise room upgrades without authorization. Maintain a hospitable and professional tone at all times.",

  tones: [
    { id: 'tone-royal', name: 'Royal Luxury', badge: 'Premium', greeting: 'Namaskaram! Welcome to a world of unparalleled luxury. How may we craft a memorable experience for you today?' },
    { id: 'tone-business', name: 'Business Professional', badge: 'Corporate', greeting: 'Good day. Welcome to the business concierge desk. How can I assist you with your stay or meeting arrangements?' },
    { id: 'tone-weekend', name: 'Weekend Getaway', badge: 'Casual', greeting: 'Hello there! Ready for a relaxing staycation? Let me know how I can help make your stay perfect.' },
  ],

  aiRules: [
    { id: 'rule-id', title: 'ID Verification Mandatory', description: 'Always remind guests that a valid physical Government ID is mandatory for all guests at check-in.', severity: 'critical' },
    { id: 'rule-tariff', title: 'Tariff Transparency', description: 'Ensure all quoted room rates clearly state if they are exclusive or inclusive of taxes and breakfast.', severity: 'warning' },
    { id: 'rule-no-upgrade', title: 'No Room Upgrades', description: 'Never promise complimentary room upgrades or late check-outs; always state these are subject to availability.', severity: 'critical' },
    { id: 'rule-empathy', title: 'Show Empathy', description: 'If a guest reports an issue, apologize sincerely first before attempting to resolve it.', severity: 'info' },
    { id: 'rule-upsell', title: 'Gentle Upselling', description: 'When appropriate, suggest dining at the hotel restaurant or booking a spa treatment.', severity: 'info' },
  ],

  inputVariables: [
    { token: 'guest_name', label: 'Guest Name', fallback: 'Valued Guest' },
    { token: 'check_in_date', label: 'Check-in Date', fallback: 'your arrival date' },
    { token: 'room_type', label: 'Room Type', fallback: 'your room' },
    { token: 'booking_source', label: 'Booking Source', fallback: 'our booking platform' },
  ]
};
