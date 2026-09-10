'use client';

import { useState, useEffect } from 'react';
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
import { apiClient } from '@/lib/api-client';

const EMPTY_WEEK_DATA = [
  { name: 'Mon', calls: 0, messages: 0 },
  { name: 'Tue', calls: 0, messages: 0 },
  { name: 'Wed', calls: 0, messages: 0 },
  { name: 'Thu', calls: 0, messages: 0 },
  { name: 'Fri', calls: 0, messages: 0 },
  { name: 'Sat', calls: 0, messages: 0 },
  { name: 'Sun', calls: 0, messages: 0 },
];

export default function BusinessHealthPage() {
  const { nicheConfig } = useNiche();
  const kpis = nicheConfig.kpis || [];
  const icons = [Phone, MessageSquare, CalendarIcon, IndianRupee];

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayBookings: 0,
    completedBookings: 0,
    pendingConfirmations: 0,
    todayRevenue: 0,
    paidInvoicesCount: 0,
    activeStaff: 0,
    totalStaff: 0,
    voiceCallsCount: 0,
    voiceAutonomousRate: 0,
    whatsappCount: 0,
    whatsappResolvedRate: 0,
    webchatCount: 0,
    webchatConvertedRate: 0,
    overallAiResolvedRate: 0,
    chartData: EMPTY_WEEK_DATA,
    pieData: [
      { name: 'AI Resolved', value: 0, color: '#2563eb' },
      { name: 'Human Handoff', value: 0, color: '#475569' },
    ]
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [apptsRes, invoicesRes, convsRes, staffRes, analyticsRes] = await Promise.allSettled([
          apiClient('/appointments'),
          apiClient('/invoices'),
          apiClient('/conversations'),
          apiClient('/staff'),
          apiClient('/analytics/overview')
        ]);

        const appts = apptsRes.status === 'fulfilled' && Array.isArray(apptsRes.value) ? apptsRes.value : [];
        const invoices = invoicesRes.status === 'fulfilled' && Array.isArray(invoicesRes.value) ? invoicesRes.value : [];
        const convs = convsRes.status === 'fulfilled' && Array.isArray(convsRes.value) ? convsRes.value : [];
        const staff = staffRes.status === 'fulfilled' && Array.isArray(staffRes.value) ? staffRes.value : [];

        // Today's date string YYYY-MM-DD
        const todayStr = new Date().toISOString().slice(0, 10);

        // Filter appointments today
        const todayAppts = appts.filter((a: any) => (a.scheduledAt || a.date || '').slice(0, 10) === todayStr);
        const completedToday = todayAppts.filter((a: any) => a.status === 'COMPLETED').length;
        const pendingToday = appts.filter((a: any) => a.status === 'SCHEDULED' || a.status === 'PENDING').length;

        // Invoices today
        const todayInvoices = invoices.filter((inv: any) => (inv.createdAt || inv.date || '').slice(0, 10) === todayStr && inv.status === 'PAID');
        const revToday = todayInvoices.reduce((acc: number, inv: any) => acc + (Number(inv.amount || inv.total) || 0), 0);

        // Staff on duty
        const activeStaffCount = staff.filter((s: any) => s.status !== 'INACTIVE' && s.status !== 'OFF_DUTY').length;

        // Channel breakdown
        const voiceConvs = convs.filter((c: any) => (c.channel || '').toUpperCase() === 'VOICE');
        const waConvs = convs.filter((c: any) => (c.channel || '').toUpperCase() === 'WHATSAPP');
        const webConvs = convs.filter((c: any) => (c.channel || '').toUpperCase() === 'WEB' || (c.channel || '').toUpperCase() === 'CHAT');

        const voiceAutonomous = voiceConvs.length > 0 
          ? Math.round((voiceConvs.filter((c: any) => c.status === 'COMPLETED').length / voiceConvs.length) * 100)
          : (voiceConvs.length > 0 ? 80 : 0);

        const waResolved = waConvs.length > 0
          ? Math.round((waConvs.filter((c: any) => c.status === 'COMPLETED').length / waConvs.length) * 100)
          : (waConvs.length > 0 ? 90 : 0);

        const webConverted = webConvs.length > 0
          ? Math.round((webConvs.filter((c: any) => c.status === 'COMPLETED').length / webConvs.length) * 100)
          : (webConvs.length > 0 ? 75 : 0);

        const totalConvs = convs.length;
        const totalCompleted = convs.filter((c: any) => c.status === 'COMPLETED').length;
        const totalHandoffs = convs.filter((c: any) => c.status === 'HANDOFF' || c.status === 'ESCALATED').length;
        const overallRate = totalConvs > 0 ? Math.round((totalCompleted / totalConvs) * 100) : 0;

        // Aggregate 7 days
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayCounts = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dayName = days[d.getDay()];
          const dateStr = d.toISOString().slice(0, 10);
          const dayCalls = voiceConvs.filter((c: any) => (c.createdAt || '').slice(0, 10) === dateStr).length;
          const dayMsgs = waConvs.filter((c: any) => (c.createdAt || '').slice(0, 10) === dateStr).length;
          return { name: dayName, calls: dayCalls, messages: dayMsgs };
        });

        // Check if any traffic exists
        const hasTraffic = dayCounts.some(d => d.calls > 0 || d.messages > 0);

        setStats({
          todayBookings: todayAppts.length,
          completedBookings: completedToday,
          pendingConfirmations: pendingToday,
          todayRevenue: revToday,
          paidInvoicesCount: todayInvoices.length,
          activeStaff: activeStaffCount || staff.length,
          totalStaff: staff.length,
          voiceCallsCount: voiceConvs.length,
          voiceAutonomousRate: voiceAutonomous,
          whatsappCount: waConvs.length,
          whatsappResolvedRate: waResolved,
          webchatCount: webConvs.length,
          webchatConvertedRate: webConverted,
          overallAiResolvedRate: overallRate,
          chartData: hasTraffic ? dayCounts : EMPTY_WEEK_DATA,
          pieData: [
            { name: 'AI Resolved', value: totalCompleted || (totalConvs === 0 ? 0 : 1), color: '#2563eb' },
            { name: 'Human Handoff', value: totalHandoffs || 0, color: '#475569' },
          ]
        });
      } catch (err) {
        console.error('Failed loading dashboard overview:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner: Business Health Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Business Health & Operations
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Real-time live operational telemetry across all communication channels & appointments
          </p>
        </div>
      </div>

      {/* 4 Core Niche KPI Cards (Live Real-Data Telemetry) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Inquiries Today",
            value: (stats.voiceCallsCount + stats.whatsappCount + stats.webchatCount).toString(),
            numericValue: stats.voiceCallsCount + stats.whatsappCount + stats.webchatCount,
            trend: 0,
            icon: Phone,
          },
          {
            label: "Confirmed Sittings",
            value: stats.todayBookings.toString(),
            numericValue: stats.todayBookings,
            trend: 0,
            icon: CalendarIcon,
          },
          {
            label: "Revenue Realized Today",
            value: `₹${stats.todayRevenue.toLocaleString('en-IN')}`,
            numericValue: stats.todayRevenue,
            trend: 0,
            icon: IndianRupee,
          },
          {
            label: "Active Clinic Team",
            value: `${stats.activeStaff} / ${stats.totalStaff}`,
            numericValue: stats.activeStaff,
            trend: 0,
            icon: Users,
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <KPICard 
              key={kpi.label}
              title={kpi.label} 
              value={kpi.value} 
              numericValue={kpi.numericValue} 
              trend={kpi.trend} 
              icon={Icon} 
              delay={0.05 * (idx + 1)} 
            />
          );
        })}
      </div>

      {/* 4 Daily Snapshot Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: "Today's Bookings", 
            val: `${stats.todayBookings} Sittings`, 
            sub: `${stats.completedBookings} Completed`, 
            icon: CalendarIcon, 
            color: "text-blue-400" 
          },
          { 
            label: "Pending Confirmations", 
            val: `${stats.pendingConfirmations} Patients`, 
            sub: stats.pendingConfirmations > 0 ? "WhatsApp active" : "All cleared", 
            icon: AlertCircle, 
            color: "text-amber-400" 
          },
          { 
            label: "Revenue Collected Today", 
            val: `₹${stats.todayRevenue.toLocaleString('en-IN')}`, 
            sub: `${stats.paidInvoicesCount} Invoices`, 
            icon: IndianRupee, 
            color: "text-emerald-400" 
          },
          { 
            label: "Staff On Duty", 
            val: `${stats.activeStaff} / ${stats.totalStaff} Active`, 
            sub: stats.totalStaff > 0 ? "Shift active" : "Configure in Manage Team", 
            icon: Users, 
            color: "text-sky-400" 
          },
        ].map((tile, i) => {
          const Icon = tile.icon;
          return (
            <div key={i} className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm hover:border-[var(--color-border-hover)] transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[var(--color-text-muted)] tracking-wide uppercase">{tile.label}</span>
                <div className={`p-2 rounded-xl bg-[var(--color-bg)] ${tile.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-[var(--color-text)] tracking-tight mb-1">{tile.val}</p>
              <p className="text-[11px] text-[var(--color-text-muted)] font-medium">{tile.sub}</p>
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
              <p className="text-[11px] text-[var(--color-text-muted)]">
                {stats.voiceCallsCount === 0 ? '0 inbound calls' : `${stats.voiceCallsCount} inbound calls handled`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-emerald-400 font-mono">{stats.voiceCallsCount > 0 ? `${stats.voiceAutonomousRate}%` : '0%'}</span>
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
              <p className="text-[11px] text-[var(--color-text-muted)]">
                {stats.whatsappCount === 0 ? '0 chats logged' : `${stats.whatsappCount} chats & recalls`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-emerald-400 font-mono">{stats.whatsappCount > 0 ? `${stats.whatsappResolvedRate}%` : '0%'}</span>
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
              <p className="text-[11px] text-[var(--color-text-muted)]">
                {stats.webchatCount === 0 ? '0 website inquiries' : `${stats.webchatCount} website inquiries`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-emerald-400 font-mono">{stats.webchatCount > 0 ? `${stats.webchatConvertedRate}%` : '0%'}</span>
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
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  contentStyle={{ backgroundColor: 'var(--color-glass)', backdropFilter: 'blur(12px)', border: '1px solid var(--color-glass-border)', borderRadius: '12px', color: 'var(--color-text)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: 'var(--color-text)', fontWeight: 600 }}
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
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-glass)', backdropFilter: 'blur(12px)', border: '1px solid var(--color-glass-border)', borderRadius: '12px', color: 'var(--color-text)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: 'var(--color-text)', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-3xl font-extrabold text-[var(--color-text)] font-mono">
                {stats.overallAiResolvedRate > 0 ? `${stats.overallAiResolvedRate}%` : (stats.voiceCallsCount + stats.whatsappCount === 0 ? '100%' : '0%')}
              </span>
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
