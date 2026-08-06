'use client';

import { motion } from 'framer-motion';
import { Radio, Clock, Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';

const COLUMNS = [
  { id: 'checked-in', title: 'Checked In', color: 'blue', count: 2 },
  { id: 'waiting', title: 'Waiting', color: 'amber', count: 3 },
  { id: 'with-doctor', title: 'With Doctor', color: 'green', count: 2 },
  { id: 'treatment', title: 'Getting Treatment', color: 'purple', count: 1 },
  { id: 'checkout', title: 'Checkout', color: 'emerald', count: 1 },
];

const PATIENTS = [
  { id: 1, name: 'Rajesh K.', time: '10:00 AM', service: 'Consultation', elapsed: '2 min', col: 'checked-in', vip: false },
  { id: 2, name: 'Priya S.', time: '10:15 AM', service: 'Chemical Peel', elapsed: '5 min', col: 'checked-in', vip: true },
  { id: 3, name: 'Sneha R.', time: '09:45 AM', service: 'Massage', elapsed: '15 min', col: 'waiting', vip: false },
  { id: 4, name: 'Amit P.', time: '09:30 AM', service: 'Hair Consult', elapsed: '20 min', col: 'waiting', vip: false },
  { id: 5, name: 'Ananya I.', time: '09:50 AM', service: 'Botox', elapsed: '12 min', col: 'waiting', vip: true },
  { id: 6, name: 'Deepak M.', time: '09:15 AM', service: 'Surgery', elapsed: '45 min', col: 'with-doctor', vip: true },
  { id: 7, name: 'Meera J.', time: '09:20 AM', service: 'Consultation', elapsed: '30 min', col: 'with-doctor', vip: false },
  { id: 8, name: 'Kiran T.', time: '08:30 AM', service: 'PRP Therapy', elapsed: '1h 15m', col: 'treatment', vip: false },
  { id: 9, name: 'Rahul B.', time: '09:00 AM', service: 'Laser Hair', elapsed: '5 min', col: 'checkout', vip: false },
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
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <Radio className="text-green-500 animate-pulse" /> Live Waiting Room
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Real-time patient status tracking</p>
        </div>
        
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" /> LIVE
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-4 pb-4">
        {COLUMNS.map((col, colIndex) => (
          <div key={col.id} className="w-72 shrink-0 flex flex-col h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
            <div className={cn("p-4 border-b border-[var(--color-border)] flex items-center justify-between", BORDER_MAP[col.color].split(' ')[1])}>
              <h3 className="font-bold">{col.title}</h3>
              <span className="bg-slate-900 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-800">{col.count}</span>
            </div>
            
            <div className="p-3 space-y-3 flex-1 overflow-y-auto">
              {PATIENTS.filter(p => p.col === col.id).map((patient, i) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (colIndex * 0.1) + (i * 0.1) }}
                  className={cn(
                    "p-3 rounded-xl border border-[var(--color-glass-border)] backdrop-blur-md shadow-sm flex flex-col gap-3 border-l-4",
                    COLOR_MAP[col.color]
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar3D name={patient.name} size="sm" />
                      <div>
                        <h4 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-1">
                          {patient.name}
                          {patient.vip && <Star size={12} className="text-amber-400 fill-amber-400" />}
                        </h4>
                        <p className="text-[10px] text-[var(--color-text-muted)] truncate max-w-[120px]">{patient.service}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] font-medium pt-2 border-t border-[var(--color-glass-border)]">
                    <span className="text-slate-400">{patient.time}</span>
                    <span className="flex items-center gap-1 text-slate-300 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                      <Clock size={10} /> {patient.elapsed}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
