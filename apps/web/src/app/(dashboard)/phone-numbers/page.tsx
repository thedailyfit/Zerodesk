'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Plus, 
  Search, 
  CheckCircle2, 
  Building2, 
  Globe, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  X,
  Settings,
  RefreshCw,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoneNumberItem {
  id: string;
  number: string;
  clinicBranch: string;
  assignedAgent: string;
  provider: 'Twilio (India)' | 'Plivo' | 'Tata Tele';
  status: 'ACTIVE' | 'PENDING_KYC' | 'UNASSIGNED';
  webhookUrl: string;
  monthlyCost: string;
}

const INITIAL_NUMBERS: PhoneNumberItem[] = [
  {
    id: 'num_1',
    number: '+91 40 1234 5678',
    clinicBranch: 'Jubilee Hills Main Clinic',
    assignedAgent: 'DermAI Receptionist (vapi_agent_hyderabad_v4)',
    provider: 'Twilio (India)',
    status: 'ACTIVE',
    webhookUrl: 'https://api.zerodesk.com/v1/voice/vapi-webhook',
    monthlyCost: '₹1,200 / mo'
  },
  {
    id: 'num_2',
    number: '+91 40 8765 4321',
    clinicBranch: 'Banjara Hills Branch',
    assignedAgent: 'VIP Concierge (vapi_agent_vip_v2)',
    provider: 'Twilio (India)',
    status: 'ACTIVE',
    webhookUrl: 'https://api.zerodesk.com/v1/voice/vapi-webhook',
    monthlyCost: '₹1,200 / mo'
  },
  {
    id: 'num_3',
    number: '+91 40 5555 9999',
    clinicBranch: 'Hitech City Express Clinic',
    assignedAgent: 'After-Hours Outbound (retell_agent_99a)',
    provider: 'Plivo',
    status: 'ACTIVE',
    webhookUrl: 'https://api.zerodesk.com/v1/voice/vapi-webhook',
    monthlyCost: '₹950 / mo'
  },
  {
    id: 'num_4',
    number: '+91 40 3333 4444',
    clinicBranch: 'Gachibowli Branch (Upcoming)',
    assignedAgent: 'Unassigned',
    provider: 'Twilio (India)',
    status: 'PENDING_KYC',
    webhookUrl: 'https://api.zerodesk.com/v1/voice/vapi-webhook',
    monthlyCost: '₹1,200 / mo'
  }
];

export default function PhoneNumbersPage() {
  const [numbers, setNumbers] = useState(INITIAL_NUMBERS);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredNumbers = numbers.filter(n => 
    n.number.includes(search) || 
    n.clinicBranch.toLowerCase().includes(search.toLowerCase()) ||
    n.assignedAgent.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Phone Numbers Management</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Provision, assign, and route virtual phone numbers to clinic branches and Voice AI agents.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
        >
          <Plus size={18} />
          <span>Provision New Phone Number</span>
        </button>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xl">
            📞
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Active Phone Numbers</p>
            <p className="text-2xl font-extrabold text-[var(--color-text)]">3 Active / 1 Pending</p>
          </div>
        </div>

        <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
            🏢
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Clinic Branches Covered</p>
            <p className="text-2xl font-extrabold text-[var(--color-text)]">3 Branches (Hyderabad)</p>
          </div>
        </div>

        <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xl">
            ⚡
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Webhooks Latency</p>
            <p className="text-2xl font-extrabold text-cyan-400 font-mono">18ms (SIP Trunk)</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)]">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search phone number or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <Info size={14} className="text-purple-400" />
          <span>Indian TRAI Regulatory KYC Status: <strong className="text-emerald-400 font-mono">VERIFIED</strong></span>
        </div>
      </div>

      {/* Numbers Table List */}
      <div className="space-y-4">
        {filteredNumbers.map((num) => (
          <div
            key={num.id}
            className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-purple-500/40 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0",
                num.status === 'ACTIVE' ? "bg-purple-600 shadow-lg shadow-purple-500/20" : "bg-slate-700"
              )}>
                <Phone size={20} />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-mono font-bold text-lg text-white">{num.number}</h3>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    num.status === 'ACTIVE' 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>
                    {num.status === 'ACTIVE' ? 'Active & Routing' : 'Pending KYC Docs'}
                  </span>
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {num.provider}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)] mt-1 font-mono">
                  <span>📍 {num.clinicBranch}</span>
                  <span>•</span>
                  <span>🤖 Agent: <strong className="text-purple-300">{num.assignedAgent}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
              <button
                onClick={() => handleCopy(num.id, num.webhookUrl)}
                className="px-3 py-1.5 bg-[var(--color-surface)] hover:bg-slate-800 text-[var(--color-text)] border border-[var(--color-border)] rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5"
              >
                {copiedId === num.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedId === num.id ? 'Copied' : 'Webhook URL'}</span>
              </button>

              <button className="px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1">
                <Settings size={12} />
                <span>Configure</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Number Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-2xl p-6 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Plus size={18} className="text-purple-400" />
                  Provision Virtual Indian Phone Number
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Telephony Provider</label>
                  <select className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white">
                    <option value="twilio">Twilio India (SIP Trunk - +91 40 / +91 80)</option>
                    <option value="plivo">Plivo Communications</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Assign to Clinic Branch</label>
                  <select className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white">
                    <option value="jubilee">Jubilee Hills Main Clinic</option>
                    <option value="banjara">Banjara Hills Branch</option>
                    <option value="hitech">Hitech City Express Clinic</option>
                    <option value="gachibowli">Gachibowli Branch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Link Voice Agent ID</label>
                  <select className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-purple-300 font-mono">
                    <option value="agent_1">DermAI Receptionist (vapi_agent_hyderabad_v4)</option>
                    <option value="agent_2">VIP Concierge (vapi_agent_vip_v2)</option>
                    <option value="agent_3">After-Hours Outbound (retell_agent_99a)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-xl font-bold shadow-lg shadow-purple-500/20"
                >
                  Provision Number
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
