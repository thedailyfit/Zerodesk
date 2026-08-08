'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Zap, 
  Clock, 
  Cpu, 
  IndianRupee, 
  CheckCircle2, 
  Activity, 
  Globe2, 
  TrendingUp, 
  Mic2, 
  Volume2, 
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AgentAnalyticsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider border border-purple-500/20">
            Real-Time Diagnostics
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[11px] font-mono border border-cyan-500/20">
            Latency Benchmark & Cost Analytics
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text)] mt-2">Voice Agent Analytics & Latency Monitor</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">
          Deep-dive technical diagnostics into STT speech recognition accuracy, pipeline latency benchmarks, and telephony API cost breakdowns.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>Avg Pipeline Latency</span>
            <Zap size={16} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 font-mono mt-2">610 ms</p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">⚡ Target &lt;800ms achieved</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>Tenglish STT Accuracy</span>
            <Mic2 size={16} className="text-cyan-400" />
          </div>
          <p className="text-3xl font-extrabold text-cyan-400 font-mono mt-2">96.8%</p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">🎯 Sarvam AI STT Benchmark</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>Month-to-Date Cost</span>
            <IndianRupee size={16} className="text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-purple-300 font-mono mt-2">₹2,840</p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">💰 ₹12.40 avg per call</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>AI Booking Conversion</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 font-mono mt-2">92.8%</p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">📅 42 appointments saved</p>
        </motion.div>
      </div>

      {/* Latency Pipeline Breakdown Card */}
      <div className="p-6 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-purple-400" />
            <h2 className="text-base font-bold text-[var(--color-text)]">Pipeline Component Latency Breakdown</h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
            Total End-to-End: 610 ms
          </span>
        </div>

        <p className="text-xs text-[var(--color-text-muted)]">
          Milisecond response timing breakdown for every leg of a live phone conversation turn.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>1. STT (Ears)</span>
              <span className="text-cyan-400 font-bold">180 ms</span>
            </div>
            <p className="text-sm font-bold text-white">Sarvam AI STT</p>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full w-[30%]" />
            </div>
            <p className="text-[10px] text-slate-400">Audio stream to Tenglish text</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>2. Brain (LLM)</span>
              <span className="text-emerald-400 font-bold">210 ms</span>
            </div>
            <p className="text-sm font-bold text-white">ZeroDesk + GPT-4o</p>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-[35%]" />
            </div>
            <p className="text-[10px] text-slate-400">Vector search & prompt logic</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>3. TTS (Mouth)</span>
              <span className="text-purple-400 font-bold">140 ms</span>
            </div>
            <p className="text-sm font-bold text-white">ElevenLabs Turbo</p>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-400 h-full w-[23%]" />
            </div>
            <p className="text-[10px] text-slate-400">Multilingual cloned voice stream</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>4. SIP Network</span>
              <span className="text-amber-400 font-bold">80 ms</span>
            </div>
            <p className="text-sm font-bold text-white">Twilio India SIP</p>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full w-[12%]" />
            </div>
            <p className="text-[10px] text-slate-400">Network packet transport</p>
          </div>
        </div>
      </div>

      {/* Grid: Call Volume & API Costs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Peak Calling Hours Heatmap */}
        <div className="p-6 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
            <Clock size={18} className="text-cyan-400" />
            Peak Calling Hours (Hyderabad Surges)
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Hourly distribution of incoming patient calls across Jubilee Hills & Banjara Hills clinics.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>10:00 AM - 12:00 PM (Morning Surge)</span>
                <span className="text-emerald-400 font-bold">18 Calls (42%)</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-full w-[85%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>04:00 PM - 07:00 PM (Evening Post-Work Surge)</span>
                <span className="text-purple-400 font-bold">19 Calls (45%)</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-purple-500 h-full w-[90%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>08:00 PM - 10:00 AM (After-Hours Auto-Responder)</span>
                <span className="text-cyan-400 font-bold">5 Calls (13%)</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-cyan-500 h-full w-[25%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Telephony Cost Breakdown */}
        <div className="p-6 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
            <IndianRupee size={18} className="text-purple-400" />
            API Cost Breakdown (INR ₹)
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Itemized cost analysis for telephony, STT, LLM tokens, and voice synthesis.
          </p>

          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between text-xs font-mono">
              <span>📞 Twilio India SIP Trunk (Per Minute)</span>
              <span className="text-white font-bold">₹2.80 / min</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between text-xs font-mono">
              <span>👂 Sarvam STT Speech-to-Text</span>
              <span className="text-cyan-400 font-bold">₹1.50 / min</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between text-xs font-mono">
              <span>🧠 OpenAI gpt-4o Tokens</span>
              <span className="text-emerald-400 font-bold">₹3.10 / min</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between text-xs font-mono">
              <span>🗣️ ElevenLabs Turbo Multilingual TTS</span>
              <span className="text-purple-300 font-bold">₹5.00 / min</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
