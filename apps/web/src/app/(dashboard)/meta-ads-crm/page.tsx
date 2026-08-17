'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNiche } from '@/components/providers/niche-provider';
import { formatCurrency } from '@/lib/utils';
import {
  Megaphone,
  UserPlus,
  Phone,
  Mail,
  MessageCircle,
  Settings,
  MoreVertical,
  X,
  Target,
  CheckCircle2,
  AlertCircle,
  Calendar,
  IndianRupee,
  Activity,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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

const generateMockLeads = (nicheId: string): AdLead[] => {
  const isDental = nicheId === 'dental';
  const isSkin = nicheId === 'skin';
  const isAuto = nicheId === 'auto';
  const isHotel = nicheId === 'hotel';
  
  const campaigns = isDental ? ['Smile Makeover Campaign', 'Teeth Whitening Offer', 'Free Checkup Ad'] :
                    isSkin ? ['Summer Glow Offer', 'Laser Hair Removal Promo', 'Free Consultation Ad'] :
                    isAuto ? ['SUV Test Drive Promo', 'Year-End Bonanza', 'Exchange Offer Campaign'] :
                    isHotel ? ['Weekend Getaway Offer', 'Luxury Suite Promo', 'Wedding Package Ad'] :
                    ['New Year Special', 'Grand Opening Promo', 'Discount Campaign'];

  return [
    { id: 'l1', name: 'Rahul Sharma', phone: '+91 98765 12345', email: 'rahul.s@example.com', campaignName: campaigns[0], adSetName: 'Audience_25_45', source: 'Meta Ads', costPerLead: 145, status: 'New', date: 'Today, 10:30 AM' },
    { id: 'l2', name: 'Priya Patel', phone: '+91 98765 23456', email: 'priya.p@example.com', campaignName: campaigns[1], adSetName: 'Retargeting_V1', source: 'Google Ads', costPerLead: 210, status: 'Contacted', date: 'Today, 09:15 AM' },
    { id: 'l3', name: 'Amit Kumar', phone: '+91 98765 34567', email: 'amit.k@example.com', campaignName: campaigns[2], adSetName: 'Lookalike_1%', source: 'Meta Ads', costPerLead: 130, status: 'New', date: 'Yesterday, 04:45 PM' },
    { id: 'l4', name: 'Neha Gupta', phone: '+91 98765 45678', email: 'neha.g@example.com', campaignName: campaigns[0], adSetName: 'Broad_City', source: 'Meta Ads', costPerLead: 155, status: 'Converted', date: 'Yesterday, 02:20 PM' },
    { id: 'l5', name: 'Vikram Singh', phone: '+91 98765 56789', email: 'vikram.s@example.com', campaignName: campaigns[1], adSetName: 'Search_Intent', source: 'Google Ads', costPerLead: 280, status: 'Lost', date: 'Aug 15, 11:10 AM' },
    { id: 'l6', name: 'Anjali Desai', phone: '+91 98765 67890', email: 'anjali.d@example.com', campaignName: campaigns[2], adSetName: 'Audience_25_45', source: 'Meta Ads', costPerLead: 140, status: 'Contacted', date: 'Aug 15, 09:30 AM' },
    { id: 'l7', name: 'Sanjay Reddy', phone: '+91 98765 78901', email: 'sanjay.r@example.com', campaignName: campaigns[0], adSetName: 'Search_Brand', source: 'Google Ads', costPerLead: 190, status: 'New', date: 'Aug 14, 05:15 PM' },
    { id: 'l8', name: 'Kavita Joshi', phone: '+91 98765 89012', email: 'kavita.j@example.com', campaignName: campaigns[1], adSetName: 'Retargeting_V1', source: 'Meta Ads', costPerLead: 165, status: 'Converted', date: 'Aug 14, 01:45 PM' },
    { id: 'l9', name: 'Ravi Verma', phone: '+91 98765 90123', email: 'ravi.v@example.com', campaignName: campaigns[2], adSetName: 'Lookalike_1%', source: 'Meta Ads', costPerLead: 135, status: 'New', date: 'Aug 13, 03:20 PM' },
    { id: 'l10', name: 'Meera Nair', phone: '+91 98765 01234', email: 'meera.n@example.com', campaignName: campaigns[0], adSetName: 'Broad_City', source: 'Google Ads', costPerLead: 220, status: 'Contacted', date: 'Aug 13, 10:05 AM' },
    { id: 'l11', name: 'Rajesh Khanna', phone: '+91 98764 12345', email: 'rajesh.k@example.com', campaignName: campaigns[1], adSetName: 'Audience_25_45', source: 'Meta Ads', costPerLead: 150, status: 'Lost', date: 'Aug 12, 02:30 PM' },
    { id: 'l12', name: 'Pooja Mishra', phone: '+91 98764 23456', email: 'pooja.m@example.com', campaignName: campaigns[2], adSetName: 'Search_Intent', source: 'Google Ads', costPerLead: 260, status: 'New', date: 'Aug 12, 11:45 AM' },
  ];
};

export default function MetaAdsCrmPage() {
  const { currentNiche } = useNiche();
  const [activeTab, setActiveTab] = useState<'All' | 'Meta' | 'Google'>('All');
  const [selectedLead, setSelectedLead] = useState<AdLead | null>(null);
  const [leads] = useState<AdLead[]>(() => generateMockLeads(currentNiche));
  
  const filteredLeads = leads.filter(lead => {
    if (activeTab === 'Meta') return lead.source === 'Meta Ads';
    if (activeTab === 'Google') return lead.source === 'Google Ads';
    return true;
  });

  const totalLeads = leads.length;
  const avgCpl = leads.reduce((acc, l) => acc + l.costPerLead, 0) / leads.length || 0;
  const converted = leads.filter(l => l.status === 'Converted').length;
  const conversionRate = totalLeads ? Math.round((converted / totalLeads) * 100) : 0;
  const totalSpend = 12600;

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text)] flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl text-blue-400">
              <Megaphone className="w-7 h-7" />
            </div>
            Ad Leads Pipeline
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Manage incoming leads from Meta and Google Ads campaigns
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/settings" className="px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-2 transition-colors text-sm font-medium">
            <Settings size={16} />
            API Setup
          </Link>
          <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all">
            <UserPlus size={16} />
            Import Leads
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-[var(--color-text-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Ad Leads</span>
            <Target size={16} className="text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-text)]">{totalLeads}</div>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">+12% from last month</span>
        </div>

        <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-[var(--color-text-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Avg. Cost Per Lead</span>
            <IndianRupee size={16} className="text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-text)]">{formatCurrency(avgCpl)}</div>
          <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">+₹15 from last month</span>
        </div>

        <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-[var(--color-text-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Conversion Rate</span>
            <Activity size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-text)]">{conversionRate}%</div>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">+2% from last month</span>
        </div>

        <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-[var(--color-text-muted)]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Ad Spend</span>
            <Megaphone size={16} className="text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-[var(--color-text)]">{formatCurrency(totalSpend)}</div>
          <span className="text-xs text-[var(--color-text-muted)] font-semibold flex items-center gap-1">This Month</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex items-center gap-2 p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/50">
          <button
            onClick={() => setActiveTab('All')}
            className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'All' ? "bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm border border-[var(--color-border)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]")}
          >
            All Leads
          </button>
          <button
            onClick={() => setActiveTab('Meta')}
            className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2", activeTab === 'Meta' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm" : "text-[var(--color-text-muted)] hover:text-blue-400")}
          >
            Meta Ads
          </button>
          <button
            onClick={() => setActiveTab('Google')}
            className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2", activeTab === 'Google' ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm" : "text-[var(--color-text-muted)] hover:text-red-400")}
          >
            Google Ads
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-surface)]/30 border-b border-[var(--color-border)] text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Lead Details</th>
                <th className="p-4 font-semibold">Campaign Info</th>
                <th className="p-4 font-semibold">Source</th>
                <th className="p-4 font-semibold">CPL</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className="hover:bg-[var(--color-surface)]/50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedLead(lead)}
                >
                  <td className="p-4">
                    <div className="font-bold text-sm text-[var(--color-text)] group-hover:text-blue-400 transition-colors">{lead.name}</div>
                    <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mt-1">
                      <span className="flex items-center gap-1"><Phone size={10} /> {lead.phone}</span>
                      <span className="flex items-center gap-1"><Mail size={10} /> {lead.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-sm text-[var(--color-text)]">{lead.campaignName}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">{lead.adSetName}</div>
                  </td>
                  <td className="p-4">
                    <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg border", lead.source === 'Meta Ads' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-red-500/10 text-red-400 border-red-500/20")}>
                      {lead.source}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-sm text-[var(--color-text)] font-semibold">{formatCurrency(lead.costPerLead)}</div>
                  </td>
                  <td className="p-4">
                    <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg border", getStatusBadge(lead.status))}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-xs text-[var(--color-text-muted)] font-medium">{lead.date}</div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--color-text-muted)]">
                    No leads found for the selected filter.
                  </td>
                </tr>
              )}
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
                  <h2 className="text-xl font-bold text-[var(--color-text)]">Lead Details</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">Captured via {selectedLead.source}</p>
                </div>
                <button onClick={() => setSelectedLead(null)} className="p-2 rounded-xl hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Lead Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-extrabold text-[var(--color-text)]">{selectedLead.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-md border", getStatusBadge(selectedLead.status))}>
                        {selectedLead.status}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                        <Calendar size={12} /> {selectedLead.date}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {selectedLead.name.charAt(0)}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-4 gap-2">
                  <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 transition-colors text-[var(--color-text)] gap-1">
                    <Phone size={18} />
                    <span className="text-[10px] font-bold">Call</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors text-[var(--color-text)] gap-1">
                    <MessageCircle size={18} />
                    <span className="text-[10px] font-bold">WhatsApp</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400 transition-colors text-[var(--color-text)] gap-1">
                    <Mail size={18} />
                    <span className="text-[10px] font-bold">Email</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-600 border border-blue-500 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-colors gap-1">
                    <ArrowRight size={18} />
                    <span className="text-[10px] font-bold">To CRM</span>
                  </button>
                </div>

                {/* Contact Info */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">Phone</span>
                      <span className="font-mono font-medium text-[var(--color-text)]">{selectedLead.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">Email</span>
                      <span className="font-medium text-[var(--color-text)]">{selectedLead.email}</span>
                    </div>
                  </div>
                </div>

                {/* Campaign Info */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Campaign Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between text-sm">
                      <span className="text-[var(--color-text-muted)] shrink-0">Campaign</span>
                      <span className="font-medium text-[var(--color-text)] text-right">{selectedLead.campaignName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">Ad Set</span>
                      <span className="font-medium text-[var(--color-text)]">{selectedLead.adSetName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">Cost Per Lead</span>
                      <span className="font-mono font-medium text-amber-400">{formatCurrency(selectedLead.costPerLead)}</span>
                    </div>
                  </div>
                </div>

                {/* Form Data */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Form Answers</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-[var(--color-text-muted)] block mb-1">What service are you interested in?</span>
                      <span className="text-sm font-medium text-[var(--color-text)]">Consultation / Assessment</span>
                    </div>
                    <div>
                      <span className="text-xs text-[var(--color-text-muted)] block mb-1">Preferred Time to Call?</span>
                      <span className="text-sm font-medium text-[var(--color-text)]">Morning (9AM - 12PM)</span>
                    </div>
                  </div>
                </div>
                
                {/* Ad Creative Preview Placeholder */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Ad Creative Preview</h4>
                  <div className="aspect-video bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] border-dashed flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                    <Megaphone size={24} className="mb-2 opacity-50" />
                    <span className="text-xs font-medium">Ad preview not available</span>
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
