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
  Zap,
  ChevronDown
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
  { name: 'New Inquiry', slug: 'new', colorClass: 'text-blue-400', bgClass: 'bg-blue-500/10' },
  { name: 'Contacted', slug: 'contacted', colorClass: 'text-indigo-400', bgClass: 'bg-indigo-500/10' },
  { name: 'Qualified', slug: 'qualified', colorClass: 'text-sky-400', bgClass: 'bg-sky-500/10' },
  { name: 'Proposal / Quote', slug: 'proposal', colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10' },
  { name: 'Won (Booked)', slug: 'won', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10' },
  { name: 'Lost', slug: 'lost', colorClass: 'text-rose-400', bgClass: 'bg-rose-500/10' },
];

const SOURCE_ICONS: Record<Lead['channel'], { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; colorClass: string }> = {
  VOICE: { label: 'Voice AI', icon: Phone, colorClass: 'text-blue-400' },
  WHATSAPP: { label: 'WhatsApp', icon: MessageSquare, colorClass: 'text-emerald-400' },
  WEB_CHAT: { label: 'Web Chat', icon: Activity, colorClass: 'text-cyan-400' },
  WALK_IN: { label: 'Walk-In', icon: Building, colorClass: 'text-amber-400' },
  REFERRAL: { label: 'Referral', icon: User, colorClass: 'text-blue-400' },
  ADS: { label: 'Ads CRM', icon: Flame, colorClass: 'text-orange-400' },
};

export default function AutomatedLeadsPage() {
  const { currentNiche } = useNiche();

  const getDefaultLeads = (niche: string): Lead[] => {
    const baseLeads: {
      name: string;
      channel: Lead['channel'];
      stage: string;
      dealValue: number;
      aiScore: number;
      daysInStage: number;
      priority: Lead['priority'];
    }[] = [
      { name: 'Arjun Reddy', channel: 'VOICE', stage: 'new', dealValue: 25000, aiScore: 88, daysInStage: 0, priority: 'High' },
      { name: 'Sneha Sharma', channel: 'WHATSAPP', stage: 'new', dealValue: 15000, aiScore: 72, daysInStage: 1, priority: 'Standard' },
      { name: 'Rahul Desai', channel: 'WEB_CHAT', stage: 'contacted', dealValue: 45000, aiScore: 92, daysInStage: 2, priority: 'VIP' },
      { name: 'Pooja Singh', channel: 'REFERRAL', stage: 'contacted', dealValue: 12000, aiScore: 65, daysInStage: 3, priority: 'Medium' },
      { name: 'Kiran Patel', channel: 'WALK_IN', stage: 'qualified', dealValue: 85000, aiScore: 95, daysInStage: 1, priority: 'VIP' },
      { name: 'Anita Bose', channel: 'VOICE', stage: 'qualified', dealValue: 32000, aiScore: 78, daysInStage: 4, priority: 'High' },
      { name: 'Vikram Iyer', channel: 'WHATSAPP', stage: 'proposal', dealValue: 55000, aiScore: 89, daysInStage: 2, priority: 'High' },
      { name: 'Amit Shah', channel: 'REFERRAL', stage: 'won', dealValue: 120000, aiScore: 98, daysInStage: 0, priority: 'VIP' },
      { name: 'Riya Sen', channel: 'VOICE', stage: 'won', dealValue: 22000, aiScore: 85, daysInStage: 0, priority: 'Medium' },
      { name: 'Sanjay Kumar', channel: 'ADS', stage: 'lost', dealValue: 10000, aiScore: 45, daysInStage: 10, priority: 'Standard' },
    ];

    return baseLeads.map((l, i) => ({
      id: `lead_${niche}_${i}`,
      name: l.name,
      phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `${l.name.split(' ')[0].toLowerCase()}@example.com`,
      channel: l.channel,
      stage: l.stage,
      dealValue: l.dealValue,
      aiScore: l.aiScore,
      assignedTo: 'Sales Team',
      daysInStage: l.daysInStage,
      summary: `Automated AI lead captured via ${l.channel}. High intent score (${l.aiScore}/100).`,
      priority: l.priority,
      createdAt: 'Recent',
      activities: [
        { id: `a_${i}`, type: 'NOTE', text: 'Initial inquiry qualified by AI frontdesk.', time: 'Recent', author: 'AI Engine' }
      ]
    }));
  };

  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedStages, setCollapsedStages] = useState<Record<string, boolean>>({});
  
  // Modals & Drawers
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New Lead Form
  const [newLead, setNewLead] = useState<Partial<Lead>>({ stage: 'new', channel: 'VOICE', dealValue: 0 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`zerodesk_crm_${currentNiche}`);
      if (saved) {
        setLeads(JSON.parse(saved));
        return;
      }
    } catch (e) {
      console.error('Failed to load leads from localStorage', e);
    }
    setLeads(getDefaultLeads(currentNiche));
  }, [currentNiche]);

  const saveLeads = (updated: Lead[]) => {
    setLeads(updated);
    try {
      localStorage.setItem(`zerodesk_crm_${currentNiche}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save leads to localStorage', e);
    }
  };

  const handleUpdateStage = (leadId: string, newStage: string) => {
    const updated = leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          stage: newStage,
          daysInStage: 0,
          activities: [
            { id: Date.now().toString(), type: 'STATUS_CHANGE', text: `Moved to ${STAGES.find(s=>s.slug===newStage)?.name}`, time: 'Just now', author: 'Manager' },
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
      channel: newLead.channel || 'VOICE',
      stage: newLead.stage || 'new',
      dealValue: newLead.dealValue || 0,
      aiScore: 75,
      assignedTo: 'Sales Desk',
      daysInStage: 0,
      summary: 'Manually entered lead.',
      createdAt: 'Just now',
      activities: []
    };
    saveLeads([created, ...leads]);
    setIsAddModalOpen(false);
    setNewLead({ stage: 'new', channel: 'VOICE', dealValue: 0 });
  };

  const toggleStageCollapse = (slug: string) => {
    setCollapsedStages(prev => ({ ...prev, [slug]: !prev[slug] }));
  };

  const filteredLeads = leads.filter(l => 
    !searchQuery || 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.phone.includes(searchQuery)
  );

  const totalValue = leads.filter(l => l.stage !== 'lost').reduce((acc, l) => acc + l.dealValue, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <Zap size={20} />
            </div>
            <span>Automated Leads & Pipeline Status</span>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-medium">
              Pipeline: {formatCurrency(totalValue)}
            </span>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            All inbound inquiries categorized by stage with AI lead scoring and zero horizontal scroll.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus size={14} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Top Pipeline Summary Funnel Bar (Counters with connectors) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {STAGES.map((stage) => {
          const count = leads.filter(l => l.stage === stage.slug).length;
          const stageValue = leads.filter(l => l.stage === stage.slug).reduce((a, b) => a + b.dealValue, 0);

          return (
            <div
              key={stage.slug}
              onClick={() => toggleStageCollapse(stage.slug)}
              className={cn(
                "p-3 rounded-2xl border transition-all cursor-pointer space-y-1",
                stage.bgClass,
                "hover:border-blue-500/40"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("text-xs font-bold truncate", stage.colorClass)}>{stage.name}</span>
                <span className="font-mono text-xs font-extrabold bg-[var(--color-bg)]/80 px-2 py-0.5 rounded-full border border-[var(--color-border)]">
                  {count}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[var(--color-text-muted)]">{formatCurrency(stageValue)}</p>
            </div>
          );
        })}
      </div>

      {/* Vertical Pipeline Accordion Sections (Fits Screen Cleanly Without Horizontal Slider) */}
      <div className="space-y-4">
        {STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter(l => l.stage === stage.slug);
          const isCollapsed = collapsedStages[stage.slug];

          return (
            <div
              key={stage.slug}
              className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Section Header */}
              <div
                onClick={() => toggleStageCollapse(stage.slug)}
                className="p-3.5 px-5 flex items-center justify-between bg-[var(--color-surface)]/50 border-b border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-surface)] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ChevronDown size={16} className={cn("text-[var(--color-text-muted)] transition-transform", isCollapsed && "-rotate-90")} />
                  <h3 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", stage.colorClass.replace('text-', 'bg-'))} />
                    <span>{stage.name}</span>
                  </h3>
                  <span className="text-xs text-[var(--color-text-muted)] font-mono">
                    ({stageLeads.length} {stageLeads.length === 1 ? 'lead' : 'leads'})
                  </span>
                </div>

                <span className="font-mono text-xs font-bold text-blue-400">
                  {formatCurrency(stageLeads.reduce((a, b) => a + b.dealValue, 0))}
                </span>
              </div>

              {/* Compact Rows */}
              {!isCollapsed && (
                <div className="divide-y divide-[var(--color-border)]">
                  {stageLeads.map((lead) => {
                    const src = SOURCE_ICONS[lead.channel] || SOURCE_ICONS.VOICE;
                    const SrcIcon = src.icon;

                    return (
                      <div
                        key={lead.id}
                        className="p-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--color-surface)]/40 transition-colors text-xs"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div 
                            onClick={() => { setSelectedLead(lead); setIsDrawerOpen(true); }}
                            className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-400 font-bold text-xs flex items-center justify-center cursor-pointer shrink-0"
                          >
                            {lead.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span 
                                onClick={() => { setSelectedLead(lead); setIsDrawerOpen(true); }}
                                className="font-bold text-sm text-[var(--color-text)] hover:text-blue-400 cursor-pointer truncate"
                              >
                                {lead.name}
                              </span>
                              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1", src.colorClass)}>
                                <SrcIcon size={10} />
                                {src.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--color-text-muted)] font-mono">{lead.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-[11px]">
                          <span className="font-mono font-bold text-emerald-400">{formatCurrency(lead.dealValue)}</span>
                          <span className="flex items-center gap-1 text-amber-400 font-bold">
                            <Flame size={12} /> {lead.aiScore}/100
                          </span>
                          <span className="text-[var(--color-text-muted)] font-mono">{lead.daysInStage}d in stage</span>

                          {/* Quick Advance Stage Dropdown */}
                          <select
                            value={lead.stage}
                            onChange={(e) => handleUpdateStage(lead.id, e.target.value)}
                            className="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-[11px] font-semibold rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                          >
                            {STAGES.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                          </select>

                          {/* Action Links */}
                          <div className="flex items-center gap-1">
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                            >
                              <Phone size={12} />
                            </a>
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            >
                              <MessageSquare size={12} />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {stageLeads.length === 0 && (
                    <div className="p-4 text-center text-xs text-[var(--color-text-muted)] italic">
                      No leads currently in this stage.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Slide-over Detail Drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-[var(--color-bg-elevated)] border-l border-[var(--color-border)] shadow-2xl z-50 flex flex-col text-xs"
            >
              <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between shrink-0">
                <h2 className="font-bold text-sm text-[var(--color-text)]">Lead Intelligence & History</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"><X size={18} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div>
                  <h3 className="text-xl font-extrabold text-[var(--color-text)]">{selectedLead.name}</h3>
                  <p className="text-xs text-blue-400 font-mono mt-0.5">{selectedLead.phone}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
                  <div>
                    <span className="text-[10px] text-[var(--color-text-muted)] block">Deal Value</span>
                    <span className="font-mono font-bold text-sm text-emerald-400">{formatCurrency(selectedLead.dealValue)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--color-text-muted)] block">AI Score</span>
                    <span className="font-mono font-bold text-sm text-amber-400">{selectedLead.aiScore}/100</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">AI Summary</span>
                  <p className="text-[11px] text-[var(--color-text)] leading-relaxed">{selectedLead.summary}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Advance Stage</span>
                  <div className="flex flex-wrap gap-1.5">
                    {STAGES.filter(s => s.slug !== selectedLead.stage).map(stage => (
                      <button
                        key={stage.slug}
                        onClick={() => handleUpdateStage(selectedLead.id, stage.slug)}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:border-blue-500"
                      >
                        Move to {stage.name}
                      </button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-3xl w-full max-w-md shadow-2xl p-6 text-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="text-base font-bold text-[var(--color-text)]">Add Automated Lead</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--color-text-muted)]"><X size={18} /></button>
              </div>

              <form onSubmit={handleCreateLead} className="space-y-3">
                <div>
                  <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Lead Name *</label>
                  <input required type="text" value={newLead.name || ''} onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Phone Number *</label>
                  <input required type="text" value={newLead.phone || ''} onChange={e => setNewLead({...newLead, phone: e.target.value})} className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Deal Value (₹)</label>
                  <input type="number" value={newLead.dealValue || ''} onChange={e => setNewLead({...newLead, dealValue: Number(e.target.value)})} className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Channel Source</label>
                  <select value={newLead.channel} onChange={e => setNewLead({...newLead, channel: e.target.value as Lead['channel']})} className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    {(Object.keys(SOURCE_ICONS) as Lead['channel'][]).map(k => <option key={k} value={k}>{SOURCE_ICONS[k].label}</option>)}
                  </select>
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25">Save Lead</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
