'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
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
  UserCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Flame,
  Mail,
  Edit3,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';
import { useNiche } from '@/components/providers/niche-provider';
import { useServices } from '@/lib/services-store';
import { api } from '@/lib/api-client';
import type { NicheId } from '@/config/niches/types';

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
  confirmationStatus?: string;
  confirmationSent?: boolean;
  notes?: string;
}

const DEFAULT_APPOINTMENTS_BY_NICHE: Record<NicheId, AppointmentItem[]> = {
  skin: [], dental: [], spa: [], salon: [], realestate: [], hotel: []
};

const statusConfig: Record<string, { icon: typeof CheckCircle2; label: string; style: string }> = {
  SCHEDULED: { icon: Clock, label: 'Scheduled', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  CONFIRMED: { icon: CheckCircle2, label: 'Confirmed', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  IN_PROGRESS: { icon: AlertCircle, label: 'In Progress', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  COMPLETED: { icon: CheckCircle2, label: 'Completed', style: 'bg-green-500/10 text-green-400 border-green-500/20' },
  CANCELLED: { icon: XCircle, label: 'Cancelled', style: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
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
  const { currentNiche, nicheConfig } = useNiche();
  const { activeServices } = useServices();
  const [appointments, setAppointments] = useState<AppointmentItem[]>(() => DEFAULT_APPOINTMENTS_BY_NICHE[currentNiche] || DEFAULT_APPOINTMENTS_BY_NICHE.skin);

  useEffect(() => {
    // 1. Initial cached render
    const cached = typeof window !== 'undefined' ? localStorage.getItem(`zerodesk_appointments_${currentNiche}`) : null;
    if (cached) {
      try {
        setAppointments(JSON.parse(cached));
      } catch {
        setAppointments(DEFAULT_APPOINTMENTS_BY_NICHE[currentNiche] || DEFAULT_APPOINTMENTS_BY_NICHE.skin);
      }
    } else {
      setAppointments(DEFAULT_APPOINTMENTS_BY_NICHE[currentNiche] || DEFAULT_APPOINTMENTS_BY_NICHE.skin);
    }

    // 2. Background sync with NestJS backend
    api.get<any[]>('/appointments').then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        const mapped: AppointmentItem[] = res.map((a: any) => ({
          id: a.id,
          customer: a.customer?.name || (nicheConfig.terminology?.customer || 'Customer'),
          phone: a.customer?.phone || '',
          email: a.customer?.email || '',
          service: a.service?.name || (nicheConfig.terminology?.service || 'Service'),
          staff: a.staff?.name || (nicheConfig.terminology?.staff || 'Staff'),
          scheduledAt: a.scheduledAt ? new Date(a.scheduledAt).toISOString() : new Date().toISOString(),
          duration: a.durationMins || 30,
          status: (a.status as any) || 'SCHEDULED',
          source: (a.source as any) || 'AI_VOICE',
          priority: 'VIP',
          confirmationStatus: a.status === 'CONFIRMED' ? 'Confirmed via WhatsApp AI' : 'Scheduled',
          confirmationSent: true,
          notes: a.notes || '',
        }));
        setAppointments(mapped);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`zerodesk_appointments_${currentNiche}`, JSON.stringify(mapped));
        }
      }
    }).catch(() => {
      // Offline fallback
    });
  }, [currentNiche]);

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [calendarSubView, setCalendarSubView] = useState<'month' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<number>(24);
  const [confirmationTriggeredId, setConfirmationTriggeredId] = useState<string | null>(null);

  // Edit Slide-Over Drawer State
  const [editingAppt, setEditingAppt] = useState<AppointmentItem | null>(null);
  const [editCustomer, setEditCustomer] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editService, setEditService] = useState('');
  const [editStaff, setEditStaff] = useState('');
  const [editDate, setEditDate] = useState('2026-08-24');
  const [editTime, setEditTime] = useState('10:00');
  const [editDuration, setEditDuration] = useState(30);
  const [editStatus, setEditStatus] = useState<AppointmentItem['status']>('CONFIRMED');
  const [editPriority, setEditPriority] = useState<AppointmentItem['priority']>('VIP');
  const [editNotes, setEditNotes] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const handleOpenEditDrawer = (appt: AppointmentItem) => {
    setEditingAppt(appt);
    setEditCustomer(appt.customer);
    setEditPhone(appt.phone || '');
    setEditEmail(appt.email || '');
    setEditService(appt.service);
    setEditStaff(appt.staff);
    const d = new Date(appt.scheduledAt);
    setEditDate(appt.scheduledAt.split('T')[0] || '2026-08-24');
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    setEditTime(`${h}:${m}`);
    setEditDuration(appt.duration || 30);
    setEditStatus(appt.status);
    setEditPriority(appt.priority || 'STANDARD');
    setEditNotes(appt.notes || '');
    setSaveSuccessMsg(false);
  };

  const handleSaveAppointmentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppt) return;

    const scheduledAt = `${editDate}T${editTime}:00`;
    setAppointments(prev => prev.map(a => {
      if (a.id === editingAppt.id) {
        return {
          ...a,
          customer: editCustomer,
          phone: editPhone,
          email: editEmail,
          service: editService,
          staff: editStaff,
          scheduledAt,
          duration: editDuration,
          status: editStatus,
          priority: editPriority,
          notes: editNotes,
        };
      }
      return a;
    }));

    // Background sync to backend
    api.patch(`/appointments/${editingAppt.id}`, {
      scheduledAt: new Date(scheduledAt).toISOString(),
      durationMins: editDuration,
      status: editStatus,
      notes: editNotes,
    })
      .then(() => {
        setSaveSuccessMsg(true);
        setTimeout(() => {
          setSaveSuccessMsg(false);
          setEditingAppt(null);
        }, 900);
      })
      .catch((err) => {
        console.error('Failed to update appointment:', err);
        alert('Could not update appointment on server: ' + (err?.message || 'Server error'));
      });
  };

  const handleCancelAppointmentFromDrawer = (apptId: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === apptId) {
        return { ...a, status: 'CANCELLED' };
      }
      return a;
    }));
    // Background sync cancel to backend
    api.put(`/appointments/${apptId}/cancel`).catch(() => {});
    setEditingAppt(null);
  };

  const handleSendConfirmationRequest = (apptId: string) => {
    setConfirmationTriggeredId(apptId);
    setTimeout(() => {
      setAppointments(prev => prev.map(a => {
        if (a.id === apptId) {
          return {
            ...a,
            status: 'CONFIRMED',
            confirmationStatus: 'Booking Confirmed via AI Engine',
            confirmationSent: true
          };
        }
        return a;
      }));
      setConfirmationTriggeredId(null);
    }, 1200);
  };

  // Selected date appointments
  const selectedDateAppts = appointments.filter(a => {
    const d = new Date(a.scheduledAt);
    return d.getDate() === selectedDate;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {nicheConfig.terminology?.appointments || 'Appointments'} & Scheduling
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher: Calendar vs List */}
          <div className="flex items-center bg-[var(--color-surface)] p-1 rounded-xl border border-[var(--color-border)]">
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === 'calendar'
                  ? "bg-blue-600 text-white shadow-sm font-bold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
            >
              <CalendarDays size={14} />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === 'list'
                  ? "bg-blue-600 text-white shadow-sm font-bold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
            >
              <ListFilter size={14} />
              List View
            </button>
          </div>

          {/* Book Appointment Button - Redirects directly to /book-appointment */}
          <Link
            href="/book-appointment"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/20 shrink-0"
          >
            <Plus size={16} />
            <span>Book Appointment</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Dominant Big Calendar (Left) + Compact Stats & Appointments List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Dominant Big Calendar / List */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4">
          {viewMode === 'calendar' ? (
            <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-3xl p-6 shadow-xl space-y-4">
              {/* Calendar Controls */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
                    <CalIcon size={18} className="text-blue-500" />
                    <span>August 2026</span>
                  </h2>
                  <span className="text-xs text-[var(--color-text-muted)] font-medium">Asia/Calcutta</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[var(--color-surface)] p-0.5 rounded-lg border border-[var(--color-border)] text-xs">
                    <button
                      onClick={() => setCalendarSubView('month')}
                      className={cn(
                        "px-3 py-1 rounded-md font-semibold transition-all",
                        calendarSubView === 'month' ? "bg-blue-600 text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                      )}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setCalendarSubView('day')}
                      className={cn(
                        "px-3 py-1 rounded-md font-semibold transition-all",
                        calendarSubView === 'day' ? "bg-blue-600 text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                      )}
                    >
                      Day
                    </button>
                  </div>
                </div>
              </div>

              {/* Month View Grid */}
              {calendarSubView === 'month' && (
                <div>
                  <div className="grid grid-cols-7 text-center font-bold text-xs text-[var(--color-text-muted)] mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="py-2">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {/* Padding days from July */}
                    {[26, 27, 28, 29, 30, 31].map(d => (
                      <div key={`prev-${d}`} className="min-h-[110px] p-2 rounded-2xl border border-transparent text-zinc-400 dark:text-zinc-600 text-xs font-semibold">
                        {d}
                      </div>
                    ))}

                    {/* August Days 1 to 31 */}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                      const isSelected = selectedDate === day;
                      const dayAppts = appointments.filter(a => new Date(a.scheduledAt).getDate() === day);

                      return (
                        <div
                          key={day}
                          onClick={() => setSelectedDate(day)}
                          className={cn(
                            "min-h-[110px] p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group",
                            isSelected
                              ? "bg-blue-500/10 border-blue-500/50 shadow-md ring-2 ring-blue-500/30"
                              : "bg-[var(--color-surface)]/60 border-[var(--color-border)] hover:border-blue-500/30 hover:bg-[var(--color-surface)]"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                              isSelected 
                                ? "bg-blue-600 text-white shadow-sm" 
                                : "text-[var(--color-text)] group-hover:text-blue-500"
                            )}>
                              {day}
                            </span>
                            {dayAppts.length > 0 && (
                              <span className="text-[10px] font-mono text-blue-500 font-bold">
                                {dayAppts.length} {dayAppts.length === 1 ? 'sitting' : 'sittings'}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 my-1">
                            {dayAppts.slice(0, 2).map((a) => (
                              <div
                                key={a.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditDrawer(a);
                                }}
                                className={cn(
                                  "p-1 rounded-md text-[10px] truncate font-medium hover:scale-[1.02] transition-transform",
                                  a.status === 'CONFIRMED' ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30" :
                                  a.status === 'IN_PROGRESS' ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30" :
                                  "bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30"
                                )}
                              >
                                {a.customer.split(' ')[0]} - {a.service}
                              </div>
                            ))}
                            {dayAppts.length > 2 && (
                              <span className="text-[9px] text-[var(--color-text-muted)] font-semibold block text-center">
                                +{dayAppts.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Day View Timeline */}
              {calendarSubView === 'day' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-[var(--color-surface)] p-3 rounded-2xl border border-[var(--color-border)]">
                    <span className="text-xs font-bold text-[var(--color-text)]">
                      Day Schedule: August {selectedDate}, 2026 ({selectedDateAppts.length} appointments)
                    </span>
                    <button
                      onClick={() => setCalendarSubView('month')}
                      className="text-xs text-blue-500 font-semibold hover:underline"
                    >
                      ← Back to Month
                    </button>
                  </div>

                  <div className="space-y-2">
                    {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(hour => {
                      const hourAppts = selectedDateAppts.filter(a => {
                        const h = new Date(a.scheduledAt).getHours().toString().padStart(2, '0');
                        return `${h}:00` === hour;
                      });

                      return (
                        <div key={hour} className="flex gap-3 p-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] items-start">
                          <span className="font-mono text-xs text-[var(--color-text-muted)] font-bold w-16 pt-1">{hour}</span>
                          <div className="flex-1 space-y-1.5">
                            {hourAppts.length > 0 ? (
                              hourAppts.map(appt => (
                                <div 
                                  key={appt.id} 
                                  onClick={() => handleOpenEditDrawer(appt)}
                                  className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-all group"
                                >
                                  <div>
                                    <span className="font-bold text-xs text-[var(--color-text)] group-hover:text-blue-500 transition-colors">{appt.customer}</span>
                                    <span className="text-[11px] text-[var(--color-text-muted)] block">{appt.service} • {appt.staff}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                                      {appt.status}
                                    </span>
                                    <Edit3 size={13} className="text-[var(--color-text-muted)] group-hover:text-blue-500" />
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-[11px] text-[var(--color-text-muted)] italic">No booking scheduled</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl space-y-3">
                  <p className="font-semibold text-sm text-[var(--color-text)]">No appointments found</p>
                  <p>There are no scheduled {nicheConfig.terminology?.appointments?.toLowerCase() || 'appointments'} recorded yet.</p>
                  <Link
                    href="/book-appointment"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
                  >
                    <Plus size={14} /> Book First {nicheConfig.terminology?.appointment || 'Appointment'}
                  </Link>
                </div>
              ) : appointments.map((appt) => {
                const status = statusConfig[appt.status] || statusConfig.SCHEDULED;
                const StatusIcon = status.icon;
                const apptDate = new Date(appt.scheduledAt);
                return (
                  <div
                    key={appt.id}
                    onClick={() => handleOpenEditDrawer(appt)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl hover:border-blue-500/40 transition-all cursor-pointer gap-4 shadow-sm group"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar3D name={appt.customer} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-[var(--color-text)] group-hover:text-blue-500 transition-colors">{appt.service}</p>
                          <span className={cn("px-2.5 py-0.5 text-[10px] rounded-full border flex items-center gap-1 font-semibold", status.style)}>
                            <StatusIcon size={10} />
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                          <span>{nicheConfig.terminology?.customer || 'Customer'}: <strong className="text-[var(--color-text)]">{appt.customer}</strong></span>
                          <span>•</span>
                          <span>{nicheConfig.terminology?.staff || 'Staff'}: <strong className="text-blue-500">{appt.staff}</strong></span>
                          <span>•</span>
                          <span className="text-[var(--color-text)] font-medium">{sourceLabels[appt.source]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-blue-500 font-mono">
                        {apptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {apptDate.getHours().toString().padStart(2, '0')}:{apptDate.getMinutes().toString().padStart(2, '0')}
                      </p>
                      <span className="text-[10px] text-emerald-500 font-medium">{appt.confirmationStatus}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Compact Smaller Stat Cards + Appointments List */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-4">
          {/* 4 Smaller, Compact Stat Cards in 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Total Bookings', count: appointments.length, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Booking Confirmed', count: appointments.filter(a => a.status === 'CONFIRMED').length, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Store / Walk-ins', count: appointments.filter(a => a.source === 'STORE_VISIT' || a.source === 'MANUAL').length, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { label: 'Referrals', count: appointments.filter(a => a.source === 'REFERRAL').length, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-3 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-sm space-y-0.5"
              >
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-bold truncate">{stat.label}</p>
                <div className="flex items-baseline justify-between">
                  <p className={cn("text-xl font-extrabold font-mono", stat.color)}>{stat.count}</p>
                  <span className="text-[9px] text-[var(--color-text-muted)] font-medium">sittings</span>
                </div>
              </div>
            ))}
          </div>

          {/* Appointments Inspector Card (Renamed from Selected Date) */}
          <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5">
              <div>
                <span className="text-xs font-bold text-[var(--color-text)]">Appointments</span>
                <span className="text-[10px] text-[var(--color-text-muted)] block">Click any to view & edit details</span>
              </div>
              <span className="text-xs font-mono font-bold text-blue-500 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                Aug {selectedDate}, 2026
              </span>
            </div>

            {selectedDateAppts.length > 0 ? (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {selectedDateAppts.map(a => (
                  <div 
                    key={a.id} 
                    onClick={() => handleOpenEditDrawer(a)}
                    className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer text-xs space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--color-text)] group-hover:text-blue-500 transition-colors flex items-center gap-1.5">
                        {a.customer}
                        {a.priority === 'VIP' && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.2 rounded font-bold">VIP</span>
                        )}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-blue-500">
                        {new Date(a.scheduledAt).getHours().toString().padStart(2, '0')}:00
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] truncate">{a.service}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-emerald-500 font-semibold">● {a.status}</span>
                      <span className="text-[10px] text-blue-500 group-hover:underline flex items-center gap-1">
                        Edit details →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[var(--color-text-muted)] space-y-2">
                <p>No appointments on this date.</p>
                <Link
                  href="/book-appointment"
                  className="inline-block text-xs text-blue-500 font-bold hover:underline"
                >
                  + Add new booking
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Large Slide-Over Appointment Details & Re-Edit Panel */}
      <AnimatePresence>
        {editingAppt && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingAppt(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            />

            {/* Slide-over Container */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-lg bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl flex flex-col justify-between"
              >
                {/* Drawer Header */}
                <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-secondary)]">
                  <div className="flex items-center gap-3">
                    <Avatar3D name={editCustomer} size="md" />
                    <div>
                      <h3 className="font-bold text-base text-[var(--color-text)] flex items-center gap-2">
                        <span>{editCustomer}</span>
                        {editPriority === 'VIP' && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2 py-0.2 rounded-full font-bold">
                            VIP
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)]">Appointment Booking Details</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingAppt(null)}
                    className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Drawer Body Form */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                  {/* Quick Action Contact Bar */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)]">
                    {editPhone && (
                      <a
                        href={`tel:${editPhone.replace(/\s+/g, '')}`}
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600/10 text-blue-500 font-semibold hover:bg-blue-600 hover:text-white transition-all text-center"
                      >
                        <Phone size={14} />
                        Call Patient
                      </a>
                    )}
                    {editPhone && (
                      <a
                        href={`https://wa.me/${editPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500/10 text-emerald-500 font-semibold hover:bg-emerald-600 hover:text-white transition-all text-center"
                      >
                        <MessageCircle size={14} />
                        WhatsApp
                      </a>
                    )}
                  </div>

                  {saveSuccessMsg && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-500 font-bold flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      <span>Appointment updated and saved successfully!</span>
                    </div>
                  )}

                  <form id="edit-appt-form" onSubmit={handleSaveAppointmentEdit} className="space-y-4">
                    {/* Customer Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Customer / Patient Name</label>
                        <input
                          type="text"
                          required
                          value={editCustomer}
                          onChange={(e) => setEditCustomer(e.target.value)}
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Email Address</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="e.g. client@email.com"
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Service & Staff Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Service</label>
                        <select
                          value={editService}
                          onChange={(e) => setEditService(e.target.value)}
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          {activeServices.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Assigned Specialist</label>
                        <input
                          type="text"
                          value={editStaff}
                          onChange={(e) => setEditStaff(e.target.value)}
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="col-span-1">
                        <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Date</label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-2.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Time Slot</label>
                        <input
                          type="time"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-2.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Duration (min)</label>
                        <select
                          value={editDuration}
                          onChange={(e) => setEditDuration(parseInt(e.target.value))}
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-2.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          {[15, 20, 30, 45, 60, 90, 120].map(d => (
                            <option key={d} value={d}>{d} min</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Booking Status</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as AppointmentItem['status'])}
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                        >
                          <option value="SCHEDULED">Scheduled</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="NO_SHOW">No Show</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Client Priority</label>
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value as AppointmentItem['priority'])}
                          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="VIP">⭐ VIP Client</option>
                          <option value="HIGH">🔥 High Priority</option>
                          <option value="STANDARD">Standard</option>
                        </select>
                      </div>
                    </div>

                    {/* Clinical / Booking Notes */}
                    <div>
                      <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Client Notes / Procedure History</label>
                      <textarea
                        rows={3}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Add special instructions, allergies, procedure notes..."
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                      />
                    </div>
                  </form>
                </div>

                {/* Drawer Footer Actions */}
                <div className="p-5 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleCancelAppointmentFromDrawer(editingAppt.id)}
                    className="py-2.5 px-4 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={14} />
                    Cancel Booking
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingAppt(null)}
                      className="py-2.5 px-4 rounded-xl border border-[var(--color-border)] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface)] text-xs cursor-pointer"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      form="edit-appt-form"
                      className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check size={14} />
                      Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
