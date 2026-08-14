'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Clock, Star, Search, ArrowRightLeft, UserCheck, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';
import { useNiche } from '@/components/providers/niche-provider';

const COLUMNS = [
  { id: 'checked-in', title: 'Checked In', color: 'blue' },
  { id: 'waiting', title: 'Waiting', color: 'amber' },
  { id: 'with-doctor', title: 'In Service', color: 'green' },
  { id: 'treatment', title: 'In Progress', color: 'purple' },
  { id: 'checkout', title: 'Checkout', color: 'emerald' },
] as const;

type ColumnId = typeof COLUMNS[number]['id'];

interface PatientItem {
  id: string;
  pid: string;
  name: string;
  time: string;
  service: string;
  elapsed: string;
  col: ColumnId;
  vip: boolean;
}

const INITIAL_PATIENTS: PatientItem[] = [
  { id: '1', pid: 'ID-8492', name: 'Rajesh K.', time: '10:00 AM', service: 'Consultation', elapsed: '2 min', col: 'checked-in', vip: false },
  { id: '2', pid: 'ID-1042', name: 'Priya S.', time: '10:15 AM', service: 'Primary Session', elapsed: '5 min', col: 'checked-in', vip: true },
  { id: '3', pid: 'ID-3829', name: 'Sneha R.', time: '09:45 AM', service: 'VIP Care', elapsed: '15 min', col: 'waiting', vip: false },
  { id: '4', pid: 'ID-5712', name: 'Amit P.', time: '09:30 AM', service: 'Assessment', elapsed: '20 min', col: 'waiting', vip: false },
  { id: '5', pid: 'ID-9201', name: 'Ananya I.', time: '09:50 AM', service: 'Specialist Session', elapsed: '12 min', col: 'waiting', vip: true },
  { id: '6', pid: 'ID-4482', name: 'Deepak M.', time: '09:15 AM', service: 'Dedicated Procedure', elapsed: '45 min', col: 'with-doctor', vip: true },
  { id: '7', pid: 'ID-6310', name: 'Meera J.', time: '09:20 AM', service: 'Review & Care', elapsed: '30 min', col: 'with-doctor', vip: false },
  { id: '8', pid: 'ID-7193', name: 'Kiran T.', time: '08:30 AM', service: 'Follow-up Session', elapsed: '1h 15m', col: 'treatment', vip: false },
  { id: '9', pid: 'ID-2054', name: 'Rahul B.', time: '09:00 AM', service: 'Express Service', elapsed: '5 min', col: 'checkout', vip: false },
];

const BOOKED_APPOINTMENTS = [
  { pid: 'ID-9104', name: 'Vikram Malhotra', time: '11:00 AM', service: 'Standard Service Session', vip: true },
  { pid: 'ID-6291', name: 'Sunita Kapoor', time: '11:30 AM', service: 'Primary Assessment', vip: false },
  { pid: 'ID-3305', name: 'Arjun Das', time: '12:00 PM', service: 'Custom Treatment', vip: false },
  { pid: 'ID-5519', name: 'Pooja Hegde', time: '12:15 PM', service: 'Consultation & Review', vip: true },
  { pid: 'ID-8840', name: 'Rohan Sharma', time: '12:30 PM', service: 'Specialist Booking', vip: false },
  { pid: 'ID-4128', name: 'Neha Gupta', time: '01:00 PM', service: 'Follow-up Check', vip: false },
];

const COLOR_MAP: Record<string, string> = {
  blue: 'border-l-blue-500 bg-blue-500/5',
  amber: 'border-l-amber-500 bg-amber-500/5',
  green: 'border-l-green-500 bg-green-500/5',
  purple: 'border-l-purple-500 bg-purple-500/5',
  emerald: 'border-l-emerald-500 bg-emerald-500/5',
};

const BORDER_MAP: Record<string, string> = {
  blue: 'border-blue-500/20 text-blue-400',
  amber: 'border-amber-500/20 text-amber-400',
  green: 'border-green-500/20 text-green-400',
  purple: 'border-purple-500/20 text-purple-400',
  emerald: 'border-emerald-500/20 text-emerald-400',
};

export default function WaitingRoomPage() {
  const { nicheConfig } = useNiche();
  const [patients, setPatients] = useState<PatientItem[]>(INITIAL_PATIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeMoveMenu, setActiveMoveMenu] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

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

  // Filter booked appointments not already checked in
  const existingPids = new Set(patients.map(p => p.pid));
  const availableBookings = BOOKED_APPOINTMENTS.filter(b => !existingPids.has(b.pid));
  
  const filteredBookings = availableBookings.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.pid.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckInPatient = (booking: typeof BOOKED_APPOINTMENTS[0]) => {
    const newPatient: PatientItem = {
      id: Date.now().toString(),
      pid: booking.pid,
      name: booking.name,
      time: booking.time,
      service: booking.service,
      elapsed: 'Just checked in',
      col: 'checked-in',
      vip: booking.vip,
    };
    setPatients(prev => [newPatient, ...prev]);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleMovePatient = (patientId: string, newCol: ColumnId) => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, col: newCol } : p));
    setActiveMoveMenu(null);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto h-[calc(100vh-100px)] flex flex-col">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <Radio className="text-green-500 animate-pulse" /> Live {nicheConfig.terminology?.waitingRoom || "Waiting Room"}
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Real-time {nicheConfig.terminology?.customer?.toLowerCase() || "patient"} status & stage tracking</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Autocomplete Search Bar */}
          <div ref={searchRef} className="relative w-full md:w-96">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder={`Search Booked ${nicheConfig.terminology?.appointment || "Appointment"} / ID...`}
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-[var(--color-text)] shadow-sm"
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
                    <span>Booked Appointments Ready for Check-in</span>
                    <span>{filteredBookings.length} Available</span>
                  </div>

                  {filteredBookings.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No matching booked appointments found.
                    </div>
                  ) : (
                    filteredBookings.map((b) => (
                      <div
                        key={b.pid}
                        onClick={() => handleCheckInPatient(b)}
                        className="p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-mono text-xs font-bold border border-blue-500/20">
                            {b.pid.split('-')[1]}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-white group-hover:text-blue-400 transition-colors">{b.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">({b.pid})</span>
                              {b.vip && <Star size={10} className="text-amber-400 fill-amber-400" />}
                            </div>
                            <p className="text-[10px] text-slate-400">{b.service} · Scheduled {b.time}</p>
                          </div>
                        </div>

                        <button className="flex items-center gap-1 text-[10px] font-bold bg-blue-500 text-white px-2.5 py-1 rounded-lg opacity-90 group-hover:opacity-100 transition-all shadow-sm">
                          <UserCheck size={12} />
                          <span>Check In</span>
                        </button>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" /> LIVE
          </div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-4 pb-4">
        {COLUMNS.map((col, colIndex) => {
          const colPatients = patients.filter(p => p.col === col.id);
          return (
            <div key={col.id} className="w-72 shrink-0 flex flex-col h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
              <div className={cn("p-4 border-b border-[var(--color-border)] flex items-center justify-between", BORDER_MAP[col.color].split(' ')[1])}>
                <h3 className="font-bold text-sm">{col.title}</h3>
                <span className="bg-slate-900 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border border-slate-800 text-slate-200">
                  {colPatients.length}
                </span>
              </div>
              
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {colPatients.map((patient, i) => (
                  <motion.div
                    key={patient.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (colIndex * 0.05) + (i * 0.05) }}
                    className={cn(
                      "p-3 rounded-xl border border-[var(--color-glass-border)] backdrop-blur-md shadow-sm flex flex-col gap-2.5 border-l-4 relative group",
                      COLOR_MAP[col.color]
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <Avatar3D name={patient.name} size="sm" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs text-[var(--color-text)] flex items-center gap-1">
                              {patient.name}
                              {patient.vip && <Star size={11} className="text-amber-400 fill-amber-400" />}
                            </h4>
                          </div>
                          <span className="inline-block bg-slate-950/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-300 border border-slate-800 font-bold mt-0.5">
                            {patient.pid}
                          </span>
                        </div>
                      </div>

                      {/* Edit / Move Dropdown Trigger */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMoveMenu(activeMoveMenu === patient.id ? null : patient.id)}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
                        >
                          <ArrowRightLeft size={10} /> Move
                        </button>

                        {/* Move Column Dropdown */}
                        <AnimatePresence>
                          {activeMoveMenu === patient.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 top-full mt-1.5 w-44 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 p-1.5 text-xs space-y-1"
                            >
                              <div className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                Shift Patient Stage
                              </div>
                              {COLUMNS.map(c => (
                                <button
                                  key={c.id}
                                  onClick={() => handleMovePatient(patient.id, c.id)}
                                  className={cn(
                                    "w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-between transition-colors",
                                    patient.col === c.id
                                      ? "bg-blue-600 text-white font-bold"
                                      : "text-slate-300 hover:bg-slate-800"
                                  )}
                                >
                                  <span>{c.title}</span>
                                  {patient.col === c.id && <Check size={12} />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-[var(--color-text-muted)] font-medium pl-1 truncate">
                      {patient.service}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-medium pt-2 border-t border-[var(--color-glass-border)]">
                      <span className="text-slate-400 font-mono">{patient.time}</span>
                      <span className="flex items-center gap-1 text-slate-300 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                        <Clock size={10} /> {patient.elapsed}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
