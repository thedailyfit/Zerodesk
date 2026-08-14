'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Upload, 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  Users, 
  TrendingUp, 
  Calendar, 
  X,
  FileSpreadsheet,
  Zap,
  PhoneOutgoing
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignItem {
  id: string;
  name: string;
  targetAudience: string;
  totalLeads: number;
  completedCalls: number;
  pickupRate: string;
  conversionRate: string;
  status: 'RUNNING' | 'SCHEDULED' | 'COMPLETED' | 'PAUSED';
  assignedAgent: string;
  scheduledTime: string;
}

const INITIAL_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'camp_1',
    name: '90-Day Diode Laser Touch-up Win-back Campaign',
    targetAudience: 'Patients with no visits in 90 days (Jubilee Hills)',
    totalLeads: 250,
    completedCalls: 184,
    pickupRate: '68.4%',
    conversionRate: '24.2%',
    status: 'RUNNING',
    assignedAgent: 'DermAI Receptionist (vapi_agent_hyderabad_v4)',
    scheduledTime: '10:00 AM - 06:00 PM Daily'
  },
  {
    id: 'camp_2',
    name: '24h Chemical Peel & PRP Pre-Procedure Reminder Calls',
    targetAudience: 'Patients booked for tomorrow',
    totalLeads: 45,
    completedCalls: 45,
    pickupRate: '91.1%',
    conversionRate: '97.8%',
    status: 'COMPLETED',
    assignedAgent: 'DermAI Receptionist (vapi_agent_hyderabad_v4)',
    scheduledTime: 'Every evening at 5 PM'
  },
  {
    id: 'camp_3',
    name: 'HydraFacial Monsoon Special Offer Outreach',
    targetAudience: 'Banjara Hills VIP leads list (CSV Upload)',
    totalLeads: 500,
    completedCalls: 0,
    pickupRate: '0.0%',
    conversionRate: '0.0%',
    status: 'SCHEDULED',
    assignedAgent: 'VIP Concierge (vapi_agent_vip_v2)',
    scheduledTime: 'Starts Tomorrow 11:00 AM'
  }
];

export default function OutboundCampaignsPage() {
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.targetAudience.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Outbound AI Campaigns</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Launch automated outbound AI calling campaigns for client win-backs, post-care check-ins, and consultation reminders.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
        >
          <Plus size={18} />
          <span>Launch New Campaign</span>
        </button>
      </div>

      {/* Stats KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xl">
            📢
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Active Campaigns</p>
            <p className="text-2xl font-extrabold text-[var(--color-text)]">1 Running / 1 Scheduled</p>
          </div>
        </div>

        <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
            📞
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Average Pick-up Rate</p>
            <p className="text-2xl font-extrabold text-emerald-400">79.7.5%</p>
          </div>
        </div>

        <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xl">
            🎯
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Booking Conversion</p>
            <p className="text-2xl font-extrabold text-cyan-400 font-mono">24.2% Booked</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)]">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search campaign name or target list..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.map((camp) => (
          <div
            key={camp.id}
            className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-purple-500/40 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0",
                camp.status === 'RUNNING' ? "bg-purple-600 shadow-lg shadow-purple-500/20 animate-pulse" :
                camp.status === 'COMPLETED' ? "bg-emerald-600" : "bg-slate-700"
              )}>
                <PhoneOutgoing size={20} />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-base text-[var(--color-text)]">{camp.name}</h3>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    camp.status === 'RUNNING' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    camp.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>
                    {camp.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)] mt-1 font-mono">
                  <span>🎯 Target: {camp.targetAudience}</span>
                  <span>•</span>
                  <span>👥 Leads: <strong className="text-white">{camp.completedCalls} / {camp.totalLeads}</strong></span>
                  <span>•</span>
                  <span>📞 Pickup Rate: <strong className="text-emerald-400">{camp.pickupRate}</strong></span>
                  <span>•</span>
                  <span>📈 Booking Rate: <strong className="text-cyan-400">{camp.conversionRate}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
              {camp.status === 'RUNNING' ? (
                <button className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5">
                  <Pause size={13} />
                  <span>Pause Dialer</span>
                </button>
              ) : (
                <button className="px-3.5 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5">
                  <Play size={13} />
                  <span>Start Campaign</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Campaign Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-2xl p-6 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Megaphone size={18} className="text-purple-400" />
                  Launch Outbound AI Calling Campaign
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Campaign Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 90-Day Chemical Peel Touch-up Campaign"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Upload Patient Lead CSV List</label>
                  <div className="p-4 border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-xl bg-slate-950 text-center cursor-pointer">
                    <FileSpreadsheet size={24} className="mx-auto text-purple-400 mb-1" />
                    <p className="text-slate-300 font-semibold">Click to upload CSV / Excel file</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">Columns required: Name, Phone, Last Treatment Date</p>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Select Outbound AI Agent</label>
                  <select className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-purple-300 font-mono">
                    <option value="agent_1">DermAI Receptionist (vapi_agent_hyderabad_v4)</option>
                    <option value="agent_2">VIP Concierge (vapi_agent_vip_v2)</option>
                    <option value="agent_3">After-Hours Outbound (retell_agent_99a)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Calling Hours (TRAI Compliant)</label>
                  <select className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white">
                    <option value="day">10:00 AM to 06:00 PM (Recommended)</option>
                    <option value="evening">04:00 PM to 08:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-xl font-bold shadow-lg shadow-purple-500/20"
                >
                  Start Campaign Dialer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
