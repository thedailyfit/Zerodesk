'use client';

import { useNiche } from '@/components/providers/niche-provider';
import { KPICard } from '@/components/dashboard/kpi-card';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { 
  Phone, 
  MessageSquare, 
  Calendar as CalendarIcon, 
  IndianRupee, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  ArrowUpRight,
  Zap,
  TrendingUp,
  Cpu,
  Bot
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import Link from 'next/link';

const chartData = [
  { name: 'Mon', calls: 140, messages: 240 },
  { name: 'Tue', calls: 230, messages: 139 },
  { name: 'Wed', calls: 200, messages: 380 },
  { name: 'Thu', calls: 278, messages: 390 },
  { name: 'Fri', calls: 189, messages: 480 },
  { name: 'Sat', calls: 239, messages: 380 },
  { name: 'Sun', calls: 349, messages: 430 },
];

const pieData = [
  { name: 'AI Resolved', value: 84, color: '#2563eb' },
  { name: 'Human Handoff', value: 16, color: '#475569' },
];

export default function BusinessHealthPage() {
  const { nicheConfig } = useNiche();
  const kpis = nicheConfig.kpis || [];
  const icons = [Phone, MessageSquare, CalendarIcon, IndianRupee];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner: Business Health Overview & Health Score */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {nicheConfig.label} Operating System
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Business Health & Operations
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Real-time operational pulse, AI frontdesk workload, and revenue velocity.
          </p>
        </div>

        {/* Business Health Score Card */}
        <div className="flex items-center gap-4 p-3.5 px-5 rounded-2xl bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] shadow-sm">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500"
                strokeDasharray="88, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-bold text-xs text-[var(--color-text)] font-mono">88%</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[var(--color-text)]">Business Health Score</span>
              <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.2 rounded-full">
                Optimal
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
              Workflows, AI desk resolution & patient flow in green zone.
            </p>
          </div>
        </div>
      </div>

      {/* AI Suggestion / Intelligence Highlight Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5">
              ZeroDesk AI Suggestion:
              <span className="text-blue-400 font-normal">3 unconfirmed sittings today</span>
            </span>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              AI 2-Step Confirmation can recover ~₹18,500 in potential slot vacancy.
            </p>
          </div>
        </div>

        <Link
          href="/appointments"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 shrink-0 text-center"
        >
          View Appointments →
        </Link>
      </motion.div>

      {/* 4 Core Niche KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <KPICard 
            key={kpi.label}
            title={kpi.label} 
            value={kpi.value} 
            numericValue={parseFloat(kpi.value.replace(/[^0-9.]/g, '')) || 100} 
            trend={kpi.trend === 'up' ? 12.5 : kpi.trend === 'down' ? -4.2 : 0} 
            icon={icons[idx % icons.length]} 
            delay={0.05 * (idx + 1)} 
          />
        ))}
      </div>

      {/* 4 Daily Snapshot Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Today's Bookings", val: "18 Sittings", sub: "8 Completed", icon: CalendarIcon, color: "text-blue-400" },
          { label: "Pending Confirmations", val: "3 Patients", sub: "WhatsApp active", icon: AlertCircle, color: "text-amber-400" },
          { label: "Revenue Collected Today", val: "₹42,800", sub: "14 Invoices", icon: IndianRupee, color: "text-emerald-400" },
          { label: "Staff On Duty", val: "6 / 8 Active", sub: "1 on break, 1 leave", icon: Users, color: "text-sky-400" },
        ].map((tile, i) => {
          const Icon = tile.icon;
          return (
            <div key={i} className="p-4 bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-[var(--color-text-muted)]">
                <span className="text-[11px] font-bold uppercase tracking-wider">{tile.label}</span>
                <Icon size={14} className={tile.color} />
              </div>
              <p className="text-xl font-extrabold text-[var(--color-text)] font-mono">{tile.val}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">{tile.sub}</p>
            </div>
          );
        })}
      </div>

      {/* AI Channels Performance Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--color-text)]">Voice AI Agent</p>
              <p className="text-[11px] text-[var(--color-text-muted)]">148 inbound calls handled</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-emerald-400 font-mono">82%</span>
            <span className="text-[10px] text-[var(--color-text-muted)] block">Autonomous</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <MessageSquare size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--color-text)]">WhatsApp AI Engine</p>
              <p className="text-[11px] text-[var(--color-text-muted)]">312 chats & recalls</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-emerald-400 font-mono">91%</span>
            <span className="text-[10px] text-[var(--color-text-muted)] block">Resolved</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
              <Bot size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--color-text)]">WebChat Assistant</p>
              <p className="text-[11px] text-[var(--color-text-muted)]">86 website inquiries</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-emerald-400 font-mono">78%</span>
            <span className="text-[10px] text-[var(--color-text-muted)] block">Converted</span>
          </div>
        </div>
      </div>

      {/* Charts: Volume Trend & Resolution Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">Weekly Channel Traffic</h2>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                <span className="text-[var(--color-text-muted)]">Calls</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-[var(--color-text-muted)]">WhatsApp</span>
              </div>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)' }}
                  itemStyle={{ color: 'var(--color-text)' }}
                />
                <Area type="monotone" dataKey="calls" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorCalls)" />
                <Area type="monotone" dataKey="messages" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMsgs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex flex-col"
        >
          <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider mb-4">AI Resolution Rate</h2>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--color-text)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-3xl font-extrabold text-[var(--color-text)] font-mono">84%</span>
              <span className="text-[11px] text-[var(--color-text-muted)]">Autonomous AI</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Activity Feed */}
      <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
        <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider mb-6">Real-Time Operational Feed</h2>
        <ActivityFeed />
      </div>
    </div>
  );
}
