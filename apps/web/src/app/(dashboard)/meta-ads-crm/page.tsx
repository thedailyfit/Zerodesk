'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNiche } from '@/components/providers/niche-provider';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Megaphone,
  Phone,
  Mail,
  MessageCircle,
  Target,
  Activity,
  TrendingUp,
  Calendar,
  X
} from 'lucide-react';
import Link from 'next/link';

type LeadStatus = 'New' | 'Contacted' | 'Converted' | 'Lost';
type LeadSource = 'Meta Ads' | 'Google Ads';

interface AdLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  campaignName: string;
  adSetName: string;
  source: LeadSource;
  costPerLead: number;
  status: LeadStatus;
  date: string;
}

const CAMPAIGNS = [
  { id: 'c1', name: 'Summer Glow & Laser Promo', platform: 'Meta Ads', spend: '₹42,500', leads: 68, cpl: 145, roas: '4.2x', status: 'ACTIVE' },
  { id: 'c2', name: 'Search Intent - High Intent Derm', platform: 'Google Ads', spend: '₹28,000', leads: 34, cpl: 210, roas: '3.8x', status: 'ACTIVE' },
  { id: 'c3', name: 'Retargeting Lookalike 1%', platform: 'Meta Ads', spend: '₹15,200', leads: 28, cpl: 130, roas: '5.1x', status: 'ACTIVE' },
];

const INITIAL_LEADS: AdLead[] = [
  { id: 'l1', name: 'Rahul Sharma', phone: '+91 98765 12345', email: 'rahul.s@example.com', campaignName: 'Summer Glow & Laser Promo', adSetName: 'Audience_25_45', source: 'Meta Ads', costPerLead: 145, status: 'New', date: 'Today, 10:30 AM' },
  { id: 'l2', name: 'Priya Patel', phone: '+91 98765 23456', email: 'priya.p@example.com', campaignName: 'Search Intent - High Intent Derm', adSetName: 'Retargeting_V1', source: 'Google Ads', costPerLead: 210, status: 'Contacted', date: 'Today, 09:15 AM' },
  { id: 'l3', name: 'Amit Kumar', phone: '+91 98765 34567', email: 'amit.k@example.com', campaignName: 'Retargeting Lookalike 1%', adSetName: 'Lookalike_1%', source: 'Meta Ads', costPerLead: 130, status: 'New', date: 'Yesterday, 04:45 PM' },
  { id: 'l4', name: 'Neha Gupta', phone: '+91 98765 45678', email: 'neha.g@example.com', campaignName: 'Summer Glow & Laser Promo', adSetName: 'Broad_City', source: 'Meta Ads', costPerLead: 155, status: 'Converted', date: 'Yesterday, 02:20 PM' },
  { id: 'l5', name: 'Vikram Singh', phone: '+91 98765 56789', email: 'vikram.s@example.com', campaignName: 'Search Intent - High Intent Derm', adSetName: 'Search_Intent', source: 'Google Ads', costPerLead: 280, status: 'Lost', date: 'Aug 15, 11:10 AM' },
  { id: 'l6', name: 'Anjali Desai', phone: '+91 98765 67890', email: 'anjali.d@example.com', campaignName: 'Retargeting Lookalike 1%', adSetName: 'Audience_25_45', source: 'Meta Ads', costPerLead: 140, status: 'Contacted', date: 'Aug 15, 09:30 AM' },
  { id: 'l7', name: 'Sanjay Reddy', phone: '+91 98765 78901', email: 'sanjay.r@example.com', campaignName: 'Search Intent - High Intent Derm', adSetName: 'Search_Brand', source: 'Google Ads', costPerLead: 190, status: 'New', date: 'Aug 14, 05:15 PM' },
  { id: 'l8', name: 'Kavita Joshi', phone: '+91 98765 89012', email: 'kavita.j@example.com', campaignName: 'Summer Glow & Laser Promo', adSetName: 'Retargeting_V1', source: 'Meta Ads', costPerLead: 165, status: 'Converted', date: 'Aug 14, 01:45 PM' },
];

export default function MetaAdsCrmPage() {
  const { currentNiche } = useNiche();
  const [activeTab, setActiveTab] = useState<'All' | 'Meta' | 'Google'>('All');
  const [selectedLead, setSelectedLead] = useState<AdLead | null>(null);
  const [leads, setLeads] = useState<AdLead[]>(INITIAL_LEADS);
  const [campaigns] = useState(CAMPAIGNS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`zerodesk_meta_ads_leads_${currentNiche}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLeads(parsed);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load ad leads from localStorage', e);
    }
    setLeads(INITIAL_LEADS);
  }, [currentNiche]);

  const saveLeads = (updated: AdLead[]) => {
    setLeads(updated);
    try {
      localStorage.setItem(`zerodesk_meta_ads_leads_${currentNiche}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save ad leads to localStorage', e);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (activeTab === 'Meta') return lead.source === 'Meta Ads';
    if (activeTab === 'Google') return lead.source === 'Google Ads';
    return true;
  });

  const totalLeads = leads.length;
  const avgCpl = leads.reduce((acc, l) => acc + l.costPerLead, 0) / leads.length || 0;
  const converted = leads.filter(l => l.status === 'Converted').length;
  const conversionRate = totalLeads ? Math.round((converted / totalLeads) * 100) : 0;
  const totalSpend = 85700;

  const handleUpdateStatus = (leadId: string, newStatus: LeadStatus) => {
    const updated = leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l);
    saveLeads(updated);
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch(status) {
      case 'New': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Contacted': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Converted': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Lost': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-2xl">
              <Megaphone size={22} />
            </div>
            <span>Meta & Google Ads CRM</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API Connected
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-xs mt-0.5">
            Real-time automated lead capture, CPL tracking, and instant WhatsApp/Call dispatch.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/appointments" 
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all"
          >
            <Calendar size={14} />
            <span>Book to Calendar</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[var(--color-text-muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Ad Leads</span>
            <Target size={16} className="text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-text)] font-mono">{totalLeads}</div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">+14% this week</span>
        </div>

        <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[var(--color-text-muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg. Cost Per Lead</span>
            <span className="text-xs font-bold text-amber-400">₹</span>
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-text)] font-mono">{formatCurrency(avgCpl)}</div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">Optimal CPL</span>
        </div>

        <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[var(--color-text-muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Conversion Rate</span>
            <Activity size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-text)] font-mono">{conversionRate}%</div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">Lead to Sitting</span>
        </div>

        <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[var(--color-text-muted)]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Ad Spend</span>
            <TrendingUp size={16} className="text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-text)] font-mono">{formatCurrency(totalSpend)}</div>
          <span className="text-[10px] text-[var(--color-text-muted)] font-semibold font-mono">ROAS: 4.2x Gross</span>
        </div>
      </div>

      {/* Active Campaigns Row */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
          Active Ad Campaigns ({campaigns.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campaigns.map((camp) => (
            <div key={camp.id} className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2.5 shadow-sm">
              <div className="flex items-start justify-between">
                <span className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-bold border",
                  camp.platform === 'Meta Ads' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                )}>
                  {camp.platform}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  ● {camp.status}
                </span>
              </div>
              <h3 className="font-bold text-sm text-[var(--color-text)] truncate">{camp.name}</h3>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--color-border)]/60 text-xs">
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] block">Spend</span>
                  <span className="font-mono font-bold text-[var(--color-text)]">{camp.spend}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] block">Leads</span>
                  <span className="font-mono font-bold text-blue-400">{camp.leads}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted)] block">ROAS</span>
                  <span className="font-mono font-bold text-emerald-400">{camp.roas}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/50">
          <div className="flex items-center gap-2">
            {(['All', 'Meta', 'Google'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                  activeTab === tab 
                    ? "bg-blue-600 text-white shadow-sm font-bold" 
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                )}
              >
                {tab === 'All' ? 'All Leads' : `${tab} Ads`}
              </button>
            ))}
          </div>

          <span className="text-xs text-[var(--color-text-muted)] font-mono">
            Showing {filteredLeads.length} leads
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--color-surface)]/30 border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase tracking-wider text-[10px] font-bold">
                <th className="p-4">Lead Details</th>
                <th className="p-4">Campaign Info</th>
                <th className="p-4">Channel</th>
                <th className="p-4">CPL</th>
                <th className="p-4">Status & Pipeline</th>
                <th className="p-4 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className="hover:bg-[var(--color-surface)]/50 transition-colors group"
                >
                  <td className="p-4">
                    <div 
                      onClick={() => setSelectedLead(lead)} 
                      className="font-bold text-sm text-[var(--color-text)] group-hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {lead.name}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mt-0.5">
                      <span className="flex items-center gap-1 font-mono"><Phone size={10} /> {lead.phone}</span>
                      <span className="flex items-center gap-1"><Mail size={10} /> {lead.email}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="font-semibold text-xs text-[var(--color-text)]">{lead.campaignName}</div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">{lead.adSetName}</div>
                  </td>

                  <td className="p-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-lg border",
                      lead.source === 'Meta Ads' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      {lead.source}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="font-mono text-xs text-[var(--color-text)] font-bold">{formatCurrency(lead.costPerLead)}</div>
                  </td>

                  {/* Status Dropdown directly in row */}
                  <td className="p-4">
                    <select
                      value={lead.status}
                      onChange={(e) => handleUpdateStatus(lead.id, e.target.value as LeadStatus)}
                      className={cn(
                        "text-[11px] font-bold rounded-lg border px-2 py-1 bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer",
                        getStatusBadge(lead.status)
                      )}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Converted">Converted</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </td>

                  {/* Functional Quick Contact Action Buttons */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`tel:${lead.phone}`}
                        title="Voice Call"
                        className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors"
                      >
                        <Phone size={13} />
                      </a>
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        title="WhatsApp AI Chat"
                        className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                      >
                        <MessageCircle size={13} />
                      </a>
                      <a
                        href={`mailto:${lead.email}`}
                        title="Email"
                        className="p-2 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-border)] text-[var(--color-text-muted)] border border-[var(--color-border)] transition-colors"
                      >
                        <Mail size={13} />
                      </a>
                      <Link
                        href="/appointments"
                        title="Book Appointment"
                        className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
                      >
                        <Calendar size={13} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Drawer */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setSelectedLead(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--color-bg-elevated)] border-l border-[var(--color-border)] shadow-2xl z-50 flex flex-col overflow-y-auto"
            >
              <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)]/50 sticky top-0 z-10">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text)]">Ad Lead Profile</h2>
                  <p className="text-xs text-[var(--color-text-muted)]">Source: {selectedLead.source}</p>
                </div>
                <button onClick={() => setSelectedLead(null)} className="p-2 rounded-xl hover:bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-[var(--color-text)]">{selectedLead.name}</h3>
                    <p className="text-xs text-blue-400 font-mono mt-0.5">{selectedLead.phone}</p>
                  </div>
                  <span className={cn("px-2.5 py-0.5 rounded-full font-bold border", getStatusBadge(selectedLead.status))}>
                    {selectedLead.status}
                  </span>
                </div>

                {/* Quick Actions in Drawer */}
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 text-center font-bold flex flex-col items-center gap-1"
                  >
                    <Phone size={16} />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-center font-bold flex flex-col items-center gap-1"
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp</span>
                  </a>
                  <Link
                    href="/appointments"
                    className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 text-center font-bold flex flex-col items-center gap-1 shadow-md"
                  >
                    <Calendar size={16} />
                    <span>Book Slot</span>
                  </Link>
                </div>

                {/* Campaign & CPL info */}
                <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Campaign Attribution</span>
                  <p className="font-bold text-xs text-[var(--color-text)]">{selectedLead.campaignName}</p>
                  <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] pt-1">
                    <span>Ad Set: {selectedLead.adSetName}</span>
                    <span className="font-mono font-bold text-amber-400">CPL: {formatCurrency(selectedLead.costPerLead)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
