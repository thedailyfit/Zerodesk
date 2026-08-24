import type { NicheConfig } from './types';
import {
  LayoutDashboard, MessageSquare, Users, Target, Calendar, BookOpen, BarChart3, Phone,
  MessageCircle, Workflow, Settings, FileText, Rocket, TrendingUp, CreditCard,
  CalendarDays, Clock, IndianRupee, Heart, Cpu, PhoneIncoming,
  Megaphone, Activity, Laptop, AlertTriangle, Sparkles, Bot, Link2, Headphones
} from 'lucide-react';

export const LUXURY_SALON_CONFIG: NicheConfig = {
  id: 'salon',
  label: 'Luxury Salon & Grooming',
  tagline: 'Redefining Beauty and Style',
  icon: 'SmilePlus',
  accentColor: 'text-rose-500',
  accentColorRGB: '244, 63, 94',
  gradientFrom: 'from-rose-400',
  gradientTo: 'to-pink-600',

  terminology: {
    customer: 'Client',
    customers: 'Clients',
    appointment: 'Booking',
    appointments: 'Bookings',
    service: 'Service Offering',
    services: 'Salon Services',
    staff: 'Artist/Stylist',
    waitingRoom: 'Live Floor Queue',
    patientFiles: 'Client Beauty Profiles',
    calendar: 'Floor & Chair Scheduler',
    billing: 'Billing & Retail',
    overview: 'Business Health',
  },

  roles: [
    { id: 'ADMIN', label: 'Owner (Admin)', description: 'Full access to floor operations, retail revenue, settings, and staff.', icon: 'Shield' },
    { id: 'MANAGER', label: 'Salon Manager', description: 'Access to chair scheduling, client management, and analytics.', icon: 'Users' },
    { id: 'STAFF', label: 'Frontdesk Staff', description: 'Access to appointments, frontdesk billing, and client chats.', icon: 'User' },
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
    
    { name: 'Styling', roles: ['ADMIN', 'STAFF'], divider: true },
    { name: 'Live Floor Queue', href: '/waiting-room', icon: Clock, roles: ['ADMIN', 'STAFF'] },
    { name: 'Chair Schedule', href: '/calendar', icon: Calendar, roles: ['ADMIN', 'STAFF'] },
    { name: 'Client Profiles', href: '/profiles', icon: Heart, roles: ['ADMIN', 'STAFF'] },
    { name: 'Staff Calendar', href: '/staff-calendar', icon: CalendarDays, roles: ['ADMIN'] },
    
    { name: 'Frontdesk', roles: ['ADMIN', 'STAFF'], divider: true },
    { name: 'Booking Link', href: '/booking-link', icon: Link2, roles: ['ADMIN'] },
    { name: 'Quick Bill', href: '/billing', icon: CreditCard, roles: ['ADMIN', 'STAFF'] },
    { name: 'Services', href: '/services', icon: Sparkles, roles: ['ADMIN', 'STAFF', 'MANAGER'] },
    { name: 'Invoices', href: '/invoices', icon: FileText, roles: ['ADMIN', 'STAFF'] },
    { name: 'Book Session', href: '/book-appointment', icon: CalendarDays, roles: ['ADMIN', 'STAFF'] },
    { name: 'Clients', href: '/customers', icon: Users, roles: ['ADMIN', 'STAFF'] },
    { name: 'Conversations', href: '/conversations', icon: MessageSquare, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    
    { name: 'Automation', roles: ['ADMIN', 'MANAGER'], divider: true },
    { name: 'Automations', href: '/automations', icon: Workflow, roles: ['ADMIN'] },
    { name: 'Automated Leads', href: '/crm', icon: Target, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Client LTV', href: '/customer-value', icon: Heart, roles: ['ADMIN', 'MANAGER'] },
    { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle, roles: ['ADMIN', 'MANAGER'] },

    { name: 'Voice Telephony', roles: ['ADMIN'], divider: true },
    { name: 'Voice AI Agent', href: '/voice', icon: Cpu, roles: ['ADMIN'] },
    { name: 'Phone Numbers', href: '/phone-numbers', icon: Phone, roles: ['ADMIN'] },
    { name: 'Inbound Calls', href: '/inbound-calls', icon: PhoneIncoming, roles: ['ADMIN'] },
    { name: 'Outbound Campaigns', href: '/outbound-campaigns', icon: Megaphone, roles: ['ADMIN'] },
    { name: 'Agent Analytics', href: '/agent-analytics', icon: Activity, roles: ['ADMIN'] },

    { name: 'Backend AI', roles: ['ADMIN'], divider: true },
    { name: 'Voice AI Knowledge Hub', href: '/voice-knowledge-hub', icon: Cpu, roles: ['ADMIN'] },
    { name: 'Company Knowledge Base', href: '/knowledge-base', icon: BookOpen, roles: ['ADMIN'] },
    { name: 'Templates', href: '/templates', icon: FileText, roles: ['ADMIN'] }
  ],

  kpis: [
    { label: 'Chair Utilization', value: '85%', change: '+4%', trend: 'up' },
    { label: 'Average Ticket Value', value: '₹3,200', change: '+₹200', trend: 'up' },
    { label: 'Client Re-Booking Rate', value: '64%', change: '+1.5%', trend: 'up' },
    { label: 'Retail-to-Service Ratio', value: '18%', change: '-1%', trend: 'down' },
  ],

  templates: [
    {
      id: 'wa_stylist_match',
      title: 'Stylist Match Confirmation',
      category: 'Booking',
      channel: 'WHATSAPP',
      content: 'Hey {{client_name}}! 💖\n\nYour session at {{salon_branch}} is locked in! You are booked with our fabulous artist, {{preferred_stylist}}, on {{appointment_date}} at {{appointment_time}}.\n\nWe cant wait to glam you up. Need to make changes? Just reply to this message!\n\nStay Gorgeous,\nThe {{salon_branch}} Team',
      isPreinstalled: true,
      variables: ['client_name', 'salon_branch', 'preferred_stylist', 'appointment_date', 'appointment_time'],
    },
    {
      id: 'wa_color_touchup',
      title: 'Color Touch-up Reminder',
      category: 'Retention',
      channel: 'WHATSAPP',
      content: 'Hi {{client_name}} ✨,\n\nIt has been a few weeks since your last color session with {{preferred_stylist}} on {{last_visit_date}}. To keep your shade looking vibrant and fresh, it might be time for a root touch-up or gloss!\n\nWould you like me to find some available slots for you this week?\n\n- StyleAI @ {{salon_branch}}',
      isPreinstalled: true,
      variables: ['client_name', 'preferred_stylist', 'last_visit_date', 'salon_branch'],
    },
    {
      id: 'wa_bridal_countdown',
      title: 'Bridal Prep Countdown',
      category: 'Events',
      channel: 'WHATSAPP',
      content: 'Hello beautiful {{client_name}} 💍!\n\nYour big day is approaching fast! This is a friendly reminder for your Bridal Hair & Makeup Trial tomorrow at {{appointment_time}}.\n\nPlease come with clean, dry hair and wear a top with a similar neckline to your dress if possible! Our bridal expert {{preferred_stylist}} is so excited to create your dream look.\n\nSee you soon at {{salon_branch}}!',
      isPreinstalled: true,
      variables: ['client_name', 'appointment_time', 'preferred_stylist', 'salon_branch'],
    },
    {
      id: 'wa_walkin_queue',
      title: 'Walk-in Queue Update',
      category: 'Operations',
      channel: 'WHATSAPP',
      content: 'Hi {{client_name}}, you are currently on the waitlist at {{salon_branch}}! 💅\n\nThere are currently {{queue_position}} clients ahead of you. We estimate your chair will be ready in about {{estimated_wait}} minutes.\n\nFeel free to grab a coffee nearby, we will text you exactly 5 minutes before your stylist is ready!',
      isPreinstalled: true,
      variables: ['client_name', 'salon_branch', 'queue_position', 'estimated_wait'],
    },
    {
      id: 'email_welcome_salon',
      title: 'Welcome to the Salon',
      category: 'Onboarding',
      channel: 'EMAIL',
      subject: 'Welcome to {{salon_branch}} - Let\'s Get Gorgeous!',
      content: 'Hi {{client_name}},\n\nWelcome to {{salon_branch}}! We are absolutely thrilled to have you as a new client.\n\nWhether you are looking for a dramatic color transformation, a fresh chop, or just some pampering, our talented artists are here to make your vision come to life.\n\nAttached is our lookbook and full service menu. As a welcome gift, enjoy 10% off any retail hair care product during your first visit!\n\nSee you in the chair,\nThe {{salon_branch}} Team',
      mediaAttachment: 'PDF',
      isPreinstalled: true,
      variables: ['client_name', 'salon_branch'],
    },
    {
      id: 'email_style_inspiration',
      title: 'Seasonal Style Inspiration',
      category: 'Marketing',
      channel: 'EMAIL',
      subject: 'Trends We Are Loving This Season 💇‍♀️',
      content: 'Hey {{client_name}},\n\nReady for a refresh?\n\nThis season at {{salon_branch}}, we are obsessed with lived-in balayage, bouncy blowouts, and bold statement nails. Our artists have been busy creating some stunning looks!\n\nCheck out our latest stylist portfolios attached. If you are feeling inspired, book your next session with {{preferred_stylist}} today and let\'s create some magic.\n\nStay stylish,\n{{salon_branch}}',
      mediaAttachment: 'IMAGE',
      isPreinstalled: true,
      variables: ['client_name', 'salon_branch', 'preferred_stylist'],
    },
    {
      id: 'email_loyalty_reward',
      title: 'Loyalty Reward Unlocked',
      category: 'Retention',
      channel: 'EMAIL',
      subject: 'You\'ve Unlocked a Style Reward! 🎁',
      content: 'Hi {{client_name}},\n\nYour loyalty means the world to us! You have just reached VIP status at {{salon_branch}}.\n\nTo celebrate, we are gifting you a complimentary deep conditioning treatment (worth ₹1,500) with your next haircut or color service.\n\nSimply mention this email when you book your next session with {{preferred_stylist}}.\n\nWith love,\nThe {{salon_branch}} Team',
      isPreinstalled: true,
      variables: ['client_name', 'salon_branch', 'preferred_stylist'],
    },
    {
      id: 'voice_inbound_glam',
      title: 'High-Energy Inbound Receptionist',
      category: 'Voice',
      channel: 'VOICE',
      content: 'Hello gorgeous! Thank you for calling {{salon_branch}}. This is Style A I, your virtual salon coordinator. Whether you need a fresh cut, a color transformation, or a flawless manicure, I am here to get you booked. What are we styling today?',
      isPreinstalled: true,
      variables: ['salon_branch'],
    },
    {
      id: 'voice_appointment_reminder',
      title: 'Chic Appointment Reminder',
      category: 'Voice',
      channel: 'VOICE',
      content: 'Hi {{client_name}}! This is a quick call from {{salon_branch}}. Just a reminder that you are booked to get glammed up with {{preferred_stylist}} tomorrow at {{appointment_time}}. If you need to tweak your time, just let me know. Otherwise, we can\'t wait to see you!',
      isPreinstalled: true,
      variables: ['client_name', 'salon_branch', 'preferred_stylist', 'appointment_time'],
    },
    {
      id: 'voice_rebook_nudge',
      title: 'Friendly Re-book Nudge',
      category: 'Voice',
      channel: 'VOICE',
      content: 'Hey {{client_name}}, it is Style A I from {{salon_branch}}. It has been a little while since we last saw you, and {{preferred_stylist}} would love to catch up and refresh your look! Would you like me to check their availability for this weekend?',
      isPreinstalled: true,
      variables: ['client_name', 'salon_branch', 'preferred_stylist'],
    }
  ],

  knowledgeBaseDocs: [
    {
      id: 'kb_hair_care_keratin',
      title: 'Hair Care Post-Keratin',
      category: 'SERVICE',
      content: 'Essential aftercare for Keratin & Smoothening treatments. Do not wash, tie, or clip hair for 72 hours. Must use sulfate-free and sodium chloride-free shampoo (recommend MoroccanOil or Olaplex). Swimming in chlorinated water or the ocean will strip the treatment rapidly.',
      chunks: 10,
      isActive: true,
      updatedAt: '2026-08-01',
    },
    {
      id: 'kb_full_service_menu',
      title: 'Full Service Menu & Pricing',
      category: 'PRICING',
      content: 'Detailed list of all salon services. Women\'s Haircut (₹1200-2500 based on stylist tier), Men\'s Grooming (₹600-1200), Global Color (Starting at ₹4500), Balayage (Starting at ₹6500), Classic Manicure (₹800), Gel Extensions (₹2500). Prices vary by hair length and thickness.',
      chunks: 30,
      isActive: true,
      updatedAt: '2026-08-10',
    },
    {
      id: 'kb_bridal_packages',
      title: 'Bridal & Pre-Bridal Packages',
      category: 'SERVICE',
      content: 'Overview of bridal offerings. Silver Package (₹15,000: HD Makeup, Hair styling, Draping). Gold Package (₹25,000: Airbrush Makeup, Premium Hair, Draping, Trial included). Pre-bridal packages (starting ₹10,000) include body polishing, facial, waxing, and spa mani/pedi. 50% advance required for booking.',
      chunks: 18,
      isActive: true,
      updatedAt: '2026-07-15',
    },
    {
      id: 'kb_stylist_portfolios',
      title: 'Stylist Tiers & Specialties',
      category: 'SOP',
      content: 'Breakdown of our staff tiers: Junior Stylist (Great for basic cuts/blowouts), Senior Stylist (Advanced coloring, layered cuts), Master/Creative Director (Transformations, corrective color, bridal). Match clients based on their requested service complexity.',
      chunks: 15,
      isActive: true,
      updatedAt: '2026-08-05',
    },
    {
      id: 'kb_salon_etiquette',
      title: 'Salon Etiquette & Policies',
      category: 'FAQ',
      content: 'If a client is more than 15 minutes late, we may need to shorten or reschedule their service to avoid delaying the next client. 24-hour notice required for cancellations. No refunds on services, but we offer a 7-day adjustment guarantee if a client is unhappy with their color/cut.',
      chunks: 12,
      isActive: true,
      updatedAt: '2026-06-20',
    },
    {
      id: 'kb_mens_grooming',
      title: 'Men\'s Grooming Guide',
      category: 'SERVICE',
      content: 'Details on men\'s services including beard sculpting, classic fades, grey blending (10-minute color), and scalp detox treatments. Highlight that complimentary hot towel service is included with premium beard trims.',
      chunks: 8,
      isActive: true,
      updatedAt: '2026-05-10',
    },
    {
      id: 'kb_nail_art_catalog',
      title: 'Nail Art & Extensions Catalog',
      category: 'SERVICE',
      content: 'Guide to nail services. Acrylic vs Gel extensions pros/cons. Nail art tiers: Basic (glitter/french - ₹300 per nail), Advanced (chrome/ombre - ₹500 per nail), 3D/Complex (crystals/hand-painted - ₹800+ per nail). Remind desk to book extra time for nail art.',
      chunks: 14,
      isActive: true,
      updatedAt: '2026-08-08',
    },
    {
      id: 'kb_festival_specials',
      title: 'Festival & Wedding Specials',
      category: 'PRICING',
      content: 'Current seasonal promotions for Diwali/Wedding season. "Glow & Go" combo (Express Facial + Blowout + Classic Mani for ₹3,500). Group discounts for bridesmaids (Book 4, Bride gets 20% off). Valid through November.',
      chunks: 6,
      isActive: true,
      updatedAt: '2026-08-11',
    }
  ],

  automationPresets: [
    {
      title: 'Color Maintenance Reminder',
      trigger: '6 weeks after any color service',
      desc: 'Automatically texts clients to book a root touch-up or toner refresh to maintain their hair health.',
      category: 'Retention'
    },
    {
      title: 'Review Request post-Makeover',
      trigger: '2 hours after a service > ₹5000',
      desc: 'Sends a sweet WhatsApp message asking for a Google Review and to tag us in their selfies.',
      category: 'Marketing'
    },
    {
      title: 'Bridal Trial Follow-up',
      trigger: '1 day after a Bridal Trial',
      desc: 'Emails the client with photos from their trial and a link to secure their wedding date deposit.',
      category: 'Sales'
    },
    {
      title: 'No-Show / Late Alert',
      trigger: 'When appointment is 10 mins late',
      desc: 'Triggers an automated SMS checking if the client is on their way, outlining the late policy.',
      category: 'Operations'
    }
  ],

  initialWorkflows: [
    {
      id: 'wf_new_client_welcome',
      name: 'New Client VIP Welcome',
      triggerEvent: 'Client Profile Created',
      description: 'Onboards new clients with a welcome email and 10% off retail coupon.',
      steps: [
        { type: 'TRIGGER', label: 'New Client', detail: 'Profile created in system' },
        { type: 'ACTION', label: 'Send Email', detail: 'Uses "email_welcome_salon" template' },
        { type: 'ACTION', label: 'Add Tag', detail: 'Tag as "First Visit"' }
      ],
      actionsCount: 2,
      isActive: true,
      lastRun: '1 hour ago',
      runs24h: 18,
      category: 'Onboarding'
    },
    {
      id: 'wf_rebook_reminder',
      name: 'Automated Re-book Nudge',
      triggerEvent: '8 Weeks Since Last Visit',
      description: 'Catches clients who forgot to rebook before leaving the salon.',
      steps: [
        { type: 'TRIGGER', label: 'Time Based', detail: '8 weeks post-appointment' },
        { type: 'CONDITION', label: 'No Future Bookings?', detail: 'Check if already booked' },
        { type: 'ACTION', label: 'Send WhatsApp', detail: 'Send friendly reminder to book' }
      ],
      actionsCount: 2,
      isActive: true,
      lastRun: '4 hours ago',
      runs24h: 32,
      category: 'Retention'
    },
    {
      id: 'wf_inventory_alert',
      name: 'Low Backbar Inventory Alert',
      triggerEvent: 'Color Tube < 5 units',
      description: 'Alerts the salon manager when popular color shades are running low.',
      steps: [
        { type: 'TRIGGER', label: 'Inventory Check', detail: 'Stock goes below threshold' },
        { type: 'ACTION', label: 'Internal Alert', detail: 'Notify Manager via Dashboard' }
      ],
      actionsCount: 1,
      isActive: true,
      lastRun: '1 day ago',
      runs24h: 2,
      category: 'Operations'
    },
    {
      id: 'wf_stylist_schedule',
      name: 'Stylist Daily Briefing',
      triggerEvent: 'Daily at 8:30 AM',
      description: 'Sends each stylist their schedule for the day.',
      steps: [
        { type: 'TRIGGER', label: 'Daily Cron', detail: 'Runs every morning' },
        { type: 'ACTION', label: 'Generate Schedule', detail: 'Compile appointments per stylist' },
        { type: 'ACTION', label: 'Send Internal SMS', detail: 'Dispatch to staff phones' }
      ],
      actionsCount: 2,
      isActive: true,
      lastRun: '3 hours ago',
      runs24h: 1,
      category: 'Operations'
    }
  ],

  goldenPrompt: `You are StyleAI, the chic, high-energy, and glamorous virtual receptionist for {{salon_branch}}.
Your tone is stylish, upbeat, and very friendly. Use terms like "gorgeous," "fabulous," and "glam" naturally.
Your primary role is to help clients book their Styling Sessions, manage the Chair Schedule, and answer questions about our services (cuts, colors, extensions, nails, bridal).
If a client is unsure what to book for a color change, politely suggest a "Consultation Session" so our Master Stylists can assess their hair.
Always quote prices in INR (₹) and gently remind them that complex color corrections may require a higher budget.
Be enthusiastic and ensure every caller feels like a VIP before they even step into the salon.`,

  tones: [
    { id: 'glamorous_trendy', name: 'Glamorous & Trendy', badge: 'Default', greeting: 'Hello gorgeous! Welcome to {{salon_branch}}. How can we make you look and feel fabulous today?' },
    { id: 'classic_elegance', name: 'Classic Elegance', badge: 'Refined', greeting: 'Good morning. Welcome to {{salon_branch}}. How may we assist you with your beauty needs today?' },
    { id: 'bridal_specialist', name: 'Bridal Specialist', badge: 'Events', greeting: 'Hello! Congratulations from {{salon_branch}}. How can we help you prepare for your special day?' }
  ],

  aiRules: [
    {
      id: 'rule_no_guarantees',
      title: 'No Exact Color Guarantees Over Phone',
      description: 'The AI must state that exact color results (like going from black to platinum) require an in-person strand test and cannot be guaranteed over the phone.',
      severity: 'critical'
    },
    {
      id: 'rule_enthusiastic_tone',
      title: 'Maintain Enthusiastic Tone',
      description: 'Ensure the AI sounds upbeat and welcoming, matching the vibrant energy of a busy luxury salon.',
      severity: 'info'
    },
    {
      id: 'rule_currency_inr',
      title: 'Pricing in INR',
      description: 'Always quote service starting prices in Indian Rupees (₹).',
      severity: 'info'
    },
    {
      id: 'rule_patch_test',
      title: 'Mention Patch Test Requirement',
      description: 'If a new client books a global color or bleach service, remind them a 48-hour patch test is required for safety.',
      severity: 'warning'
    },
    {
      id: 'rule_bridal_deposit',
      title: 'Bridal Deposit Rule',
      description: 'When discussing bridal packages, clearly state that a 50% non-refundable deposit is required to lock in the wedding date.',
      severity: 'critical'
    }
  ],

  inputVariables: [
    { token: 'client_name', label: 'Client Name', fallback: 'Beautiful' },
    { token: 'last_visit_date', label: 'Last Visit Date', fallback: 'your last appointment' },
    { token: 'preferred_stylist', label: 'Preferred Stylist', fallback: 'our talented stylist' },
    { token: 'salon_branch', label: 'Salon Branch Name', fallback: 'our salon' }
  ]
};
