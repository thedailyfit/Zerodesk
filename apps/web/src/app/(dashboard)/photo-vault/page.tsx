'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Lock, ChevronLeft, ChevronRight } from 'lucide-react';

const RECORDS = [
  { id: 1, name: 'Priya S.', treatment: 'Acne Scar Treatment', dateStr: 'Jan 15 ➡️ Apr 20', color1: 'from-red-900/50', color2: 'from-amber-900/50' },
  { id: 2, name: 'Rajesh K.', treatment: 'PRP Hair Therapy', dateStr: 'Feb 10 ➡️ May 12', color1: 'from-slate-800', color2: 'from-slate-700' },
  { id: 3, name: 'Ananya I.', treatment: 'Chemical Peel', dateStr: 'Mar 05 ➡️ Apr 05', color1: 'from-rose-900/40', color2: 'from-pink-900/40' },
  { id: 4, name: 'Vikram S.', treatment: 'Mole Removal', dateStr: 'Apr 01 ➡️ May 01', color1: 'from-orange-900/40', color2: 'from-yellow-900/40' },
  { id: 5, name: 'Amit P.', treatment: 'Pigmentation', dateStr: 'Jan 20 ➡️ Mar 20', color1: 'from-purple-900/40', color2: 'from-indigo-900/40' },
  { id: 6, name: 'Meera J.', treatment: 'Laser Hair Removal', dateStr: 'Feb 25 ➡️ May 25', color1: 'from-emerald-900/40', color2: 'from-teal-900/40' },
];

function ComparisonCard({ record }: { record: typeof RECORDS[0] }) {
  const [position, setPosition] = useState(50);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-3xl p-5 shadow-xl flex flex-col gap-4"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-[var(--color-text)]">{record.name}</h3>
          <p className="text-xs text-[var(--color-text-muted)]">{record.treatment}</p>
        </div>
        <div className="text-[10px] font-mono bg-slate-900 text-slate-300 px-2 py-1 rounded-lg border border-slate-800">
          {record.dateStr}
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative w-full h-48 rounded-xl overflow-hidden cursor-ew-resize select-none"
           onMouseMove={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
             setPosition((x / rect.width) * 100);
           }}
           onTouchMove={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             const touch = e.touches[0];
             const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
             setPosition((x / rect.width) * 100);
           }}>
        
        {/* After (Bottom Layer) */}
        <div className={`absolute inset-0 bg-gradient-to-br ${record.color2} to-slate-900 flex items-center justify-end pr-6`}>
          <span className="font-bold text-white/50 tracking-widest uppercase text-sm">After</span>
        </div>
        
        {/* Before (Top Layer) */}
        <div className={`absolute inset-y-0 left-0 bg-gradient-to-br ${record.color1} to-slate-800 flex items-center pl-6 overflow-hidden`} style={{ width: `${position}%` }}>
          <span className="font-bold text-white/50 tracking-widest uppercase text-sm w-32">Before</span>
        </div>
        
        {/* Slider Handle */}
        <div className="absolute inset-y-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ left: `calc(${position}% - 2px)` }}>
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900">
            <ChevronLeft size={14} className="absolute left-1" />
            <ChevronRight size={14} className="absolute right-1" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-[10px] text-[var(--color-text-muted)] font-medium px-2 relative before:absolute before:inset-x-4 before:top-1/2 before:-translate-y-1/2 before:h-px before:bg-slate-800 before:-z-10">
        <span className="bg-[var(--color-glass)] px-2">Week 1</span>
        <span className="bg-[var(--color-glass)] px-2">Week 4</span>
        <span className="bg-[var(--color-glass)] px-2">Week 8</span>
      </div>
    </motion.div>
  );
}

export default function PhotoVaultPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <Camera className="text-pink-400" /> Photo Comparison Vault
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Track patient progress with visual evidence</p>
        </div>
        
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold">
          <Lock size={14} /> Secure & HIPAA Compliant
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RECORDS.map(record => (
          <ComparisonCard key={record.id} record={record} />
        ))}
      </div>
    </div>
  );
}
