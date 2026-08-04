'use client';

import { motion } from 'framer-motion';
import { Plus, Calendar as CalIcon, Clock, User, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const appointments = [
  { id: '1', customer: 'Rajesh Kumar', service: 'Laser Hair Removal', staff: 'Dr. Meenakshi', scheduledAt: '2024-03-15T10:00:00', duration: 45, status: 'SCHEDULED', source: 'AI_VOICE' },
  { id: '2', customer: 'Priya Sharma', service: 'Chemical Peel', staff: 'Dr. Arun', scheduledAt: '2024-03-15T11:00:00', duration: 30, status: 'CONFIRMED', source: 'AI_WHATSAPP' },
  { id: '3', customer: 'Sneha Reddy', service: 'Full Body Massage', staff: 'Kavita', scheduledAt: '2024-03-15T12:30:00', duration: 60, status: 'IN_PROGRESS', source: 'AI_VOICE' },
  { id: '4', customer: 'Amit Patel', service: 'Consultation', staff: 'Dr. Meenakshi', scheduledAt: '2024-03-15T14:00:00', duration: 20, status: 'COMPLETED', source: 'MANUAL' },
  { id: '5', customer: 'Ananya Iyer', service: 'Facial Treatment', staff: 'Rekha', scheduledAt: '2024-03-15T15:00:00', duration: 45, status: 'CANCELLED', source: 'AI_WHATSAPP' },
  { id: '6', customer: 'Deepak Menon', service: 'Hair Transplant Consultation', staff: 'Dr. Arun', scheduledAt: '2024-03-15T16:00:00', duration: 30, status: 'NO_SHOW', source: 'AI_VOICE' },
  { id: '7', customer: 'Vikram Singh', service: 'PRP Therapy', staff: 'Dr. Meenakshi', scheduledAt: '2024-03-16T10:00:00', duration: 60, status: 'SCHEDULED', source: 'AI_WEB' },
  { id: '8', customer: 'Meera Joshi', service: 'Botox Treatment', staff: 'Dr. Arun', scheduledAt: '2024-03-16T11:30:00', duration: 30, status: 'CONFIRMED', source: 'AI_WHATSAPP' },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; label: string; style: string }> = {
  SCHEDULED: { icon: Clock, label: 'Scheduled', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  CONFIRMED: { icon: CheckCircle2, label: 'Confirmed', style: 'bg-green-500/10 text-green-400 border-green-500/20' },
  IN_PROGRESS: { icon: AlertCircle, label: 'In Progress', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  COMPLETED: { icon: CheckCircle2, label: 'Completed', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  CANCELLED: { icon: XCircle, label: 'Cancelled', style: 'bg-red-500/10 text-red-400 border-red-500/20' },
  NO_SHOW: { icon: XCircle, label: 'No Show', style: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
};

const sourceLabels: Record<string, string> = { AI_VOICE: '📞 AI Voice', AI_WHATSAPP: '💬 AI WhatsApp', AI_WEB: '🌐 AI Chat', MANUAL: '✍️ Manual' };

export default function AppointmentsPage() {
  const today = appointments.filter(a => a.scheduledAt.startsWith('2024-03-15'));
  const tomorrow = appointments.filter(a => a.scheduledAt.startsWith('2024-03-16'));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Manage all bookings across AI and manual channels</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} />
          Book Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Today', count: today.length, color: 'text-blue-400' },
          { label: 'Confirmed', count: appointments.filter(a => a.status === 'CONFIRMED').length, color: 'text-green-400' },
          { label: 'AI Booked', count: appointments.filter(a => a.source.startsWith('AI_')).length, color: 'text-purple-400' },
          { label: 'Cancelled', count: appointments.filter(a => a.status === 'CANCELLED').length, color: 'text-red-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl"
          >
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{stat.label}</p>
            <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.count}</p>
          </motion.div>
        ))}
      </div>

      {/* Appointment List */}
      {[{ label: 'Today — March 15', items: today }, { label: 'Tomorrow — March 16', items: tomorrow }].map((group) => (
        <div key={group.label}>
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3 flex items-center gap-2">
            <CalIcon size={14} />
            {group.label}
          </h2>
          <div className="space-y-2">
            {group.items.map((appt, i) => {
              const status = statusConfig[appt.status];
              const StatusIcon = status.icon;
              const time = new Date(appt.scheduledAt);
              return (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl hover:bg-[var(--color-glass-hover)] transition-all cursor-pointer"
                >
                  <div className="text-center w-16 shrink-0">
                    <p className="text-lg font-bold text-[var(--color-text)]">{time.getHours().toString().padStart(2, '0')}:{time.getMinutes().toString().padStart(2, '0')}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{appt.duration} min</p>
                  </div>
                  <div className="w-px h-10 bg-[var(--color-border)]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-[var(--color-text)]">{appt.service}</p>
                      <span className={cn("px-2 py-0.5 text-[10px] rounded-full border flex items-center gap-1", status.style)}>
                        <StatusIcon size={10} />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1"><User size={10} />{appt.customer}</span>
                      <span>with {appt.staff}</span>
                      <span>{sourceLabels[appt.source]}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
