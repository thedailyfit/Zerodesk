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
  X
} from 'lucide-react';

import type { NicheId } from '@/config/niches/types';

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

interface CampaignItem {
  id: string;
  name: string;
  platform: string;
  spend: string;
  leads: number;
  cpl: number;
  roas: string;
  status: 'ACTIVE' | 'PAUSED';
}

const DEFAULT_CAMPAIGNS_BY_NICHE: Record<NicheId, CampaignItem[]> = {
  skin: [
    { id: 'c-sk-1', name: 'Summer Glow & Laser Hair Promo', platform: 'Meta Ads', spend: '₹42,500', leads: 68, cpl: 145, roas: '4.2x', status: 'ACTIVE' },
    { id: 'c-sk-2', name: 'Search Intent - Dermatologist Near Me', platform: 'Google Ads', spend: '₹28,000', leads: 34, cpl: 210, roas: '3.8x', status: 'ACTIVE' },
    { id: 'c-sk-3', name: 'Retargeting - Acne Scars Consultation', platform: 'Meta Ads', spend: '₹15,200', leads: 28, cpl: 130, roas: '5.1x', status: 'ACTIVE' },
  ],
  dental: [
    { id: 'c-dt-1', name: 'Invisalign Clear Aligners Early Bird', platform: 'Meta Ads', spend: '₹55,000', leads: 42, cpl: 280, roas: '6.4x', status: 'ACTIVE' },
    { id: 'c-dt-2', name: 'Search Intent - Dental Implants Center', platform: 'Google Ads', spend: '₹38,000', leads: 29, cpl: 320, roas: '5.2x', status: 'ACTIVE' },
    { id: 'c-dt-3', name: 'Laser Teeth Whitening Instant Booking', platform: 'Meta Ads', spend: '₹18,500', leads: 35, cpl: 160, roas: '4.1x', status: 'ACTIVE' },
  ],
  spa: [
    { id: 'c-sp-1', name: 'Ayurvedic Monsoon Rejuvenation Retreat', platform: 'Meta Ads', spend: '₹35,000', leads: 54, cpl: 175, roas: '4.8x', status: 'ACTIVE' },
    { id: 'c-sp-2', name: 'Luxury Couple Spa Weekend Getaway', platform: 'Meta Ads', spend: '₹24,000', leads: 38, cpl: 190, roas: '5.5x', status: 'ACTIVE' },
    { id: 'c-sp-3', name: 'Deep Tissue & Stress Relief Therapy', platform: 'Google Ads', spend: '₹16,000', leads: 22, cpl: 220, roas: '3.9x', status: 'ACTIVE' },
  ],
  salon: [
    { id: 'c-sl-1', name: 'Bridal Makeup 2026 Advance Booking', platform: 'Meta Ads', spend: '₹48,000', leads: 62, cpl: 220, roas: '7.1x', status: 'ACTIVE' },
    { id: 'c-sl-2', name: 'Balayage Color & Olaplex Treatment Promo', platform: 'Meta Ads', spend: '₹32,000', leads: 48, cpl: 165, roas: '4.6x', status: 'ACTIVE' },
    { id: 'c-sl-3', name: 'Keratin Smoothening Festive Discount', platform: 'Google Ads', spend: '₹19,500', leads: 31, cpl: 180, roas: '4.0x', status: 'ACTIVE' },
  ],
  realestate: [
    { id: 'c-re-1', name: '3BHK Luxury Gated Villas Launch', platform: 'Meta Ads', spend: '₹1,20,000', leads: 74, cpl: 450, roas: '12.5x', status: 'ACTIVE' },
    { id: 'c-re-2', name: 'High-Yield Commercial Office Spaces', platform: 'Google Ads', spend: '₹85,000', leads: 38, cpl: 620, roas: '9.8x', status: 'ACTIVE' },
    { id: 'c-re-3', name: 'NRI Direct Investment Highway Plots', platform: 'Meta Ads', spend: '₹45,000', leads: 30, cpl: 510, roas: '8.2x', status: 'ACTIVE' },
  ],
  hotel: [
    { id: 'c-ht-1', name: 'Weekend Luxury Suite Staycation Pass', platform: 'Meta Ads', spend: '₹60,000', leads: 82, cpl: 240, roas: '5.8x', status: 'ACTIVE' },
    { id: 'c-ht-2', name: 'Grand Ballroom Wedding & Banquet Leads', platform: 'Google Ads', spend: '₹45,000', leads: 26, cpl: 480, roas: '11.2x', status: 'ACTIVE' },
  ],
};

const DEFAULT_LEADS_BY_NICHE: Record<NicheId, AdLead[]> = {
  skin: [
    { id: 'l-sk-1', name: 'Rahul Sharma', phone: '+91 98765 12345', email: 'rahul.s@example.com', campaignName: 'Summer Glow & Laser Hair Promo', adSetName: 'Audience_25_45', source: 'Meta Ads', costPerLead: 145, status: 'New', date: 'Today, 10:30 AM' },
    { id: 'l-sk-2', name: 'Priya Patel', phone: '+91 98765 23456', email: 'priya.p@example.com', campaignName: 'Search Intent - Dermatologist Near Me', adSetName: 'Retargeting_V1', source: 'Google Ads', costPerLead: 210, status: 'Contacted', date: 'Today, 09:15 AM' },
    { id: 'l-sk-3', name: 'Amit Kumar', phone: '+91 98765 34567', email: 'amit.k@example.com', campaignName: 'Retargeting - Acne Scars Consultation', adSetName: 'Lookalike_1%', source: 'Meta Ads', costPerLead: 130, status: 'New', date: 'Yesterday, 04:45 PM' },
    { id: 'l-sk-4', name: 'Neha Gupta', phone: '+91 98765 45678', email: 'neha.g@example.com', campaignName: 'Summer Glow & Laser Hair Promo', adSetName: 'Broad_City', source: 'Meta Ads', costPerLead: 155, status: 'Converted', date: 'Yesterday, 02:20 PM' },
    { id: 'l-sk-5', name: 'Vikram Singh', phone: '+91 98765 56789', email: 'vikram.s@example.com', campaignName: 'Search Intent - Dermatologist Near Me', adSetName: 'Search_Intent', source: 'Google Ads', costPerLead: 280, status: 'Lost', date: 'Aug 15, 11:10 AM' },
  ],
  dental: [
    { id: 'l-dt-1', name: 'Rohan Mehra', phone: '+91 91234 11111', email: 'rohan.m@example.com', campaignName: 'Invisalign Clear Aligners Early Bird', adSetName: 'Orthodontics_20_35', source: 'Meta Ads', costPerLead: 280, status: 'New', date: 'Today, 10:30 AM' },
    { id: 'l-dt-2', name: 'Deepika Sen', phone: '+91 91234 22222', email: 'deepika.s@example.com', campaignName: 'Search Intent - Dental Implants Center', adSetName: 'Implants_Intent', source: 'Google Ads', costPerLead: 320, status: 'Contacted', date: 'Today, 09:15 AM' },
    { id: 'l-dt-3', name: 'Siddharth Rao', phone: '+91 91234 33333', email: 'siddharth@example.com', campaignName: 'Laser Teeth Whitening Instant Booking', adSetName: 'Cosmetic_Smile', source: 'Meta Ads', costPerLead: 160, status: 'Converted', date: 'Yesterday, 04:45 PM' },
    { id: 'l-dt-4', name: 'Ananya Deshmukh', phone: '+91 91234 44444', email: 'ananya.d@example.com', campaignName: 'Invisalign Clear Aligners Early Bird', adSetName: 'Aligners_Lookalike', source: 'Meta Ads', costPerLead: 290, status: 'New', date: 'Yesterday, 02:20 PM' },
    { id: 'l-dt-5', name: 'Karan Johar', phone: '+91 91234 55555', email: 'karan.j@example.com', campaignName: 'Search Intent - Dental Implants Center', adSetName: 'Implants_Intent', source: 'Google Ads', costPerLead: 340, status: 'Lost', date: 'Aug 15, 11:10 AM' },
  ],
  spa: [
    { id: 'l-sp-1', name: 'Kavita Menon', phone: '+91 99887 11111', email: 'kavita.m@example.com', campaignName: 'Ayurvedic Monsoon Rejuvenation Retreat', adSetName: 'Wellness_Enthusiasts', source: 'Meta Ads', costPerLead: 175, status: 'New', date: 'Today, 10:30 AM' },
    { id: 'l-sp-2', name: 'Aditya Roy', phone: '+91 99887 22222', email: 'aditya.r@example.com', campaignName: 'Luxury Couple Spa Weekend Getaway', adSetName: 'Couples_Anniversary', source: 'Meta Ads', costPerLead: 190, status: 'Contacted', date: 'Today, 09:15 AM' },
    { id: 'l-sp-3', name: 'Tara Sharma', phone: '+91 99887 33333', email: 'tara.s@example.com', campaignName: 'Deep Tissue & Stress Relief Therapy', adSetName: 'Pain_Relief_Search', source: 'Google Ads', costPerLead: 220, status: 'Converted', date: 'Yesterday, 04:45 PM' },
    { id: 'l-sp-4', name: 'Manish Tiwari', phone: '+91 99887 44444', email: 'manish.t@example.com', campaignName: 'Ayurvedic Monsoon Rejuvenation Retreat', adSetName: 'Ayurveda_Lookalike', source: 'Meta Ads', costPerLead: 180, status: 'New', date: 'Yesterday, 02:20 PM' },
  ],
  salon: [
    { id: 'l-sl-1', name: 'Simran Walia', phone: '+91 98123 11111', email: 'simran.w@example.com', campaignName: 'Bridal Makeup 2026 Advance Booking', adSetName: 'Brides_To_Be_2026', source: 'Meta Ads', costPerLead: 220, status: 'New', date: 'Today, 10:30 AM' },
    { id: 'l-sl-2', name: 'Tanvi Shah', phone: '+91 98123 22222', email: 'tanvi.s@example.com', campaignName: 'Balayage Color & Olaplex Treatment Promo', adSetName: 'Hair_Color_Trend', source: 'Meta Ads', costPerLead: 165, status: 'Contacted', date: 'Today, 09:15 AM' },
    { id: 'l-sl-3', name: 'Varun Grover', phone: '+91 98123 33333', email: 'varun.g@example.com', campaignName: 'Keratin Smoothening Festive Discount', adSetName: 'Keratin_Search', source: 'Google Ads', costPerLead: 180, status: 'Converted', date: 'Yesterday, 04:45 PM' },
    { id: 'l-sl-4', name: 'Pooja Hegde', phone: '+91 98123 44444', email: 'pooja.h@example.com', campaignName: 'Bridal Makeup 2026 Advance Booking', adSetName: 'Wedding_Lookalike', source: 'Meta Ads', costPerLead: 210, status: 'Contacted', date: 'Yesterday, 02:20 PM' },
  ],
  realestate: [
    { id: 'l-re-1', name: 'Suresh Singhania', phone: '+91 90011 11111', email: 'suresh.s@example.com', campaignName: '3BHK Luxury Gated Villas Launch', adSetName: 'HNIs_RealEstate', source: 'Meta Ads', costPerLead: 450, status: 'New', date: 'Today, 10:30 AM' },
    { id: 'l-re-2', name: 'Alok Goenka', phone: '+91 90011 22222', email: 'alok.g@example.com', campaignName: 'High-Yield Commercial Office Spaces', adSetName: 'Commercial_Investors', source: 'Google Ads', costPerLead: 620, status: 'Contacted', date: 'Today, 09:15 AM' },
    { id: 'l-re-3', name: 'Harsh Vardhan', phone: '+91 90011 33333', email: 'harsh.v@example.com', campaignName: 'NRI Direct Investment Highway Plots', adSetName: 'NRI_Targeting', source: 'Meta Ads', costPerLead: 510, status: 'Converted', date: 'Yesterday, 04:45 PM' },
  ],
  hotel: [
    { id: 'l-ht-1', name: 'Vikramaditya Birla', phone: '+91 97766 11111', email: 'vikram.b@example.com', campaignName: 'Grand Ballroom Wedding & Banquet Leads', adSetName: 'Wedding_Planners', source: 'Google Ads', costPerLead: 480, status: 'New', date: 'Today, 10:30 AM' },
    { id: 'l-ht-2', name: 'Shalini Passi', phone: '+91 97766 22222', email: 'shalini.p@example.com', campaignName: 'Weekend Luxury Suite Staycation Pass', adSetName: 'Staycation_Luxury', source: 'Meta Ads', costPerLead: 240, status: 'Contacted', date: 'Today, 09:15 AM' },
  ],
};

export default function MetaAdsCrmPage() {
  const { currentNiche } = useNiche();
  const [activeTab, setActiveTab] = useState<'All' | 'Meta' | 'Google'>('All');
  const [selectedLead, setSelectedLead] = useState<AdLead | null>(null);
  const [leads, setLeads] = useState<AdLead[]>(() => DEFAULT_LEADS_BY_NICHE[currentNiche] || DEFAULT_LEADS_BY_NICHE.skin);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(() => DEFAULT_CAMPAIGNS_BY_NICHE[currentNiche] || DEFAULT_CAMPAIGNS_BY_NICHE.skin);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`zerodesk_meta_ads_leads_${currentNiche}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLeads(parsed);
          setCampaigns(DEFAULT_CAMPAIGNS_BY_NICHE[currentNiche] || DEFAULT_CAMPAIGNS_BY_NICHE.skin);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load ad leads from localStorage', e);
    }
    setLeads(DEFAULT_LEADS_BY_NICHE[currentNiche] || DEFAULT_LEADS_BY_NICHE.skin);
    setCampaigns(DEFAULT_CAMPAIGNS_BY_NICHE[currentNiche] || DEFAULT_CAMPAIGNS_BY_NICHE.skin);
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
            <span>Ads CRM Management</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API Connected
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-xs mt-0.5">
            Real-time automated lead capture, CPL tracking, and instant WhatsApp/Call dispatch.
          </p>
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
                  â— {camp.status}
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
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 text-center font-bold flex items-center justify-center gap-2"
                  >
                    <Phone size={16} />
                    <span>Direct Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-center font-bold flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp</span>
                  </a>
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
