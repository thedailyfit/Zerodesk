'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Clock, Star, Search, ArrowRightLeft, UserCheck, Check, RefreshCw, Calendar, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';
import { useNiche } from '@/components/providers/niche-provider';
import { apiClient } from '@/lib/api-client';

type ColumnId = 'checked-in' | 'waiting' | 'with-doctor' | 'treatment' | 'checkout';

interface PatientItem {
  id: string;
  pid: string;
  name: string;
  time: string;
  service: string;
  elapsed: string;
  col: ColumnId;
  vip: boolean;
  phone?: string;
  rawStatus?: string;
}

const COLOR_MAP: Record<string, string> = {
  blue: 'border-l-blue-500 bg-blue-500/5',
  amber: 'border-l-amber-500 bg-amber-500/5',
  green: 'border-l-green-500 bg-green-500/5',
  indigo: 'border-l-indigo-500 bg-indigo-500/5',
  emerald: 'border-l-emerald-500 bg-emerald-500/5',
};

const BORDER_MAP: Record<string, string> = {
  blue: 'border-blue-500/20 text-blue-400',
  amber: 'border-amber-500/20 text-amber-400',
  green: 'border-green-500/20 text-green-400',
  indigo: 'border-indigo-500/20 text-indigo-400',
  emerald: 'border-emerald-500/20 text-emerald-400',
};

export default function WaitingRoomPage() {
  const { currentNiche, nicheConfig } = useNiche();

  const columns = useMemo(() => [
    { id: 'checked-in' as const, title: 'Checked In', color: 'blue', dbStatus: 'PENDING' },
    { id: 'waiting' as const, title: nicheConfig.id === 'spa' ? 'Therapy Lounge' : (nicheConfig.terminology?.waitingRoom || 'Waiting Room'), color: 'amber', dbStatus: 'CONFIRMED' },
    { id: 'with-doctor' as const, title: `With ${nicheConfig.terminology?.staff || (nicheConfig.id === 'spa' ? 'Therapist' : 'Specialist')}`, color: 'green', dbStatus: 'IN_PROGRESS' },
    { id: 'treatment' as const, title: nicheConfig.id === 'spa' ? 'Therapy Suite' : 'Service Room', color: 'indigo', dbStatus: 'IN_PROGRESS' },
    { id: 'checkout' as const, title: 'Checkout', color: 'emerald', dbStatus: 'COMPLETED' },
  ], [nicheConfig]);

  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeMoveMenu, setActiveMoveMenu] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<any[]>('/appointments');
      if (Array.isArray(data)) {
        setAllAppointments(data);

        // Map appointments to waiting room items
        const mapped: PatientItem[] = data
          .filter((appt) => appt.status !== 'CANCELLED' && appt.status !== 'NO_SHOW')
          .map((appt) => {
            let col: ColumnId = 'checked-in';
            if (appt.status === 'COMPLETED') col = 'checkout';
            else if (appt.status === 'IN_PROGRESS') col = 'with-doctor';
            else if (appt.status === 'CONFIRMED') col = 'waiting';
            else if (appt.status === 'PENDING') col = 'checked-in';

            const apptDate = appt.date ? new Date(appt.date) : new Date();
            const timeStr = appt.startTime || apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const diffMin = Math.max(0, Math.round((Date.now() - apptDate.getTime()) / 60000));
            const elapsed = diffMin > 60 ? `${Math.floor(diffMin / 60)}h ${diffMin % 60}m` : `${diffMin || 1} min`;

            return {
              id: appt.id,
              pid: appt.id.slice(0, 8).toUpperCase(),
              name: appt.customer?.name || (nicheConfig.id === 'spa' ? 'Walk-in Guest' : `Walk-in ${nicheConfig.terminology?.customer || 'Client'}`),
              time: timeStr,
              service: appt.service?.name || (nicheConfig.id === 'spa' ? 'Therapy Session' : (nicheConfig.terminology?.consultation || 'Session')),
              elapsed,
              col,
              vip: (appt.customer?.lifetimeValue || 0) > 15000,
              phone: appt.customer?.phone,
              rawStatus: appt.status,
            };
          });

        setPatients(mapped);
      } else {
        setPatients([]);
      }
    } catch (err) {
      console.warn('Waiting room: using fallback empty state due to API error', err);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, [nicheConfig]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments, currentNiche]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMovePatient = async (patientId: string, newCol: ColumnId) => {
    setActiveMoveMenu(null);
    const colDef = columns.find((c) => c.id === newCol);
    const nextStatus = colDef?.dbStatus || 'CONFIRMED';

    // Optimistic UI update
    setPatients((prev) => prev.map((p) => (p.id === patientId ? { ...p, col: newCol } : p)));

    try {
      setIsUpdating(true);
      await apiClient(`/appointments/${patientId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (e) {
      console.error('Failed to update appointment stage:', e);
      fetchAppointments();
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredBookings = allAppointments.filter(
    (b) =>
      b.status === 'PENDING' &&
      ((b.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.service?.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCheckInPatient = async (appt: any) => {
    setSearchQuery('');
    setIsDropdownOpen(false);
    await handleMovePatient(appt.id, 'waiting');
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto h-[calc(100vh-100px)] flex flex-col">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <Radio className="text-green-500 animate-pulse" /> Live {nicheConfig?.terminology?.waitingRoom || 'Waiting Room'}
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Real-time {nicheConfig?.terminology?.customer?.toLowerCase() || (nicheConfig.id === 'spa' ? 'guest' : 'client')} status & queue tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAppointments()}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
            title="Refresh queue"
          >
            <RefreshCw size={16} className={cn(isLoading && 'animate-spin text-blue-400')} />
          </button>

          {/* Autocomplete Search Bar */}
          <div ref={searchRef} className="relative w-full md:w-80">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder={`Search ${nicheConfig?.terminology?.customer || (nicheConfig.id === 'spa' ? 'Guest' : 'Client')}...`}
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-[var(--color-text)] shadow-sm"
              />
            </div>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto divide-y divide-slate-800/60 p-2"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Pending Appointments</span>
                    <span>{filteredBookings.length} Available</span>
                  </div>

                  {filteredBookings.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No matching pending appointments found.
                    </div>
                  ) : (
                    filteredBookings.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => handleCheckInPatient(b)}
                        className="p-3 hover:bg-slate-800/80 rounded-xl cursor-pointer transition flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition">
                              {b.customer?.name || (nicheConfig.id === 'spa' ? 'Guest' : 'Client')}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {b.service?.name || 'Service'} &bull; {b.startTime || 'Scheduled Today'}
                          </div>
                        </div>
                        <button className="px-2.5 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-medium transition flex items-center gap-1">
                          <UserCheck size={12} /> Check-In
                        </button>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/appointments"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition shrink-0"
          >
            <UserPlus size={14} /> Book {nicheConfig?.terminology?.customer || (nicheConfig.id === 'spa' ? 'Guest' : 'Client')}
          </Link>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1 min-h-0 overflow-x-auto pb-2">
        {columns.map((col) => {
          const colPatients = patients.filter((p) => p.col === col.id);

          return (
            <div
              key={col.id}
              className="flex flex-col bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-3 min-w-[240px] shadow-sm overflow-hidden"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={cn('w-2.5 h-2.5 rounded-full', {
                    'bg-blue-500': col.color === 'blue',
                    'bg-amber-500': col.color === 'amber',
                    'bg-green-500': col.color === 'green',
                    'bg-indigo-500': col.color === 'indigo',
                    'bg-emerald-500': col.color === 'emerald',
                  })} />
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">{col.title}</span>
                </div>
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', BORDER_MAP[col.color])}>
                  {colPatients.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {colPatients.length === 0 ? (
                  <div className="h-32 border border-dashed border-[var(--color-border)] rounded-xl flex flex-col items-center justify-center text-center p-3 text-[var(--color-text-muted)] text-xs">
                    <Clock size={18} className="mb-1 opacity-40" />
                    <span>No {nicheConfig?.terminology?.customer?.toLowerCase() || (nicheConfig.id === 'spa' ? 'guests' : 'clients')}</span>
                  </div>
                ) : (
                  colPatients.map((patient) => (
                    <motion.div
                      layout
                      key={patient.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        'border-l-4 rounded-xl p-3.5 bg-[var(--color-surface-hover)] border border-[var(--color-border)] shadow-sm relative group hover:border-[var(--color-border-hover)] transition',
                        COLOR_MAP[col.color]
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar3D name={patient.name} size="sm" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[var(--color-text)] line-clamp-1">{patient.name}</span>
                              {patient.vip && <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />}
                            </div>
                            <span className="text-[10px] text-[var(--color-text-muted)]">{patient.pid}</span>
                          </div>
                        </div>

                        {/* Move Dropdown Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setActiveMoveMenu(activeMoveMenu === patient.id ? null : patient.id)}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
                            title="Move Stage"
                          >
                            <ArrowRightLeft size={13} />
                          </button>

                          {activeMoveMenu === patient.id && (
                            <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-30 py-1 w-36 text-xs divide-y divide-slate-800/60">
                              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">Move To:</div>
                              {columns.filter((c) => c.id !== col.id).map((targetCol) => (
                                <button
                                  key={targetCol.id}
                                  onClick={() => handleMovePatient(patient.id, targetCol.id)}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center justify-between"
                                >
                                  <span>{targetCol.title}</span>
                                  <Check size={11} className="opacity-0 group-hover:opacity-100" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                        <span className="line-clamp-1 font-medium text-[var(--color-text)]">{patient.service}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <Clock size={11} />
                          <span>{patient.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
