export const Industry = {
  HOSPITAL: 'HOSPITAL',
  SKIN_CLINIC: 'SKIN_CLINIC',
  SPA: 'SPA',
  HOTEL: 'HOTEL',
  REAL_ESTATE: 'REAL_ESTATE',
} as const;

export type IndustryType = (typeof Industry)[keyof typeof Industry];

export const INDUSTRY_CONFIG: Record<
  IndustryType,
  {
    label: string;
    icon: string;
    description: string;
    defaultVoicePersonality: string;
    knowledgeCategories: string[];
    pipelineStages: Array<{ name: string; slug: string; order: number; color: string }>;
  }
> = {
  HOSPITAL: {
    label: 'Hospital & Medical Clinic',
    icon: '🏥',
    description: 'Hospitals, multi-specialty clinics, diagnostic centers',
    defaultVoicePersonality: 'doctor_assistant',
    knowledgeCategories: [
      'Doctors', 'Departments', 'Emergency', 'Insurance',
      'Appointments', 'Reports', 'Follow-ups', 'Lab Booking',
      'OP/IP', 'Working Hours', 'Pricing', 'FAQs', 'Policies',
    ],
    pipelineStages: [
      { name: 'Enquiry', slug: 'enquiry', order: 1, color: '#6366f1' },
      { name: 'Consultation Scheduled', slug: 'consultation', order: 2, color: '#8b5cf6' },
      { name: 'Diagnosed', slug: 'diagnosed', order: 3, color: '#a855f7' },
      { name: 'Treatment', slug: 'treatment', order: 4, color: '#d946ef' },
      { name: 'Follow-up', slug: 'followup', order: 5, color: '#ec4899' },
      { name: 'Completed', slug: 'completed', order: 6, color: '#22c55e' },
    ],
  },
  SKIN_CLINIC: {
    label: 'Skin & Hair Clinic',
    icon: '✨',
    description: 'Dermatology clinics, cosmetology centers, hair treatment clinics',
    defaultVoicePersonality: 'friendly',
    knowledgeCategories: [
      'Treatments', 'Pricing', 'Packages', 'Doctors',
      'Offers', 'Consultations', 'Follow-ups', 'Products',
      'Working Hours', 'Cancellation Policy', 'FAQs',
    ],
    pipelineStages: [
      { name: 'Enquiry', slug: 'enquiry', order: 1, color: '#f472b6' },
      { name: 'Consultation', slug: 'consultation', order: 2, color: '#fb7185' },
      { name: 'Treatment Plan', slug: 'treatment-plan', order: 3, color: '#f97316' },
      { name: 'Active Treatment', slug: 'active', order: 4, color: '#eab308' },
      { name: 'Follow-up', slug: 'followup', order: 5, color: '#84cc16' },
      { name: 'Completed', slug: 'completed', order: 6, color: '#22c55e' },
    ],
  },
  SPA: {
    label: 'Spa & Wellness Center',
    icon: '🧖',
    description: 'Day spas, wellness centers, ayurvedic clinics, massage centers',
    defaultVoicePersonality: 'luxury',
    knowledgeCategories: [
      'Services', 'Packages', 'Membership', 'Therapists',
      'Availability', 'Booking', 'Offers', 'Products',
      'Working Hours', 'Cancellation Policy', 'FAQs',
    ],
    pipelineStages: [
      { name: 'Enquiry', slug: 'enquiry', order: 1, color: '#06b6d4' },
      { name: 'Trial Session', slug: 'trial', order: 2, color: '#0ea5e9' },
      { name: 'Membership Offered', slug: 'membership', order: 3, color: '#6366f1' },
      { name: 'Active Member', slug: 'active', order: 4, color: '#8b5cf6' },
      { name: 'Renewal', slug: 'renewal', order: 5, color: '#a855f7' },
      { name: 'Completed', slug: 'completed', order: 6, color: '#22c55e' },
    ],
  },
  HOTEL: {
    label: 'Hotel & Resort',
    icon: '🏨',
    description: 'Hotels, resorts, serviced apartments, boutique stays',
    defaultVoicePersonality: 'hotel_reception',
    knowledgeCategories: [
      'Rooms', 'Reservations', 'Facilities', 'Check In',
      'Check Out', 'Restaurant', 'Housekeeping', 'Events',
      'Pricing', 'Policies', 'Offers', 'FAQs',
    ],
    pipelineStages: [
      { name: 'Enquiry', slug: 'enquiry', order: 1, color: '#f59e0b' },
      { name: 'Reservation', slug: 'reservation', order: 2, color: '#f97316' },
      { name: 'Confirmed', slug: 'confirmed', order: 3, color: '#22c55e' },
      { name: 'Checked In', slug: 'checked-in', order: 4, color: '#3b82f6' },
      { name: 'Checked Out', slug: 'checked-out', order: 5, color: '#6366f1' },
      { name: 'Review Requested', slug: 'review', order: 6, color: '#a855f7' },
    ],
  },
  REAL_ESTATE: {
    label: 'Real Estate Agency',
    icon: '🏠',
    description: 'Real estate agencies, property developers, brokerages',
    defaultVoicePersonality: 'real_estate_executive',
    knowledgeCategories: [
      'Properties', 'Agents', 'Locations', 'Price',
      'Site Visits', 'Loans', 'Availability', 'Builder Projects',
      'Amenities', 'Policies', 'FAQs',
    ],
    pipelineStages: [
      { name: 'Enquiry', slug: 'enquiry', order: 1, color: '#10b981' },
      { name: 'Site Visit Scheduled', slug: 'site-visit', order: 2, color: '#14b8a6' },
      { name: 'Interested', slug: 'interested', order: 3, color: '#06b6d4' },
      { name: 'Negotiation', slug: 'negotiation', order: 4, color: '#0ea5e9' },
      { name: 'Booking', slug: 'booking', order: 5, color: '#3b82f6' },
      { name: 'Registration', slug: 'registration', order: 6, color: '#22c55e' },
    ],
  },
};
