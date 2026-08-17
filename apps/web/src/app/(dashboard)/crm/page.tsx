'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNiche } from '@/components/providers/niche-provider';
import {
  Plus,
  X,
  Phone,
  MessageSquare,
  Search,
  Flame,
  Building,
  Activity,
  User,
  Clock,
  Briefcase,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export interface LeadActivity {
  id: string;
  type: 'CALL' | 'WHATSAPP' | 'NOTE' | 'STATUS_CHANGE';
  text: string;
  time: string;
  author?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  channel: 'VOICE' | 'WHATSAPP' | 'WEB_CHAT' | 'WALK_IN' | 'REFERRAL' | 'ADS';
  stage: string;
  dealValue: number;
  aiScore: number;
  assignedTo: string;
  daysInStage: number;
  summary: string;
  priority?: 'VIP' | 'High' | 'Medium' | 'Standard';
  activities: LeadActivity[];
  createdAt: string;
}

export interface StageItem {
  name: string;
  slug: string;
  colorClass: string;
  bgClass: string;
}

const STAGES: StageItem[] = [
  { name: 'New Inquiry', slug: 'new', colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10' },
  { name: 'Contacted', slug: 'contacted', colorClass: 'text-indigo-500', bgClass: 'bg-indigo-500/10' },
  { name: 'Qualified', slug: 'qualified', colorClass: 'text-purple-500', bgClass: 'bg-purple-500/10' },
  { name: 'Proposal/Quote', slug: 'proposal', colorClass: 'text-pink-500', bgClass: 'bg-pink-500/10' },
  { name: 'Won', slug: 'won', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10' },
  { name: 'Lost', slug: 'lost', colorClass: 'text-rose-500', bgClass: 'bg-rose-500/10' },
];

const SOURCE_ICONS: Record<string, { label: string; icon: any; colorClass: string }> = {
  VOICE: { label: 'Voice AI', icon: Phone, colorClass: 'text-cyan-500' },
  WHATSAPP: { label: 'WhatsApp', icon: MessageSquare, colorClass: 'text-emerald-500' },
  WEB_CHAT: { label: 'Web Chat', icon: Activity, colorClass: 'text-purple-500' },
  WALK_IN: { label: 'Walk-In', icon: Building, colorClass: 'text-amber-500' },
  REFERRAL: { label: 'Referral', icon: User, colorClass: 'text-blue-500' },
  ADS: { label: 'Ads', icon: Flame, colorClass: 'text-orange-500' },
};

export default function CrmPage() {
  const { currentNiche } = useNiche();

  const getDefaultLeads = (niche: string): Lead[] => {
    // Generate a set of realistic demo leads distributed across stages
    const baseLeads: Partial<Lead>[] = [
      { name: 'Arjun Reddy', channel: 'VOICE', stage: 'new', dealValue: 25000, aiScore: 88, daysInStage: 0, priority: 'High' },
      { name: 'Sneha Sharma', channel: 'WHATSAPP', stage: 'new', dealValue: 15000, aiScore: 72, daysInStage: 1, priority: 'Standard' },
      { name: 'Rahul Desai', channel: 'WEB_CHAT', stage: 'contacted', dealValue: 45000, aiScore: 92, daysInStage: 2, priority: 'VIP' },
      { name: 'Pooja Singh', channel: 'REFERRAL', stage: 'contacted', dealValue: 12000, aiScore: 65, daysInStage: 3, priority: 'Medium' },
      { name: 'Kiran Patel', channel: 'WALK_IN', stage: 'qualified', dealValue: 85000, aiScore: 95, daysInStage: 1, priority: 'VIP' },
      { name: 'Anita Bose', channel: 'VOICE', stage: 'qualified', dealValue: 32000, aiScore: 78, daysInStage: 4, priority: 'High' },
      { name: 'Vikram Iyer', channel: 'WHATSAPP', stage: 'proposal', dealValue: 55000, aiScore: 89, daysInStage: 2, priority: 'High' },
      { name: 'Neha Gupta', channel: 'WEB_CHAT', stage: 'proposal', dealValue: 18000, aiScore: 60, daysInStage: 5, priority: 'Standard' },
      { name: 'Amit Shah', channel: 'REFERRAL', stage: 'won', dealValue: 120000, aiScore: 98, daysInStage: 0, priority: 'VIP' },
      { name: 'Riya Sen', channel: 'VOICE', stage: 'won', dealValue: 22000, aiScore: 85, daysInStage: 0, priority: 'Medium' },
      { name: 'Sanjay Kumar', channel: 'ADS', stage: 'lost', dealValue: 10000, aiScore: 45, daysInStage: 10, priority: 'Standard' },
      { name: 'Priya Menon', channel: 'WALK_IN', stage: 'lost', dealValue: 40000, aiScore: 50, daysInStage: 12, priority: 'Medium' },
    ];

    return baseLeads.map((l, i) => ({
      id: `lead_${niche}_${i}`,
      name: l.name!,
      phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `${l.name?.split(' ')[0].toLowerCase()}@example.com`,
      channel: l.channel as any,
      stage: l.stage!,
      dealValue: l.dealValue!,
      aiScore: l.aiScore!,
      assignedTo: 'Sales Team',
      daysInStage: l.daysInStage!,
      summary: `Automated AI summary for ${l.name}. Expressed interest via ${l.channel}. Need follow-up.`,
      priority: l.priority as any,
      createdAt: 'Recent',
      activities: [
        { id: `a_${i}`, type: 'NOTE', text: 'Initial inquiry captured.', time: 'Recent', author: 'System' }
      ]
    }));
  };

  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Drawers
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New Lead Form
  const [newLead, setNewLead] = useState<Partial<Lead>>({ stage: 'new', channel: 'VOICE', dealValue: 0 });

  useEffect(() => {
    const saved = localStorage.getItem(`zerodesk_crm_${currentNiche}`);
    if (saved) {
      try {
        setLeads(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    setLeads(getDefaultLeads(currentNiche));
  }, [currentNiche]);

  const saveLeads = (updated: Lead[]) => {
    setLeads(updated);
    localStorage.setItem(`zerodesk_crm_${currentNiche}`, JSON.stringify(updated));
  };

  const handleUpdateStage = (leadId: string, newStage: string) => {
    const updated = leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          stage: newStage,
          daysInStage: 0,
          activities: [
            { id: Date.now().toString(), type: 'STATUS_CHANGE', text: `Moved to ${STAGES.find(s=>s.slug===newStage)?.name}`, time: 'Just now' },
            ...l.activities
          ]
        } as Lead;
      }
      return l;
    });
    saveLeads(updated);
    if (selectedLead?.id === leadId) setSelectedLead(updated.find(l => l.id === leadId) || null);
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.phone) return;
    const created: Lead = {
      id: `lead_${Date.now()}`,
      name: newLead.name,
      phone: newLead.phone,
      channel: (newLead.channel || 'VOICE') as any,
      stage: newLead.stage || 'new',
      dealValue: newLead.dealValue || 0,
      aiScore: 70,
      assignedTo: 'Unassigned',
      daysInStage: 0,
      summary: 'Manually added lead.',
      createdAt: 'Just now',
      activities: []
    };
    saveLeads([created, ...leads]);
    setIsAddModalOpen(false);
    setNewLead({ stage: 'new', channel: 'VOICE', dealValue: 0 });
  };

  const filteredLeads = leads.filter(l => 
    !searchQuery || 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.phone.includes(searchQuery)
  );

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-full overflow-hidden p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">Lead Pipeline</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Manage your automated sales and leads.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-4 h-full min-w-max items-start">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage.slug);
            return (
              <div key={stage.slug} className={cn("w-80 flex flex-col max-h-full rounded-xl border border-[var(--color-border)]", stage.bgClass)}>
                {/* Column Header */}
                <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)] rounded-t-xl shrink-0">
                  <h3 className="font-semibold text-sm text-[var(--color-text)] flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full bg-current", stage.colorClass)} />
                    {stage.name}
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 bg-[var(--color-bg)] rounded-full text-[var(--color-text-muted)] border border-[var(--color-border)]">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                  {stageLeads.map(lead => {
                    const src = SOURCE_ICONS[lead.channel] || SOURCE_ICONS.VOICE;
                    const SrcIcon = src.icon;
                    return (
                      <div
                        key={lead.id}
                        onClick={() => { setSelectedLead(lead); setIsDrawerOpen(true); }}
                        className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-lg hover:border-blue-500 cursor-pointer transition-all shadow-sm group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-sm text-[var(--color-text)] group-hover:text-blue-500">{lead.name}</h4>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{lead.phone}</p>
                          </div>
                          <div className={cn("flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-bg)]", src.colorClass)}>
                            <SrcIcon size={10} />
                            {src.label}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs mt-3">
                          <span className="font-mono text-[var(--color-text)]">{formatCurrency(lead.dealValue)}</span>
                          <div className="flex gap-2 text-[var(--color-text-muted)] text-[10px] font-medium items-center">
                            <span className="flex items-center gap-1" title="Assigned To"><User size={10}/> {lead.assignedTo.split(' ')[0]}</span>
                            <span className="flex items-center gap-1" title="Days in Stage"><Clock size={12}/> {lead.daysInStage}d</span>
                            {lead.aiScore >= 80 && <span className="flex items-center gap-0.5 text-amber-500" title="AI Lead Score"><Flame size={12}/>{lead.aiScore}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl z-50 flex flex-col"
            >
              <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between shrink-0">
                <h2 className="font-semibold text-[var(--color-text)] text-lg">Lead Details</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="p-1 hover:bg-[var(--color-bg)] rounded-lg text-[var(--color-text-muted)]"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Header Info */}
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[var(--color-text)]">{selectedLead.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1"><Phone size={14} /> {selectedLead.phone}</span>
                    {selectedLead.email && <span className="flex items-center gap-1">· {selectedLead.email}</span>}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-emerald-500/20">
                    <MessageSquare size={16} /> WhatsApp
                  </button>
                  <button className="flex-1 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-blue-500/20">
                    <Phone size={16} /> Call
                  </button>
                </div>

                {/* Status & Assignment */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Current Stage</p>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{STAGES.find(s=>s.slug===selectedLead.stage)?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Deal Value</p>
                    <p className="text-sm font-mono font-semibold text-[var(--color-text)]">{formatCurrency(selectedLead.dealValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Assigned To</p>
                    <p className="text-sm font-medium text-[var(--color-text)] flex items-center gap-1"><User size={14}/> {selectedLead.assignedTo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">AI Lead Score</p>
                    <p className="text-sm font-semibold text-amber-500 flex items-center gap-1"><Flame size={14}/> {selectedLead.aiScore}/100</p>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
                    <Activity size={16} className="text-purple-500" /> AI Conversation Summary
                  </h4>
                  <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {selectedLead.summary}
                  </div>
                </div>

                {/* Move Stage Buttons */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-[var(--color-text)]">Advance Pipeline</h4>
                  <div className="flex flex-wrap gap-2">
                    {STAGES.filter(s => s.slug !== selectedLead.stage).map(stage => (
                      <button
                        key={stage.slug}
                        onClick={() => handleUpdateStage(selectedLead.id, stage.slug)}
                        className="px-3 py-1.5 text-xs font-medium bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] hover:border-blue-500 transition-colors"
                      >
                        Move to {stage.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-[var(--color-text)]">Activity History</h4>
                  <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-2 before:w-0.5 before:bg-[var(--color-border)] pl-6">
                    {selectedLead.activities.map((act, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[var(--color-surface)] border-2 border-blue-500" />
                        <p className="text-xs text-[var(--color-text-muted)]">{act.time} · {act.author}</p>
                        <p className="text-sm text-[var(--color-text)] mt-0.5">{act.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Lead Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl w-full max-w-md shadow-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--color-text)]">Add New Lead</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--color-text-muted)]"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateLead} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Full Name</label>
                  <input required type="text" value={newLead.name || ''} onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Phone Number</label>
                  <input required type="text" value={newLead.phone || ''} onChange={e => setNewLead({...newLead, phone: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Deal Value (₹)</label>
                  <input type="number" value={newLead.dealValue || ''} onChange={e => setNewLead({...newLead, dealValue: Number(e.target.value)})} className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Channel Source</label>
                  <select value={newLead.channel} onChange={e => setNewLead({...newLead, channel: e.target.value as any})} className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)]">
                    {Object.keys(SOURCE_ICONS).map(k => <option key={k} value={k}>{SOURCE_ICONS[k].label}</option>)}
                  </select>
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Save Lead</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
