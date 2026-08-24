'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Users, 
  Clock, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Calendar as CalIcon
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { cn, formatNumber, formatCurrency } from '@/lib/utils';

// Dynamic Multiplier based on timeframe selected
const TIMEFRAME_MULTIPLIERS: Record<string, number> = {
  '1D': 0.15,
  '7D': 1,
  '15D': 2.1,
  '30D': 4.2,
  '45D': 6.3,
  '90D': 12.5,
  'custom': 5.0,
};

const baseCallData = [
  { date: 'Mon', calls: 42, resolved: 38, missed: 4 },
  { date: 'Tue', calls: 55, resolved: 50, missed: 5 },
  { date: 'Wed', calls: 38, resolved: 35, missed: 3 },
  { date: 'Thu', calls: 62, resolved: 58, missed: 4 },
  { date: 'Fri', calls: 71, resolved: 65, missed: 6 },
  { date: 'Sat', calls: 48, resolved: 44, missed: 4 },
  { date: 'Sun', calls: 25, resolved: 23, missed: 2 },
];

const baseHourlyData = Array.from({ length: 12 }, (_, i) => ({
  hour: `${(i + 8).toString().padStart(2, '0')}:00`,
  calls: Math.floor(Math.random() * 15) + 2,
  messages: Math.floor(Math.random() * 25) + 5,
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-[var(--color-bg-elevated)] backdrop-blur-md border border-[var(--color-border)] rounded-lg p-3 shadow-lg text-xs">
      <p className="text-[var(--color-text-muted)] mb-1 font-semibold">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('7D');
  const [customStartDate, setCustomStartDate] = useState('2026-07-01');
  const [customEndDate, setCustomEndDate] = useState('2026-08-05');

  const mult = TIMEFRAME_MULTIPLIERS[selectedTimeframe] || 1;

  const kpis = [
    { label: 'Total Calls', value: Math.round(341 * mult), change: 12.5, icon: Phone, color: 'text-blue-400' },
    { label: 'Total Messages', value: Math.round(528 * mult), change: 8.3, icon: MessageCircle, color: 'text-emerald-400' },
    { label: 'Appointments', value: Math.round(156 * mult), change: 4.8, icon: Calendar, color: 'text-blue-400' },
    { label: 'New Leads', value: Math.round(89 * mult), change: 15.7, icon: Users, color: 'text-amber-400' },
    { label: 'Avg Response', value: '1.2s', change: -18.5, icon: Clock, color: 'text-cyan-400' },
    { label: 'Conversion Rate', value: '34%', change: 5.1, icon: Target, color: 'text-emerald-400' },
  ];

  const channelData = [
    { name: 'Voice', value: Math.round(341 * mult), color: '#3b82f6' },
    { name: 'WhatsApp', value: Math.round(528 * mult), color: '#10b981' },
    { name: 'Web Chat', value: Math.round(167 * mult), color: '#0ea5e9' },
  ];

  const scaledCallData = baseCallData.map(d => ({
    ...d,
    calls: Math.round(d.calls * (mult < 1 ? 1 : mult / 2)),
    resolved: Math.round(d.resolved * (mult < 1 ? 1 : mult / 2)),
    missed: Math.round(d.missed * (mult < 1 ? 1 : mult / 2)),
  }));

  const hourlyData = baseHourlyData.map(d => ({
    ...d,
    calls: Math.round(d.calls * (mult < 1 ? 1 : Math.min(mult, 3))),
    messages: Math.round(d.messages * (mult < 1 ? 1 : Math.min(mult, 3))),
  }));

  const serviceData = [
    { service: 'Laser Treatment', bookings: Math.round(45 * mult), revenue: Math.round(675000 * mult) },
    { service: 'Hair Transplant', bookings: Math.round(12 * mult), revenue: Math.round(960000 * mult) },
    { service: 'Chemical Peel', bookings: Math.round(38 * mult), revenue: Math.round(190000 * mult) },
    { service: 'PRP Therapy', bookings: Math.round(22 * mult), revenue: Math.round(440000 * mult) },
    { service: 'Consultation', bookings: Math.round(89 * mult), revenue: Math.round(44500 * mult) },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Timeframe Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Analytics & Performance Insights</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Multi-channel performance analytics up to 90 days retention.</p>
        </div>

        {/* Predefined Analytics Filters: 1D, 7D, 15D, 30D, 45D, 90D, Custom */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[var(--color-surface)] p-1.5 rounded-2xl border border-[var(--color-border)] shadow-sm">
          <span className="text-[11px] font-semibold text-[var(--color-text-muted)] px-2 uppercase tracking-wider">Timeframe:</span>
          {['1D', '7D', '15D', '30D', '45D', '90D', 'custom'].map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all uppercase",
                selectedTimeframe === tf
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
              )}
            >
              {tf === 'custom' ? 'Custom Range' : tf}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {selectedTimeframe === 'custom' && (
        <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-2xl flex items-center gap-4 text-xs">
          <CalIcon size={16} className="text-blue-400" />
          <div className="flex items-center gap-2">
            <span className="text-slate-300">Start Date:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-300">End Date:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-white"
            />
          </div>
          <span className="text-blue-400 font-mono text-[11px]">Filtered: {customStartDate} to {customEndDate}</span>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="p-3.5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <kpi.icon size={16} className={kpi.color} />
              <div className={cn("flex items-center gap-0.5 text-[10px] font-bold", kpi.change > 0 ? "text-emerald-400" : "text-red-400")}>
                {kpi.change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(kpi.change)}%
              </div>
            </div>
            <p className="text-2xl font-extrabold mt-2 text-[var(--color-text)] font-mono">{typeof kpi.value === 'number' ? formatNumber(kpi.value) : kpi.value}</p>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 font-medium">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Volume Trend */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-md"
        >
          <h3 className="text-sm font-bold text-[var(--color-text)] mb-4 flex items-center justify-between">
            <span>Call Volume Trend ({selectedTimeframe})</span>
            <span className="text-xs text-blue-400 font-mono">Retained 90 Days</span>
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={scaledCallData}>
              <defs>
                <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={2} fill="url(#callsGradient)" name="Total Calls" />
              <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fill="url(#resolvedGradient)" name="Resolved by AI" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Channel Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-md"
        >
          <h3 className="text-sm font-bold text-[var(--color-text)] mb-4">Inquiries by Channel ({selectedTimeframe})</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={channelData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {channelData.map((ch) => (
              <div key={ch.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                <span className="text-[var(--color-text-muted)]">{ch.name}</span>
                <span className="font-bold text-[var(--color-text)]">{ch.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-md"
        >
          <h3 className="text-sm font-bold text-[var(--color-text)] mb-4">Traffic by Hour of Day ({selectedTimeframe})</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="calls" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Calls" />
              <Bar dataKey="messages" fill="#10b981" radius={[4, 4, 0, 0]} name="Messages" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Services */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-md"
        >
          <h3 className="text-sm font-bold text-[var(--color-text)] mb-4">Top Services Revenue ({selectedTimeframe})</h3>
          <div className="space-y-3">
            {serviceData.map((svc, i) => (
              <div key={svc.service} className="flex items-center gap-3">
                <span className="text-xs text-[var(--color-text-muted)] font-bold w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[var(--color-text)]">{svc.service}</span>
                    <span className="text-xs font-mono text-blue-400 font-bold">{formatCurrency(svc.revenue)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (svc.revenue / Math.max(...serviceData.map(s => s.revenue))) * 100)}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
