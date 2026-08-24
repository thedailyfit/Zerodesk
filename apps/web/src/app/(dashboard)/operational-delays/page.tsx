"use client";

import { motion } from "framer-motion";
import { 
  Clock, 
  AlertTriangle, 
  Activity, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  ShieldCheck,
  Zap,
  TrendingDown
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from "recharts";
import { cn } from "@/lib/utils";

const hourlyData = [
  { time: "09:00", delay: 4 },
  { time: "10:00", delay: 10 },
  { time: "11:00", delay: 16 },
  { time: "12:00", delay: 12 },
  { time: "13:00", delay: 6 },
  { time: "14:00", delay: 24 },
  { time: "15:00", delay: 18 },
  { time: "16:00", delay: 12 },
  { time: "17:00", delay: 8 },
  { time: "18:00", delay: 3 }
];

const topCauses = [
  { cause: "Late Patient Arrivals", percentage: 42, note: "AI sends automatic 15-min pre-arrival WhatsApp nudge" },
  { cause: "Extended Consultation / Procedure", percentage: 28, note: "Slot buffer auto-adjusted to +15m" },
  { cause: "Treatment Room Sanitization", percentage: 16, note: "Turnover time within normal 8m SLA" },
  { cause: "Walk-in Priority Squeeze", percentage: 9, note: "Frontdesk walk-in slot balancing active" },
  { cause: "Staff Shift Transitions", percentage: 5, note: "Doctor shift overlap optimal" }
];

const aiWatchlistItems = [
  {
    title: "Appointment Gap & Slot Waste (> 30 min)",
    status: "Healthy",
    statusType: "success",
    detail: "ZeroDesk AI filled 2 afternoon slot gaps today via WhatsApp flash recall.",
    metric: "0 empty gaps"
  },
  {
    title: "Late Patient Arrivals Pattern",
    status: "Monitoring",
    statusType: "warning",
    detail: "3 patients arrived 10+ mins past schedule between 1:30 PM - 3:00 PM.",
    metric: "3 flagged today"
  },
  {
    title: "Treatment Room & Chair Turnover Time",
    status: "Optimal",
    statusType: "success",
    detail: "Average chair sanitization and prep turnaround is 7.5 minutes (Target: < 10 min).",
    metric: "7.5 min avg"
  },
  {
    title: "Peak Hour Wait Time Surge (2:00 PM Spike)",
    status: "Alert",
    statusType: "alert",
    detail: "Consultation queue reached +14 mins at 2:00 PM due to complex VIP procedure.",
    metric: "+14 min peak"
  },
  {
    title: "Staff Frontdesk Response SLA",
    status: "Optimal",
    statusType: "success",
    detail: "Frontdesk check-in time averaged 2.4 minutes per patient entry.",
    metric: "2.4 min avg"
  }
];

export default function OperationalDelaysPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Operations & Delay Watchlist</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI Autonomous Watch Active
          </span>
        </div>
      </div>

      {/* 4 Clean Operational KPI Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Average Wait Time</p>
              <h3 className="text-3xl font-extrabold text-[var(--color-text)] font-mono mt-1">
                12 <span className="text-sm font-normal text-[var(--color-text-muted)]">min</span>
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingDown size={14} />
            -4 min compared to last week
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Turnover Time</p>
              <h3 className="text-3xl font-extrabold text-[var(--color-text)] font-mono mt-1">
                7.5 <span className="text-sm font-normal text-[var(--color-text-muted)]">min</span>
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity size={20} />
            </div>
          </div>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 size={13} />
            Within 10m target SLA
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Staff Frontdesk SLA</p>
              <h3 className="text-3xl font-extrabold text-[var(--color-text)] font-mono mt-1">
                2.4 <span className="text-sm font-normal text-[var(--color-text-muted)]">min</span>
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Users size={20} />
            </div>
          </div>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 size={13} />
            Fast Check-in Flow
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Patient Turnaround</p>
              <h3 className="text-3xl font-extrabold text-[var(--color-text)] font-mono mt-1">
                44 <span className="text-sm font-normal text-[var(--color-text-muted)]">min</span>
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-xs text-amber-400 font-semibold flex items-center gap-1">
            <AlertCircle size={13} />
            Slight afternoon surge
          </p>
        </motion.div>
      </motion.div>

      {/* Hourly Delay Timeline & Top Causes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">Hourly Delay Timeline (09:00 - 18:00)</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Average waiting minutes per scheduled time block</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400">Peak: 14:00 (24m)</span>
          </div>

          <div className="h-[260px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  dy={8}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--color-border)', opacity: 0.3 }}
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)' }}
                />
                <Bar dataKey="delay" radius={[4, 4, 0, 0]}>
                  {hourlyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.delay > 20 ? '#f97316' : entry.delay > 12 ? '#3b82f6' : '#10b981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Causes */}
        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">Delay Drivers Breakdown</h3>
          <div className="space-y-4">
            {topCauses.map((cause, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[var(--color-text)]">{cause.cause}</span>
                  <span className="font-mono font-bold text-blue-400">{cause.percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-[var(--color-bg)] rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      idx === 0 ? "bg-amber-500" : "bg-blue-600"
                    )}
                    style={{ width: `${cause.percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)]">{cause.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ZeroDesk AI Watchlist Section (Replacing Department Bottlenecks) */}
      <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <Eye size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">
                ZeroDesk AI Operational Watchlist
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Autonomous parameters watched 24/7 by AI assistant to ensure smooth client operations.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full font-bold">
            Live Stream
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {aiWatchlistItems.map((item, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2 hover:border-blue-500/40 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-[var(--color-text)] leading-tight">{item.title}</span>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0",
                  item.statusType === 'success' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  item.statusType === 'warning' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-rose-500/10 text-rose-400 border-rose-500/20"
                )}>
                  {item.status}
                </span>
              </div>

              <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                {item.detail}
              </p>

              <div className="pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between text-[10px]">
                <span className="text-[var(--color-text-muted)]">Metric Status</span>
                <span className="font-mono font-bold text-blue-400">{item.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
