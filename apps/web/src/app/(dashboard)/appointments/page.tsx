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
  Send,
  Phone,
  MessageCircle,
  Mail,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';
import posthog from 'posthog-js';

interface AppointmentItem {
  id: string;
  customer: string;
  phone?: string;
  email?: string;
  service: string;
  staff: string;
  scheduledAt: string; // ISO format
  duration: number;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  source: 'AI_VOICE' | 'AI_WHATSAPP' | 'AI_WEB' | 'STORE_VISIT' | 'REFERRAL' | 'MANUAL';
  priority?: 'VIP' | 'HIGH' | 'MEDIUM' | 'STANDARD';
  confirmationStatus?: string; // e.g. "Confirmed via WhatsApp AI at 14:32"
  confirmationSent?: boolean;
}

const INITIAL_APPOINTMENTS: AppointmentItem[] = [
  { id: '1', customer: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh@email.com', service: 'Laser Hair Removal', staff: 'Dr. Meenakshi', scheduledAt: '2026-08-05T10:00:00', duration: 45, status: 'CONFIRMED', source: 'AI_VOICE', priority: 'VIP', confirmationStatus: 'Confirmed via WhatsApp AI at 09:15 AM', confirmationSent: true },
  { id: '2', customer: 'Priya Sharma', phone: '+91 87654 32109', email: 'priya@email.com', service: 'Chemical Peel', staff: 'Dr. Arun', scheduledAt: '2026-08-05T11:00:00', duration: 30, status: 'CONFIRMED', source: 'AI_WHATSAPP', priority: 'HIGH', confirmationStatus: 'Confirmed via Voice AI Call at 10:00 AM', confirmationSent: true },
  { id: '3', customer: 'Sneha Reddy', phone: '+91 65432 10987', email: 'sneha@email.com', service: 'Full Body Massage', staff: 'Kavita', scheduledAt: '2026-08-05T12:30:00', duration: 60, status: 'IN_PROGRESS', source: 'STORE_VISIT', priority: 'VIP', confirmationStatus: 'Confirmed Walk-in at Front Desk', confirmationSent: true },
  { id: '4', customer: 'Amit Patel', phone: '+91 76543 21098', email: 'amit@email.com', service: 'Consultation', staff: 'Dr. Meenakshi', scheduledAt: '2026-08-05T14:00:00', duration: 20, status: 'COMPLETED', source: 'MANUAL', priority: 'STANDARD', confirmationStatus: 'Completed', confirmationSent: true },
  { id: '5', customer: 'Ananya Iyer', phone: '+91 43210 98765', email: 'ananya@email.com', service: 'Facial Treatment', staff: 'Rekha', scheduledAt: '2026-08-05T15:00:00', duration: 45, status: 'CANCELLED', source: 'REFERRAL', priority: 'HIGH', confirmationStatus: 'Cancelled by Patient', confirmationSent: true },
  { id: '6', customer: 'Deepak Menon', phone: '+91 32109 87654', email: 'deepak@email.com', service: 'Hair Transplant Consultation', staff: 'Dr. Arun', scheduledAt: '2026-08-06T10:00:00', duration: 30, status: 'SCHEDULED', source: 'AI_VOICE', priority: 'VIP', confirmationStatus: 'Awaiting Patient Response', confirmationSent: false },
  { id: '7', customer: 'Vikram Singh', phone: '+91 54321 09876', email: 'vikram@email.com', service: 'PRP Therapy', staff: 'Dr. Meenakshi', scheduledAt: '2026-08-06T11:30:00', duration: 60, status: 'SCHEDULED', source: 'AI_WEB', priority: 'HIGH', confirmationStatus: 'WhatsApp Confirmation Sent', confirmationSent: true },
  { id: '8', customer: 'Meera Joshi', phone: '+91 99887 76655', email: 'meera@email.com', service: 'Botox Treatment', staff: 'Dr. Arun', scheduledAt: '2026-08-12T14:00:00', duration: 45, status: 'SCHEDULED', source: 'STORE_VISIT', priority: 'VIP', confirmationStatus: 'Awaiting Patient Response', confirmationSent: false },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; label: string; style: string }> = {
  SCHEDULED: { icon: Clock, label: 'Scheduled', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  CONFIRMED: { icon: CheckCircle2, label: 'Booking Confirmed', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
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
  MANUAL: '✍️ Manual Walk-in' 
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(INITIAL_APPOINTMENTS);
  const [viewMode, setViewMode] = useState<'list' | 'month'>('list');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<AppointmentItem | null>(null);
  const [confirmationTriggeredId, setConfirmationTriggeredId] = useState<string | null>(null);

  // Manual Walk-in Booking Form State
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('Laser Treatment Consultation');
  const [staff, setStaff] = useState('Dr. Meenakshi');
  const [date, setDate] = useState('2026-08-05');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('45');
  const [source, setSource] = useState<AppointmentItem['source']>('MANUAL');
  const [priority, setPriority] = useState<AppointmentItem['priority']>('HIGH');

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim()) return;

    const scheduledAt = `${date}T${time}:00`;
    const created: AppointmentItem = {
      id: Date.now().toString(),
      customer,
      phone: phone || '+91 98765 00000',
      service,
      staff,
      scheduledAt,
      duration: parseInt(duration) || 30,
      status: 'CONFIRMED',
      source,
      priority,
      confirmationStatus: 'Booking Confirmed (Staff Walk-in Entry)',
      confirmationSent: true,
    };

    if (typeof window !== 'undefined') {
      posthog.capture('appointment_booked', { service, staff, source, priority });
    }

    setAppointments([created, ...appointments]);
    setIsBookModalOpen(false);
    setCustomer('');
    setPhone('');
  };

  const handleSendConfirmationRequest = (apptId: string) => {
    setConfirmationTriggeredId(apptId);
    if (typeof window !== 'undefined') {
      posthog.capture('ai_confirmation_workflow_triggered', { apptId });
    }
    
    // Simulate AI 2-Step Confirmation Workflow: WhatsApp -> Voice Call (10 mins later) -> Auto Confirmed
    setTimeout(() => {
      setAppointments(prev => prev.map(a => {
        if (a.id === apptId) {
          return {
            ...a,
            status: 'CONFIRMED',
            confirmationStatus: 'Booking Confirmed via AI WhatsApp & Voice Call',
            confirmationSent: true
          };
        }
        return a;
      }));
      setConfirmationTriggeredId(null);
      if (selectedAppt?.id === apptId) {
        setSelectedAppt(prev => prev ? { ...prev, status: 'CONFIRMED', confirmationStatus: 'Booking Confirmed via AI WhatsApp & Voice Call' } : null);
      }
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <span>Appointments & Scheduling</span>
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-medium">
              AI 2-Step Confirmation Engine
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Manual walk-in bookings and automated 2-step AI confirmation (WhatsApp ➡️ Voice Call 10m later).
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
            onClick={() => setIsBookModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shrink-0"
          >
            <Plus size={16} />
            Book Walk-in / Manual
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', count: appointments.length, color: 'text-blue-400' },
          { label: 'Booking Confirmed', count: appointments.filter(a => a.status === 'CONFIRMED').length, color: 'text-emerald-400' },
          { label: 'Store Visit / Walk-ins', count: appointments.filter(a => a.source === 'STORE_VISIT' || a.source === 'MANUAL').length, color: 'text-amber-400' },
          { label: 'Referrals', count: appointments.filter(a => a.source === 'REFERRAL').length, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-sm"
          >
            <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">{stat.label}</p>
            <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.count}</p>
          </motion.div>
        ))}
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
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
                onClick={() => setSelectedAppt(appt)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl hover:border-purple-500/40 transition-all cursor-pointer gap-4 shadow-sm group"
              >
                <div className="flex items-center gap-4">
                  <Avatar3D name={appt.customer} size="md" />

                  <div className="text-center w-16 shrink-0 bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <p className="text-xs font-bold text-purple-300 font-mono">
                      {apptDate.getHours().toString().padStart(2, '0')}:{apptDate.getMinutes().toString().padStart(2, '0')}
                    </p>
                    <p className="text-[10px] text-slate-400">{appt.duration} min</p>
                  </div>

                  <div className="w-px h-8 bg-[var(--color-border)] hidden sm:block" />

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-[var(--color-text)] group-hover:text-purple-300 transition-colors">{appt.service}</p>
                      <span className={cn("px-2.5 py-0.5 text-[10px] rounded-full border flex items-center gap-1 font-semibold", status.style)}>
                        <StatusIcon size={10} />
                        {status.label}
                      </span>
                      {appt.priority === 'VIP' && <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">VIP 🌟</span>}
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                      <span>Patient: <strong className="text-slate-200">{appt.customer}</strong></span>
                      <span>•</span>
                      <span>Staff: <strong className="text-purple-300">{appt.staff}</strong></span>
                      <span>•</span>
                      <span className="text-slate-300 font-medium">{sourceLabels[appt.source]}</span>
                    </div>
                  </div>
                </div>

                {/* Confirmation Status Details */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-emerald-400 flex items-center justify-end gap-1">
                      <UserCheck size={13} />
                      {appt.confirmationStatus || 'Booking Confirmed'}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Click card to view popup & workflow</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MONTHLY CALENDAR GRID VIEW */}
      {viewMode === 'month' && (
        <div className="p-6 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
              <CalIcon size={18} className="text-purple-400" />
              August 2026 Monthly Calendar
            </h3>
            <span className="text-xs text-[var(--color-text-muted)] font-mono">Click date card for popups</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[var(--color-text-muted)] border-b border-[var(--color-border)] pb-2">
            <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }, (_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-08-${dayNum.toString().padStart(2, '0')}`;
              const dayAppts = appointments.filter(a => a.scheduledAt.startsWith(dateStr));
              return (
                <div
                  key={dayNum}
                  className={cn(
                    "min-h-[85px] p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer hover:border-purple-500",
                    dayAppts.length > 0
                      ? "bg-purple-950/20 border-purple-500/40"
                      : "bg-[var(--color-surface)] border-[var(--color-border)]"
                  )}
                  onClick={() => dayAppts.length > 0 && setSelectedAppt(dayAppts[0])}
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

      {/* APPOINTMENT DETAILED POPUP MODAL */}
      <AnimatePresence>
        {selectedAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <Avatar3D name={selectedAppt.customer} size="md" />
                  <div>
                    <h3 className="font-bold text-base">{selectedAppt.customer}</h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedAppt.phone || '+91 98765 43210'}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAppt(null)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {/* Appointment Details Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                <div>
                  <span className="text-slate-400 block mb-0.5">Treatment / Service</span>
                  <span className="font-bold text-white text-sm">{selectedAppt.service}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Assigned Staff Doctor</span>
                  <span className="font-bold text-purple-300 text-sm">{selectedAppt.staff}</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-400 block mb-0.5">Scheduled Date & Time</span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedAppt.scheduledAt.replace('T', ' at ')}</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-400 block mb-0.5">Booking Channel Source</span>
                  <span className="font-semibold text-slate-200">{sourceLabels[selectedAppt.source]}</span>
                </div>
              </div>

              {/* Booking Confirmation Status Box */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck size={14} />
                    Booking Confirmation Status
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    {selectedAppt.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {selectedAppt.confirmationStatus || 'Booking Confirmed'}
                </p>
              </div>

              {/* Trigger AI Confirmation Workflow (Step 1: WhatsApp -> Step 2: Voice Call in 10 mins) */}
              <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} />
                  AI 2-Step Auto Confirmation Workflow
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Triggers automated sequence: <strong>Step 1:</strong> Sends instant WhatsApp confirmation message ➡️ <strong>Step 2:</strong> Schedules a personalized Voice AI call in 10 mins if unconfirmed.
                </p>

                <button
                  onClick={() => handleSendConfirmationRequest(selectedAppt.id)}
                  disabled={confirmationTriggeredId === selectedAppt.id}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {confirmationTriggeredId === selectedAppt.id ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Sending AI WhatsApp & Scheduling Voice Call...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send Booking Confirmation Request (WhatsApp + Voice AI)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedAppt(null)}
                  className="px-4 py-2 bg-slate-800 text-white text-xs rounded-xl font-medium"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANUAL WALK-IN BOOKING MODAL */}
      <AnimatePresence>
        {isBookModalOpen && (
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
                  Book Manual Walk-in Appointment
                </h3>
                <button onClick={() => setIsBookModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="e.g. Vikram Singh"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Assigned Staff / Doctor *</label>
                    <input
                      type="text"
                      required
                      value={staff}
                      onChange={(e) => setStaff(e.target.value)}
                      placeholder="e.g. Dr. Meenakshi / Rekha"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Treatment / Service *</label>
                  <input
                    type="text"
                    required
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
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
                    <label className="block text-xs font-medium text-slate-400 mb-1">Channel Source</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="MANUAL">✍️ Manual Walk-in</option>
                      <option value="STORE_VISIT">🏬 Store Visit</option>
                      <option value="REFERRAL">🤝 Referral</option>
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

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsBookModalOpen(false)}
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
