'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalIcon, 
  Clock, 
  Users, 
  Coffee, 
  UserCheck, 
  UserX, 
  PhoneCall, 
  Building2, 
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Info,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ShiftType = 'duty' | 'lunch' | 'leave' | 'oncall';
export type Department = 'Dermatology' | 'Cosmetology' | 'Reception' | 'Wellness';

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
  department: Department;
  avatar: string;
  phone: string;
  email: string;
  status: 'Active' | 'On Break' | 'Off Shift' | 'On Call';
  shifts: StaffShiftBlock[];
  workingHoursStr: string;
  lunchHoursStr: string;
}

const DEPARTMENTS: Department[] = ['Dermatology', 'Cosmetology', 'Reception', 'Wellness'];

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
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', 
    barColor: 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400/50 text-purple-100',
    dot: 'bg-purple-400',
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

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 's1',
    name: 'Dr. Meenakshi',
    role: 'Senior Dermatologist',
    department: 'Dermatology',
    avatar: 'DM',
    phone: '+91 98765 11111',
    email: 'meenakshi@zerodesk.com',
    status: 'Active',
    workingHoursStr: '9:00 AM - 5:00 PM',
    lunchHoursStr: '1:00 PM - 2:00 PM',
    shifts: [
      { type: 'duty', startHour: 9.0, endHour: 13.0, label: 'Morning Consultations' },
      { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
      { type: 'duty', startHour: 14.0, endHour: 17.0, label: 'Afternoon Procedure Duty' },
      { type: 'oncall', startHour: 17.0, endHour: 20.0, label: 'Emergency On Call' }
    ]
  },
  {
    id: 's2',
    name: 'Dr. Arun',
    role: 'Cosmetic Surgeon',
    department: 'Cosmetology',
    avatar: 'DA',
    phone: '+91 98765 22222',
    email: 'arun@zerodesk.com',
    status: 'Active',
    workingHoursStr: '10:00 AM - 6:00 PM',
    lunchHoursStr: '2:00 PM - 3:00 PM',
    shifts: [
      { type: 'duty', startHour: 10.0, endHour: 14.0, label: 'Surgery OT Duty' },
      { type: 'lunch', startHour: 14.0, endHour: 15.0, label: 'Lunch Break' },
      { type: 'duty', startHour: 15.0, endHour: 18.0, label: 'Post-Op Rounds & Consults' }
    ]
  },
  {
    id: 's3',
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
    id: 's4',
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
    id: 's5',
    name: 'Sunita',
    role: 'Wellness Specialist',
    department: 'Wellness',
    avatar: 'SN',
    phone: '+91 98765 55555',
    email: 'sunita@zerodesk.com',
    status: 'On Break',
    workingHoursStr: '9:30 AM - 5:30 PM',
    lunchHoursStr: '1:00 PM - 2:00 PM',
    shifts: [
      { type: 'duty', startHour: 9.5, endHour: 13.0, label: 'Wellness Massages' },
      { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
      { type: 'duty', startHour: 14.0, endHour: 17.5, label: 'Holistic Spa Therapy' }
    ]
  },
  {
    id: 's6',
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
  },
  {
    id: 's7',
    name: 'Amit',
    role: 'Reception Coordinator',
    department: 'Reception',
    avatar: 'AM',
    phone: '+91 98765 77777',
    email: 'amit@zerodesk.com',
    status: 'Off Shift',
    workingHoursStr: 'On Leave Today',
    lunchHoursStr: 'N/A',
    shifts: [
      { type: 'leave', startHour: 8.0, endHour: 20.0, label: 'Annual Paid Leave' }
    ]
  },
];

function formatDecimalHour(hr: number): string {
  const h = Math.floor(hr);
  const m = Math.round((hr - h) * 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const displayM = m < 10 ? `0${m}` : m;
  return `${displayH}:${displayM} ${period}`;
}

export default function StaffCalendarPage() {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('Today - Aug 6, 2026');
  const [selectedStaffDetail, setSelectedStaffDetail] = useState<StaffMember | null>(null);

  // Timeline hours from 8 AM to 8 PM (12 hour span)
  const timelineHours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 to 20

  const filteredStaff = useMemo(() => {
    return INITIAL_STAFF.filter(s => {
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

    INITIAL_STAFF.forEach(s => {
      if (s.shifts.some(sh => sh.type === 'leave')) {
        leaveCount++;
      } else {
        if (s.shifts.some(sh => sh.type === 'duty')) dutyCount++;
        if (s.shifts.some(sh => sh.type === 'lunch')) lunchCount++;
        if (s.shifts.some(sh => sh.type === 'oncall')) onCallCount++;
      }
    });

    return { total: INITIAL_STAFF.length, dutyCount, lunchCount, onCallCount, leaveCount };
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              Admin & Manager Portal
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-3 mt-1 tracking-tight">
            <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-2xl text-purple-400">
              <Users className="w-7 h-7" />
            </div>
            Staff Working Calendar
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Real-time staff shift schedules, exact lunch break windows, and department duty tracking
          </p>
        </div>

        {/* Date Selector Switcher */}
        <div className="flex items-center gap-3 bg-[var(--color-glass)] backdrop-blur-xl p-2 rounded-2xl border border-[var(--color-glass-border)] shadow-lg self-start md:self-auto">
          <button className="p-2 hover:bg-[var(--color-surface)] rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-bold text-[var(--color-text)] px-2 font-mono">{selectedDate}</span>
          <button className="p-2 hover:bg-[var(--color-surface)] rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] p-4 rounded-2xl shadow-lg space-y-1">
          <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Total Staff</span>
          <div className="text-2xl font-extrabold text-[var(--color-text)]">{stats.total}</div>
          <span className="text-[10px] text-purple-400 font-semibold block">Across 4 Departments</span>
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

        <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-2xl shadow-lg space-y-1">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">On Call</span>
            <PhoneCall size={16} />
          </div>
          <div className="text-2xl font-extrabold text-purple-300">{stats.onCallCount}</div>
          <span className="text-[10px] text-purple-400/80 font-medium block">Emergency Standby</span>
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
                ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20"
                : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white"
            )}
          >
            All Departments
          </button>
          {DEPARTMENTS.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
                selectedDept === dept
                  ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20"
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
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Legend for Shift Types */}
      <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] p-4 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={14} className="text-purple-400" />
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

      {/* Main Staff Working Timeline Grid */}
      <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Grid Header with Time Columns */}
            <div className="grid grid-cols-13 border-b border-[var(--color-glass-border)] bg-[var(--color-surface)]/40 p-4">
              <div className="col-span-3 font-bold text-xs text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2">
                <Users size={16} className="text-purple-400" />
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
                  <AlertCircle className="w-8 h-8 mx-auto text-purple-400 opacity-60" />
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
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                          {staff.avatar}
                        </div>
                        <span className={cn(
                          "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[var(--color-bg)]",
                          staff.status === 'Active' ? "bg-emerald-500" :
                          staff.status === 'On Break' ? "bg-amber-500" :
                          staff.status === 'On Call' ? "bg-purple-500" : "bg-rose-500"
                        )} />
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-sm text-[var(--color-text)] truncate group-hover:text-purple-300 transition-colors">
                          {staff.name}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)] truncate">{staff.role}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
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
                                {block.type === 'oncall' && <PhoneCall size={12} className="shrink-0 text-purple-200" />}
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
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-lg">
                    {selectedStaffDetail.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[var(--color-text)]">{selectedStaffDetail.name}</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">{selectedStaffDetail.role} • {selectedStaffDetail.department}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStaffDetail(null)}
                  className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  ✕
                </button>
              </div>

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

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedStaffDetail(null)}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
