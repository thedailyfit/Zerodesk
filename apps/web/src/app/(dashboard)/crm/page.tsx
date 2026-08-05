'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, X, Target, Check } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface LeadItem {
  id: string;
  title: string;
  customer: string;
  value: number;
  source: string;
  score: number;
  daysInStage: number;
  priority?: 'VIP' | 'HIGH' | 'MEDIUM' | 'STANDARD';
}

interface StageItem {
  name: string;
  slug: string;
  color: string;
  leads: LeadItem[];
}

const INITIAL_STAGES: StageItem[] = [
  {
    name: 'New Lead', slug: 'new', color: '#6366f1', leads: [
      { id: '1', title: 'Skin Treatment Inquiry', customer: 'Rajesh Kumar', value: 25000, source: 'VOICE', score: 85, daysInStage: 1, priority: 'VIP' },
      { id: '2', title: 'Hair Transplant Query', customer: 'Vikram Singh', value: 80000, source: 'WHATSAPP', score: 45, daysInStage: 2, priority: 'HIGH' },
      { id: '3', title: 'Facial Package', customer: 'Meera Joshi', value: 12000, source: 'WEB_CHAT', score: 60, daysInStage: 0, priority: 'MEDIUM' },
    ],
  },
  {
    name: 'Contacted', slug: 'contacted', color: '#8b5cf6', leads: [
      { id: '4', title: 'Laser Treatment', customer: 'Priya Sharma', value: 35000, source: 'VOICE', score: 72, daysInStage: 3, priority: 'HIGH' },
      { id: '5', title: 'Acne Scar Treatment', customer: 'Ankit Rawat', value: 18000, source: 'WHATSAPP', score: 58, daysInStage: 1, priority: 'STANDARD' },
    ],
  },
  {
    name: 'Qualified', slug: 'qualified', color: '#a855f7', leads: [
      { id: '6', title: 'Full Body Laser Package', customer: 'Sneha Reddy', value: 120000, source: 'VOICE', score: 92, daysInStage: 5, priority: 'VIP' },
    ],
  },
  {
    name: 'Proposal Sent', slug: 'proposal', color: '#d946ef', leads: [
      { id: '7', title: 'Annual Membership', customer: 'Ananya Iyer', value: 50000, source: 'WHATSAPP', score: 78, daysInStage: 2, priority: 'HIGH' },
      { id: '8', title: 'Premium Wellness Plan', customer: 'Deepak Menon', value: 75000, source: 'VOICE', score: 80, daysInStage: 4, priority: 'VIP' },
    ],
  },
  {
    name: 'Won', slug: 'won', color: '#22c55e', leads: [
      { id: '9', title: 'Laser Hair Removal', customer: 'Ritu Agarwal', value: 45000, source: 'VOICE', score: 95, daysInStage: 0, priority: 'HIGH' },
    ],
  },
  {
    name: 'Lost', slug: 'lost', color: '#ef4444', leads: [
      { id: '10', title: 'Budget Consultation', customer: 'Suresh Nair', value: 8000, source: 'WEB_CHAT', score: 20, daysInStage: 7, priority: 'STANDARD' },
    ],
  },
];

const sourceIcons: Record<string, string> = { VOICE: '📞', WHATSAPP: '💬', WEB_CHAT: '🌐', STORE_VISIT: '🏬', REFERRAL: '🤝' };

export default function CrmPage() {
  const [stages, setStages] = useState<StageItem[]>(INITIAL_STAGES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Lead Form State
  const [title, setTitle] = useState('');
  const [customer, setCustomer] = useState('');
  const [value, setValue] = useState('25000');
  const [targetStageSlug, setTargetStageSlug] = useState('new');
  const [source, setSource] = useState('VOICE');
  const [priority, setPriority] = useState<LeadItem['priority']>('HIGH');

  const totalValue = stages.reduce((sum, s) => sum + s.leads.reduce((ls, l) => ls + l.value, 0), 0);

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !customer.trim()) return;

    const newLead: LeadItem = {
      id: Date.now().toString(),
      title,
      customer,
      value: parseFloat(value) || 10000,
      source,
      score: 75,
      daysInStage: 0,
      priority
    };

    setStages(prev => prev.map(s => {
      if (s.slug === targetStageSlug) {
        return { ...s, leads: [newLead, ...s.leads] };
      }
      return s;
    }));

    setIsModalOpen(false);
    setTitle('');
    setCustomer('');
    setValue('25000');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">CRM Pipeline</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Total pipeline value: <span className="font-mono text-purple-300 font-bold">{formatCurrency(totalValue)}</span>
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shrink-0"
        >
          <Plus size={16} />
          Add Lead
        </button>
      </div>

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {stages.map((stage, si) => (
          <motion.div
            key={stage.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.08 }}
            className="flex-shrink-0 w-72"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-sm font-bold text-[var(--color-text)]">{stage.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                  {stage.leads.length}
                </span>
              </div>
              <span className="text-xs font-mono text-[var(--color-text-muted)]">
                {formatCurrency(stage.leads.reduce((s, l) => s + l.value, 0))}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2.5">
              {stage.leads.map((lead, li) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: si * 0.05 + li * 0.03 }}
                  className="p-3.5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl hover:border-purple-500/40 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className="text-xs font-bold text-[var(--color-text)] truncate">{lead.title}</p>
                        {lead.priority === 'VIP' && <span className="text-[10px] text-amber-400">🌟</span>}
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)]">{lead.customer}</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[var(--color-surface)] rounded">
                      <MoreHorizontal size={14} className="text-[var(--color-text-muted)]" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-mono font-bold" style={{ color: stage.color }}>
                      {formatCurrency(lead.value)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{sourceIcons[lead.source] || '🌐'}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", lead.score >= 70 ? "bg-emerald-500" : lead.score >= 40 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${lead.score}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{lead.score}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Lead Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Target size={18} className="text-purple-400" />
                  Add New Pipeline Lead
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddLead} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Deal Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. PRP Hair Package Inquiry"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    placeholder="e.g. Sneha Reddy"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Pipeline Stage</label>
                    <select
                      value={targetStageSlug}
                      onChange={(e) => setTargetStageSlug(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      {stages.map(s => (
                        <option key={s.slug} value={s.slug}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Deal Value (₹)</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Lead Source</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="VOICE">📞 AI Voice</option>
                      <option value="WHATSAPP">💬 AI WhatsApp</option>
                      <option value="WEB_CHAT">🌐 Web Chat</option>
                      <option value="STORE_VISIT">🏬 Store Visit</option>
                      <option value="REFERRAL">🤝 Referral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Priority Tag</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="VIP">VIP 🌟</option>
                      <option value="HIGH">High 🔴</option>
                      <option value="MEDIUM">Medium 🟡</option>
                      <option value="STANDARD">Standard ⚪</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg font-medium transition-colors"
                  >
                    Add Lead to Pipeline
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
