'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = Array.from({ length: 10 }, (_, i) => i + 9); // 9 AM to 6 PM

const APPOINTMENTS = [
  { id: 1, day: 0, time: 9, duration: 2, patient: 'Rajesh K.', service: 'Consultation', type: 'consult', staff: 'Dr. Meenakshi' },
  { id: 2, day: 0, time: 13, duration: 3, patient: 'Priya S.', service: 'Hair Transplant', type: 'surgery', staff: 'Dr. Arun' },
  { id: 3, day: 1, time: 10, duration: 2, patient: 'Sneha R.', service: 'Full Massage', type: 'wellness', staff: 'Sunita' },
  { id: 4, day: 1, time: 14, duration: 1, patient: 'Amit P.', service: 'Follow-up', type: 'followup', staff: 'Dr. Meenakshi' },
  { id: 5, day: 2, time: 11, duration: 2, patient: 'Ananya I.', service: 'Chemical Peel', type: 'consult', staff: 'Rekha' },
  { id: 6, day: 2, time: 15, duration: 4, patient: 'Deepak M.', service: 'Scar Surgery', type: 'surgery', staff: 'Dr. Arun' },
  { id: 7, day: 3, time: 9, duration: 2, patient: 'Vikram S.', service: 'PRP Therapy', type: 'wellness', staff: 'Kavita' },
  { id: 8, day: 3, time: 12, duration: 1, patient: 'Meera J.', service: 'Follow-up', type: 'followup', staff: 'Dr. Meenakshi' },
  { id: 9, day: 4, time: 10, duration: 3, patient: 'Kiran T.', service: 'Botox', type: 'consult', staff: 'Dr. Meenakshi' },
  { id: 10, day: 4, time: 16, duration: 2, patient: 'Rahul B.', service: 'Laser Hair', type: 'wellness', staff: 'Rekha' },
  { id: 11, day: 5, time: 11, duration: 2, patient: 'Pooja V.', service: 'Mole Removal', type: 'surgery', staff: 'Dr. Arun' },
  { id: 12, day: 5, time: 14, duration: 2, patient: 'Sameer N.', service: 'Massage', type: 'wellness', staff: 'Sunita' },
];

const COLORS = {
  consult: 'bg-blue-500/20 border-blue-500/40 text-blue-200',
  surgery: 'bg-rose-500/20 border-rose-500/40 text-rose-200',
  wellness: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200',
  followup: 'bg-amber-500/20 border-amber-500/40 text-amber-200',
};

const FILTERS = ['All Staff', 'Dr. Meenakshi', 'Dr. Arun', 'Kavita', 'Rekha'];

export default function CalendarPage() {
  const [filter, setFilter] = useState('All Staff');

  const filteredAppts = APPOINTMENTS.filter(a => filter === 'All Staff' || a.staff === filter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <CalIcon className="text-purple-400" /> Easy Calendar
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Color-coded weekly schedule view</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[var(--color-surface)] p-2 rounded-xl border border-[var(--color-border)]">
          <button className="p-1.5 hover:bg-[var(--color-glass)] rounded-lg transition-colors"><ChevronLeft size={18} /></button>
          <span className="text-sm font-bold w-24 text-center">This Week</span>
          <button className="p-1.5 hover:bg-[var(--color-glass)] rounded-lg transition-colors"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter size={16} className="text-[var(--color-text-muted)] mr-2" />
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
              filter === f ? "bg-purple-600 border-purple-500 text-white" : "bg-[var(--color-glass)] border-[var(--color-glass-border)] text-[var(--color-text-muted)] hover:text-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-8 border-b border-[var(--color-glass-border)]">
          <div className="p-4 border-r border-[var(--color-glass-border)] flex items-center justify-center">
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Time</span>
          </div>
          {DAYS.map(day => (
            <div key={day} className="p-4 text-center border-r border-[var(--color-glass-border)] last:border-0">
              <span className="text-sm font-bold text-[var(--color-text)]">{day}</span>
            </div>
          ))}
        </div>

        <div className="relative">
          {TIME_SLOTS.map(time => (
            <div key={time} className="grid grid-cols-8 border-b border-[var(--color-glass-border)]/50 last:border-0 h-16">
              <div className="border-r border-[var(--color-glass-border)] flex items-center justify-center relative -top-3">
                <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{time}:00 {time < 12 ? 'AM' : 'PM'}</span>
              </div>
              {DAYS.map((_, i) => (
                <div key={i} className="border-r border-[var(--color-glass-border)] last:border-0 relative" />
              ))}
            </div>
          ))}

          {/* Absolute positioned appointments */}
          {filteredAppts.map(appt => (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              style={{
                top: `${(appt.time - 9) * 4}rem`,
                left: `calc(${((appt.day + 1) / 8) * 100}% + 4px)`,
                width: `calc(${100 / 8}% - 8px)`,
                height: `calc(${appt.duration * 2}rem - 4px)`
              }}
              className={cn(
                "absolute rounded-xl p-2 border backdrop-blur-md shadow-lg transition-shadow cursor-pointer overflow-hidden group",
                COLORS[appt.type as keyof typeof COLORS]
              )}
            >
              <div className="text-[10px] font-mono opacity-70 mb-1">{appt.time}:00 - {appt.time + Math.floor(appt.duration/2)}:{appt.duration % 2 === 0 ? '00' : '30'}</div>
              <div className="font-bold text-xs truncate leading-tight group-hover:whitespace-normal">{appt.patient}</div>
              <div className="text-[10px] opacity-90 truncate">{appt.service}</div>
              <div className="text-[9px] mt-1 opacity-60 font-medium truncate">{appt.staff}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
