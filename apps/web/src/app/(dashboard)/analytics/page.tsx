'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Phone, MessageCircle, Calendar, Users, Clock, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { cn, formatNumber, formatCurrency } from '@/lib/utils';

const callData = [
  { date: 'Mon', calls: 42, resolved: 38, missed: 4 },
  { date: 'Tue', calls: 55, resolved: 50, missed: 5 },
  { date: 'Wed', calls: 38, resolved: 35, missed: 3 },
  { date: 'Thu', calls: 62, resolved: 58, missed: 4 },
  { date: 'Fri', calls: 71, resolved: 65, missed: 6 },
  { date: 'Sat', calls: 48, resolved: 44, missed: 4 },
  { date: 'Sun', calls: 25, resolved: 23, missed: 2 },
];

const channelData = [
  { name: 'Voice', value: 341, color: '#3b82f6' },
  { name: 'WhatsApp', value: 528, color: '#22c55e' },
  { name: 'Web Chat', value: 167, color: '#a855f7' },
];

const hourlyData = Array.from({ length: 12 }, (_, i) => ({
  hour: `${(i + 8).toString().padStart(2, '0')}:00`,
  calls: Math.floor(Math.random() * 15) + 2,
  messages: Math.floor(Math.random() * 25) + 5,
}));

const serviceData = [
  { service: 'Laser Treatment', bookings: 45, revenue: 675000 },
  { service: 'Hair Transplant', bookings: 12, revenue: 960000 },
  { service: 'Chemical Peel', bookings: 38, revenue: 190000 },
  { service: 'PRP Therapy', bookings: 22, revenue: 440000 },
  { service: 'Consultation', bookings: 89, revenue: 44500 },
];

const kpis = [
  { label: 'Total Calls', value: 341, change: 12.5, icon: Phone, color: 'text-blue-400' },
  { label: 'Total Messages', value: 528, change: 8.3, icon: MessageCircle, color: 'text-green-400' },
  { label: 'Appointments', value: 156, change: -3.2, icon: Calendar, color: 'text-purple-400' },
  { label: 'New Leads', value: 89, change: 15.7, icon: Users, color: 'text-amber-400' },
  { label: 'Avg Response', value: '1.2s', change: -18.5, icon: Clock, color: 'text-cyan-400' },
  { label: 'Conversion Rate', value: '34%', change: 5.1, icon: Target, color: 'text-pink-400' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-[var(--color-bg-elevated)] backdrop-blur-md border border-[var(--color-border)] rounded-lg p-3 shadow-lg">
      <p className="text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="text-sm font-medium" style={{ color: entry.color }}>{entry.name}: {entry.value}</p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">Performance insights across all channels</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-3 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl"
          >
            <div className="flex items-center justify-between">
              <kpi.icon size={16} className={kpi.color} />
              <div className={cn("flex items-center gap-0.5 text-[10px]", kpi.change > 0 ? "text-green-400" : "text-red-400")}>
                {kpi.change > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {Math.abs(kpi.change)}%
              </div>
            </div>
            <p className="text-xl font-bold mt-2 text-[var(--color-text)]">{kpi.value}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Call Volume Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Call Volume — This Week</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={callData}>
              <defs>
                <linearGradient id="gradCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradMissed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="calls" stroke="#7c3aed" fill="url(#gradCalls)" strokeWidth={2} name="Total Calls" />
              <Area type="monotone" dataKey="missed" stroke="#ef4444" fill="url(#gradMissed)" strokeWidth={2} name="Missed" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Channel Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Channel Distribution</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={channelData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {channelData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-xs text-[var(--color-text-secondary)]">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Peak Hours */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Peak Hours — Today</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="calls" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Calls" />
              <Bar dataKey="messages" fill="#22c55e" radius={[4, 4, 0, 0]} name="Messages" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Services */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Top Services — Revenue</h3>
          <div className="space-y-3">
            {serviceData.map((svc, i) => (
              <div key={svc.service} className="flex items-center gap-3">
                <span className="text-xs text-[var(--color-text-muted)] w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[var(--color-text)]">{svc.service}</span>
                    <span className="text-xs font-mono text-[var(--color-text-secondary)]">{formatCurrency(svc.revenue)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(svc.revenue / 960000) * 100}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
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
