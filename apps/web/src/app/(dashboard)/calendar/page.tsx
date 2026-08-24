'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalIcon, 
  Filter, 
  Plus, 
  Clock, 
  Edit3, 
  Move, 
  X, 
  Check, 
  Sparkles,
  Stethoscope,
  Scissors,
  HeartPulse,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = '2h' | '4h' | '12h' | '24h' | 'weekly' | '15days';

export interface Appointment {
  id: string;
  dayIndex: number; // 0-6 for Mon-Sun or 0-14 for 15 days
  dateStr: string;
  startTime: number; // decimal hour e.g. 9.5 for 9:30 AM
  duration: number; // in hours e.g. 0.5, 1, 2
  patient: string;
  phone: string;
  service: string;
  type: 'consult' | 'surgery' | 'wellness' | 'followup';
  staff: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  room?: string;
  notes?: string;
}

const TYPE_CONFIG = {
  consult: {
    label: 'Skin Checkup / Consult',
    color: 'bg-cyan-500/15 dark:bg-cyan-500/20 border-cyan-500/40 text-cyan-950 dark:text-cyan-100 hover:border-cyan-500 shadow-sm',
    badge: 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-200 border-cyan-500/30',
    dot: 'bg-cyan-500',
    icon: Stethoscope,
  },
  surgery: {
    label: 'Surgery',
    color: 'bg-rose-500/15 dark:bg-rose-500/20 border-rose-500/40 text-rose-950 dark:text-rose-100 hover:border-rose-500 shadow-sm',
    badge: 'bg-rose-500/20 text-rose-800 dark:text-rose-200 border-rose-500/30',
    dot: 'bg-rose-500',
    icon: Scissors,
  },
  wellness: {
    label: 'Wellness',
    color: 'bg-emerald-500/15 dark:bg-emerald-500/20 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 hover:border-emerald-500 shadow-sm',
    badge: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border-emerald-500/30',
    dot: 'bg-emerald-500',
    icon: HeartPulse,
  },
  followup: {
    label: 'Follow-up',
    color: 'bg-amber-500/15 dark:bg-amber-500/20 border-amber-500/40 text-amber-950 dark:text-amber-100 hover:border-amber-500 shadow-sm',
    badge: 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/30',
    dot: 'bg-amber-500',
    icon: RotateCcw,
  },
};

const STAFF_LIST = ['Dr. Meenakshi', 'Dr. Arun', 'Kavita', 'Rekha', 'Sunita'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: '1', dayIndex: 0, dateStr: '2026-08-03', startTime: 9.0, duration: 1.5, patient: 'Rajesh K.', phone: '+91 98765 43210', service: 'Skin Checkup & Acne Consult', type: 'consult', staff: 'Dr. Meenakshi', status: 'Confirmed', room: 'Consult Room 1' },
  { id: '2', dayIndex: 0, dateStr: '2026-08-03', startTime: 11.5, duration: 2.5, patient: 'Priya S.', phone: '+91 98123 45678', service: 'Hair Transplant Surgery', type: 'surgery', staff: 'Dr. Arun', status: 'Confirmed', room: 'OT 2' },
  { id: '3', dayIndex: 1, dateStr: '2026-08-04', startTime: 10.0, duration: 1.0, patient: 'Sneha R.', phone: '+91 97654 32109', service: 'Full Facial Wellness Massage', type: 'wellness', staff: 'Sunita', status: 'Confirmed', room: 'Spa Room B' },
  { id: '4', dayIndex: 1, dateStr: '2026-08-04', startTime: 14.0, duration: 0.5, patient: 'Amit P.', phone: '+91 96543 21098', service: 'Laser Treatment Follow-up', type: 'followup', staff: 'Dr. Meenakshi', status: 'Pending', room: 'Consult Room 1' },
  { id: '5', dayIndex: 2, dateStr: '2026-08-05', startTime: 9.5, duration: 1.5, patient: 'Ananya I.', phone: '+91 95432 10987', service: 'Chemical Peel & Glow', type: 'consult', staff: 'Rekha', status: 'Confirmed', room: 'Treatment 3' },
  { id: '6', dayIndex: 2, dateStr: '2026-08-05', startTime: 13.0, duration: 3.0, patient: 'Deepak M.', phone: '+91 94321 09876', service: 'Scar Revision Surgery', type: 'surgery', staff: 'Dr. Arun', status: 'Confirmed', room: 'OT 1' },
  { id: '7', dayIndex: 3, dateStr: '2026-08-06', startTime: 9.0, duration: 1.0, patient: 'Vikram S.', phone: '+91 93210 98765', service: 'PRP Scalp Therapy', type: 'wellness', staff: 'Kavita', status: 'Confirmed', room: 'Proc Room 2' },
  { id: '8', dayIndex: 3, dateStr: '2026-08-06', startTime: 11.0, duration: 0.5, patient: 'Meera J.', phone: '+91 92109 87654', service: 'Post-Op Follow-up', type: 'followup', staff: 'Dr. Meenakshi', status: 'Confirmed', room: 'Consult Room 1' },
  { id: '9', dayIndex: 4, dateStr: '2026-08-07', startTime: 10.0, duration: 1.5, patient: 'Kiran T.', phone: '+91 91098 76543', service: 'Botox Anti-Aging Consult', type: 'consult', staff: 'Dr. Meenakshi', status: 'Pending', room: 'Consult Room 2' },
  { id: '10', dayIndex: 4, dateStr: '2026-08-07', startTime: 15.0, duration: 2.0, patient: 'Rahul B.', phone: '+91 90987 65432', service: 'Full Body Laser Session', type: 'wellness', staff: 'Rekha', status: 'Confirmed', room: 'Laser Suite' },
  { id: '11', dayIndex: 5, dateStr: '2026-08-08', startTime: 11.0, duration: 1.5, patient: 'Pooja V.', phone: '+91 89876 54321', service: 'Minor Mole Excision Surgery', type: 'surgery', staff: 'Dr. Arun', status: 'Confirmed', room: 'OT 2' },
  { id: '12', dayIndex: 5, dateStr: '2026-08-08', startTime: 14.0, duration: 1.0, patient: 'Sameer N.', phone: '+91 88765 43210', service: 'HydraFacial Wellness', type: 'wellness', staff: 'Sunita', status: 'Completed', room: 'Spa Room A' },
  { id: '13', dayIndex: 6, dateStr: '2026-08-09', startTime: 10.0, duration: 0.5, patient: 'Divya M.', phone: '+91 87654 32109', service: 'Routine Skin Checkup', type: 'consult', staff: 'Dr. Meenakshi', status: 'Confirmed', room: 'Consult Room 1' },
  { id: '14', dayIndex: 7, dateStr: '2026-08-10', startTime: 9.5, duration: 1.0, patient: 'Siddharth R.', phone: '+91 86543 21098', service: 'Acne Scars Consultation', type: 'consult', staff: 'Dr. Meenakshi', status: 'Confirmed', room: 'Consult Room 1' },
  { id: '15', dayIndex: 9, dateStr: '2026-08-12', startTime: 11.0, duration: 2.0, patient: 'Neha G.', phone: '+91 85432 10987', service: 'Liposuction Follow-up', type: 'followup', staff: 'Dr. Arun', status: 'Confirmed', room: 'Consult Room 2' },
];

function formatTime(decimalHour: number): string {
  const hrs = Math.floor(decimalHour);
  const mins = Math.round((decimalHour - hrs) * 60);
  const period = hrs >= 12 ? 'PM' : 'AM';
  const displayHrs = hrs > 12 ? hrs - 12 : hrs === 0 ? 12 : hrs;
  const displayMins = mins < 10 ? `0${mins}` : mins;
  return `${displayHrs}:${displayMins} ${period}`;
}

export default function DoctorSlotsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [selectedStaff, setSelectedStaff] = useState<string>('All Staff');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [focusHour, setFocusHour] = useState<number>(9); // 9 AM default for 2h/4h focus window
  
  // Quick Edit Modal state
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtered Appointments
  const filteredAppts = useMemo(() => {
    return appointments.filter(a => {
      const matchStaff = selectedStaff === 'All Staff' || a.staff === selectedStaff;
      const matchType = selectedType === 'all' || a.type === selectedType;
      return matchStaff && matchType;
    });
  }, [appointments, selectedStaff, selectedType]);

  // Quick slot shift (+15m, +30m, -15m, -30m)
  const handleShiftTime = (id: string, deltaMinutes: number) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === id) {
        const newStart = Math.max(7, Math.min(21, a.startTime + deltaMinutes / 60));
        return { ...a, startTime: newStart };
      }
      return a;
    }));
    if (editingAppt && editingAppt.id === id) {
      setEditingAppt(prev => prev ? { ...prev, startTime: Math.max(7, Math.min(21, prev.startTime + deltaMinutes / 60)) } : null);
    }
  };

  const handleSaveAppt = (updated: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
    setIsModalOpen(false);
    setEditingAppt(null);
  };

  const handleOpenNewAppt = (dayIdx = 0, startHr = 9.0) => {
    const newAppt: Appointment = {
      id: `new-${Date.now()}`,
      dayIndex: dayIdx,
      dateStr: `2026-08-0${dayIdx + 3}`,
      startTime: startHr,
      duration: 1.0,
      patient: 'New Patient',
      phone: '+91 99999 88888',
      service: 'General Consultation',
      type: 'consult',
      staff: selectedStaff !== 'All Staff' ? selectedStaff : 'Dr. Meenakshi',
      status: 'Pending',
      room: 'Consult Room 1',
      notes: ''
    };
    setEditingAppt(newAppt);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-2xl text-blue-400">
              <CalIcon className="w-7 h-7" />
            </div>
            Doctor Slots & Appointments
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Dynamic slot allocation, quick shifting, and staff appointment grid
          </p>
        </div>

        <button
          onClick={() => handleOpenNewAppt(0, 9.0)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-95 self-start md:self-auto"
        >
          <Plus size={18} />
          Book Slot
        </button>
      </div>

      {/* View Selector Bar */}
      <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] p-2 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto p-1 scrollbar-hide">
          <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-2 mr-1 hidden sm:inline">
            Resolution:
          </span>
          {(['2h', '4h', '12h', '24h', 'weekly', '15days'] as ViewMode[]).map((v) => {
            const labels: Record<ViewMode, string> = {
              '2h': '2 Hours',
              '4h': '4 Hours',
              '12h': '12 Hours',
              '24h': '24 Hours',
              'weekly': 'Weekly',
              '15days': '15 Days'
            };
            const active = viewMode === v;
            return (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
                  active
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                )}
              >
                {active && <Sparkles size={13} className="text-cyan-300 animate-pulse" />}
                {labels[v]}
              </button>
            );
          })}
        </div>

        {/* Time Window Shift Controls for 2h & 4h modes */}
        {(viewMode === '2h' || viewMode === '4h') && (
          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs font-semibold">
            <span className="text-[var(--color-text-muted)]">Focus Time:</span>
            <button 
              onClick={() => setFocusHour(prev => Math.max(8, prev - (viewMode === '2h' ? 2 : 4)))}
              className="p-1 hover:bg-[var(--color-glass)] rounded-lg text-[var(--color-text)]"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-blue-300 font-bold min-w-[110px] text-center">
              {formatTime(focusHour)} - {formatTime(focusHour + (viewMode === '2h' ? 2 : 4))}
            </span>
            <button 
              onClick={() => setFocusHour(prev => Math.min(18, prev + (viewMode === '2h' ? 2 : 4)))}
              className="p-1 hover:bg-[var(--color-glass)] rounded-lg text-[var(--color-text)]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Filters Bar & Color Legend */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Staff Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Filter size={16} className="text-[var(--color-text-muted)] shrink-0" />
          <button
            onClick={() => setSelectedStaff('All Staff')}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0",
              selectedStaff === 'All Staff'
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-[var(--color-glass)] border-[var(--color-glass-border)] text-[var(--color-text-muted)] hover:text-white"
            )}
          >
            All Doctors & Staff
          </button>
          {STAFF_LIST.map(st => (
            <button
              key={st}
              onClick={() => setSelectedStaff(st)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0",
                selectedStaff === st
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-[var(--color-glass)] border-[var(--color-glass-border)] text-[var(--color-text-muted)] hover:text-white"
              )}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Color Coding Legend & Type Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-[var(--color-text-muted)]">Type:</span>
          <button
            onClick={() => setSelectedType('all')}
            className={cn(
              "text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all",
              selectedType === 'all'
                ? "bg-[var(--color-surface)] border-[var(--color-primary)] text-[var(--color-text)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            )}
          >
            All Types
          </button>
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setSelectedType(selectedType === key ? 'all' : key)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-all",
                cfg.badge,
                selectedType === key ? "ring-2 ring-blue-500 scale-105" : "opacity-80 hover:opacity-100"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", cfg.dot)} />
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Calendar View Container */}
      <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-3xl overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          {/* Render based on viewMode */}
          {viewMode === '2h' && (
            <DetailHoursView 
              appointments={filteredAppts} 
              focusHour={focusHour} 
              intervalMinutes={15} 
              onEdit={setEditingAppt}
              onShift={handleShiftTime}
              setIsModalOpen={setIsModalOpen}
            />
          )}

          {viewMode === '4h' && (
            <DetailHoursView 
              appointments={filteredAppts} 
              focusHour={focusHour} 
              intervalMinutes={30} 
              onEdit={setEditingAppt}
              onShift={handleShiftTime}
              setIsModalOpen={setIsModalOpen}
            />
          )}

          {(viewMode === '12h' || viewMode === '24h') && (
            <FullDayView 
              appointments={filteredAppts} 
              mode={viewMode}
              onEdit={setEditingAppt}
              onShift={handleShiftTime}
              setIsModalOpen={setIsModalOpen}
            />
          )}

          {viewMode === 'weekly' && (
            <WeeklyGridMode 
              appointments={filteredAppts} 
              onEdit={setEditingAppt}
              onShift={handleShiftTime}
              setIsModalOpen={setIsModalOpen}
            />
          )}

          {viewMode === '15days' && (
            <FifteenDaysMatrixMode 
              appointments={filteredAppts} 
              onEdit={setEditingAppt}
              setIsModalOpen={setIsModalOpen}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Quick Edit Modal */}
      <AnimatePresence>
        {isModalOpen && editingAppt && (
          <QuickEditModal
            appointment={editingAppt}
            onClose={() => {
              setIsModalOpen(false);
              setEditingAppt(null);
            }}
            onSave={handleSaveAppt}
            onShift={handleShiftTime}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================================
   COMPONENTS FOR VARIOUS VIEW RESOLUTIONS
   ========================================================================= */

// 1. Detail Hours View (2 Hours with 15m resolution OR 4 Hours with 30m resolution)
function DetailHoursView({
  appointments,
  focusHour,
  intervalMinutes,
  onEdit,
  onShift,
  setIsModalOpen
}: {
  appointments: Appointment[];
  focusHour: number;
  intervalMinutes: number; // 15 or 30
  onEdit: (a: Appointment) => void;
  onShift: (id: string, deltaMins: number) => void;
  setIsModalOpen: (open: boolean) => void;
}) {
  const totalHours = intervalMinutes === 15 ? 2 : 4;
  const totalSlots = (totalHours * 60) / intervalMinutes;

  // Generate slots array
  const slots = Array.from({ length: totalSlots }, (_, i) => {
    const timeInHours = focusHour + (i * intervalMinutes) / 60;
    return {
      time: timeInHours,
      label: formatTime(timeInHours)
    };
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="p-6 space-y-6"
    >
      <div className="flex items-center justify-between border-b border-[var(--color-glass-border)] pb-4">
        <div>
          <h3 className="font-bold text-lg text-[var(--color-text)] flex items-center gap-2">
            <Clock className="text-blue-400" size={18} />
            High Resolution {intervalMinutes}m Slot Breakdown
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            Viewing {totalHours}-hour window ({formatTime(focusHour)} to {formatTime(focusHour + totalHours)})
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {STAFF_LIST.map(staffName => {
          const staffAppts = appointments.filter(a => 
            a.staff === staffName && 
            a.startTime >= focusHour && 
            a.startTime < focusHour + totalHours
          );

          return (
            <div key={staffName} className="bg-[var(--color-surface)]/60 border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--color-border)]/50 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                    {staffName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-[var(--color-text)]">{staffName}</span>
                    <span className="text-xs text-[var(--color-text-muted)] block">{staffAppts.length} slots booked in window</span>
                  </div>
                </div>
              </div>

              {/* Timeline slots */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {slots.map(slot => {
                  const matched = staffAppts.find(a => Math.abs(a.startTime - slot.time) < (intervalMinutes / 120));
                  return (
                    <div 
                      key={slot.time}
                      className={cn(
                        "p-2.5 rounded-xl border flex flex-col justify-between min-h-[90px] transition-all relative group",
                        matched 
                          ? TYPE_CONFIG[matched.type].color
                          : "bg-[var(--color-bg)]/40 border-[var(--color-border)] hover:border-blue-500/50 hover:bg-blue-500/5"
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-text-muted)]">
                        <span>{slot.label}</span>
                        {matched && (
                          <span className={cn("px-1.5 py-0.2 rounded font-semibold text-[9px]", TYPE_CONFIG[matched.type].badge)}>
                            {matched.type}
                          </span>
                        )}
                      </div>

                      {matched ? (
                        <div 
                          onClick={() => {
                            onEdit(matched);
                            setIsModalOpen(true);
                          }}
                          className="cursor-pointer space-y-1 my-1"
                        >
                          <div className="font-bold text-xs truncate text-[var(--color-text)]">{matched.patient}</div>
                          <div className="text-[10px] text-[var(--color-text-muted)] truncate">{matched.service}</div>
                        </div>
                      ) : (
                        <div 
                          onClick={() => {
                            onEdit({
                              id: `new-${Date.now()}`,
                              dayIndex: 3,
                              dateStr: '2026-08-06',
                              startTime: slot.time,
                              duration: intervalMinutes / 60,
                              patient: 'Walk-in Patient',
                              phone: '',
                              service: 'Consultation',
                              type: 'consult',
                              staff: staffName,
                              status: 'Confirmed'
                            });
                            setIsModalOpen(true);
                          }}
                          className="flex flex-col items-center justify-center text-center my-auto cursor-pointer text-[var(--color-text-muted)] hover:text-blue-300 py-1"
                        >
                          <Plus size={14} />
                          <span className="text-[9px] font-medium mt-0.5">Available</span>
                        </div>
                      )}

                      {/* Quick Shift buttons on hover if matched */}
                      {matched && (
                        <div className="flex items-center gap-1 pt-1 border-t border-[var(--color-border)]/40 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onShift(matched.id, -15);
                            }}
                            title="-15m"
                            className="text-[9px] px-1 py-0.5 rounded bg-[var(--color-surface)] hover:bg-blue-600 hover:text-white font-mono transition-colors"
                          >
                            -15m
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onShift(matched.id, 15);
                            }}
                            title="+15m"
                            className="text-[9px] px-1 py-0.5 rounded bg-[var(--color-surface)] hover:bg-blue-600 hover:text-white font-mono transition-colors"
                          >
                            +15m
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onShift(matched.id, 30);
                            }}
                            title="+30m"
                            className="text-[9px] px-1 py-0.5 rounded bg-[var(--color-surface)] hover:bg-blue-600 hover:text-white font-mono transition-colors ml-auto"
                          >
                            +30m
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// 2. Full Day View (12 Hours or 24 Hours)
function FullDayView({
  appointments,
  mode,
  onEdit,
  onShift,
  setIsModalOpen
}: {
  appointments: Appointment[];
  mode: '12h' | '24h';
  onEdit: (a: Appointment) => void;
  onShift: (id: string, deltaMins: number) => void;
  setIsModalOpen: (open: boolean) => void;
}) {
  const startHour = mode === '12h' ? 8 : 0;
  const hoursCount = mode === '12h' ? 12 : 24;
  const hours = Array.from({ length: hoursCount }, (_, i) => startHour + i);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="p-4 overflow-x-auto"
    >
      <div className="min-w-[900px]">
        {/* Header timeline */}
        <div className="grid grid-cols-13 border-b border-[var(--color-glass-border)] pb-3">
          <div className="w-40 font-bold text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
            Doctor / Staff
          </div>
          <div className="col-span-12 grid grid-cols-12 gap-1 text-center">
            {hours.slice(0, 12).map(h => (
              <span key={h} className="text-[10px] font-mono text-[var(--color-text-muted)]">
                {formatTime(h)}
              </span>
            ))}
          </div>
        </div>

        {/* Rows per doctor */}
        <div className="divide-y divide-[var(--color-glass-border)]">
          {STAFF_LIST.map(staff => {
            const staffAppts = appointments.filter(a => a.staff === staff);
            return (
              <div key={staff} className="py-4 flex items-start gap-4">
                <div className="w-40 shrink-0 space-y-1">
                  <div className="font-bold text-sm text-[var(--color-text)]">{staff}</div>
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    {staffAppts.length} appointments
                  </span>
                </div>

                {/* Timeline track */}
                <div className="flex-1 relative bg-[var(--color-surface)]/40 rounded-xl h-24 border border-[var(--color-border)] p-1 overflow-hidden">
                  {/* Grid lines for hours */}
                  <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="border-r border-[var(--color-border)]/30 h-full" />
                    ))}
                  </div>

                  {/* Render appointments positioned horizontally */}
                  {staffAppts.map(appt => {
                    const leftPct = ((appt.startTime - startHour) / hoursCount) * 100;
                    const widthPct = (appt.duration / hoursCount) * 100;

                    if (leftPct < 0 || leftPct > 100) return null;

                    return (
                      <motion.div
                        key={appt.id}
                        whileHover={{ scale: 1.02, zIndex: 20 }}
                        onClick={() => {
                          onEdit(appt);
                          setIsModalOpen(true);
                        }}
                        style={{
                          left: `${Math.max(0, leftPct)}%`,
                          width: `${Math.min(100 - leftPct, widthPct)}%`,
                        }}
                        className={cn(
                          "absolute top-2 bottom-2 rounded-lg p-2 border backdrop-blur-md cursor-pointer shadow-md flex flex-col justify-between overflow-hidden group",
                          TYPE_CONFIG[appt.type].color
                        )}
                      >
                        <div className="flex items-center justify-between text-[9px] font-mono">
                          <span className="font-bold">{formatTime(appt.startTime)}</span>
                          <span className="opacity-80">{appt.duration}h</span>
                        </div>
                        <div className="font-bold text-xs truncate">{appt.patient}</div>
                        <div className="text-[10px] truncate opacity-80">{appt.service}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// 3. Weekly Grid Mode (Mon - Sun, 9 AM - 6 PM)
function WeeklyGridMode({
  appointments,
  onEdit,
  onShift,
  setIsModalOpen
}: {
  appointments: Appointment[];
  onEdit: (a: Appointment) => void;
  onShift: (id: string, deltaMins: number) => void;
  setIsModalOpen: (open: boolean) => void;
}) {
  const timeSlots = Array.from({ length: 10 }, (_, i) => i + 9); // 9 AM to 6 PM

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <div className="grid grid-cols-8 border-b border-[var(--color-glass-border)]">
        <div className="p-4 border-r border-[var(--color-glass-border)] flex items-center justify-center bg-[var(--color-surface)]/40">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Time</span>
        </div>
        {DAYS_SHORT.map((day, idx) => (
          <div key={day} className="p-4 text-center border-r border-[var(--color-glass-border)] last:border-0 bg-[var(--color-surface)]/40">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">{day}</span>
            <span className="text-[10px] text-[var(--color-text-muted)] font-mono">Aug {idx + 3}</span>
          </div>
        ))}
      </div>

      <div className="relative min-h-[640px]">
        {timeSlots.map(time => (
          <div key={time} className="grid grid-cols-8 border-b border-[var(--color-glass-border)]/50 h-16">
            <div className="border-r border-[var(--color-glass-border)] flex items-center justify-center relative -top-3">
              <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{formatTime(time)}</span>
            </div>
            {DAYS_SHORT.map((_, i) => (
              <div 
                key={i} 
                onClick={() => {
                  onEdit({
                    id: `new-${Date.now()}`,
                    dayIndex: i,
                    dateStr: `2026-08-0${i + 3}`,
                    startTime: time,
                    duration: 1.0,
                    patient: 'Walk-in Patient',
                    phone: '',
                    service: 'General Consultation',
                    type: 'consult',
                    staff: 'Dr. Meenakshi',
                    status: 'Confirmed'
                  });
                  setIsModalOpen(true);
                }}
                className="border-r border-[var(--color-glass-border)] last:border-0 relative hover:bg-blue-500/5 transition-colors cursor-pointer group"
              >
                <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center">
                  <Plus size={14} className="text-blue-400" />
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Absolute Positioned Appointments */}
        {appointments.map(appt => {
          if (appt.dayIndex < 0 || appt.dayIndex > 6) return null;
          const topRem = (appt.startTime - 9) * 4; // 4rem per hour (h-16)
          const heightRem = appt.duration * 4;

          return (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03, zIndex: 30 }}
              style={{
                top: `${topRem}rem`,
                left: `calc(${((appt.dayIndex + 1) / 8) * 100}% + 4px)`,
                width: `calc(${100 / 8}% - 8px)`,
                height: `calc(${heightRem}rem - 4px)`
              }}
              className={cn(
                "absolute rounded-2xl p-2.5 border backdrop-blur-xl shadow-lg transition-all cursor-pointer overflow-hidden flex flex-col justify-between group",
                TYPE_CONFIG[appt.type].color
              )}
              onClick={() => {
                onEdit(appt);
                setIsModalOpen(true);
              }}
            >
              <div>
                <div className="flex items-center justify-between text-[9px] font-mono opacity-80 mb-1">
                  <span>{formatTime(appt.startTime)}</span>
                  <span className={cn("px-1 rounded text-[8px] font-bold uppercase", TYPE_CONFIG[appt.type].badge)}>
                    {appt.type}
                  </span>
                </div>
                <div className="font-bold text-xs truncate leading-snug">{appt.patient}</div>
                <div className="text-[10px] opacity-80 truncate">{appt.service}</div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)]/40 mt-1">
                <span className="text-[9px] font-medium opacity-90 truncate">{appt.staff}</span>
                
                {/* Quick Shift buttons on hover */}
                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShift(appt.id, 15);
                    }}
                    title="Shift +15m"
                    className="text-[8px] px-1 py-0.5 rounded bg-blue-600 text-white font-mono"
                  >
                    +15m
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShift(appt.id, 30);
                    }}
                    title="Shift +30m"
                    className="text-[8px] px-1 py-0.5 rounded bg-blue-600 text-white font-mono"
                  >
                    +30m
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// 4. 15 Days Matrix Mode
function FifteenDaysMatrixMode({
  appointments,
  onEdit,
  setIsModalOpen
}: {
  appointments: Appointment[];
  onEdit: (a: Appointment) => void;
  setIsModalOpen: (open: boolean) => void;
}) {
  const days = Array.from({ length: 15 }, (_, i) => ({
    dayIndex: i,
    dateNum: i + 1,
    dateStr: `Aug ${i + 1}`,
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="p-6 space-y-6"
    >
      <div>
        <h3 className="font-bold text-lg text-[var(--color-text)] flex items-center gap-2">
          <CalIcon className="text-blue-400" size={18} />
          15-Day Strategic Doctor Schedule Overview
        </h3>
        <p className="text-xs text-[var(--color-text-muted)]">
          Comprehensive 15-day view of booked surgery & consultation density
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {days.map(d => {
          const dayAppts = appointments.filter(a => a.dayIndex === d.dayIndex);
          return (
            <div 
              key={d.dayIndex}
              className="bg-[var(--color-surface)]/60 border border-[var(--color-border)] rounded-2xl p-3.5 space-y-2 hover:border-blue-500/50 transition-all flex flex-col justify-between min-h-[140px]"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 mb-2">
                  <span className="font-bold text-sm text-[var(--color-text)]">{d.dateStr}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                    {dayAppts.length} slots
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1 scrollbar-hide">
                  {dayAppts.length === 0 ? (
                    <span className="text-[10px] text-[var(--color-text-muted)] italic block pt-2">No appointments booked</span>
                  ) : (
                    dayAppts.map(a => (
                      <div 
                        key={a.id}
                        onClick={() => {
                          onEdit(a);
                          setIsModalOpen(true);
                        }}
                        className={cn(
                          "p-1.5 rounded-lg border text-[10px] cursor-pointer transition-transform hover:scale-[1.02]",
                          TYPE_CONFIG[a.type].color
                        )}
                      >
                        <div className="font-bold truncate">{a.patient} ({formatTime(a.startTime)})</div>
                        <div className="text-[9px] opacity-80 truncate">{a.staff}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  onEdit({
                    id: `new-${Date.now()}`,
                    dayIndex: d.dayIndex,
                    dateStr: `2026-08-${d.dateNum < 10 ? '0' : ''}${d.dateNum}`,
                    startTime: 9.0,
                    duration: 1.0,
                    patient: 'New Patient',
                    phone: '',
                    service: 'Consultation',
                    type: 'consult',
                    staff: 'Dr. Meenakshi',
                    status: 'Confirmed'
                  });
                  setIsModalOpen(true);
                }}
                className="w-full text-center py-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20 mt-2"
              >
                + Add Slot
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* =========================================================================
   QUICK EDIT MODAL
   ========================================================================= */
function QuickEditModal({
  appointment,
  onClose,
  onSave,
  onShift
}: {
  appointment: Appointment;
  onClose: () => void;
  onSave: (updated: Appointment) => void;
  onShift: (id: string, deltaMins: number) => void;
}) {
  const [formData, setFormData] = useState<Appointment>({ ...appointment });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 relative"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl border", TYPE_CONFIG[formData.type].badge)}>
              <Edit3 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[var(--color-text)]">Quick Edit Slot</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Modify doctor, shift time, status, or move slot</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Time Shift Controls Bar inside modal */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3 space-y-2">
          <span className="text-xs font-bold text-[var(--color-text-muted)] block">Quick Time Shift / Move:</span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const newStart = Math.max(7, formData.startTime - 0.5);
                setFormData(prev => ({ ...prev, startTime: newStart }));
                onShift(formData.id, -30);
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-mono font-bold transition-all"
            >
              -30 Min
            </button>
            <button
              type="button"
              onClick={() => {
                const newStart = Math.max(7, formData.startTime - 0.25);
                setFormData(prev => ({ ...prev, startTime: newStart }));
                onShift(formData.id, -15);
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-mono font-bold transition-all"
            >
              -15 Min
            </button>
            <button
              type="button"
              onClick={() => {
                const newStart = Math.min(21, formData.startTime + 0.25);
                setFormData(prev => ({ ...prev, startTime: newStart }));
                onShift(formData.id, 15);
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-mono font-bold transition-all"
            >
              +15 Min
            </button>
            <button
              type="button"
              onClick={() => {
                const newStart = Math.min(21, formData.startTime + 0.5);
                setFormData(prev => ({ ...prev, startTime: newStart }));
                onShift(formData.id, 30);
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-mono font-bold transition-all"
            >
              +30 Min
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[var(--color-text-muted)] block mb-1">Doctor / Staff</label>
              <select
                value={formData.staff}
                onChange={e => setFormData(prev => ({ ...prev, staff: e.target.value }))}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text)] font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {STAFF_LIST.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-[var(--color-text-muted)] block mb-1">Appointment Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text)] font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="consult">Skin Checkup / Consult</option>
                <option value="surgery">Surgery</option>
                <option value="wellness">Wellness</option>
                <option value="followup">Follow-up</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[var(--color-text-muted)] block mb-1">Patient Name</label>
              <input
                type="text"
                value={formData.patient}
                onChange={e => setFormData(prev => ({ ...prev, patient: e.target.value }))}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text)] font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-[var(--color-text-muted)] block mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text)] font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[var(--color-text-muted)] block mb-1">Start Hour (24h)</label>
              <input
                type="number"
                step="0.25"
                min="7"
                max="21"
                value={formData.startTime}
                onChange={e => setFormData(prev => ({ ...prev, startTime: parseFloat(e.target.value) || 9.0 }))}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text)] font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono block mt-1">
                = {formatTime(formData.startTime)}
              </span>
            </div>

            <div>
              <label className="font-semibold text-[var(--color-text-muted)] block mb-1">Duration (Hours)</label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="8"
                value={formData.duration}
                onChange={e => setFormData(prev => ({ ...prev, duration: parseFloat(e.target.value) || 1.0 }))}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text)] font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[var(--color-text-muted)] block mb-1">Service / Procedure</label>
            <input
              type="text"
              value={formData.service}
              onChange={e => setFormData(prev => ({ ...prev, service: e.target.value }))}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text)] font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(formData)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all"
          >
            <Check size={16} />
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
