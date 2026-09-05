'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Clock, Star, Search, ArrowRightLeft, UserCheck, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';
import { useNiche } from '@/components/providers/niche-provider';

import type { NicheId } from '@/config/niches/types';

const COLUMNS = [
  { id: 'checked-in', title: 'Checked In', color: 'blue' },
  { id: 'waiting', title: 'Waiting', color: 'amber' },
  { id: 'with-doctor', title: 'In Service', color: 'green' },
  { id: 'treatment', title: 'In Progress', color: 'indigo' },
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

const DEFAULT_WAITING_ROOM_BY_NICHE: Record<NicheId, PatientItem[]> = {
  skin: [
    { id: 'sk-w1', pid: 'SK-1001', name: 'Priya Sharma', time: '10:00 AM', service: 'HydraFacial Deep Cleanse', elapsed: '2 min', col: 'checked-in', vip: true },
    { id: 'sk-w2', pid: 'SK-1002', name: 'Vikram Singh', time: '10:15 AM', service: 'Laser Hair Removal', elapsed: '5 min', col: 'checked-in', vip: false },
    { id: 'sk-w3', pid: 'SK-1003', name: 'Sneha Patel', time: '09:45 AM', service: 'Chemical Peel & Glow', elapsed: '15 min', col: 'waiting', vip: false },
    { id: 'sk-w4', pid: 'SK-1004', name: 'Rahul Desai', time: '09:15 AM', service: 'Dermatology Consultation', elapsed: '45 min', col: 'with-doctor', vip: false },
    { id: 'sk-w5', pid: 'SK-1005', name: 'Anjali Verma', time: '08:30 AM', service: 'PRP Hair Therapy', elapsed: '1h 15m', col: 'treatment', vip: true },
    { id: 'sk-w6', pid: 'SK-1006', name: 'Deepak Menon', time: '09:00 AM', service: 'Post-Laser Checkout', elapsed: '5 min', col: 'checkout', vip: false },
  ],
  dental: [
    { id: 'dt-w1', pid: 'DT-2001', name: 'Ananya Reddy', time: '10:00 AM', service: 'Invisalign 3D Scan', elapsed: '3 min', col: 'checked-in', vip: true },
    { id: 'dt-w2', pid: 'DT-2002', name: 'Karthik Menon', time: '10:15 AM', service: 'Implant Placement Prep', elapsed: '8 min', col: 'checked-in', vip: false },
    { id: 'dt-w3', pid: 'DT-2003', name: 'Neha Gupta', time: '09:45 AM', service: 'Teeth Whitening Sitting', elapsed: '12 min', col: 'waiting', vip: false },
    { id: 'dt-w4', pid: 'DT-2004', name: 'Rohit Sharma', time: '09:15 AM', service: 'Root Canal Sitting 2', elapsed: '35 min', col: 'with-doctor', vip: true },
    { id: 'dt-w5', pid: 'DT-2005', name: 'Pooja Iyer', time: '08:45 AM', service: 'Scaling & Fluoride Polish', elapsed: '50 min', col: 'treatment', vip: false },
    { id: 'dt-w6', pid: 'DT-2006', name: 'Vikram Seth', time: '09:00 AM', service: 'Crown Delivery Billing', elapsed: '4 min', col: 'checkout', vip: false },
  ],
  spa: [
    { id: 'sp-w1', pid: 'SP-3001', name: 'Meera Kapoor', time: '10:00 AM', service: 'Ayurvedic Abhyanga Massage', elapsed: '4 min', col: 'checked-in', vip: true },
    { id: 'sp-w2', pid: 'SP-3002', name: 'Aman Verma', time: '10:15 AM', service: 'Deep Tissue Recovery', elapsed: '6 min', col: 'checked-in', vip: false },
    { id: 'sp-w3', pid: 'SP-3003', name: 'Simran Kaur', time: '09:50 AM', service: 'Aromatherapy Body Wrap', elapsed: '14 min', col: 'waiting', vip: false },
    { id: 'sp-w4', pid: 'SP-3004', name: 'Karan Patel', time: '09:20 AM', service: 'Hot Stone Thermal Therapy', elapsed: '40 min', col: 'with-doctor', vip: true },
    { id: 'sp-w5', pid: 'SP-3005', name: 'Anita Desai', time: '08:30 AM', service: 'Panchakarma Steam Therapy', elapsed: '1h 10m', col: 'treatment', vip: true },
    { id: 'sp-w6', pid: 'SP-3006', name: 'Rohan Bose', time: '09:00 AM', service: 'Herbal Tea & Bill Settlement', elapsed: '5 min', col: 'checkout', vip: false },
  ],
  salon: [
    { id: 'sl-w1', pid: 'SL-4001', name: 'Divya Nair', time: '10:00 AM', service: 'Balayage Color & Gloss', elapsed: '5 min', col: 'checked-in', vip: true },
    { id: 'sl-w2', pid: 'SL-4002', name: 'Sameer Khan', time: '10:15 AM', service: 'Keratin Hair Smoothening', elapsed: '7 min', col: 'checked-in', vip: false },
    { id: 'sl-w3', pid: 'SL-4003', name: 'Riya Sharma', time: '09:40 AM', service: 'Bridal Trial Makeup', elapsed: '20 min', col: 'waiting', vip: true },
    { id: 'sl-w4', pid: 'SL-4004', name: 'Arjun Singh', time: '09:15 AM', service: 'Nail Extensions Sculpting', elapsed: '45 min', col: 'with-doctor', vip: false },
    { id: 'sl-w5', pid: 'SL-4005', name: 'Kavita Joshi', time: '08:45 AM', service: 'Moroccan Foot Spa Pedicure', elapsed: '55 min', col: 'treatment', vip: false },
    { id: 'sl-w6', pid: 'SL-4006', name: 'Pooja Bhatt', time: '09:00 AM', service: 'Blowdry & Styling Invoice', elapsed: '6 min', col: 'checkout', vip: false },
  ],
  realestate: [
    { id: 're-w1', pid: 'RE-5001', name: 'Rajesh Gupta', time: '10:00 AM', service: 'Villa Guided Site Tour Briefing', elapsed: '3 min', col: 'checked-in', vip: true },
    { id: 're-w2', pid: 'RE-5002', name: 'Sunita Reddy', time: '10:15 AM', service: 'Commercial Floor Plan Review', elapsed: '10 min', col: 'waiting', vip: false },
    { id: 're-w3', pid: 'RE-5003', name: 'Ravi Kumar', time: '09:30 AM', service: 'NRI Video Call Walkthrough', elapsed: '30 min', col: 'with-doctor', vip: true },
    { id: 're-w4', pid: 'RE-5004', name: 'Alok Mishra', time: '09:00 AM', service: 'Allotment Token Clearance', elapsed: '5 min', col: 'checkout', vip: false },
  ],
  hotel: [
    { id: 'ht-w1', pid: 'HT-6001', name: 'Amit Patel', time: '10:00 AM', service: 'Executive Suite Check-in & Keycard', elapsed: '2 min', col: 'checked-in', vip: true },
    { id: 'ht-w2', pid: 'HT-6002', name: 'Shruti Hasan', time: '10:15 AM', service: 'Presidential Suite Concierge Brief', elapsed: '8 min', col: 'waiting', vip: true },
    { id: 'ht-w3', pid: 'HT-6003', name: 'Vikas Khanna', time: '09:30 AM', service: 'Banquet Hall Tasting & Review', elapsed: '35 min', col: 'with-doctor', vip: false },
    { id: 'ht-w4', pid: 'HT-6004', name: 'Neha Sharma', time: '09:00 AM', service: 'Express Checkout & Airport Cab', elapsed: '4 min', col: 'checkout', vip: false },
  ],
};

const DEFAULT_BOOKED_BY_NICHE: Record<NicheId, { pid: string; name: string; time: string; service: string; vip: boolean }[]> = {
  skin: [
    { pid: 'SK-1007', name: 'Kiran Thapar', time: '11:00 AM', service: 'Botox Anti-Aging Consult', vip: true },
    { pid: 'SK-1008', name: 'Pooja Hegde', time: '11:30 AM', service: 'Acne Scar Subcision', vip: false },
    { pid: 'SK-1009', name: 'Rohan Mehra', time: '12:00 PM', service: 'Dermabrasion Glow', vip: false },
  ],
  dental: [
    { pid: 'DT-2007', name: 'Meera Nambiar', time: '11:00 AM', service: 'Aligner Review Checkup', vip: true },
    { pid: 'DT-2008', name: 'Arunav Roy', time: '11:30 AM', service: 'Wisdom Tooth Consultation', vip: false },
    { pid: 'DT-2009', name: 'Shweta Nanda', time: '12:00 PM', service: 'Zirconia Bridge Trial', vip: false },
  ],
  spa: [
    { pid: 'SP-3007', name: 'Tara Alisha', time: '11:00 AM', service: 'Shirodhara Mind Calm', vip: true },
    { pid: 'SP-3008', name: 'Devendra Rao', time: '11:30 AM', service: 'Foot Reflexology & Herbal Soak', vip: false },
    { pid: 'SP-3009', name: 'Kavita Menon', time: '12:00 PM', service: 'Balinese Relaxation Therapy', vip: true },
  ],
  salon: [
    { pid: 'SL-4007', name: 'Sunita Sharma', time: '11:00 AM', service: 'Hair Spa Deep Moisture', vip: false },
    { pid: 'SL-4008', name: 'Rahul Verma', time: '11:30 AM', service: 'Precision Fade & Beard Sculpt', vip: false },
    { pid: 'SL-4009', name: 'Simran Kaur', time: '12:00 PM', service: 'Global Color Touch-up', vip: true },
  ],
  realestate: [
    { pid: 'RE-5005', name: 'Nandini Das', time: '11:00 AM', service: 'Luxury Penthouse Preview', vip: true },
    { pid: 'RE-5006', name: 'Gautam Adani', time: '11:30 AM', service: 'Commercial Lease Agreement', vip: true },
  ],
  hotel: [
    { pid: 'HT-6005', name: 'Rahul Bajaj', time: '11:00 AM', service: 'Weekend Dining & Spa Pass', vip: true },
    { pid: 'HT-6006', name: 'Rajinikanth', time: '11:30 AM', service: 'Royal Suite Check-in', vip: true },
  ],
};

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
  const [patients, setPatients] = useState<PatientItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`zerodesk_waiting_room_${currentNiche}`);
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return DEFAULT_WAITING_ROOM_BY_NICHE[currentNiche] || DEFAULT_WAITING_ROOM_BY_NICHE.skin;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`zerodesk_waiting_room_${currentNiche}`);
      if (saved) {
        try {
          setPatients(JSON.parse(saved));
          return;
        } catch {}
      }
    }
    setPatients(DEFAULT_WAITING_ROOM_BY_NICHE[currentNiche] || DEFAULT_WAITING_ROOM_BY_NICHE.skin);
  }, [currentNiche]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`zerodesk_waiting_room_${currentNiche}`, JSON.stringify(patients));
    }
  }, [patients, currentNiche]);

  const bookedAppointments = DEFAULT_BOOKED_BY_NICHE[currentNiche] || DEFAULT_BOOKED_BY_NICHE.skin;
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
  const availableBookings = bookedAppointments.filter(b => !existingPids.has(b.pid));
  
  const filteredBookings = availableBookings.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.pid.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckInPatient = (booking: typeof bookedAppointments[0]) => {
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
