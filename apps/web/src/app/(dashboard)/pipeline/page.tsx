'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target,
  Plus,
  Search,
  Filter,
  Phone,
  MessageCircle,
  Mail,
  Building2,
  DollarSign,
  ChevronRight,
  User,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';

type PipelineStage = 'NEW_LEAD' | 'VISIT_SCHEDULED' | 'VISITED' | 'NEGOTIATION' | 'LEGAL_AGREEMENT' | 'CLOSED_WON';

interface Deal {
  id: string;
  clientName: string;
  phone: string;
  property: string;
  dealValue: number;
  stage: PipelineStage;
  agent: string;
  source: 'Meta Ads' | 'Google Ads' | 'Referral' | 'Walk-in';
  daysInStage: number;
  lastContact: string;
}

const STAGES: { id: PipelineStage; label: string; color: string }[] = [
  { id: 'NEW_LEAD', label: 'New Inquiries', color: 'border-blue-500/40 text-blue-600 dark:text-blue-400' },
  { id: 'VISIT_SCHEDULED', label: 'Site Visit Booked', color: 'border-sky-500/40 text-sky-600 dark:text-sky-400' },
  { id: 'VISITED', label: 'Visited & Interested', color: 'border-indigo-500/40 text-indigo-600 dark:text-indigo-400' },
  { id: 'NEGOTIATION', label: 'Token / Offer Discuss', color: 'border-amber-500/40 text-amber-600 dark:text-amber-400' },
  { id: 'LEGAL_AGREEMENT', label: 'Sale Agreement', color: 'border-blue-500/40 text-blue-600 dark:text-blue-400' },
  { id: 'CLOSED_WON', label: 'Closed & Registered', color: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400' }
];

const INITIAL_DEALS: Deal[] = [
  { id: 'deal-01', clientName: 'Vikram & Ananya Singhal', phone: '+91 98201 55667', property: 'Godrej Horizon 3BHK (Floor 18)', dealValue: 18500000, stage: 'NEW_LEAD', agent: 'Kunal Sharma', source: 'Meta Ads', daysInStage: 1, lastContact: '2 hrs ago' },
  { id: 'deal-02', clientName: 'Rajesh & Kavita Rao', phone: '+91 99401 88990', property: 'Prestige Lavender 4BHK Villa', dealValue: 34000000, stage: 'VISIT_SCHEDULED', agent: 'Neha Kapoor', source: 'Google Ads', daysInStage: 2, lastContact: 'Yesterday' },
  { id: 'deal-03', clientName: 'Amitabh Bansal', phone: '+91 98110 33221', property: 'DLF Crest 3BHK Penthouse', dealValue: 27500000, stage: 'VISITED', agent: 'Kunal Sharma', source: 'Referral', daysInStage: 4, lastContact: '3 days ago' },
  { id: 'deal-04', clientName: 'Dr. Siddharth Verma', phone: '+91 98220 99881', property: 'Oberoi Sky City 3BHK Luxury', dealValue: 22000000, stage: 'NEGOTIATION', agent: 'Neha Kapoor', source: 'Meta Ads', daysInStage: 3, lastContact: '5 hrs ago' },
  { id: 'deal-05', clientName: 'Rohit & Shweta Mehra', phone: '+91 97110 44556', property: 'Brigade Cosmopolis 2BHK', dealValue: 12500000, stage: 'LEGAL_AGREEMENT', agent: 'Sanjay Dutt', source: 'Walk-in', daysInStage: 5, lastContact: 'Yesterday' },
  { id: 'deal-06', clientName: 'Pooja & Sameer Joshi', phone: '+91 98330 11223', property: 'Sobha Dream Acres 3BHK', dealValue: 16000000, stage: 'CLOSED_WON', agent: 'Kunal Sharma', source: 'Google Ads', daysInStage: 12, lastContact: 'Finalized' }
];

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({
    clientName: '',
    phone: '',
    property: '',
    dealValue: '',
    stage: 'NEW_LEAD' as PipelineStage,
    agent: 'Kunal Sharma',
    source: 'Meta Ads' as const
  });

  const moveStage = (dealId: string, direction: 'forward' | 'backward') => {
    setDeals(prev => prev.map(deal => {
      if (deal.id !== dealId) return deal;
      const currentIndex = STAGES.findIndex(s => s.id === deal.stage);
      const nextIndex = direction === 'forward' ? Math.min(currentIndex + 1, STAGES.length - 1) : Math.max(currentIndex - 1, 0);
      return { ...deal, stage: STAGES[nextIndex].id, daysInStage: 0 };
    }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeal.clientName || !newDeal.property || !newDeal.dealValue) return;

    const created: Deal = {
      id: `deal-${Date.now()}`,
      clientName: newDeal.clientName,
      phone: newDeal.phone || '+91 98000 00000',
      property: newDeal.property,
      dealValue: parseFloat(newDeal.dealValue) || 15000000,
      stage: newDeal.stage,
      agent: newDeal.agent,
      source: newDeal.source,
      daysInStage: 0,
      lastContact: 'Just now'
    };

    setDeals([created, ...deals]);
    setIsAddOpen(false);
    setNewDeal({
      clientName: '',
      phone: '',
      property: '',
      dealValue: '',
      stage: 'NEW_LEAD',
      agent: 'Kunal Sharma',
      source: 'Meta Ads'
    });
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || deal.property.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAgent = selectedAgent === 'ALL' || deal.agent === selectedAgent;
    return matchesSearch && matchesAgent;
  });

  const totalPipelineValue = deals.reduce((acc, d) => acc + (d.stage !== 'CLOSED_WON' ? d.dealValue : 0), 0);
  const totalClosedValue = deals.reduce((acc, d) => acc + (d.stage === 'CLOSED_WON' ? d.dealValue : 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
              Real Estate Sales Pipeline
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Kanban Deal Flow
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Track high-ticket property buyers from inquiry to site visits, negotiations, and closed agreements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            + New Property Deal
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Active Pipeline Value</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">₹{(totalPipelineValue / 10000000).toFixed(2)} Cr</p>
          <span className="text-[10px] text-emerald-500 font-semibold">{deals.length} Active Opportunities</span>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Closed Won Revenue</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">₹{(totalClosedValue / 10000000).toFixed(2)} Cr</p>
          <span className="text-[10px] text-emerald-600 font-medium">Registered this month</span>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Avg Deal Ticket</span>
          <p className="text-2xl font-black text-[var(--color-text)] mt-1">₹2.18 Cr</p>
          <span className="text-[10px] text-[var(--color-text-secondary)]">Luxury & 3BHK units</span>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Conversion Win Rate</span>
          <p className="text-2xl font-black text-indigo-500 mt-1">28.5%</p>
          <span className="text-[10px] text-indigo-400">Site visit to token</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search client or property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Sales Agents</option>
            <option value="Kunal Sharma">Kunal Sharma</option>
            <option value="Neha Kapoor">Neha Kapoor</option>
            <option value="Sanjay Dutt">Sanjay Dutt</option>
          </select>
        </div>

        <div className="text-xs text-[var(--color-text-secondary)] font-medium">
          Showing {filteredDeals.length} deals across 6 pipeline stages
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
        {STAGES.map(stage => {
          const stageDeals = filteredDeals.filter(d => d.stage === stage.id);
          const stageTotal = stageDeals.reduce((sum, d) => sum + d.dealValue, 0);

          return (
            <div key={stage.id} className="rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-3 space-y-3 flex flex-col min-h-[500px]">
              {/* Stage Header */}
              <div className="p-2 border-b border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[var(--color-text)] truncate">{stage.label}</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {stageDeals.length}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--color-text-secondary)] font-semibold mt-1">
                  ₹{(stageTotal / 10000000).toFixed(2)} Cr
                </p>
              </div>

              {/* Deal Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageDeals.map(deal => (
                  <div
                    key={deal.id}
                    className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-blue-500/40 transition-all space-y-2.5 shadow-sm"
                  >
                    {/* Buyer & Value */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-bold text-xs text-[var(--color-text)] leading-tight">{deal.clientName}</h5>
                        <span className="text-[10px] text-[var(--color-text-secondary)]">{deal.source}</span>
                      </div>
                      <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                        ₹{(deal.dealValue / 100000).toFixed(0)}L
                      </span>
                    </div>

                    {/* Property */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text)] font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{deal.property}</span>
                    </div>

                    {/* Agent & Days in Stage */}
                    <div className="flex items-center justify-between text-[10px] text-[var(--color-text-secondary)] pt-1 border-t border-[var(--color-border)]">
                      <span>Agent: {deal.agent}</span>
                      <span>{deal.daysInStage}d in stage</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1">
                        <a href={`tel:${deal.phone}`} className="p-1.5 rounded-lg bg-[var(--color-bg-secondary)] hover:text-blue-500 text-[var(--color-text-secondary)] transition-colors">
                          <Phone className="w-3 h-3" />
                        </a>
                        <a href={`https://wa.me/${deal.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-[var(--color-bg-secondary)] hover:text-emerald-500 text-[var(--color-text-secondary)] transition-colors">
                          <MessageCircle className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="flex items-center gap-1">
                        {stage.id !== 'NEW_LEAD' && (
                          <button
                            onClick={() => moveStage(deal.id, 'backward')}
                            className="px-1.5 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                          >
                            ←
                          </button>
                        )}
                        {stage.id !== 'CLOSED_WON' && (
                          <button
                            onClick={() => moveStage(deal.id, 'forward')}
                            className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold"
                          >
                            Next →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div className="p-6 text-center text-[11px] text-[var(--color-text-secondary)] italic border border-dashed border-[var(--color-border)] rounded-xl">
                    No deals in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deal Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-[var(--color-text)]">Create Real Estate Deal</h3>
                </div>
                <button onClick={() => setIsAddOpen(false)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[var(--color-text)]">Buyer / Prospect Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram & Ananya Singhal"
                    value={newDeal.clientName}
                    onChange={(e) => setNewDeal({ ...newDeal, clientName: e.target.value })}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--color-text)]">Phone Number</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98200 00000"
                      value={newDeal.phone}
                      onChange={(e) => setNewDeal({ ...newDeal, phone: e.target.value })}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--color-text)]">Deal Value (₹ INR)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 18500000"
                      value={newDeal.dealValue}
                      onChange={(e) => setNewDeal({ ...newDeal, dealValue: e.target.value })}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[var(--color-text)]">Property Details / Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Godrej Horizon 3BHK Luxury Tower A"
                    value={newDeal.property}
                    onChange={(e) => setNewDeal({ ...newDeal, property: e.target.value })}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--color-text)]">Assigned Sales Agent</label>
                    <select
                      value={newDeal.agent}
                      onChange={(e) => setNewDeal({ ...newDeal, agent: e.target.value })}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    >
                      <option value="Kunal Sharma">Kunal Sharma</option>
                      <option value="Neha Kapoor">Neha Kapoor</option>
                      <option value="Sanjay Dutt">Sanjay Dutt</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[var(--color-text)]">Starting Pipeline Stage</label>
                    <select
                      value={newDeal.stage}
                      onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value as PipelineStage })}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    >
                      {STAGES.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20"
                  >
                    Add Deal to Pipeline
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
