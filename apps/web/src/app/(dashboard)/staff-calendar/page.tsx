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
  AlertCircle,
  Plus,
  Clock,
  Edit2,
  Check,
  X,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ShiftType = 'duty' | 'lunch' | 'leave' | 'oncall';

export interface StaffShiftBlock {
  type: ShiftType;
  startHour: number; // e.g. 9.0 for 9:00 AM
  endHour: number;   // e.g. 13.0 for 1:00 PM
  label?: string;
}

export type StaffWorkingStatus = 
  | 'On Duty' 
  | 'Active' 
  | 'On Treatment Session' 
  | 'Lunch Break' 
  | 'On Leave' 
  | 'Off Shift'
  | 'On Call';

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  phone: string;
  email: string;
  status: StaffWorkingStatus;
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

const STATUS_OPTIONS: StaffWorkingStatus[] = [
  'On Duty',
  'Active',
  'On Treatment Session',
  'Lunch Break',
  'On Leave',
  'Off Shift',
];

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

// Rich, realistic default staff per niche
const DEFAULT_STAFF_BY_NICHE: Record<NicheId, StaffMember[]> = {
  skin: [
    {
      id: 'st_skin_1',
      name: 'Dr. Ananya Sen',
      role: 'Senior Dermatologist & Medical Director',
      department: 'Dermatology',
      avatar: 'AS',
      phone: '+91 98201 12345',
      email: 'ananya.sen@clinic.zerodesk.com',
      status: 'On Duty',
      shifts: [
        { type: 'duty', startHour: 9.0, endHour: 13.0, label: 'Morning Consultations' },
        { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.0, endHour: 18.0, label: 'OPD & Laser Sittings' },
      ],
      workingHoursStr: '09:00 AM - 06:00 PM',
      lunchHoursStr: '01:00 PM - 02:00 PM',
    },
    {
      id: 'st_skin_2',
      name: 'Dr. Rohan Mehra',
      role: 'Aesthetic Specialist',
      department: 'Cosmetology',
      avatar: 'RM',
      phone: '+91 98201 23456',
      email: 'rohan.mehra@clinic.zerodesk.com',
      status: 'On Treatment Session',
      shifts: [
        { type: 'duty', startHour: 10.0, endHour: 14.0, label: 'Injectables & Peels' },
        { type: 'lunch', startHour: 14.0, endHour: 15.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 15.0, endHour: 19.0, label: 'Evening Consultations' },
      ],
      workingHoursStr: '10:00 AM - 07:00 PM',
      lunchHoursStr: '02:00 PM - 03:00 PM',
    },
    {
      id: 'st_skin_3',
      name: 'Priya Nair',
      role: 'Head Laser Esthetician',
      department: 'Wellness',
      avatar: 'PN',
      phone: '+91 98201 34567',
      email: 'priya.nair@clinic.zerodesk.com',
      status: 'Active',
      shifts: [
        { type: 'duty', startHour: 9.0, endHour: 13.0, label: 'Laser Treatments' },
        { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.0, endHour: 18.0, label: 'HydraFacials' },
      ],
      workingHoursStr: '09:00 AM - 06:00 PM',
      lunchHoursStr: '01:00 PM - 02:00 PM',
    },
    {
      id: 'st_skin_4',
      name: 'Sneha Roy',
      role: 'Frontdesk & Patient Care Lead',
      department: 'Reception',
      avatar: 'SR',
      phone: '+91 98201 45678',
      email: 'sneha.roy@clinic.zerodesk.com',
      status: 'Lunch Break',
      shifts: [
        { type: 'duty', startHour: 8.5, endHour: 12.5, label: 'Morning Inbound & Check-in' },
        { type: 'lunch', startHour: 12.5, endHour: 13.5, label: 'Lunch Break' },
        { type: 'duty', startHour: 13.5, endHour: 17.5, label: 'Billing & Dispatch' },
      ],
      workingHoursStr: '08:30 AM - 05:30 PM',
      lunchHoursStr: '12:30 PM - 01:30 PM',
    },
  ],
  dental: [
    {
      id: 'st_dent_1',
      name: 'Dr. Sameer Kapoor',
      role: 'Chief Endodontist & Implantologist',
      department: 'Endodontics',
      avatar: 'SK',
      phone: '+91 98301 11223',
      email: 'sameer.k@dental.zerodesk.com',
      status: 'On Duty',
      shifts: [
        { type: 'duty', startHour: 9.0, endHour: 13.0, label: 'Root Canal Surgeries' },
        { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.0, endHour: 18.0, label: 'Implant Sittings' },
      ],
      workingHoursStr: '09:00 AM - 06:00 PM',
      lunchHoursStr: '01:00 PM - 02:00 PM',
    },
    {
      id: 'st_dent_2',
      name: 'Dr. Nidhi Verma',
      role: 'Consultant Orthodontist',
      department: 'Orthodontics',
      avatar: 'NV',
      phone: '+91 98301 22334',
      email: 'nidhi.v@dental.zerodesk.com',
      status: 'On Treatment Session',
      shifts: [
        { type: 'duty', startHour: 10.0, endHour: 14.0, label: 'Aligner Checkups' },
        { type: 'lunch', startHour: 14.0, endHour: 15.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 15.0, endHour: 19.0, label: 'Braces Adjustments' },
      ],
      workingHoursStr: '10:00 AM - 07:00 PM',
      lunchHoursStr: '02:00 PM - 03:00 PM',
    },
    {
      id: 'st_dent_3',
      name: 'Rahul Sharma',
      role: 'Dental Hygienist & Scaling Lead',
      department: 'Hygiene & Prep',
      avatar: 'RS',
      phone: '+91 98301 33445',
      email: 'rahul.s@dental.zerodesk.com',
      status: 'Active',
      shifts: [
        { type: 'duty', startHour: 9.0, endHour: 13.0, label: 'Ultrasonic Scaling' },
        { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.0, endHour: 18.0, label: 'Polishing & Fluoride' },
      ],
      workingHoursStr: '09:00 AM - 06:00 PM',
      lunchHoursStr: '01:00 PM - 02:00 PM',
    },
    {
      id: 'st_dent_4',
      name: 'Meera Iyer',
      role: 'Front Office Coordinator',
      department: 'Front Office',
      avatar: 'MI',
      phone: '+91 98301 44556',
      email: 'meera.i@dental.zerodesk.com',
      status: 'Lunch Break',
      shifts: [
        { type: 'duty', startHour: 8.5, endHour: 12.5, label: 'Desk Coordination' },
        { type: 'lunch', startHour: 12.5, endHour: 13.5, label: 'Lunch Break' },
        { type: 'duty', startHour: 13.5, endHour: 17.5, label: 'Patient Triage' },
      ],
      workingHoursStr: '08:30 AM - 05:30 PM',
      lunchHoursStr: '12:30 PM - 01:30 PM',
    },
  ],
  spa: [
    {
      id: 'st_spa_1',
      name: 'Maya Sharma',
      role: 'Senior Ayurvedic Master',
      department: 'Ayurvedic Therapy',
      avatar: 'MS',
      phone: '+91 98401 11111',
      email: 'maya@wellness.zerodesk.com',
      status: 'On Duty',
      shifts: [
        { type: 'duty', startHour: 9.0, endHour: 13.0, label: 'Abhyanga Sessions' },
        { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.0, endHour: 18.0, label: 'Shirodhara Rituals' },
      ],
      workingHoursStr: '09:00 AM - 06:00 PM',
      lunchHoursStr: '01:00 PM - 02:00 PM',
    },
    {
      id: 'st_spa_2',
      name: 'Arjun Rao',
      role: 'Deep Tissue Therapist',
      department: 'Massage Therapy',
      avatar: 'AR',
      phone: '+91 98401 22222',
      email: 'arjun@wellness.zerodesk.com',
      status: 'On Treatment Session',
      shifts: [
        { type: 'duty', startHour: 10.0, endHour: 14.0, label: 'Swedish Massage' },
        { type: 'lunch', startHour: 14.0, endHour: 15.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 15.0, endHour: 19.0, label: 'Hot Stone Therapy' },
      ],
      workingHoursStr: '10:00 AM - 07:00 PM',
      lunchHoursStr: '02:00 PM - 03:00 PM',
    },
    {
      id: 'st_spa_3',
      name: 'Anita Patel',
      role: 'Guest Concierge',
      department: 'Guest Relations',
      avatar: 'AP',
      phone: '+91 98401 33333',
      email: 'anita@wellness.zerodesk.com',
      status: 'Active',
      shifts: [
        { type: 'duty', startHour: 9.0, endHour: 13.0, label: 'Suite Scheduling' },
        { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.0, endHour: 18.0, label: 'Guest Check-ins' },
      ],
      workingHoursStr: '09:00 AM - 06:00 PM',
      lunchHoursStr: '01:00 PM - 02:00 PM',
    },
  ],
  salon: [
    {
      id: 'st_sal_1',
      name: 'Vikram Mehta',
      role: 'Master Hair Stylist',
      department: 'Hair Styling',
      avatar: 'VM',
      phone: '+91 98501 11111',
      email: 'vikram@salon.zerodesk.com',
      status: 'On Duty',
      shifts: [
        { type: 'duty', startHour: 9.0, endHour: 13.0, label: 'Precision Cuts' },
        { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.0, endHour: 18.0, label: 'Keratin & Styling' },
      ],
      workingHoursStr: '09:00 AM - 06:00 PM',
      lunchHoursStr: '01:00 PM - 02:00 PM',
    },
    {
      id: 'st_sal_2',
      name: 'Natasha Singh',
      role: 'Creative Color Director',
      department: 'Color Lab',
      avatar: 'NS',
      phone: '+91 98501 22222',
      email: 'natasha@salon.zerodesk.com',
      status: 'On Treatment Session',
      shifts: [
        { type: 'duty', startHour: 10.0, endHour: 14.0, label: 'Balayage & Highlights' },
        { type: 'lunch', startHour: 14.0, endHour: 15.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 15.0, endHour: 19.0, label: 'Toner & Glossing' },
      ],
      workingHoursStr: '10:00 AM - 07:00 PM',
      lunchHoursStr: '02:00 PM - 03:00 PM',
    },
  ],
  realestate: [
    {
      id: 'st_re_1',
      name: 'Rajesh Varma',
      role: 'VP Luxury Residential',
      department: 'Luxury Residential',
      avatar: 'RV',
      phone: '+91 98601 11111',
      email: 'rajesh@realty.zerodesk.com',
      status: 'On Duty',
      shifts: [
        { type: 'duty', startHour: 9.0, endHour: 13.0, label: 'Client Portfolios' },
        { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.0, endHour: 18.0, label: 'Site Walkthroughs' },
      ],
      workingHoursStr: '09:00 AM - 06:00 PM',
      lunchHoursStr: '01:00 PM - 02:00 PM',
    },
    {
      id: 'st_re_2',
      name: 'Priya Deshmukh',
      role: 'Senior Portfolio Advisor',
      department: 'Commercial Advisory',
      avatar: 'PD',
      phone: '+91 98601 22222',
      email: 'priya.d@realty.zerodesk.com',
      status: 'On Treatment Session',
      shifts: [
        { type: 'duty', startHour: 10.0, endHour: 14.0, label: 'Investor Consultations' },
        { type: 'lunch', startHour: 14.0, endHour: 15.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 15.0, endHour: 19.0, label: 'Cost Sheet Closures' },
      ],
      workingHoursStr: '10:00 AM - 07:00 PM',
      lunchHoursStr: '02:00 PM - 03:00 PM',
    },
  ],
  hotel: [
    {
      id: 'st_hot_1',
      name: 'Vikramaditya Rao',
      role: 'Chief Concierge & Guest Relations',
      department: 'Concierge & VIP',
      avatar: 'VR',
      phone: '+91 98701 11111',
      email: 'vikramaditya@hotel.zerodesk.com',
      status: 'On Duty',
      shifts: [
        { type: 'duty', startHour: 9.0, endHour: 13.0, label: 'VIP Guest Arrivals' },
        { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 14.0, endHour: 18.0, label: 'Suite Upgrades' },
      ],
      workingHoursStr: '09:00 AM - 06:00 PM',
      lunchHoursStr: '01:00 PM - 02:00 PM',
    },
    {
      id: 'st_hot_2',
      name: 'Alisha Khan',
      role: 'Front Office Manager',
      department: 'Front Office',
      avatar: 'AK',
      phone: '+91 98701 22222',
      email: 'alisha.k@hotel.zerodesk.com',
      status: 'Active',
      shifts: [
        { type: 'duty', startHour: 8.0, endHour: 12.0, label: 'Morning Checkout Fleet' },
        { type: 'lunch', startHour: 12.0, endHour: 13.0, label: 'Lunch Break' },
        { type: 'duty', startHour: 13.0, endHour: 17.0, label: 'Billing & Keycards' },
      ],
      workingHoursStr: '08:00 AM - 05:00 PM',
      lunchHoursStr: '12:00 PM - 01:00 PM',
    },
  ],
};

function formatDecimalHour(hr: number): string {
  const h = Math.floor(hr);
  const m = Math.round((hr - h) * 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const displayM = m < 10 ? `0${m}` : m;
  return `${displayH}:${displayM} ${period}`;
}

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
  const isAdminOrManager = ['MANAGER', 'ADMIN', 'ORG_ADMIN', 'SUPER_ADMIN'].includes(role || '');

  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedStaffDetail, setSelectedStaffDetail] = useState<StaffMember | null>(null);
  
  // Persistent staff list state
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`zerodesk_staff_calendar_${currentNiche}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return DEFAULT_STAFF_BY_NICHE[currentNiche] || DEFAULT_STAFF_BY_NICHE.skin;
  });

  // Sync when currentNiche changes
  useEffect(() => {
    let initialList = DEFAULT_STAFF_BY_NICHE[currentNiche] || DEFAULT_STAFF_BY_NICHE.skin;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`zerodesk_staff_calendar_${currentNiche}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialList = parsed;
          }
        } catch {}
      }
    }
    setStaffList(initialList);
    setSelectedDept('All');
  }, [currentNiche]);

  // Helper to persist list
  const persistStaffList = (newList: StaffMember[]) => {
    setStaffList(newList);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`zerodesk_staff_calendar_${currentNiche}`, JSON.stringify(newList));
    }
  };

  const departments = ['All', ...(DEPARTMENTS_BY_NICHE[currentNiche] || DEPARTMENTS_BY_NICHE.skin)];

  // Edit schedule state
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [editForm, setEditForm] = useState({
    dutyStart: '09:00', dutyEnd: '17:00',
    lunchStart: '13:00', lunchEnd: '14:00',
    hasOnCall: false, onCallStart: '17:00', onCallEnd: '20:00'
  });

  // Add Staff Member Modal State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    role: '',
    department: DEPARTMENTS_BY_NICHE[currentNiche]?.[0] || 'Dermatology',
    phone: '',
    email: '',
    status: 'On Duty' as StaffWorkingStatus,
    dutyStart: '09:00',
    dutyEnd: '18:00',
    lunchStart: '13:00',
    lunchEnd: '14:00',
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
  }, [staffList, selectedDept, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    let dutyCount = 0;
    let lunchCount = 0;
    let sessionCount = 0;
    let leaveCount = 0;

    staffList.forEach(s => {
      if (s.status === 'On Leave' || s.shifts.some(sh => sh.type === 'leave')) {
        leaveCount++;
      } else if (s.status === 'Lunch Break' || s.shifts.some(sh => sh.type === 'lunch')) {
        lunchCount++;
      } else if (s.status === 'On Treatment Session') {
        sessionCount++;
      } else {
        dutyCount++;
      }
    });

    return { total: staffList.length, dutyCount, lunchCount, sessionCount, leaveCount };
  }, [staffList]);

  // 1-Click inline status changer for Manager
  const handleQuickStatusChange = (staffId: string, newStatus: StaffWorkingStatus, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = staffList.map(s => {
      if (s.id === staffId) {
        return { ...s, status: newStatus };
      }
      return s;
    });
    persistStaffList(updated);
    if (selectedStaffDetail?.id === staffId) {
      setSelectedStaffDetail({ ...selectedStaffDetail, status: newStatus });
    }
  };

  // Add new staff member submit
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.name.trim()) return;

    const initials = newStaffForm.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ST';
    const dStart = timeToDecimal(newStaffForm.dutyStart);
    const dEnd = timeToDecimal(newStaffForm.dutyEnd);
    const lStart = timeToDecimal(newStaffForm.lunchStart);
    const lEnd = timeToDecimal(newStaffForm.lunchEnd);

    const shifts: StaffShiftBlock[] = [];
    if (lStart > dStart && lStart < dEnd) {
      shifts.push({ type: 'duty', startHour: dStart, endHour: lStart, label: 'Morning Duty' });
      shifts.push({ type: 'lunch', startHour: lStart, endHour: lEnd, label: 'Lunch Break' });
      shifts.push({ type: 'duty', startHour: lEnd, endHour: dEnd, label: 'Afternoon Duty' });
    } else {
      shifts.push({ type: 'duty', startHour: dStart, endHour: dEnd, label: 'Scheduled Shift' });
    }

    const formatTimeAMPM = (d: number) => {
      const h = Math.floor(d);
      const m = Math.round((d - h) * 60);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hr = h % 12 || 12;
      return `${hr}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    const newMember: StaffMember = {
      id: `staff_${Date.now()}`,
      name: newStaffForm.name.trim(),
      role: newStaffForm.role.trim() || 'Specialist',
      department: newStaffForm.department,
      avatar: initials,
      phone: newStaffForm.phone.trim() || '+91 98000 00000',
      email: newStaffForm.email.trim() || `${newStaffForm.name.toLowerCase().replace(/\s+/g, '.')}@zerodesk.com`,
      status: newStaffForm.status,
      shifts,
      workingHoursStr: `${formatTimeAMPM(dStart)} - ${formatTimeAMPM(dEnd)}`,
      lunchHoursStr: `${formatTimeAMPM(lStart)} - ${formatTimeAMPM(lEnd)}`,
    };

    const updated = [newMember, ...staffList];
    persistStaffList(updated);
    setIsAddStaffOpen(false);
    setNewStaffForm({
      name: '',
      role: '',
      department: DEPARTMENTS_BY_NICHE[currentNiche]?.[0] || 'Dermatology',
      phone: '',
      email: '',
      status: 'On Duty',
      dutyStart: '09:00',
      dutyEnd: '18:00',
      lunchStart: '13:00',
      lunchEnd: '14:00',
    });
  };

  const getStatusBadgeStyle = (status: StaffWorkingStatus) => {
    switch (status) {
      case 'On Duty':
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'On Treatment Session':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25';
      case 'Lunch Break':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'On Leave':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/25';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-2xl text-blue-400 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            Staff Working Calendar
          </h1>
          <p className="text-[var(--color-text-muted)] text-xs sm:text-sm mt-1">
            Real-time shift management, 1-click status toggles, and department duty tracking for Managers & Admins.
          </p>
        </div>

        {/* Date Selector Switcher & Add Staff Button */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <div className="flex items-center gap-2 bg-[var(--color-surface)] p-1.5 rounded-2xl border border-[var(--color-border)] shadow-sm">
            <button onClick={handlePrevDay} className="p-1.5 hover:bg-[var(--color-bg)] rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-[var(--color-text)] px-2 font-mono">{formattedDate}</span>
            <button onClick={handleNextDay} className="p-1.5 hover:bg-[var(--color-bg)] rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          {isAdminOrManager && (
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-102"
            >
              <Plus size={15} />
              <span>Add Staff Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Total Staff</span>
          <div className="text-2xl font-extrabold text-[var(--color-text)]">{stats.total}</div>
          <span className="text-[10px] text-blue-400 font-semibold block">Across {departments.length - 1} Departments</span>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">On Duty / Active</span>
            <UserCheck size={16} />
          </div>
          <div className="text-2xl font-extrabold text-emerald-300">{stats.dutyCount}</div>
          <span className="text-[10px] text-emerald-400/80 font-medium block">Working Shift</span>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">In Session</span>
            <Clock size={16} />
          </div>
          <div className="text-2xl font-extrabold text-indigo-300">{stats.sessionCount}</div>
          <span className="text-[10px] text-indigo-400/80 font-medium block">Active Treatment / Consult</span>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Lunch Break</span>
            <Coffee size={16} />
          </div>
          <div className="text-2xl font-extrabold text-amber-300">{stats.lunchCount}</div>
          <span className="text-[10px] text-amber-400/80 font-medium block">1 Hr Window</span>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl shadow-sm space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">On Leave</span>
            <UserX size={16} />
          </div>
          <div className="text-2xl font-extrabold text-rose-300">{stats.leaveCount}</div>
          <span className="text-[10px] text-rose-400/80 font-medium block">Time Off Approved</span>
        </div>
      </div>

      {/* Control Toolbar: Department Filters & Search */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Department Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto custom-scrollbar pb-1 md:pb-0">
          <Building2 size={16} className="text-[var(--color-text-muted)] shrink-0 ml-1 mr-1" />
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
                selectedDept === dept
                  ? "bg-blue-600 border-blue-500 text-white shadow-sm"
                  : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
            >
              {dept === 'All' ? 'All Departments' : dept}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search staff name or role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Main Staff Working Timeline Grid */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[1050px]">
            {/* Grid Header with Time Columns */}
            <div className="grid grid-cols-13 border-b border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <div className="col-span-4 font-bold text-xs text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2">
                <Users size={16} className="text-blue-400" />
                Staff Member & Working Status
              </div>
              <div className="col-span-9 grid grid-cols-12 text-center items-center">
                {timelineHours.slice(0, 12).map((h) => (
                  <span key={h} className="text-[10px] font-mono font-bold text-[var(--color-text-muted)]">
                    {formatDecimalHour(h)}
                  </span>
                ))}
              </div>
            </div>

            {/* Staff Rows */}
            <div className="divide-y divide-[var(--color-border)]">
              {filteredStaff.length === 0 ? (
                <div className="p-12 text-center text-[var(--color-text-muted)] space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto text-blue-400 opacity-60" />
                  <p className="text-sm font-medium">No staff members found matching filter.</p>
                </div>
              ) : (
                filteredStaff.map((staff) => (
                  <motion.div
                    key={staff.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-13 p-4 items-center hover:bg-[var(--color-bg)]/40 transition-colors group"
                  >
                    {/* Staff Profile Left Cell */}
                    <div className="col-span-4 flex items-center gap-3 pr-3">
                      <div 
                        onClick={() => setSelectedStaffDetail(staff)}
                        className="relative cursor-pointer shrink-0"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                          {staff.avatar}
                        </div>
                        <span className={cn(
                          "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[var(--color-bg)]",
                          staff.status === 'On Duty' || staff.status === 'Active' ? "bg-emerald-500" :
                          staff.status === 'On Treatment Session' ? "bg-indigo-500" :
                          staff.status === 'Lunch Break' ? "bg-amber-500" : "bg-rose-500"
                        )} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div 
                          onClick={() => setSelectedStaffDetail(staff)}
                          className="font-bold text-xs sm:text-sm text-[var(--color-text)] truncate cursor-pointer hover:text-blue-400 transition-colors"
                        >
                          {staff.name}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted)] truncate">{staff.role}</div>
                        
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--color-bg)] text-[var(--color-text-muted)] border border-[var(--color-border)] font-medium">
                            {staff.department}
                          </span>

                          {/* 1-Click Inline Status Dropdown for Managers */}
                          {isAdminOrManager ? (
                            <select
                              value={staff.status}
                              onChange={(e) => handleQuickStatusChange(staff.id, e.target.value as StaffWorkingStatus)}
                              className={cn(
                                "px-2 py-0.5 text-[10px] font-bold rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm",
                                getStatusBadgeStyle(staff.status)
                              )}
                              title="1-Click Manager Status Toggle"
                            >
                              {STATUS_OPTIONS.map(opt => (
                                <option key={opt} value={opt} className="bg-[var(--color-bg)] text-[var(--color-text)]">
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-md border font-bold", getStatusBadgeStyle(staff.status))}>
                              {staff.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Shift Bar Right Cell (spanning 12 hours: 8 AM to 8 PM) */}
                    <div className="col-span-9 relative h-14 bg-[var(--color-bg)]/60 rounded-2xl border border-[var(--color-border)] p-1 overflow-hidden">
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
                              "absolute top-1.5 bottom-1.5 rounded-xl p-2 border backdrop-blur-md flex flex-col justify-center overflow-hidden shadow-sm cursor-pointer transition-all",
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

      {/* Legend for Shift Types */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3">
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

      {/* Add Staff Member Modal */}
      <AnimatePresence>
        {isAddStaffOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 relative"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--color-text)]">Add Staff Member</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">Register a specialist or team member on shift</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddStaffOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Aryan Sharma"
                      value={newStaffForm.name}
                      onChange={e => setNewStaffForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">Role / Designation *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Endodontist"
                      value={newStaffForm.role}
                      onChange={e => setNewStaffForm(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">Department</label>
                    <select
                      value={newStaffForm.department}
                      onChange={e => setNewStaffForm(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    >
                      {DEPARTMENTS_BY_NICHE[currentNiche]?.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">Initial Working Status</label>
                    <select
                      value={newStaffForm.status}
                      onChange={e => setNewStaffForm(prev => ({ ...prev, status: e.target.value as StaffWorkingStatus }))}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98200 12345"
                      value={newStaffForm.phone}
                      onChange={e => setNewStaffForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="aryan@clinic.com"
                      value={newStaffForm.email}
                      onChange={e => setNewStaffForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--color-border)] space-y-2">
                  <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Shift & Lunch Hours</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-[var(--color-text-muted)]">Duty Start</label>
                      <input
                        type="time"
                        value={newStaffForm.dutyStart}
                        onChange={e => setNewStaffForm(prev => ({ ...prev, dutyStart: e.target.value }))}
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-1.5 text-xs text-[var(--color-text)]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--color-text-muted)]">Duty End</label>
                      <input
                        type="time"
                        value={newStaffForm.dutyEnd}
                        onChange={e => setNewStaffForm(prev => ({ ...prev, dutyEnd: e.target.value }))}
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-1.5 text-xs text-[var(--color-text)]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--color-text-muted)]">Lunch Start</label>
                      <input
                        type="time"
                        value={newStaffForm.lunchStart}
                        onChange={e => setNewStaffForm(prev => ({ ...prev, lunchStart: e.target.value }))}
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-1.5 text-xs text-[var(--color-text)]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--color-text-muted)]">Lunch End</label>
                      <input
                        type="time"
                        value={newStaffForm.lunchEnd}
                        onChange={e => setNewStaffForm(prev => ({ ...prev, lunchEnd: e.target.value }))}
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-1.5 text-xs text-[var(--color-text)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddStaffOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                  >
                    Add Staff Member
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Staff Detail Drawer / Modal & Shift Editor */}
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
                    {/* Live Working Status Selector */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[var(--color-text-muted)]">Live Status:</span>
                      {isAdminOrManager ? (
                        <select
                          value={selectedStaffDetail.status}
                          onChange={(e) => handleQuickStatusChange(selectedStaffDetail.id, e.target.value as StaffWorkingStatus)}
                          className={cn(
                            "px-2.5 py-1 text-xs font-bold rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm",
                            getStatusBadgeStyle(selectedStaffDetail.status)
                          )}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt} className="bg-[var(--color-bg)] text-[var(--color-text)]">
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={cn("px-2 py-0.5 text-xs font-bold rounded-md border", getStatusBadgeStyle(selectedStaffDetail.status))}>
                          {selectedStaffDetail.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedStaffDetail(null);
                    setIsEditingSchedule(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  <X size={18} />
                </button>
              </div>

              {isEditingSchedule ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[var(--color-text-muted)]">Duty Start</label>
                      <input type="time" value={editForm.dutyStart} onChange={e => setEditForm(prev => ({...prev, dutyStart: e.target.value}))} className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[var(--color-text-muted)]">Duty End</label>
                      <input type="time" value={editForm.dutyEnd} onChange={e => setEditForm(prev => ({...prev, dutyEnd: e.target.value}))} className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[var(--color-text-muted)]">Lunch Start</label>
                      <input type="time" value={editForm.lunchStart} onChange={e => setEditForm(prev => ({...prev, lunchStart: e.target.value}))} className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[var(--color-text-muted)]">Lunch End</label>
                      <input type="time" value={editForm.lunchEnd} onChange={e => setEditForm(prev => ({...prev, lunchEnd: e.target.value}))} className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
                    <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)] cursor-pointer">
                      <input type="checkbox" checked={editForm.hasOnCall} onChange={e => setEditForm(prev => ({...prev, hasOnCall: e.target.checked}))} className="rounded text-blue-600 bg-[var(--color-surface)] border-[var(--color-border)] focus:ring-blue-500" />
                      Add On-Call Coverage
                    </label>
                    {editForm.hasOnCall && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[var(--color-text-muted)]">On-Call Start</label>
                          <input type="time" value={editForm.onCallStart} onChange={e => setEditForm(prev => ({...prev, onCallStart: e.target.value}))} className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[var(--color-text-muted)]">On-Call End</label>
                          <input type="time" value={editForm.onCallEnd} onChange={e => setEditForm(prev => ({...prev, onCallEnd: e.target.value}))} className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500" />
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
                    className="px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-blue-500/10 hover:text-blue-400 text-[var(--color-text)] font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Edit2 size={13} />
                    <span>Edit Shift Hours</span>
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

                        const updatedList = staffList.map(s => s.id === updatedStaff.id ? updatedStaff : s);
                        persistStaffList(updatedList);
                        setSelectedStaffDetail(updatedStaff);
                        setIsEditingSchedule(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all"
                    >
                      Save Shift Changes
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedStaffDetail(null);
                      setIsEditingSchedule(false);
                    }}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all ml-auto"
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
