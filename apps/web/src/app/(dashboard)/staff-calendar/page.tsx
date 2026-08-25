'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRole } from '@/components/providers/role-provider';
import { useNiche } from '@/components/providers/niche-provider';
import type { NicheId } from '@/config/niches/types';
import { 
  Users, 
  Coffee, 
  UserCheck, 
  UserX, 
  PhoneCall, 
  Building2, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ShiftType = 'duty' | 'lunch' | 'leave' | 'oncall';

export interface StaffShiftBlock {
  type: ShiftType;
  startHour: number; // e.g. 9.0 for 9:00 AM
  endHour: number;   // e.g. 13.0 for 1:00 PM
  label?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  phone: string;
  email: string;
  status: 'Active' | 'On Break' | 'Off Shift' | 'On Call' | 'On Duty' | 'On Leave' | 'Lunch Break' | 'On Treatment Session' | string;
  shifts: StaffShiftBlock[];
  workingHoursStr: string;
  lunchHoursStr: string;
}

const DEPARTMENTS_BY_NICHE: Record<NicheId, string[]> = {
  skin: ['Dermatology', 'Cosmetology', 'Reception', 'Wellness'],
  dental: ['Endodontics', 'Orthodontics', 'Oral Surgery', 'Hygiene & Prep', 'Front Office'],
  spa: ['Ayurvedic Therapy', 'Massage Therapy', 'Thermal Spa', 'Guest Relations'],
  salon: ['Hair Styling', 'Color Lab', 'Bridal & Makeup', 'Nail Bar', 'Reception'],
  realestate: ['Luxury Residential', 'Commercial Advisory', 'Legal & Documentation', 'Client Relations'],
  hotel: ['Front Office', 'Concierge & VIP', 'Banquets & Events', 'Guest Experience'],
};

const SHIFT_LEGEND = [
  { 
    type: 'duty' as ShiftType, 
    label: 'Duty Time', 
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', 
    barColor: 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400/50 text-emerald-100',
    dot: 'bg-emerald-400',
    icon: UserCheck 
  },
  { 
    type: 'lunch' as ShiftType, 
    label: 'Lunch Break', 
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', 
    barColor: 'bg-gradient-to-r from-amber-600 to-yellow-600 border-amber-400/50 text-amber-100',
    dot: 'bg-amber-400',
    icon: Coffee 
  },
  { 
    type: 'oncall' as ShiftType, 
    label: 'On Call', 
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', 
    barColor: 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400/50 text-blue-100',
    dot: 'bg-blue-400',
    icon: PhoneCall 
  },
  { 
    type: 'leave' as ShiftType, 
    label: 'On Leave', 
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', 
    barColor: 'bg-gradient-to-r from-rose-600 to-red-600 border-rose-400/50 text-rose-100',
    dot: 'bg-rose-400',
    icon: UserX 
  },
];

const DEFAULT_STAFF_BY_NICHE: Record<NicheId, StaffMember[]> = {
  skin: [
    {
      id: 's-sk-1',
      name: 'Meenakshi Rao',
      role: 'Clinic Operations Manager',
      department: 'Management',
      avatar: 'MR',
      phone: '+91 98765 11111',
      email: 'meenakshi@zerodesk.com',
      status: 'Active',
      workingHoursStr: '9:00 AM - 5:00 PM',
      lunchHoursStr: '1:00 PM - 2:00 PM',
      shifts: [
        { type: 'duty', startHour: 9.0, endHour: 13.0, label: 'Floor Operations & Staffing' },
        { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.0, endHour: 17.0, label: 'Inventory & Operations Review' },
        { type: 'oncall', startHour: 17.0, endHour: 20.0, label: 'Manager On Call' }
      ]
    },
    {
      id: 's-sk-2',
      name: 'Arun Kumar',
      role: 'Senior Clinical Coordinator',
      department: 'Clinical Care',
      avatar: 'AK',
      phone: '+91 98765 22222',
      email: 'arun@zerodesk.com',
      status: 'Active',
      workingHoursStr: '10:00 AM - 6:00 PM',
      lunchHoursStr: '2:00 PM - 3:00 PM',
      shifts: [
        { type: 'duty', startHour: 10.0, endHour: 14.0, label: 'Treatment Room Coordination' },
        { type: 'lunch', startHour: 14.0, endHour: 15.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 15.0, endHour: 18.0, label: 'Patient Post-Care Support' }
      ]
    },
    {
      id: 's-sk-3',
      name: 'Kavita',
      role: 'Senior Clinical Nurse',
      department: 'Dermatology',
      avatar: 'KV',
      phone: '+91 98765 33333',
      email: 'kavita@zerodesk.com',
      status: 'Active',
      workingHoursStr: '8:30 AM - 4:30 PM',
      lunchHoursStr: '12:30 PM - 1:30 PM',
      shifts: [
        { type: 'duty', startHour: 8.5, endHour: 12.5, label: 'Patient Prep & Vitals' },
        { type: 'lunch', startHour: 12.5, endHour: 13.5, label: 'Lunch Break' },
        { type: 'duty', startHour: 13.5, endHour: 16.5, label: 'PRP Assisting' }
      ]
    },
    {
      id: 's-sk-4',
      name: 'Rekha',
      role: 'Cosmetology Therapist',
      department: 'Cosmetology',
      avatar: 'RK',
      phone: '+91 98765 44444',
      email: 'rekha@zerodesk.com',
      status: 'Active',
      workingHoursStr: '9:00 AM - 5:00 PM',
      lunchHoursStr: '1:30 PM - 2:30 PM',
      shifts: [
        { type: 'duty', startHour: 9.0, endHour: 13.5, label: 'Laser Treatments' },
        { type: 'lunch', startHour: 13.5, endHour: 14.5, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.5, endHour: 17.0, label: 'Peels & Facials' }
      ]
    },
    {
      id: 's-sk-5',
      name: 'Pooja',
      role: 'Head Desk Administrator',
      department: 'Reception',
      avatar: 'PJ',
      phone: '+91 98765 66666',
      email: 'pooja@zerodesk.com',
      status: 'Active',
      workingHoursStr: '8:00 AM - 4:00 PM',
      lunchHoursStr: '12:00 PM - 1:00 PM',
      shifts: [
        { type: 'duty', startHour: 8.0, endHour: 12.0, label: 'Front Desk & Billing' },
        { type: 'lunch', startHour: 12.0, endHour: 13.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 13.0, endHour: 16.0, label: 'Patient Check-ins' }
      ]
    }
  ],
  dental: [
    {
      id: 's-dt-1',
      name: 'Arvind Sharma',
      role: 'Dental Clinic Manager',
      department: 'Operations',
      avatar: 'AS',
      phone: '+91 91234 11111',
      email: 'arvind@dentalcare.com',
      status: 'Active',
      workingHoursStr: '9:00 AM - 5:00 PM',
      lunchHoursStr: '1:00 PM - 2:00 PM',
      shifts: [
        { type: 'duty', startHour: 9.0, endHour: 13.0, label: 'Clinic Operations & Supplies' },
        { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.0, endHour: 17.0, label: 'Staff Roster & Chair Management' }
      ]
    },
    {
      id: 's-dt-2',
      name: 'Priya Nair',
      role: 'Senior Clinical Coordinator',
      department: 'Clinical Staff',
      avatar: 'PN',
      phone: '+91 91234 22222',
      email: 'priya@dentalcare.com',
      status: 'Active',
      workingHoursStr: '10:00 AM - 6:00 PM',
      lunchHoursStr: '2:00 PM - 3:00 PM',
      shifts: [
        { type: 'duty', startHour: 10.0, endHour: 14.0, label: 'Patient Scans & Treatment Planning' },
        { type: 'lunch', startHour: 14.0, endHour: 15.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 15.0, endHour: 18.0, label: 'Lab Case Tracking' }
      ]
    },
    {
      id: 's-dt-3',
      name: 'Sarah Hygienist',
      role: 'Lead Dental Hygienist',
      department: 'Hygiene & Prep',
      avatar: 'SH',
      phone: '+91 91234 33333',
      email: 'sarah@dentalcare.com',
      status: 'Active',
      workingHoursStr: '8:30 AM - 4:30 PM',
      lunchHoursStr: '12:30 PM - 1:30 PM',
      shifts: [
        { type: 'duty', startHour: 8.5, endHour: 12.5, label: 'Ultrasonic Scaling & Clean' },
        { type: 'lunch', startHour: 12.5, endHour: 13.5, label: 'Lunch Break' },
        { type: 'duty', startHour: 13.5, endHour: 16.5, label: 'Fluoride Polish & X-Rays' }
      ]
    },
    {
      id: 's-dt-4',
      name: 'Pooja Hegde',
      role: 'Dental Frontdesk Lead',
      department: 'Front Office',
      avatar: 'PH',
      phone: '+91 91234 44444',
      email: 'pooja@dentalcare.com',
      status: 'Active',
      workingHoursStr: '8:00 AM - 4:00 PM',
      lunchHoursStr: '12:00 PM - 1:00 PM',
      shifts: [
        { type: 'duty', startHour: 8.0, endHour: 12.0, label: 'Patient Reception & Files' },
        { type: 'lunch', startHour: 12.0, endHour: 13.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 13.0, endHour: 16.0, label: 'Insurance & Estimates' }
      ]
    }
  ],
  spa: [
    {
      id: 's-sp-1',
      name: 'Master Somchai',
      role: 'Senior Deep Tissue Master',
      department: 'Massage Therapy',
      avatar: 'MS',
      phone: '+91 99887 11111',
      email: 'somchai@serenityspa.com',
      status: 'Active',
      workingHoursStr: '9:00 AM - 5:00 PM',
      lunchHoursStr: '1:00 PM - 2:00 PM',
      shifts: [
        { type: 'duty', startHour: 9.0, endHour: 13.0, label: 'Deep Tissue & Hot Stone Sessions' },
        { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.0, endHour: 17.0, label: 'Couples Sanctuary Sessions' }
      ]
    },
    {
      id: 's-sp-2',
      name: 'Ananya Healer',
      role: 'Ayurvedic Doctor (BAMS)',
      department: 'Ayurvedic Therapy',
      avatar: 'AH',
      phone: '+91 99887 22222',
      email: 'ananya@serenityspa.com',
      status: 'Active',
      workingHoursStr: '9:30 AM - 5:30 PM',
      lunchHoursStr: '1:30 PM - 2:30 PM',
      shifts: [
        { type: 'duty', startHour: 9.5, endHour: 13.5, label: 'Panchakarma & Abhyanga Prep' },
        { type: 'lunch', startHour: 13.5, endHour: 14.5, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.5, endHour: 17.5, label: 'Shirodhara & Herbal Consults' }
      ]
    },
    {
      id: 's-sp-3',
      name: 'Maya Sen',
      role: 'Aromatherapy Specialist',
      department: 'Massage Therapy',
      avatar: 'MS',
      phone: '+91 99887 33333',
      email: 'maya@serenityspa.com',
      status: 'Active',
      workingHoursStr: '10:00 AM - 6:00 PM',
      lunchHoursStr: '2:00 PM - 3:00 PM',
      shifts: [
        { type: 'duty', startHour: 10.0, endHour: 14.0, label: 'Herbal Body Wraps & Scrubs' },
        { type: 'lunch', startHour: 14.0, endHour: 15.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 15.0, endHour: 18.0, label: 'Balinese Relaxation Massage' }
      ]
    },
    {
      id: 's-sp-4',
      name: 'Leela Hostess',
      role: 'Spa Concierge Lead',
      department: 'Guest Relations',
      avatar: 'LH',
      phone: '+91 99887 44444',
      email: 'leela@serenityspa.com',
      status: 'Active',
      workingHoursStr: '8:30 AM - 4:30 PM',
      lunchHoursStr: '12:30 PM - 1:30 PM',
      shifts: [
        { type: 'duty', startHour: 8.5, endHour: 12.5, label: 'Welcome Herbal Tea & Check-in' },
        { type: 'lunch', startHour: 12.5, endHour: 13.5, label: 'Lunch Break' },
        { type: 'duty', startHour: 13.5, endHour: 16.5, label: 'Lounge Care & Memberships' }
      ]
    }
  ],
  salon: [
    {
      id: 's-sl-1',
      name: 'Zara Khan',
      role: 'Master Creative Director',
      department: 'Hair Styling',
      avatar: 'ZK',
      phone: '+91 98123 11111',
      email: 'zara@luxurysalon.com',
      status: 'Active',
      workingHoursStr: '10:00 AM - 6:30 PM',
      lunchHoursStr: '2:00 PM - 3:00 PM',
      shifts: [
        { type: 'duty', startHour: 10.0, endHour: 14.0, label: 'Keratin & Precision Cuts' },
        { type: 'lunch', startHour: 14.0, endHour: 15.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 15.0, endHour: 18.5, label: 'VIP Styling Appointments' }
      ]
    },
    {
      id: 's-sl-2',
      name: 'Rohit Mehra',
      role: 'Senior Colorist',
      department: 'Color Lab',
      avatar: 'RM',
      phone: '+91 98123 22222',
      email: 'rohit@luxurysalon.com',
      status: 'Active',
      workingHoursStr: '9:30 AM - 5:30 PM',
      lunchHoursStr: '1:30 PM - 2:30 PM',
      shifts: [
        { type: 'duty', startHour: 9.5, endHour: 13.5, label: 'Balayage & Highlights Foil Work' },
        { type: 'lunch', startHour: 13.5, endHour: 14.5, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.5, endHour: 17.5, label: 'Global Color & Gloss Toners' }
      ]
    },
    {
      id: 's-sl-3',
      name: 'Tanya Roy',
      role: 'Lead Bridal Artist',
      department: 'Bridal & Makeup',
      avatar: 'TR',
      phone: '+91 98123 33333',
      email: 'tanya@luxurysalon.com',
      status: 'Active',
      workingHoursStr: '9:00 AM - 5:00 PM',
      lunchHoursStr: '1:00 PM - 2:00 PM',
      shifts: [
        { type: 'duty', startHour: 9.0, endHour: 13.0, label: 'HD Airbrush Makeup & Draping' },
        { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.0, endHour: 17.0, label: 'Bridal Trials & Consultations' }
      ]
    },
    {
      id: 's-sl-4',
      name: 'Maya Nail Tech',
      role: 'Senior Nail Artist',
      department: 'Nail Bar',
      avatar: 'MN',
      phone: '+91 98123 44444',
      email: 'maya@luxurysalon.com',
      status: 'Active',
      workingHoursStr: '10:30 AM - 6:30 PM',
      lunchHoursStr: '2:30 PM - 3:30 PM',
      shifts: [
        { type: 'duty', startHour: 10.5, endHour: 14.5, label: 'Gel Extensions & Nail Art' },
        { type: 'lunch', startHour: 14.5, endHour: 15.5, label: 'Lunch Break' },
        { type: 'duty', startHour: 15.5, endHour: 18.5, label: 'Moroccan Pedicure & Manicure' }
      ]
    }
  ],
  realestate: [
    {
      id: 's-re-1',
      name: 'Vikram Property Advisor',
      role: 'Senior Villa Specialist',
      department: 'Luxury Residential',
      avatar: 'VA',
      phone: '+91 90011 11111',
      email: 'vikram@zerorealty.com',
      status: 'Active',
      workingHoursStr: '9:00 AM - 6:00 PM',
      lunchHoursStr: '1:00 PM - 2:00 PM',
      shifts: [
        { type: 'duty', startHour: 9.0, endHour: 13.0, label: 'Villa Site Visits Tour' },
        { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.0, endHour: 18.0, label: 'Investor Token Consultations' }
      ]
    },
    {
      id: 's-re-2',
      name: 'Rajesh Commercial Head',
      role: 'Commercial Portfolio Lead',
      department: 'Commercial Advisory',
      avatar: 'RC',
      phone: '+91 90011 22222',
      email: 'rajesh@zerorealty.com',
      status: 'Active',
      workingHoursStr: '9:30 AM - 6:30 PM',
      lunchHoursStr: '1:30 PM - 2:30 PM',
      shifts: [
        { type: 'duty', startHour: 9.5, endHour: 13.5, label: 'Grade-A Floor Plate Audits' },
        { type: 'lunch', startHour: 13.5, endHour: 14.5, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.5, endHour: 18.5, label: 'Corporate Lease Agreements' }
      ]
    }
  ],
  hotel: [
    {
      id: 's-ht-1',
      name: 'Kabir Chief Concierge',
      role: 'VIP Relations Head',
      department: 'Concierge & VIP',
      avatar: 'KC',
      phone: '+91 97766 11111',
      email: 'kabir@grandhotel.com',
      status: 'Active',
      workingHoursStr: '8:00 AM - 5:00 PM',
      lunchHoursStr: '1:00 PM - 2:00 PM',
      shifts: [
        { type: 'duty', startHour: 8.0, endHour: 13.0, label: 'Presidential Suite Arrival Briefing' },
        { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.0, endHour: 17.0, label: 'Chauffeur & Dining Itinerary' }
      ]
    },
    {
      id: 's-ht-2',
      name: 'Sneha Front Desk',
      role: 'Front Office Hostess',
      department: 'Front Office',
      avatar: 'SF',
      phone: '+91 97766 22222',
      email: 'sneha@grandhotel.com',
      status: 'Active',
      workingHoursStr: '7:00 AM - 3:30 PM',
      lunchHoursStr: '11:30 AM - 12:30 PM',
      shifts: [
        { type: 'duty', startHour: 7.0, endHour: 11.5, label: 'Morning Checkouts & Folios' },
        { type: 'lunch', startHour: 11.5, endHour: 12.5, label: 'Lunch Break' },
        { type: 'duty', startHour: 12.5, endHour: 15.5, label: 'Early Arrival Keycard Issuance' }
      ]
    }
  ]
};

function formatDecimalHour(hr: number): string {
  const h = Math.floor(hr);
  const m = Math.round((hr - h) * 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const displayM = m < 10 ? `0${m}` : m;
  return `${displayH}:${displayM} ${period}`;
}

const DEFAULT_LEAVE_REQUESTS_BY_NICHE: Record<NicheId, { id: string; name: string; role: string; type: string; reason: string; dates: string; status: string }[]> = {
  skin: [
    { id: 'lr-sk-1', name: 'Rekha', role: 'Cosmetology Therapist', type: 'Sick Leave', reason: 'Fever and cold', dates: 'Aug 8 - Aug 9', status: 'Pending' },
    { id: 'lr-sk-2', name: 'Kavita', role: 'Senior Clinical Nurse', type: 'Casual Leave', reason: 'Personal work', dates: 'Aug 16', status: 'Pending' },
  ],
  dental: [
    { id: 'lr-dt-1', name: 'Sarah Hygienist', role: 'Lead Dental Hygienist', type: 'Casual Leave', reason: 'Family function', dates: 'Aug 10', status: 'Pending' },
    { id: 'lr-dt-2', name: 'Pooja Hegde', role: 'Dental Frontdesk Lead', type: 'Annual Leave', reason: 'Out of town', dates: 'Aug 14 - Aug 17', status: 'Pending' },
  ],
  spa: [
    { id: 'lr-sp-1', name: 'Maya Sen', role: 'Aromatherapy Specialist', type: 'Sick Leave', reason: 'Rest & recovery', dates: 'Aug 11', status: 'Pending' },
    { id: 'lr-sp-2', name: 'Master Somchai', role: 'Deep Tissue Master', type: 'Annual Leave', reason: 'Thailand retreat', dates: 'Aug 20 - Aug 25', status: 'Pending' },
  ],
  salon: [
    { id: 'lr-sl-1', name: 'Rohit Mehra', role: 'Senior Colorist', type: 'Casual Leave', reason: 'Masterclass attendance', dates: 'Aug 12', status: 'Pending' },
    { id: 'lr-sl-2', name: 'Maya Nail Tech', role: 'Senior Nail Artist', type: 'Sick Leave', reason: 'Hand sprain recovery', dates: 'Aug 15 - Aug 16', status: 'Pending' },
  ],
  realestate: [
    { id: 'lr-re-1', name: 'Vikram Property Advisor', role: 'Senior Villa Specialist', type: 'Casual Leave', reason: 'Site registry at sub-registrar', dates: 'Aug 12', status: 'Pending' },
  ],
  hotel: [
    { id: 'lr-ht-1', name: 'Sneha Front Desk', role: 'Front Office Hostess', type: 'Comp Off', reason: 'Weekend marathon shift', dates: 'Aug 10', status: 'Pending' },
  ],
};

function timeToDecimal(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h + (m / 60);
}

function decimalToTime(decimal: number): string {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export default function StaffCalendarPage() {
  const { role } = useRole();
  const { currentNiche } = useNiche();
  const isAdminOrManager = ['MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN'].includes(role || '');

  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 6)); // Aug 6, 2026
  const [selectedStaffDetail, setSelectedStaffDetail] = useState<StaffMember | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>(() => DEFAULT_STAFF_BY_NICHE[currentNiche] || DEFAULT_STAFF_BY_NICHE.skin);
  const [leaveRequests, setLeaveRequests] = useState(() => DEFAULT_LEAVE_REQUESTS_BY_NICHE[currentNiche] || DEFAULT_LEAVE_REQUESTS_BY_NICHE.skin);

  useEffect(() => {
    setStaffList(DEFAULT_STAFF_BY_NICHE[currentNiche] || DEFAULT_STAFF_BY_NICHE.skin);
    setLeaveRequests(DEFAULT_LEAVE_REQUESTS_BY_NICHE[currentNiche] || DEFAULT_LEAVE_REQUESTS_BY_NICHE.skin);
    setSelectedDept('All');
  }, [currentNiche]);

  const departments = ['All', ...(DEPARTMENTS_BY_NICHE[currentNiche] || DEPARTMENTS_BY_NICHE.skin)];

  // Edit schedule state
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [editForm, setEditForm] = useState({
    dutyStart: '09:00', dutyEnd: '17:00',
    lunchStart: '13:00', lunchEnd: '14:00',
    hasOnCall: false, onCallStart: '17:00', onCallEnd: '20:00'
  });

  const handlePrevDay = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1));
  const handleNextDay = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1));
  const formattedDate = currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  // Timeline hours from 8 AM to 8 PM (12 hour span)
  const timelineHours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 to 20

  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      const matchDept = selectedDept === 'All' || s.department === selectedDept;
      const matchQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchQuery;
    });
  }, [selectedDept, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    let dutyCount = 0;
    let lunchCount = 0;
    let onCallCount = 0;
    let leaveCount = 0;

    staffList.forEach(s => {
      if (s.shifts.some(sh => sh.type === 'leave')) {
        leaveCount++;
      } else {
        if (s.shifts.some(sh => sh.type === 'duty')) dutyCount++;
        if (s.shifts.some(sh => sh.type === 'lunch')) lunchCount++;
        if (s.shifts.some(sh => sh.type === 'oncall')) onCallCount++;
      }
    });

    return { total: staffList.length, dutyCount, lunchCount, onCallCount, leaveCount };
  }, [staffList]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-2xl text-blue-400">
              <Users className="w-7 h-7" />
            </div>
            Staff Working Calendar
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Real-time staff shift schedules, lunch break windows, and department duty tracking
          </p>
        </div>

        {/* Date Selector Switcher */}
        <div className="flex items-center gap-3 bg-[var(--color-glass)] backdrop-blur-xl p-2 rounded-2xl border border-[var(--color-glass-border)] shadow-lg self-start md:self-auto">
          <button onClick={handlePrevDay} className="p-2 hover:bg-[var(--color-surface)] rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-bold text-[var(--color-text)] px-2 font-mono">{formattedDate}</span>
          <button onClick={handleNextDay} className="p-2 hover:bg-[var(--color-surface)] rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] p-4 rounded-2xl shadow-lg space-y-1">
          <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Total Staff</span>
          <div className="text-2xl font-extrabold text-[var(--color-text)]">{stats.total}</div>
          <span className="text-[10px] text-blue-400 font-semibold block">Across 4 Departments</span>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl shadow-lg space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">On Duty</span>
            <UserCheck size={16} />
          </div>
          <div className="text-2xl font-extrabold text-emerald-300">{stats.dutyCount}</div>
          <span className="text-[10px] text-emerald-400/80 font-medium block">Working Scheduled Hours</span>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl shadow-lg space-y-1">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lunch Break</span>
            <Coffee size={16} />
          </div>
          <div className="text-2xl font-extrabold text-amber-300">{stats.lunchCount}</div>
          <span className="text-[10px] text-amber-400/80 font-medium block">1 Hr Staggered Slots</span>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-2xl shadow-lg space-y-1">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">On Call</span>
            <PhoneCall size={16} />
          </div>
          <div className="text-2xl font-extrabold text-blue-300">{stats.onCallCount}</div>
          <span className="text-[10px] text-blue-400/80 font-medium block">Emergency Standby</span>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl shadow-lg space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">On Leave</span>
            <UserX size={16} />
          </div>
          <div className="text-2xl font-extrabold text-rose-300">{stats.leaveCount}</div>
          <span className="text-[10px] text-rose-400/80 font-medium block">Approved Time Off</span>
        </div>
      </div>

      {/* Control Toolbar: Department Filters & Search */}
      <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] p-3 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Department Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-hide">
          <Building2 size={16} className="text-[var(--color-text-muted)] shrink-0 ml-1 mr-1" />
          <button
            onClick={() => setSelectedDept('All')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
              selectedDept === 'All'
                ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20"
                : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white"
            )}
          >
            All Departments
          </button>
          {departments.filter(d => d !== 'All').map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
                selectedDept === dept
                  ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20"
                  : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white"
              )}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search staff name or role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Staff Working Timeline Grid */}
      <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Grid Header with Time Columns */}
            <div className="grid grid-cols-13 border-b border-[var(--color-glass-border)] bg-[var(--color-surface)]/40 p-4">
              <div className="col-span-3 font-bold text-xs text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2">
                <Users size={16} className="text-blue-400" />
                Staff Member & Department
              </div>
              <div className="col-span-10 grid grid-cols-12 text-center items-center">
                {timelineHours.slice(0, 12).map((h) => (
                  <span key={h} className="text-[11px] font-mono font-bold text-[var(--color-text-muted)]">
                    {formatDecimalHour(h)}
                  </span>
                ))}
              </div>
            </div>

            {/* Staff Rows */}
            <div className="divide-y divide-[var(--color-glass-border)]">
              {filteredStaff.length === 0 ? (
                <div className="p-12 text-center text-[var(--color-text-muted)] space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto text-blue-400 opacity-60" />
                  <p className="text-sm font-medium">No staff members found matching search filter.</p>
                </div>
              ) : (
                filteredStaff.map((staff) => (
                  <motion.div
                    key={staff.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-13 p-4 items-center hover:bg-[var(--color-surface)]/30 transition-colors group"
                  >
                    {/* Staff Profile Left Cell */}
                    <div 
                      onClick={() => setSelectedStaffDetail(staff)}
                      className="col-span-3 flex items-center gap-3 cursor-pointer pr-3"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                          {staff.avatar}
                        </div>
                        <span className={cn(
                          "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[var(--color-bg)]",
                          staff.status === 'Active' ? "bg-emerald-500" :
                          staff.status === 'On Break' ? "bg-amber-500" :
                          staff.status === 'On Call' ? "bg-blue-500" : "bg-rose-500"
                        )} />
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-sm text-[var(--color-text)] truncate group-hover:text-blue-300 transition-colors">
                          {staff.name}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)] truncate">{staff.role}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                            {staff.department}
                          </span>
                          <span className="text-[10px] text-amber-300 font-mono">
                            🍱 {staff.lunchHoursStr}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Shift Bar Right Cell (spanning 12 hours: 8 AM to 8 PM) */}
                    <div className="col-span-10 relative h-14 bg-[var(--color-surface)]/50 rounded-2xl border border-[var(--color-border)] p-1 overflow-hidden">
                      {/* Hour background grid lines */}
                      <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="border-r border-[var(--color-border)]/20 h-full" />
                        ))}
                      </div>

                      {/* Render each shift block */}
                      {staff.shifts.map((block, idx) => {
                        const totalSpan = 12; // 8 AM to 8 PM = 12 hours
                        const startOffset = Math.max(0, block.startHour - 8);
                        const duration = block.endHour - block.startHour;
                        
                        const leftPct = (startOffset / totalSpan) * 100;
                        const widthPct = (duration / totalSpan) * 100;

                        const legendItem = SHIFT_LEGEND.find(l => l.type === block.type);

                        return (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.01, zIndex: 10 }}
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`
                            }}
                            className={cn(
                              "absolute top-1.5 bottom-1.5 rounded-xl p-2 border backdrop-blur-md flex flex-col justify-center overflow-hidden shadow-md cursor-pointer transition-all",
                              legendItem?.barColor
                            )}
                            onClick={() => setSelectedStaffDetail(staff)}
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold truncate">
                              <span className="flex items-center gap-1">
                                {block.type === 'lunch' && <Coffee size={12} className="shrink-0 text-amber-200" />}
                                {block.type === 'oncall' && <PhoneCall size={12} className="shrink-0 text-blue-200" />}
                                {block.type === 'leave' && <UserX size={12} className="shrink-0 text-rose-200" />}
                                {block.label || legendItem?.label}
                              </span>
                              <span className="font-mono text-[9px] opacity-90 shrink-0 ml-1">
                                {formatDecimalHour(block.startHour)} - {formatDecimalHour(block.endHour)}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legend for Shift Types (Moved to Bottom) */}
      <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] p-4 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={14} className="text-blue-400" />
          Shift Types Legend:
        </span>
        <div className="flex items-center gap-3 flex-wrap">
          {SHIFT_LEGEND.map(leg => {
            const Icon = leg.icon;
            return (
              <div 
                key={leg.type}
                className={cn("px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2", leg.color)}
              >
                <Icon size={14} />
                <span>{leg.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Staff Detail Drawer / Modal */}
      <AnimatePresence>
        {selectedStaffDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-6 relative"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-lg">
                    {selectedStaffDetail.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[var(--color-text)]">{selectedStaffDetail.name}</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">{selectedStaffDetail.role} • {selectedStaffDetail.department}</p>
                    {/* Real-time Status Selector */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[var(--color-text-muted)]">Live Status:</span>
                      {isAdminOrManager ? (
                        <select
                          value={selectedStaffDetail.status}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            const updated = { ...selectedStaffDetail, status: newStatus };
                            setSelectedStaffDetail(updated);
                            setStaffList(prev => prev.map(s => s.id === updated.id ? updated : s));
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="On Duty">On Duty</option>
                          <option value="On Leave">On Leave</option>
                          <option value="Lunch Break">Lunch Break</option>
                          <option value="On Call">On Call</option>
                          <option value="On Treatment Session">On Treatment Session</option>
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {selectedStaffDetail.status || 'On Duty'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStaffDetail(null)}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  ✕
                </button>
              </div>

              {isEditingSchedule ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--color-text-muted)]">Duty Start</label>
                      <input type="time" value={editForm.dutyStart} onChange={e => setEditForm(prev => ({...prev, dutyStart: e.target.value}))} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--color-text-muted)]">Duty End</label>
                      <input type="time" value={editForm.dutyEnd} onChange={e => setEditForm(prev => ({...prev, dutyEnd: e.target.value}))} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--color-text-muted)]">Lunch Start</label>
                      <input type="time" value={editForm.lunchStart} onChange={e => setEditForm(prev => ({...prev, lunchStart: e.target.value}))} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[var(--color-text-muted)]">Lunch End</label>
                      <input type="time" value={editForm.lunchEnd} onChange={e => setEditForm(prev => ({...prev, lunchEnd: e.target.value}))} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
                    <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)] cursor-pointer">
                      <input type="checkbox" checked={editForm.hasOnCall} onChange={e => setEditForm(prev => ({...prev, hasOnCall: e.target.checked}))} className="rounded text-blue-600 bg-[var(--color-surface)] border-[var(--color-border)] focus:ring-blue-500" />
                      Add On-Call Shift
                    </label>
                    {editForm.hasOnCall && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[var(--color-text-muted)]">On-Call Start</label>
                          <input type="time" value={editForm.onCallStart} onChange={e => setEditForm(prev => ({...prev, onCallStart: e.target.value}))} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[var(--color-text-muted)]">On-Call End</label>
                          <input type="time" value={editForm.onCallEnd} onChange={e => setEditForm(prev => ({...prev, onCallEnd: e.target.value}))} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Timing info boxes */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3.5 space-y-1">
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Duty Shift Timing</span>
                      <div className="font-mono font-bold text-sm text-emerald-400">{selectedStaffDetail.workingHoursStr}</div>
                    </div>
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3.5 space-y-1">
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Scheduled Lunch Window</span>
                      <div className="font-mono font-bold text-sm text-amber-400">{selectedStaffDetail.lunchHoursStr}</div>
                    </div>
                  </div>

                  {/* Detailed shift timeline blocks */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Today's Detailed Timeline:</span>
                    <div className="space-y-2">
                      {selectedStaffDetail.shifts.map((sh, i) => {
                        const leg = SHIFT_LEGEND.find(l => l.type === sh.type);
                        return (
                          <div key={i} className={cn("p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold", leg?.color)}>
                            <div className="flex items-center gap-2">
                              <span className={cn("w-2.5 h-2.5 rounded-full", leg?.dot)} />
                              <span>{sh.label || leg?.label}</span>
                            </div>
                            <span className="font-mono text-xs">{formatDecimalHour(sh.startHour)} - {formatDecimalHour(sh.endHour)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="bg-[var(--color-surface)]/60 border border-[var(--color-border)] rounded-2xl p-3.5 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-muted)]">Phone:</span>
                      <span className="font-mono text-[var(--color-text)] font-semibold">{selectedStaffDetail.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-muted)]">Email:</span>
                      <span className="font-mono text-[var(--color-text)] font-semibold">{selectedStaffDetail.email}</span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center pt-2">
                {isAdminOrManager && !isEditingSchedule && (
                  <button
                    onClick={() => {
                      const dutyShift = selectedStaffDetail.shifts.find(s => s.type === 'duty');
                      const lunchShift = selectedStaffDetail.shifts.find(s => s.type === 'lunch');
                      const onCallShift = selectedStaffDetail.shifts.find(s => s.type === 'oncall');
                      setEditForm({
                        dutyStart: dutyShift ? decimalToTime(dutyShift.startHour) : '09:00',
                        dutyEnd: dutyShift ? decimalToTime(selectedStaffDetail.shifts.filter(s => s.type === 'duty').pop()?.endHour || 17) : '17:00',
                        lunchStart: lunchShift ? decimalToTime(lunchShift.startHour) : '13:00',
                        lunchEnd: lunchShift ? decimalToTime(lunchShift.endHour) : '14:00',
                        hasOnCall: !!onCallShift,
                        onCallStart: onCallShift ? decimalToTime(onCallShift.startHour) : '17:00',
                        onCallEnd: onCallShift ? decimalToTime(onCallShift.endHour) : '20:00',
                      });
                      setIsEditingSchedule(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-blue-500/10 hover:text-blue-400 text-[var(--color-text)] font-bold text-xs transition-colors"
                  >
                    Edit Schedule
                  </button>
                )}
                {isEditingSchedule ? (
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={() => setIsEditingSchedule(false)}
                      className="px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] font-bold text-xs hover:bg-[var(--color-bg)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const newShifts: StaffShiftBlock[] = [];
                        const dStart = timeToDecimal(editForm.dutyStart);
                        const dEnd = timeToDecimal(editForm.dutyEnd);
                        const lStart = timeToDecimal(editForm.lunchStart);
                        const lEnd = timeToDecimal(editForm.lunchEnd);
                        
                        if (lStart > dStart && lStart < dEnd) {
                          newShifts.push({ type: 'duty', startHour: dStart, endHour: lStart, label: 'Morning Duty' });
                          newShifts.push({ type: 'lunch', startHour: lStart, endHour: lEnd, label: 'Lunch Break' });
                          newShifts.push({ type: 'duty', startHour: lEnd, endHour: dEnd, label: 'Afternoon Duty' });
                        } else {
                          newShifts.push({ type: 'duty', startHour: dStart, endHour: dEnd, label: 'Duty Time' });
                        }
                        
                        if (editForm.hasOnCall) {
                          newShifts.push({ type: 'oncall', startHour: timeToDecimal(editForm.onCallStart), endHour: timeToDecimal(editForm.onCallEnd), label: 'On Call' });
                        }

                        const formatTimeAMPM = (d: number) => {
                          const h = Math.floor(d);
                          const m = Math.round((d - h) * 60);
                          const ampm = h >= 12 ? 'PM' : 'AM';
                          const hr = h % 12 || 12;
                          return `${hr}:${m.toString().padStart(2, '0')} ${ampm}`;
                        };

                        const updatedStaff = {
                          ...selectedStaffDetail,
                          shifts: newShifts,
                          workingHoursStr: `${formatTimeAMPM(dStart)} - ${formatTimeAMPM(dEnd)}`,
                          lunchHoursStr: `${formatTimeAMPM(lStart)} - ${formatTimeAMPM(lEnd)}`
                        };

                        setStaffList(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
                        setSelectedStaffDetail(updatedStaff);
                        setIsEditingSchedule(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedStaffDetail(null);
                      setIsEditingSchedule(false);
                    }}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all ml-auto"
                  >
                    Close Inspector
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
