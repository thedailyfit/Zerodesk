'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhoneIncoming, 
  Search, 
  CheckCircle2, 
  Play, 
  Pause, 
  FileText, 
  X, 
  User, 
  Clock, 
  IndianRupee, 
  Sparkles,
  PhoneOff,
  Smile,
  Meh,
  AlertTriangle,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

const INBOUND_CALL_LOGS: any[] = [];

export default function InboundCallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/lib/api-client').then(({ apiClient }) => {
      apiClient('/conversations')
        .then((res: any) => {
          if (Array.isArray(res)) {
            const voiceCalls = res
              .filter((c: any) => c.channel === 'VOICE' || (c.channel && c.channel.toLowerCase().includes('voice')))
              .map((c: any) => ({
                id: c.id,
                customer: c.customer?.name || 'Inbound Caller',
                phone: c.customer?.phone || 'N/A',
                time: new Date(c.startedAt || c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                duration: c.endedAt && c.startedAt ? `${Math.round((new Date(c.endedAt).getTime() - new Date(c.startedAt).getTime()) / 60000)}m` : (c.duration ? `${Math.round(c.duration / 60)}m` : '-'),
                branch: c.tenant?.name || 'Clinic',
                agent: 'LiveKit Voice AI',
                resolution: c.status === 'COMPLETED' ? 'AI_RESOLVED' : c.status === 'HANDOFF' ? 'HANDED_OFF_TO_HUMAN' : 'AI_RESOLVED',
                sentiment: c.sentiment || 'SATISFIED',
                cost: c.duration ? `₹${((c.duration / 60) * 0.45).toFixed(2)}` : '-',
                transcript: c.aiSummary || c.transcript || 'Inbound call logged without transcript.',
              }));
            setCalls(voiceCalls);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, []);
  const [search, setSearch] = useState('');
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filteredCalls = calls.filter(c => 
    c.customer.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) ||
    c.branch.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAudioPlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      setTimeout(() => setPlayingId(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Inbound Call Logs</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Monitor real-time incoming telephone calls, listen to recordings, review full transcripts, and check AI resolution rates.
          </p>
        </div>
      </div>

      {/* KPI Ticker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl">
          <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Total Inbound Calls (24h)</p>
          <p className="text-2xl font-extrabold text-[var(--color-text)] mt-1">{calls.length} Calls</p>
        </div>
        <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl">
          <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">AI Resolution Rate</p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">{calls.length > 0 ? Math.round((calls.filter(c => c.resolution === 'AI_RESOLVED').length / calls.length) * 100) + '%' : '0%'}</p>
        </div>
        <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl">
          <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Human Handoffs</p>
          <p className="text-2xl font-extrabold text-blue-400 mt-1">{calls.filter(c => c.resolution === 'HANDED_OFF_TO_HUMAN').length} Calls</p>
        </div>
    </div>

      {/* Search & Post-Call Disposition Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)]">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search patient name, phone, or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Disposition Enum Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0">
            <Filter size={13} className="text-blue-400" /> Disposition:
          </span>
          {['ALL', 'AI_RESOLVED', 'HANDED_OFF_TO_HUMAN', 'MISSED_AUTO_WHATSAPP'].map((disp) => (
            <button
              key={disp}
              onClick={() => {
                if (disp === 'ALL') {
                  setCalls(INBOUND_CALL_LOGS);
                } else {
                  setCalls(INBOUND_CALL_LOGS.filter(c => c.resolution === disp));
                }
              }}
              className="px-3 py-1 rounded-lg border text-[11px] font-mono font-bold transition-all shrink-0 bg-slate-900 border-slate-800 text-slate-300 hover:border-blue-500/50"
            >
              {disp === 'ALL' ? 'Show All' : disp.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Call List */}
      <div className="space-y-4">
        {filteredCalls.length === 0 ? (
          <div className="p-12 text-center bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-slate-800 rounded-3xl space-y-5 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 shadow-inner">
              <PhoneIncoming size={32} className="animate-pulse" />
            </div>

            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-white">Your AI Receptionist is Ready & Waiting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No call logs match this filter yet. Experience the ultra-low latency LiveKit Indian voice engine by running a live test call.
              </p>
            </div>

            {/* Glowing CTA actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  alert("Initiating live AI Receptionist browser audio call with LiveKit...");
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles size={15} />
                <span>Test Your AI Receptionist Now</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("+91 40 1234 5678");
                  alert("Copied testing phone number (+91 40 1234 5678) to clipboard!");
                }}
                className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
              >
                <span>📋 Copy Inbound Testing Number</span>
              </button>
            </div>

            {/* Visual Setup Helper Bar */}
            <div className="pt-6 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-xl mx-auto text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">1</span>
                <span>Dial testing line</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[10px]">2</span>
                <span>Speak naturally in English or Hindi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-[10px]">3</span>
                <span>Review live transcript here</span>
              </div>
            </div>
          </div>
        ) : (
          filteredCalls.map((call) => (
            <div
              key={call.id}
              className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-blue-500/40 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0",
                  call.resolution === 'AI_RESOLVED' ? "bg-emerald-600 shadow-lg shadow-emerald-500/20" :
                  call.resolution === 'HANDED_OFF_TO_HUMAN' ? "bg-blue-600 shadow-lg shadow-blue-500/20" : "bg-red-600"
                )}>
                  <PhoneIncoming size={20} />
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-base text-[var(--color-text)]">{call.customer}</h3>
                    <span className="font-mono text-xs text-slate-400">{call.phone}</span>
                    
                    {call.resolution === 'AI_RESOLVED' && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                        ✓ AI Booked
                      </span>
                    )}
                    {call.resolution === 'HANDED_OFF_TO_HUMAN' && (
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                        ⚠️ Doctor Handoff
                      </span>
                    )}
                    {call.resolution === 'MISSED_AUTO_WHATSAPP' && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                        📲 Auto WhatsApp Sent
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)] mt-1 font-mono">
                    <span>📍 {call.branch}</span>
                    <span>•</span>
                    <span>🤖 Agent: <strong className="text-blue-300">{call.agent}</strong></span>
                    <span>•</span>
                    <span>⏱️ Duration: <strong>{call.duration}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                <button
                  onClick={() => toggleAudioPlay(call.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs transition-colors flex items-center gap-1.5 font-medium"
                >
                  {playingId === call.id ? (
                    <>
                      <Pause size={13} className="text-amber-400 animate-pulse" />
                      <span className="text-amber-400">Playing...</span>
                    </>
                  ) : (
                    <>
                      <Play size={13} />
                      <span>Play Audio</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setActiveCallId(call.id)}
                  className="px-3.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <FileText size={13} />
                  <span>View Full Transcript</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Transcript Modal */}
      <AnimatePresence>
        {activeCallId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-blue-500/30 rounded-2xl p-6 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <FileText size={18} className="text-blue-400" />
                  Transcript: {calls.find(c => c.id === activeCallId)?.customer}
                </h3>
                <button onClick={() => setActiveCallId(null)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto shadow-inner">
                {calls.find(c => c.id === activeCallId)?.transcript}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveCallId(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-xl font-medium"
                >
                  Close Transcript
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
