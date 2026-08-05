'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  IndianRupee, 
  Target, 
  Award, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart as PieIcon,
  Users
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { cn, formatCurrency } from '@/lib/utils';

const monthlyRevenue = [
  { month: 'June 2026', revenue: 1850000, target: 2000000, bookings: 142 },
  { month: 'July 2026', revenue: 2240000, target: 2200000, bookings: 168 },
  { month: 'August 2026 (MTD)', revenue: 2580000, target: 2800000, bookings: 195 },
];

const treatmentRevenue = [
  { service: 'Laser Hair Removal', revenue: 950000, share: '36.8%' },
  { service: 'Hair Transplant Surgery', revenue: 840000, share: '32.5%' },
  { service: 'PRP Therapy & Growth', revenue: 420000, share: '16.2%' },
  { service: 'Chemical Peels & Facials', revenue: 240000, share: '9.3%' },
  { service: 'Consultations & Meds', revenue: 130000, share: '5.2%' },
];

const staffLeaderboard = [
  { name: 'Dr. Meenakshi Rao', role: 'Dermatologist', sales: 1120000, bookings: 78, avatar: 'female' },
  { name: 'Dr. Arun Krishnan', role: 'Hair Specialist', sales: 980000, bookings: 45, avatar: 'male' },
  { name: 'Kavita Menon', role: 'Therapist', sales: 320000, bookings: 52, avatar: 'female' },
  { name: 'Rekha Pillai', role: 'Aesthetician', sales: 160000, bookings: 20, avatar: 'female' },
];

export default function SalesPage() {
  const currentMonth = monthlyRevenue[2];
  const targetPct = Math.round((currentMonth.revenue / currentMonth.target) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <span>Sales & 3-Month Revenue Analytics</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono font-semibold">
              90 Days Performance
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Track business growth, monthly target benchmarks, and revenue per treatment over the last 3 months.
          </p>
        </div>
      </div>

      {/* Target Progress Bar Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">August 2026 Target Progress</span>
            <h2 className="text-3xl font-extrabold text-white mt-1 flex items-center gap-3">
              {formatCurrency(currentMonth.revenue)}
              <span className="text-xs font-semibold text-slate-400">/ {formatCurrency(currentMonth.target)} Target</span>
            </h2>
          </div>

          <div className="text-right">
            <span className="text-3xl font-extrabold text-emerald-400">{targetPct}%</span>
            <p className="text-xs text-slate-400">Target Achieved MTD</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, targetPct)}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-emerald-400 rounded-full shadow-lg"
          />
        </div>
      </div>

      {/* 3 Months Revenue Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              3-Month Revenue Trend (June - August 2026)
            </h3>
            <span className="text-xs text-emerald-400 font-mono font-bold">+39.4% Growth</span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip 
                formatter={(val: any) => [formatCurrency(val), 'Revenue']}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Actual Revenue" />
              <Bar dataKey="target" fill="#334155" radius={[6, 6, 0, 0]} name="Monthly Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Treatment Revenue Share */}
        <div className="p-5 rounded-2xl bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] shadow-md space-y-4">
          <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
            <PieIcon size={18} className="text-purple-400" />
            Revenue Share by Treatment
          </h3>

          <div className="space-y-3 pt-2">
            {treatmentRevenue.map((item, i) => (
              <div key={item.service} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--color-text)]">{item.service}</span>
                  <span className="font-mono text-purple-300 font-bold">{formatCurrency(item.revenue)}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    style={{ width: item.share }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Sales Staff Leaderboard */}
      <div className="p-5 rounded-2xl bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] shadow-xl space-y-4">
        <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
          <Award size={18} className="text-amber-400" />
          Top Performing Practitioners & Sales Staff (Last 90 Days)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {staffLeaderboard.map((staff, idx) => (
            <div
              key={staff.name}
              className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-3.5"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow">
                  {staff.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[9px] flex items-center justify-center shadow">
                  #{idx + 1}
                </span>
              </div>

              <div>
                <p className="font-bold text-xs text-[var(--color-text)]">{staff.name}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">{staff.role}</p>
                <p className="text-xs font-mono font-bold text-emerald-400 mt-1">{formatCurrency(staff.sales)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
