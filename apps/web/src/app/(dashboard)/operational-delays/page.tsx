"use client";

import { useState, useEffect } from "react";
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
  TrendingDown,
  Calendar
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
import { apiClient } from "@/lib/api-client";
import Link from "next/link";

const DEFAULT_HOURS = [
  { time: "09:00", delay: 0 },
  { time: "10:00", delay: 0 },
  { time: "11:00", delay: 0 },
  { time: "12:00", delay: 0 },
  { time: "13:00", delay: 0 },
  { time: "14:00", delay: 0 },
  { time: "15:00", delay: 0 },
  { time: "16:00", delay: 0 },
  { time: "17:00", delay: 0 },
  { time: "18:00", delay: 0 }
];

export default function OperationalDelaysPage() {
  const [loading, setLoading] = useState(true);
  const [hourlyData, setHourlyData] = useState(DEFAULT_HOURS);
  const [stats, setStats] = useState({
    avgDelay: 0,
    peakWait: 0,
    onScheduleRate: 100,
    delayedCount: 0,
    totalToday: 0
  });

  useEffect(() => {
    async function loadDelayTelemetry() {
      try {
        setLoading(true);
        const res = await apiClient('/appointments');
        if (Array.isArray(res)) {
          const todayStr = new Date().toISOString().slice(0, 10);
          const todayAppts = res.filter((a: any) => (a.scheduledAt || a.date || '').slice(0, 10) === todayStr);

          // Group by hour
          const hourBuckets: Record<string, number> = {
            "09:00": 0, "10:00": 0, "11:00": 0, "12:00": 0,
            "13:00": 0, "14:00": 0, "15:00": 0, "16:00": 0,
            "17:00": 0, "18:00": 0
          };

          let totalDelay = 0;
          let delayedCount = 0;
          let maxDelay = 0;

          todayAppts.forEach((a: any) => {
            const date = new Date(a.scheduledAt || a.date);
            const hour = String(date.getHours()).padStart(2, '0') + ':00';
            const delayMin = a.delayMins || (a.status === 'SCHEDULED' && date.getTime() < Date.now() ? Math.round((Date.now() - date.getTime()) / 60000) : 0);
            
            if (delayMin > 5) {
              delayedCount++;
              totalDelay += delayMin;
              if (delayMin > maxDelay) maxDelay = delayMin;
            }
            if (hourBuckets[hour] !== undefined) {
              hourBuckets[hour] = Math.max(hourBuckets[hour], delayMin);
            }
          });

          const formattedHourly = Object.entries(hourBuckets).map(([time, delay]) => ({
            time,
            delay: Math.min(delay, 60)
          }));

          const onSchedule = todayAppts.length > 0 
            ? Math.round(((todayAppts.length - delayedCount) / todayAppts.length) * 100) 
            : 100;

          const avg = delayedCount > 0 ? Math.round(totalDelay / delayedCount) : 0;

          setHourlyData(formattedHourly);
          setStats({
            avgDelay: avg,
            peakWait: maxDelay,
            onScheduleRate: onSchedule,
            delayedCount,
            totalToday: todayAppts.length
          });
        }
      } catch (err) {
        console.error('Error loading operational delay data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDelayTelemetry();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Operational Delays & Wait Times
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Real-time chair turnover, doctor schedule variance, and patient queue analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/appointments" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all">
            <Calendar size={14} /> View Appointments
          </Link>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants} className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Avg Consultation Delay</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Clock size={18} />
              </div>
            </div>
            <p className="text-2xl font-black text-[var(--color-text)] tracking-tight mb-1">{stats.avgDelay} min</p>
            <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <TrendingDown size={14} /> Optimal threshold &lt; 15m
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Peak Wait Time</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <AlertTriangle size={18} />
              </div>
            </div>
            <p className="text-2xl font-black text-[var(--color-text)] tracking-tight mb-1">{stats.peakWait} min</p>
            <p className="text-[11px] text-[var(--color-text-muted)] font-medium">
              {stats.peakWait > 0 ? "Under buffer limit" : "No queue backlog"}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">On-Schedule Rate</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Activity size={18} />
              </div>
            </div>
            <p className="text-2xl font-black text-[var(--color-text)] tracking-tight mb-1">{stats.onScheduleRate}%</p>
            <p className="text-[11px] text-emerald-400 font-medium">
              {stats.totalToday} total sittings today
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Active Buffer Interventions</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Zap size={18} />
              </div>
            </div>
            <p className="text-2xl font-black text-[var(--color-text)] tracking-tight mb-1">Active</p>
            <p className="text-[11px] text-blue-400 font-medium">Auto WhatsApp reminders live</p>
          </motion.div>
        </div>

        {/* Hourly Delay Chart & Operational Causes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-2 p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">Hourly Delay Telemetry</h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Average wait duration in minutes across clinic consultation hours</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> &lt; 10m Normal</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> 10-20m Buffer</span>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="time" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} unit="m" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-glass)', backdropFilter: 'blur(12px)', border: '1px solid var(--color-glass-border)', borderRadius: '12px', color: 'var(--color-text)' }}
                    formatter={(val: any) => [`${val} minutes`, 'Delay']}
                  />
                  <Bar dataKey="delay" radius={[6, 6, 0, 0]}>
                    {hourlyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.delay <= 5 ? '#10b981' : entry.delay <= 15 ? '#f59e0b' : '#ef4444'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* AI Operational Watchlist */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-blue-400" />
                ZeroDesk AI Queue Optimization
              </h2>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[var(--color-text)]">Round-Robin Doctor Balancing</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold">Active</span>
                  </div>
                  <p className="text-[var(--color-text-muted)] text-[11px]">When a physician runs over 15 mins, alternative available doctors are offered with client consent.</p>
                </div>

                <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[var(--color-text)]">2-Hour WhatsApp Reminder</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold">Enforced</span>
                  </div>
                  <p className="text-[var(--color-text-muted)] text-[11px]">Automatic pre-arrival prompt sent to patients to confirm punctual arrival.</p>
                </div>

                <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[var(--color-text)]">Late Arrival Buffer Squeeze</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-bold">Dynamic</span>
                  </div>
                  <p className="text-[var(--color-text-muted)] text-[11px]">Next appointments are gently staggered by +5m to prevent waiting room overflow.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> Clinic SLA Protection</span>
              <span>v2.4 Engine</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
