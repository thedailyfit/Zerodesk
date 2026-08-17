'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Coffee, 
  UserCheck, 
  UserX, 
  Activity, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  AlertCircle,
  Edit2,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNiche } from '@/components/providers/niche-provider';
import { useRole } from '@/components/providers/role-provider';

export type ShiftType = 'consultation' | 'surgery' | 'lunch' | 'leave';

export interface DoctorShiftBlock {
  type: ShiftType;
  startHour: number;
  endHour: number;
  label?: string;
}

export interface DoctorMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  phone: string;
  email: string;
  status: 'Active' | 'On Break' | 'In Surgery' | 'Off Shift';
  shifts: DoctorShiftBlock[];
  workingHoursStr: string;
  lunchHoursStr: string;
}

const SHIFT_LEGEND = [
  { 
    type: 'consultation' as ShiftType, 
    label: 'Consultation', 
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', 
    barColor: 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-400/50 text-emerald-100',
    dot: 'bg-emerald-400',
    icon: UserCheck 
  },
  { 
    type: 'surgery' as ShiftType, 
    label: 'Surgery Block', 
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', 
    barColor: 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400/50 text-purple-100',
    dot: 'bg-purple-400',
    icon: Activity 
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
    type: 'leave' as ShiftType, 
    label: 'On Leave', 
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', 
    barColor: 'bg-gradient-to-r from-rose-600 to-red-600 border-rose-400/50 text-rose-100',
    dot: 'bg-rose-400',
    icon: UserX 
  },
];

const INITIAL_DOCTORS: DoctorMember[] = [
  {
    id: 'doc_1',
    name: 'Dr. Meenakshi',
    role: 'Senior Consultant',
    specialty: 'Dermatology',
    avatar: 'DM',
    phone: '+91 98765 11111',
    email: 'meenakshi@zerodesk.com',
    status: 'Active',
    workingHoursStr: '9:00 AM - 5:00 PM',
    lunchHoursStr: '1:00 PM - 2:00 PM',
    shifts: [
      { type: 'consultation', startHour: 9.0, endHour: 13.0, label: 'Morning Consultations' },
      { type: 'lunch', startHour: 13.0, endHour: 14.0, label: 'Lunch Break' },
      { type: 'surgery', startHour: 14.0, endHour: 17.0, label: 'Procedure Duty' }
    ]
  },
  {
    id: 'doc_2',
    name: 'Dr. Arun',
    role: 'Chief Surgeon',
    specialty: 'Cosmetology',
    avatar: 'DA',
    phone: '+91 98765 22222',
    email: 'arun@zerodesk.com',
    status: 'In Surgery',
    workingHoursStr: '10:00 AM - 6:00 PM',
    lunchHoursStr: '2:00 PM - 3:00 PM',
    shifts: [
      { type: 'surgery', startHour: 10.0, endHour: 14.0, label: 'Surgery OT Duty' },
      { type: 'lunch', startHour: 14.0, endHour: 15.0, label: 'Lunch Break' },
      { type: 'consultation', startHour: 15.0, endHour: 18.0, label: 'Post-Op Rounds' }
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

export default function DoctorCalendarPage() {
  const { currentNiche, nicheConfig } = useNiche();
  const { role } = useRole();
  const terminology = nicheConfig.terminology.staff || 'Doctor';

  const [doctors, setDoctors] = useState<DoctorMember[]>(INITIAL_DOCTORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('Today');
  const [editingDoctor, setEditingDoctor] = useState<DoctorMember | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`zerodesk_doctor_schedule_${currentNiche}`);
    if (saved) {
      try {
        setDoctors(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved schedule');
      }
    }
  }, [currentNiche]);

  // Save to localStorage
  const saveSchedule = (updatedDoctors: DoctorMember[]) => {
    setDoctors(updatedDoctors);
    localStorage.setItem(`zerodesk_doctor_schedule_${currentNiche}`, JSON.stringify(updatedDoctors));
    setEditingDoctor(null);
  };

  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingDoctor) return;
    
    // Quick mock save: just updating the basic hours strings for demo
    // A real implementation would parse the times and recreate the shift blocks
    const formData = new FormData(e.currentTarget);
    const workHours = formData.get('workHours') as string;
    const lunchHours = formData.get('lunchHours') as string;
    
    const updated = doctors.map(d => 
      d.id === editingDoctor.id ? { 
        ...d, 
        workingHoursStr: workHours,
        lunchHoursStr: lunchHours
      } : d
    );
    saveSchedule(updated);
  };

  const timelineHours = Array.from({ length: 13 }, (_, i) => i + 8);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [doctors, searchQuery]);

  // Access Control
  if (role === 'STAFF') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Lock className="w-16 h-16 text-rose-500/50" />
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Access Denied</h2>
        <p className="text-[var(--color-text-muted)] text-sm">
          Only Managers and Administrators can view and edit the {terminology} schedule.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-3 mt-1 tracking-tight">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400">
              <Users className="w-7 h-7" />
            </div>
            {terminology} Schedule & Availability
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Manage consultations, surgery blocks, and availability.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[var(--color-surface)] p-2 rounded-2xl border border-[var(--color-border)] shadow-sm">
          <button className="p-2 hover:bg-[var(--color-bg)] rounded-xl text-[var(--color-text-muted)] transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-bold text-[var(--color-text)] px-2">{selectedDate}</span>
          <button className="p-2 hover:bg-[var(--color-bg)] rounded-xl text-[var(--color-text-muted)] transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder={`Search ${terminology.toLowerCase()}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-9 pr-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {SHIFT_LEGEND.map(leg => {
            const Icon = leg.icon;
            return (
              <div key={leg.type} className={cn("px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2", leg.color)}>
                <Icon size={14} />
                <span>{leg.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            <div className="grid grid-cols-13 border-b border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <div className="col-span-3 font-bold text-xs text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2">
                <Users size={16} className="text-emerald-400" />
                {terminology} Profile
              </div>
              <div className="col-span-10 grid grid-cols-12 text-center items-center">
                {timelineHours.slice(0, 12).map((h) => (
                  <span key={h} className="text-[11px] font-mono font-bold text-[var(--color-text-muted)]">
                    {formatDecimalHour(h)}
                  </span>
                ))}
              </div>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {filteredDoctors.length === 0 ? (
                <div className="p-12 text-center text-[var(--color-text-muted)] space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto text-emerald-400 opacity-60" />
                  <p className="text-sm font-medium">No results found.</p>
                </div>
              ) : (
                filteredDoctors.map((doc) => (
                  <div key={doc.id} className="grid grid-cols-13 p-4 items-center hover:bg-[var(--color-bg)]/50 transition-colors group">
                    <div className="col-span-3 flex items-start justify-between pr-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-bold text-white text-xs">
                          {doc.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[var(--color-text)]">{doc.name}</div>
                          <div className="text-xs text-[var(--color-text-muted)]">{doc.specialty}</div>
                          <div className="text-[10px] text-emerald-400 mt-1">{doc.workingHoursStr}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => setEditingDoctor(doc)}
                        className="p-1.5 text-[var(--color-text-muted)] hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit Schedule"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>

                    <div className="col-span-10 relative h-12 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] p-1 overflow-hidden">
                      <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="border-r border-[var(--color-border)] h-full" />
                        ))}
                      </div>

                      {doc.shifts.map((block, idx) => {
                        const totalSpan = 12; 
                        const startOffset = Math.max(0, block.startHour - 8);
                        const duration = block.endHour - block.startHour;
                        
                        const leftPct = (startOffset / totalSpan) * 100;
                        const widthPct = (duration / totalSpan) * 100;

                        const legendItem = SHIFT_LEGEND.find(l => l.type === block.type);

                        return (
                          <div
                            key={idx}
                            style={{ left: `\${leftPct}%`, width: `\${widthPct}%` }}
                            className={cn(
                              "absolute top-1 bottom-1 rounded-lg px-2 flex flex-col justify-center overflow-hidden",
                              legendItem?.barColor
                            )}
                          >
                            <div className="flex items-center gap-1 text-[10px] font-bold truncate">
                              <span>{block.label || legendItem?.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Edit Schedule: {editingDoctor.name}</h3>
              
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Working Hours (String format)</label>
                  <input 
                    name="workHours"
                    defaultValue={editingDoctor.workingHoursStr}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Lunch Window (String format)</label>
                  <input 
                    name="lunchHours"
                    defaultValue={editingDoctor.lunchHoursStr}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                {/* Real implementation would parse individual shift times, simplified for demo */}

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => setEditingDoctor(null)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
