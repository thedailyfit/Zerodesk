'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  PieChart as PieIcon,
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

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
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/30 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">August 2026 Target Progress</span>
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
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-full shadow-lg"
          />
        </div>
      </div>

      {/* 3 Months Revenue Comparison Chart & Treatment Share */}
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
              <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Actual Revenue" />
              <Bar dataKey="target" fill="#334155" radius={[6, 6, 0, 0]} name="Monthly Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Treatment Revenue Share */}
        <div className="p-5 rounded-2xl bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] shadow-md space-y-4">
          <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
            <PieIcon size={18} className="text-blue-400" />
            Revenue Share by Treatment
          </h3>

          <div className="space-y-3 pt-2">
            {treatmentRevenue.map((item) => (
              <div key={item.service} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--color-text)]">{item.service}</span>
                  <span className="font-mono text-blue-300 font-bold">{formatCurrency(item.revenue)}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    style={{ width: item.share }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
