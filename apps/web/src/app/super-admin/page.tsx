'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Building2, 
  PhoneCall, 
  Cpu, 
  HardDrive, 
  TrendingUp, 
  Activity, 
  Radio, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight, 
  Clock, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useSuperAdminStore } from '@/lib/superadmin-store';

export default function SuperAdminOverviewPage() {
  const { tenants, voices, llmModels, globalFailoverEnabled } = useSuperAdminStore();

  const totalMRR = tenants.reduce((acc: number, t: any) => acc + t.mrr, 0);
  const totalVoiceMinutes = tenants.reduce((acc: number, t: any) => acc + t.voiceMinutesUsed, 0);
  const totalTokensUsed = tenants.reduce((acc: number, t: any) => acc + t.llmTokensUsed, 0);
  const totalStorageMB = tenants.reduce((acc: number, t: any) => acc + t.storageUsedMB, 0);
  const totalRagChunks = tenants.reduce((acc: number, t: any) => acc + t.ragChunksCount, 0);

  const formatINR = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Global Command Dashboard</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Live Fleet Active
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time multi-tenant telemetry, aggregated AI voice minutes, and centralized LLM routing control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/super-admin/tenants"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Manage Tenants</span>
          </Link>
          <Link
            href="/super-admin/voice-fleet"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Voice & LLM Registry</span>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div whileHover={{ y: -2 }} className="p-5 rounded-2xl bg-[#0D111D] border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span>Total Platform MRR</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{formatINR(totalMRR)}</div>
          <div className="text-[11px] text-emerald-400 mt-2 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% growth vs last month</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="p-5 rounded-2xl bg-[#0D111D] border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span>Aggregated Voice Minutes</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <PhoneCall className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{(totalVoiceMinutes).toLocaleString()} mins</div>
          <div className="text-[11px] text-slate-400 mt-2 font-medium">
            Across {tenants.length} active business accounts
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="p-5 rounded-2xl bg-[#0D111D] border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span>LLM Token Consumption</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Cpu className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{(totalTokensUsed / 1000000).toFixed(1)}M Tokens</div>
          <div className="text-[11px] text-purple-400 mt-2 font-medium">
            Avg cost: ₹0.042 / 1k tokens
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="p-5 rounded-2xl bg-[#0D111D] border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span>Vector RAG Storage</span>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <HardDrive className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{totalStorageMB.toFixed(1)} MB</div>
          <div className="text-[11px] text-slate-400 mt-2 font-medium">
            {totalRagChunks.toLocaleString()} indexed pgvector chunks
          </div>
        </motion.div>
      </div>

      {/* Control Strip */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0E1322] to-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">Global AI Failover & Telemetry System</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              If primary model latency exceeds 1200ms, calls auto-reroute to Groq LLaMA 3.3 70B (350 t/s).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-slate-200">Global Failover</div>
            <div className="text-[11px] text-emerald-400 font-mono">AUTOMATIC ARMING</div>
          </div>
          <Link
            href="/super-admin/llm-router"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
          >
            <span>Configure Rules</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Top 5 Tenants Usage Snapshot */}
      <div className="rounded-2xl bg-[#0D111D] border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white text-sm">Active Client Accounts & Resource Allocation</h3>
            <p className="text-xs text-slate-400 mt-0.5">High-ticket multi-tenant businesses utilizing ZeroDesk AI</p>
          </div>
          <Link 
            href="/super-admin/tenants"
            className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
          >
            <span>View All ({tenants.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Business Name</th>
                <th className="px-5 py-3.5">Industry / Niche</th>
                <th className="px-5 py-3.5">Plan Tier</th>
                <th className="px-5 py-3.5">Voice Minutes</th>
                <th className="px-5 py-3.5">LLM Engine</th>
                <th className="px-5 py-3.5">MRR</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {tenants.slice(0, 5).map((t: any) => {
                const assignedLlm = llmModels.find((m: any) => m.id === t.assignedLlmId);
                const fallbackLlm = llmModels.find((m: any) => m.id === t.assignedFallbackLlmId);
                return (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 font-semibold text-white">{t.name}</td>
                    <td className="px-5 py-4 text-slate-400">{t.industry}</td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        'px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase',
                        t.plan === 'Enterprise' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        t.plan === 'Growth' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      )}>
                        {t.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono">
                      {t.voiceMinutesUsed} / {t.voiceMinutesLimit} mins
                      <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="bg-blue-500 h-full rounded-full" 
                          style={{ width: `${Math.min(100, (t.voiceMinutesUsed / t.voiceMinutesLimit) * 100)}%` }} 
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-slate-200 text-[11px] bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 w-fit">
                          {assignedLlm?.name.split(' ')[0] || 'GPT-4o'}
                        </span>
                        {fallbackLlm && (
                          <span className="font-mono text-amber-300 text-[9px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 w-fit">
                            ↳ {fallbackLlm.name.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-emerald-400 font-semibold">{formatINR(t.mrr)}</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
