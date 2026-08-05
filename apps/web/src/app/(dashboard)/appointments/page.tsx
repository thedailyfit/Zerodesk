'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar as CalIcon, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  CalendarDays,
  ListFilter,
  X,
  Check,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentItem {
  id: string;
  customer: string;
  service: string;
  staff: string;
  scheduledAt: string; // ISO format
  duration: number;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  source: 'AI_VOICE' | 'AI_WHATSAPP' | 'AI_WEB' | 'STORE_VISIT' | 'REFERRAL' | 'MANUAL';
  priority?: 'VIP' | 'HIGH' | 'MEDIUM' | 'STANDARD';
  gcalSynced?: boolean;
}

const INITIAL_APPOINTMENTS: AppointmentItem[] = [
  { id: '1', customer: 'Rajesh Kumar', service: 'Laser Hair Removal', staff: 'Dr. Meenakshi', scheduledAt: '2026-08-05T10:00:00', duration: 45, status: 'SCHEDULED', source: 'AI_VOICE', priority: 'VIP', gcalSynced: true },
  { id: '2', customer: 'Priya Sharma', service: 'Chemical Peel', staff: 'Dr. Arun', scheduledAt: '2026-08-05T11:00:00', duration: 30, status: 'CONFIRMED', source: 'AI_WHATSAPP', priority: 'HIGH', gcalSynced: true },
  { id: '3', customer: 'Sneha Reddy', service: 'Full Body Massage', staff: 'Kavita', scheduledAt: '2026-08-05T12:30:00', duration: 60, status: 'IN_PROGRESS', source: 'STORE_VISIT', priority: 'VIP', gcalSynced: true },
  { id: '4', customer: 'Amit Patel', service: 'Consultation', staff: 'Dr. Meenakshi', scheduledAt: '2026-08-05T14:00:00', duration: 20, status: 'COMPLETED', source: 'MANUAL', priority: 'STANDARD', gcalSynced: true },
  { id: '5', customer: 'Ananya Iyer', service: 'Facial Treatment', staff: 'Rekha', scheduledAt: '2026-08-05T15:00:00', duration: 45, status: 'CANCELLED', source: 'REFERRAL', priority: 'HIGH', gcalSynced: true },
  { id: '6', customer: 'Deepak Menon', service: 'Hair Transplant Consultation', staff: 'Dr. Arun', scheduledAt: '2026-08-06T10:00:00', duration: 30, status: 'SCHEDULED', source: 'AI_VOICE', priority: 'VIP', gcalSynced: true },
  { id: '7', customer: 'Vikram Singh', service: 'PRP Therapy', staff: 'Dr. Meenakshi', scheduledAt: '2026-08-06T11:30:00', duration: 60, status: 'CONFIRMED', source: 'AI_WEB', priority: 'HIGH', gcalSynced: true },
  { id: '8', customer: 'Meera Joshi', service: 'Botox Treatment', staff: 'Dr. Arun', scheduledAt: '2026-08-12T14:00:00', duration: 45, status: 'SCHEDULED', source: 'STORE_VISIT', priority: 'VIP', gcalSynced: true },
  { id: '9', customer: 'Suresh Nair', service: 'Acne Consultation', staff: 'Dr. Meenakshi', scheduledAt: '2026-08-18T16:00:00', duration: 30, status: 'CONFIRMED', source: 'REFERRAL', priority: 'MEDIUM', gcalSynced: true },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; label: string; style: string }> = {
  SCHEDULED: { icon: Clock, label: 'Scheduled', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  CONFIRMED: { icon: CheckCircle2, label: 'Confirmed', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  IN_PROGRESS: { icon: AlertCircle, label: 'In Progress', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  COMPLETED: { icon: CheckCircle2, label: 'Completed', style: 'bg-green-500/10 text-green-400 border-green-500/20' },
  CANCELLED: { icon: XCircle, label: 'Cancelled', style: 'bg-red-500/10 text-red-400 border-red-500/20' },
  NO_SHOW: { icon: XCircle, label: 'No Show', style: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
};

const sourceLabels: Record<string, string> = { 
  AI_VOICE: '📞 AI Voice', 
  AI_WHATSAPP: '💬 AI WhatsApp', 
  AI_WEB: '🌐 AI Chat', 
  STORE_VISIT: '🏬 Store Visit', 
  REFERRAL: '🤝 Referral',
  MANUAL: '✍️ Manual' 
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(INITIAL_APPOINTMENTS);
  const [viewMode, setViewMode] = useState<'list' | 'month'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Manual Booking Form State
  const [customer, setCustomer] = useState('');
  const [service, setService] = useState('Laser Treatment Consultation');
  const [staff, setStaff] = useState('Dr. Meenakshi');
  const [date, setDate] = useState('2026-08-05');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('45');
  const [source, setSource] = useState<AppointmentItem['source']>('MANUAL');
  const [priority, setPriority] = useState<AppointmentItem['priority']>('HIGH');
  const [autoSyncGcal, setAutoSyncGcal] = useState(true);

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim()) return;

    const scheduledAt = `${date}T${time}:00`;
    const created: AppointmentItem = {
      id: Date.now().toString(),
      customer,
      service,
      staff,
      scheduledAt,
      duration: parseInt(duration) || 30,
      status: 'CONFIRMED',
      source,
      priority,
      gcalSynced: autoSyncGcal,
    };

    setAppointments([created, ...appointments]);
    setIsModalOpen(false);
    setCustomer('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <span>Appointments & Scheduling</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <RefreshCw size={11} className="animate-spin" /> Google Calendar Synced
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Manual bookings and AI appointment manager with Google Calendar auto-sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher: List vs Monthly Calendar */}
          <div className="flex items-center bg-[var(--color-surface)] p-1 rounded-xl border border-[var(--color-border)]">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === 'list'
                  ? "bg-purple-600 text-white shadow"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
            >
              <ListFilter size={14} />
              List View
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === 'month'
                  ? "bg-purple-600 text-white shadow"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
            >
              <CalendarDays size={14} />
              Monthly Calendar
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shrink-0"
          >
            <Plus size={16} />
            Book Appointment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', count: appointments.length, color: 'text-blue-400' },
          { label: 'Confirmed', count: appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'SCHEDULED').length, color: 'text-emerald-400' },
          { label: 'Store & Referral', count: appointments.filter(a => a.source === 'STORE_VISIT' || a.source === 'REFERRAL').length, color: 'text-amber-400' },
          { label: 'Google Cal Synced', count: appointments.filter(a => a.gcalSynced).length, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-sm"
          >
            <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">{stat.label}</p>
            <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.count}</p>
          </motion.div>
        ))}
      </div>

      {/* MAIN VIEW: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          <div className="space-y-3">
            {appointments.map((appt, i) => {
              const status = statusConfig[appt.status] || statusConfig.SCHEDULED;
              const StatusIcon = status.icon;
              const apptDate = new Date(appt.scheduledAt);
              return (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl hover:border-purple-500/40 transition-all gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center w-16 shrink-0 bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <p className="text-sm font-bold text-purple-300">
                        {apptDate.getHours().toString().padStart(2, '0')}:{apptDate.getMinutes().toString().padStart(2, '0')}
                      </p>
                      <p className="text-[10px] text-slate-400">{appt.duration} min</p>
                    </div>

                    <div className="w-px h-8 bg-[var(--color-border)] hidden sm:block" />

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-[var(--color-text)]">{appt.service}</p>
                        <span className={cn("px-2.5 py-0.5 text-[10px] rounded-full border flex items-center gap-1 font-semibold", status.style)}>
                          <StatusIcon size={10} />
                          {status.label}
                        </span>
                        {appt.priority === 'VIP' && <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">VIP 🌟</span>}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1"><User size={12} className="text-purple-400" />{appt.customer}</span>
                        <span>with <strong>{appt.staff}</strong></span>
                        <span className="text-slate-300 font-medium">{sourceLabels[appt.source]}</span>
                      </div>
                    </div>
                  </div>

                  {appt.gcalSynced && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full shrink-0">
                      <Check size={12} />
                      <span>Synced to Google Cal</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN VIEW: MONTHLY CALENDAR GRID */}
      {viewMode === 'month' && (
        <div className="p-6 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
              <CalIcon size={18} className="text-purple-400" />
              August 2026 Monthly Calendar
            </h3>
            <span className="text-xs text-[var(--color-text-muted)] font-mono">Interactive Month Grid</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[var(--color-text-muted)] border-b border-[var(--color-border)] pb-2">
            <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
          </div>

          {/* 31 Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }, (_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-08-${dayNum.toString().padStart(2, '0')}`;
              const dayAppts = appointments.filter(a => a.scheduledAt.startsWith(dateStr));
              return (
                <div
                  key={dayNum}
                  className={cn(
                    "min-h-[85px] p-2 rounded-xl border flex flex-col justify-between transition-all",
                    dayAppts.length > 0
                      ? "bg-purple-950/20 border-purple-500/40"
                      : "bg-[var(--color-surface)] border-[var(--color-border)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">{dayNum}</span>
                    {dayAppts.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayAppts.slice(0, 2).map(a => (
                      <div key={a.id} className="text-[9px] bg-purple-600/30 text-purple-200 p-1 rounded font-medium truncate border border-purple-500/30">
                        {a.customer} ({a.service.split(' ')[0]})
                      </div>
                    ))}
                    {dayAppts.length > 2 && (
                      <p className="text-[9px] text-purple-400 font-bold">+{dayAppts.length - 2} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Booking Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <CalIcon size={18} className="text-purple-400" />
                  Manual Appointment Booking
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="e.g. Ananya Iyer"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Treatment / Service</label>
                    <input
                      type="text"
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Assigned Doctor / Staff</label>
                    <select
                      value={staff}
                      onChange={(e) => setStaff(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="Dr. Meenakshi">Dr. Meenakshi</option>
                      <option value="Dr. Arun">Dr. Arun</option>
                      <option value="Kavita">Kavita</option>
                      <option value="Rekha">Rekha</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Time</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Booking Channel Source</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="STORE_VISIT">🏬 Store Visit</option>
                      <option value="REFERRAL">🤝 Referral</option>
                      <option value="MANUAL">✍️ Manual Walk-in</option>
                      <option value="AI_VOICE">📞 AI Voice</option>
                      <option value="AI_WHATSAPP">💬 AI WhatsApp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Priority Tag</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="VIP">VIP 🌟</option>
                      <option value="HIGH">High 🔴</option>
                      <option value="MEDIUM">Medium 🟡</option>
                      <option value="STANDARD">Standard ⚪</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-medium text-purple-300">Auto-sync with Google Calendar</span>
                  <input
                    type="checkbox"
                    checked={autoSyncGcal}
                    onChange={(e) => setAutoSyncGcal(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg font-medium transition-colors"
                  >
                    Confirm Booking
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
