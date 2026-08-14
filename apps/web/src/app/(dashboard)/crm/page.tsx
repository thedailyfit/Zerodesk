'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNiche } from '@/components/providers/niche-provider';
import { 
  Plus, 
  MoreHorizontal, 
  X, 
  Target, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Sparkles, 
  ArrowRight, 
  User, 
  DollarSign, 
  ChevronRight, 
  FileText, 
  Send, 
  TrendingUp, 
  Trash2, 
  Edit3, 
  Check, 
  ShieldCheck,
  Building,
  Activity,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export interface LeadActivity {
  id: string;
  type: 'CALL' | 'WHATSAPP' | 'NOTE' | 'STATUS_CHANGE';
  text: string;
  time: string;
  author?: string;
}

export interface LeadItem {
  id: string;
  title: string;
  customer: string;
  phone: string;
  email?: string;
  value: number;
  stageSlug: string;
  source: 'VOICE' | 'WHATSAPP' | 'WEB_CHAT' | 'STORE_VISIT' | 'REFERRAL';
  score: number; // 0-100 AI Lead Quality Score
  daysInStage: number;
  priority: 'VIP' | 'HIGH' | 'MEDIUM' | 'STANDARD';
  assignedTo: string;
  aiSummary: string;
  createdAt: string;
  activities: LeadActivity[];
}

export interface StageItem {
  name: string;
  slug: string;
  color: string;
}

const DEFAULT_STAGES: StageItem[] = [
  { name: 'New Inquiries', slug: 'new', color: '#6366f1' },
  { name: 'Contacted & Qualified', slug: 'contacted', color: '#8b5cf6' },
  { name: 'Consultation / Site Visit', slug: 'qualified', color: '#a855f7' },
  { name: 'Proposal Sent', slug: 'proposal', color: '#d946ef' },
  { name: 'Won & Booked', slug: 'won', color: '#22c55e' },
  { name: 'Lost / Dormant', slug: 'lost', color: '#ef4444' },
];

const SOURCE_ICONS: Record<string, { label: string; icon: any; color: string }> = {
  VOICE: { label: 'Voice AI', icon: Phone, color: 'text-cyan-400' },
  WHATSAPP: { label: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-400' },
  WEB_CHAT: { label: 'Web Chat', icon: Activity, color: 'text-purple-400' },
  STORE_VISIT: { label: 'Walk-In', icon: Building, color: 'text-amber-400' },
  REFERRAL: { label: 'Referral', icon: User, color: 'text-blue-400' },
};

export default function CrmPage() {
  const { currentNiche, nicheConfig } = useNiche();

  const getDefaultLeads = (): LeadItem[] => {
    if (currentNiche === 'realestate') {
      return [
        {
          id: 're_1',
          title: '3BHK Luxury Villa Site Visit',
          customer: 'Vikramaditya Varma',
          phone: '+91 98490 12345',
          email: 'vikram.varma@hyderabad.com',
          value: 28500000,
          stageSlug: 'qualified',
          source: 'VOICE',
          score: 94,
          daysInStage: 1,
          priority: 'VIP',
          assignedTo: 'Suresh Reddy',
          aiSummary: 'Inquired about East-facing 3BHK Gated Villa in Jubilee Hills. Budget approved up to ₹3 Cr. Weekend site visit scheduled.',
          createdAt: 'Aug 13, 2026',
          activities: [
            { id: 'a1', type: 'CALL', text: 'Voice AI inbound call: Captured budget & location preference', time: 'Yesterday 3:15 PM' },
            { id: 'a2', type: 'WHATSAPP', text: 'Brochure + Location coordinates sent via WhatsApp', time: 'Yesterday 3:17 PM' }
          ]
        },
        {
          id: 're_2',
          title: 'Commercial Office Space Inquiry',
          customer: 'Anand Rao (Tech Corp)',
          phone: '+91 97000 88991',
          value: 45000000,
          stageSlug: 'proposal',
          source: 'WHATSAPP',
          score: 88,
          daysInStage: 3,
          priority: 'VIP',
          assignedTo: 'Pooja Agarwal',
          aiSummary: 'Looking for 5,000 sq.ft bare shell office in Hitec City. Sent pricing floor plan proposal.',
          createdAt: 'Aug 11, 2026',
          activities: [
            { id: 'a1', type: 'WHATSAPP', text: 'Floor plans & cost estimation PDF shared', time: 'Aug 11' }
          ]
        },
        {
          id: 're_3',
          title: '2BHK Apartment Investment',
          customer: 'Kavitha Swaminathan',
          phone: '+91 94400 33445',
          value: 8500000,
          stageSlug: 'new',
          source: 'WEB_CHAT',
          score: 65,
          daysInStage: 0,
          priority: 'HIGH',
          assignedTo: 'Frontdesk AI',
          aiSummary: 'Inquired via web widget regarding upcoming launch in Gachibowli.',
          createdAt: 'Today 10:20 AM',
          activities: [
            { id: 'a1', type: 'NOTE', text: 'New inquiry registered from website widget', time: 'Today 10:20 AM' }
          ]
        }
      ];
    }

    if (currentNiche === 'dental') {
      return [
        {
          id: 'de_1',
          title: 'Invisalign Invisible Aligners Package',
          customer: 'Sneha Chawla',
          phone: '+91 98850 44321',
          value: 140000,
          stageSlug: 'qualified',
          score: 92,
          source: 'VOICE',
          daysInStage: 1,
          priority: 'VIP',
          assignedTo: 'Dr. Vivek Sharma',
          aiSummary: 'Called for transparent aligners cost & 3D scan consultation. Scheduled clinical assessment.',
          createdAt: 'Aug 14, 2026',
          activities: [
            { id: 'a1', type: 'CALL', text: 'Voice AI consultation: Scheduled 3D intraoral scan', time: 'Today 11:30 AM' }
          ]
        },
        {
          id: 'de_2',
          title: 'Full Ceramic Crown & Root Canal',
          customer: 'Mahesh Babu',
          phone: '+91 98480 99887',
          value: 38000,
          stageSlug: 'proposal',
          score: 85,
          source: 'WHATSAPP',
          daysInStage: 2,
          priority: 'HIGH',
          assignedTo: 'Dr. Ananya',
          aiSummary: 'Sent treatment estimate for Zirconia crown and laser root canal procedure.',
          createdAt: 'Aug 12, 2026',
          activities: [
            { id: 'a1', type: 'WHATSAPP', text: 'Digital estimate #DE-881 sent with payment link', time: 'Aug 12' }
          ]
        }
      ];
    }

    // Default Skin & Aesthetic Clinic Deals
    return [
      {
        id: 'sk_1',
        title: 'Full Body Diode Laser Package (6 Sessions)',
        customer: 'Sneha Reddy',
        phone: '+91 98490 55432',
        email: 'sneha.reddy@hyderabad.com',
        value: 95000,
        stageSlug: 'qualified',
        source: 'VOICE',
        score: 95,
        daysInStage: 1,
        priority: 'VIP',
        assignedTo: 'Dr. Meenakshi',
        aiSummary: 'Caller requested US-FDA Diode Laser package for full body. Approved budget, scheduled patch test for Saturday 4 PM.',
        createdAt: 'Aug 14, 2026',
        activities: [
          { id: 'a1', type: 'CALL', text: 'Voice AI inbound call: Consultation booked for Saturday', time: 'Today 11:00 AM' },
          { id: 'a2', type: 'WHATSAPP', text: 'Pre-treatment instructions + clinic location sent', time: 'Today 11:02 AM' }
        ]
      },
      {
        id: 'sk_2',
        title: 'GFC & Hair PRP Therapy (4 Sessions)',
        customer: 'Vikramaditya Singh',
        phone: '+91 97000 11223',
        value: 48000,
        stageSlug: 'contacted',
        source: 'WHATSAPP',
        score: 78,
        daysInStage: 2,
        priority: 'HIGH',
        assignedTo: 'Patient Coordinator',
        aiSummary: 'Inquired about hair loss staging and GFC treatment timeline. Sent PDF brochure.',
        createdAt: 'Aug 12, 2026',
        activities: [
          { id: 'a1', type: 'WHATSAPP', text: 'GFC therapy protocol PDF sent via WhatsApp', time: 'Aug 12' }
        ]
      },
      {
        id: 'sk_3',
        title: 'Acne Scar Subcision & Chemical Peel Plan',
        customer: 'Pooja Agarwal',
        phone: '+91 99880 77665',
        value: 32000,
        stageSlug: 'proposal',
        source: 'VOICE',
        score: 88,
        daysInStage: 3,
        priority: 'HIGH',
        assignedTo: 'Dr. Ramesh',
        aiSummary: 'Doctor assessment completed. Sent customized 3-month scar reduction treatment proposal.',
        createdAt: 'Aug 11, 2026',
        activities: [
          { id: 'a1', type: 'NOTE', text: 'Dr. Ramesh evaluated grade 3 scars; recommended peel + subcision', time: 'Aug 11' }
        ]
      },
      {
        id: 'sk_4',
        title: 'HydraFacial Glow & Skin Brightening',
        customer: 'Ananya Iyer',
        phone: '+91 94400 66778',
        value: 12500,
        stageSlug: 'new',
        source: 'WEB_CHAT',
        score: 62,
        daysInStage: 0,
        priority: 'MEDIUM',
        assignedTo: 'Frontdesk Host',
        aiSummary: 'Inquired regarding bridal facial packages for next month wedding.',
        createdAt: 'Today 9:15 AM',
        activities: [
          { id: 'a1', type: 'NOTE', text: 'Registered via web widget bridal form', time: 'Today 9:15 AM' }
        ]
      },
      {
        id: 'sk_5',
        title: 'Annual Aesthetic Maintenance Membership',
        customer: 'Deepak Menon',
        phone: '+91 98850 33441',
        value: 120000,
        stageSlug: 'won',
        source: 'REFERRAL',
        score: 98,
        daysInStage: 0,
        priority: 'VIP',
        assignedTo: 'Clinic Owner',
        aiSummary: 'Enrolled in Annual VIP Aesthetic Program. 1st installment paid.',
        createdAt: 'Aug 10, 2026',
        activities: [
          { id: 'a1', type: 'STATUS_CHANGE', text: 'Deal closed: Invoice #INV-2026-991 generated', time: 'Aug 10' }
        ]
      }
    ];
  };

  const [leads, setLeads] = useState<LeadItem[]>(getDefaultLeads());
  const [stages] = useState<StageItem[]>(DEFAULT_STAGES);
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Lead Profile Drawer State
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // Add Deal Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCustomer, setNewCustomer] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newValue, setNewValue] = useState('35000');
  const [newSource, setNewSource] = useState<LeadItem['source']>('VOICE');
  const [newPriority, setNewPriority] = useState<LeadItem['priority']>('HIGH');
  const [newStage, setNewStage] = useState('new');
  const [newSummary, setNewSummary] = useState('');

  // Niche storage sync
  useEffect(() => {
    const saved = localStorage.getItem(`zerodesk_crm_${currentNiche}`);
    if (saved) {
      try {
        setLeads(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    setLeads(getDefaultLeads());
  }, [currentNiche]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const saveLeads = (updated: LeadItem[]) => {
    setLeads(updated);
    localStorage.setItem(`zerodesk_crm_${currentNiche}`, JSON.stringify(updated));
  };

  // KPIs
  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.stageSlug !== 'lost' ? l.value : 0), 0);
  const activeDealsCount = leads.filter(l => l.stageSlug !== 'won' && l.stageSlug !== 'lost').length;
  const wonDealsCount = leads.filter(l => l.stageSlug === 'won').length;
  const hotLeadsCount = leads.filter(l => l.score >= 85 && l.stageSlug !== 'lost' && l.stageSlug !== 'won').length;

  const filteredLeads = leads.filter(l => {
    if (selectedSource !== 'ALL' && l.source !== selectedSource) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return l.title.toLowerCase().includes(q) || l.customer.toLowerCase().includes(q) || l.phone.includes(q);
    }
    return true;
  });

  const openLeadDrawer = (lead: LeadItem) => {
    setSelectedLead(JSON.parse(JSON.stringify(lead)));
    setIsDrawerOpen(true);
  };

  const handleUpdateLeadStage = (leadId: string, newStageSlug: string) => {
    const updated = leads.map(l => {
      if (l.id === leadId) {
        const stageName = stages.find(s => s.slug === newStageSlug)?.name || newStageSlug;
        const newAct: LeadActivity = {
          id: `act_${Date.now()}`,
          type: 'STATUS_CHANGE',
          text: `Stage updated to "${stageName}"`,
          time: 'Just now',
          author: 'Manager'
        };
        return {
          ...l,
          stageSlug: newStageSlug,
          daysInStage: 0,
          activities: [newAct, ...(l.activities || [])]
        };
      }
      return l;
    });

    saveLeads(updated);
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(updated.find(l => l.id === leadId) || null);
    }
    showToast('Lead stage updated!');
  };

  const handleAddActivityNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newNoteText.trim()) return;

    const newAct: LeadActivity = {
      id: `act_${Date.now()}`,
      type: 'NOTE',
      text: newNoteText.trim(),
      time: 'Just now',
      author: 'Staff'
    };

    const updated = leads.map(l => {
      if (l.id === selectedLead.id) {
        return {
          ...l,
          activities: [newAct, ...(l.activities || [])]
        };
      }
      return l;
    });

    saveLeads(updated);
    setSelectedLead(updated.find(l => l.id === selectedLead.id) || null);
    setNewNoteText('');
    showToast('Note added to timeline');
  };

  const handleDeleteLead = (id: string) => {
    const updated = leads.filter(l => l.id !== id);
    saveLeads(updated);
    setIsDrawerOpen(false);
    showToast('Lead deal removed');
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCustomer.trim()) return;

    const created: LeadItem = {
      id: `lead_${Date.now()}`,
      title: newTitle.trim(),
      customer: newCustomer.trim(),
      phone: newPhone.trim() || '+91 98000 00000',
      value: parseFloat(newValue) || 25000,
      stageSlug: newStage,
      source: newSource,
      score: 75,
      daysInStage: 0,
      priority: newPriority,
      assignedTo: 'Lead Coordinator',
      aiSummary: newSummary.trim() || 'Inbound inquiry captured in CRM.',
      createdAt: 'Just now',
      activities: [
        { id: `act_init`, type: 'NOTE', text: 'Deal registered in CRM pipeline', time: 'Just now' }
      ]
    };

    const updated = [created, ...leads];
    saveLeads(updated);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewCustomer('');
    setNewPhone('');
    setNewSummary('');
    showToast('✨ New deal successfully added to pipeline!');
  };

  const triggerQuickWhatsApp = (lead: LeadItem, e: React.MouseEvent) => {
    e.stopPropagation();
    showToast(`💬 WhatsApp consultation link sent to ${lead.customer}`);
  };

  const triggerQuickCall = (lead: LeadItem, e: React.MouseEvent) => {
    e.stopPropagation();
    showToast(`📞 Voice AI outbound dialer dispatched to ${lead.phone}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 rounded-xl shadow-2xl backdrop-blur-xl text-xs font-semibold"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <span>Lead & Sales Management Pipeline</span>
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-medium">
              AI Scoring Active
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Track inquiries, automate Voice & WhatsApp follow-ups, and convert leads into high-ticket clients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle (Kanban vs. Table) */}
          <div className="flex items-center p-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={cn(
                "p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                viewMode === 'KANBAN'
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              )}
              title="Kanban Pipeline View"
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={cn(
                "p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
                viewMode === 'TABLE'
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              )}
              title="Table List View"
            >
              <List size={15} />
              <span className="hidden sm:inline">List View</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
          >
            <Plus size={16} />
            <span>Add New Deal</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>Total Pipeline Value</span>
            <DollarSign size={16} className="text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">
            {formatCurrency(totalPipelineValue)}
          </p>
          <p className="text-[11px] text-purple-300 mt-1">Across all open stages</p>
        </div>

        <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>Active Deals In-Flight</span>
            <Target size={16} className="text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
            {activeDealsCount} Deals
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Inquiries undergoing follow-up</p>
        </div>

        <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>🔥 Hot High-Intent Leads</span>
            <Flame size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
            {hotLeadsCount} Leads
          </p>
          <p className="text-[11px] text-amber-300/80 mt-1">AI Lead Score &gt;85</p>
        </div>

        <div className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>Closed Won Revenue</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            {wonDealsCount} Won
          </p>
          <p className="text-[11px] text-emerald-300/80 mt-1">Confirmed packages & bookings</p>
        </div>
      </div>

      {/* Search & Channel Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search lead title, customer name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'VOICE', 'WHATSAPP', 'WEB_CHAT', 'STORE_VISIT', 'REFERRAL'].map((src) => (
            <button
              key={src}
              onClick={() => setSelectedSource(src)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-xl border font-medium transition-all",
                selectedSource === src
                  ? "bg-purple-600 text-white border-purple-500 shadow"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
              )}
            >
              {src === 'ALL' ? 'All Channels' : SOURCE_ICONS[src]?.label || src}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW MODE 1: KANBAN BOARD */}
      {viewMode === 'KANBAN' && (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1">
          {stages.map((stage, si) => {
            const stageLeads = filteredLeads.filter(l => l.stageSlug === stage.slug);
            const stageValue = stageLeads.reduce((s, l) => s + l.value, 0);

            return (
              <motion.div
                key={stage.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.05 }}
                className="flex-shrink-0 w-80 space-y-3"
              >
                {/* Column Header */}
                <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <h3 className="text-xs font-bold text-[var(--color-text)]">{stage.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 font-mono font-bold border border-slate-700">
                      {stageLeads.length}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-300">
                    {formatCurrency(stageValue)}
                  </span>
                </div>

                {/* Lead Cards List */}
                <div className="space-y-2.5 min-h-[150px]">
                  {stageLeads.map((lead, li) => {
                    const src = SOURCE_ICONS[lead.source] || SOURCE_ICONS.VOICE;
                    const SrcIcon = src.icon;

                    return (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: si * 0.04 + li * 0.02 }}
                        onClick={() => openLeadDrawer(lead)}
                        className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl hover:border-purple-500/50 hover:shadow-xl transition-all cursor-pointer group space-y-2.5 shadow-sm relative overflow-hidden"
                      >
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className={cn("flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700", src.color)}>
                              <SrcIcon size={11} />
                              {src.label}
                            </span>

                            {lead.priority === 'VIP' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                🌟 VIP
                              </span>
                            )}
                          </div>

                          {/* AI Score Badge */}
                          <div className="flex items-center gap-1">
                            {lead.score >= 85 && <Flame size={12} className="text-amber-400" />}
                            <span className={cn(
                              "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                              lead.score >= 85 ? "bg-emerald-500/20 text-emerald-300" : lead.score >= 60 ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-800 text-slate-400"
                            )}>
                              {lead.score}% AI
                            </span>
                          </div>
                        </div>

                        {/* Title & Customer */}
                        <div>
                          <h4 className="font-bold text-xs text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                            {lead.title}
                          </h4>
                          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 flex items-center justify-between">
                            <span>{lead.customer}</span>
                            <span className="font-mono text-[10px] text-slate-500">{lead.phone}</span>
                          </p>
                        </div>

                        {/* AI Summary Snippet */}
                        {lead.aiSummary && (
                          <p className="text-[10px] text-slate-400 line-clamp-2 bg-slate-950/60 p-2 rounded-lg font-sans leading-relaxed border border-slate-800/80">
                            🤖 {lead.aiSummary}
                          </p>
                        )}

                        {/* Value & Quick Actions Bar */}
                        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] text-xs">
                          <span className="font-mono font-bold text-white text-xs">
                            {formatCurrency(lead.value)}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => triggerQuickWhatsApp(lead, e)}
                              className="p-1.5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors"
                              title="Send WhatsApp DM"
                            >
                              <MessageSquare size={13} />
                            </button>
                            <button
                              onClick={(e) => triggerQuickCall(lead, e)}
                              className="p-1.5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors"
                              title="Trigger Voice AI Dialer"
                            >
                              <Phone size={13} />
                            </button>
                            <div className="p-1 text-slate-500 group-hover:text-purple-400 transition-colors">
                              <ChevronRight size={13} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: HIGH-DENSITY TABLE LIST VIEW */}
      {viewMode === 'TABLE' && (
        <div className="bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-surface)] border-b border-[var(--color-border)] text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                <tr>
                  <th className="p-3.5">Deal Title & Customer</th>
                  <th className="p-3.5">Stage</th>
                  <th className="p-3.5">Deal Value</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">AI Intent Score</th>
                  <th className="p-3.5">Assigned To</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredLeads.map((lead) => {
                  const stage = stages.find(s => s.slug === lead.stageSlug) || stages[0];
                  const src = SOURCE_ICONS[lead.source] || SOURCE_ICONS.VOICE;

                  return (
                    <tr 
                      key={lead.id}
                      onClick={() => openLeadDrawer(lead)}
                      className="hover:bg-slate-900/50 transition-colors cursor-pointer group"
                    >
                      <td className="p-3.5">
                        <div className="font-bold text-[var(--color-text)] group-hover:text-purple-400 transition-colors">
                          {lead.title}
                        </div>
                        <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                          {lead.customer} · <span className="font-mono text-[var(--color-text-muted)]">{lead.phone}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span 
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold border"
                          style={{ borderColor: `${stage.color}40`, backgroundColor: `${stage.color}15`, color: stage.color }}
                        >
                          {stage.name}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono font-bold text-[var(--color-text)]">
                        {formatCurrency(lead.value)}
                      </td>

                      <td className="p-3.5">
                        <span className={cn("font-medium text-[11px]", src.color)}>
                          {src.label}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-xs">
                          {lead.score >= 85 ? (
                            <span className="text-amber-500 flex items-center gap-1">
                              <Flame size={13} /> {lead.score}%
                            </span>
                          ) : (
                            <span className="text-[var(--color-text-muted)]">{lead.score}%</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-[var(--color-text-muted)]">
                        {lead.assignedTo}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={(e) => triggerQuickWhatsApp(lead, e)}
                            className="p-1.5 hover:bg-emerald-500/20 text-[var(--color-text-muted)] hover:text-emerald-500 rounded-lg transition-colors"
                            title="WhatsApp"
                          >
                            <MessageSquare size={13} />
                          </button>
                          <button
                            onClick={(e) => triggerQuickCall(lead, e)}
                            className="p-1.5 hover:bg-cyan-500/20 text-[var(--color-text-muted)] hover:text-cyan-500 rounded-lg transition-colors"
                            title="Call"
                          >
                            <Phone size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INTERACTIVE LEAD PROFILE DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && selectedLead && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="w-full max-w-lg bg-[var(--color-surface)] border-l border-[var(--color-border)] p-6 text-[var(--color-text)] space-y-6 shadow-2xl overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20 uppercase font-mono">
                      Lead Profile & Deal Info
                    </span>
                    <h2 className="text-lg font-bold text-[var(--color-text)] mt-1.5">{selectedLead.title}</h2>
                    <p className="text-xs text-[var(--color-text-muted)]">{selectedLead.customer} · {selectedLead.phone}</p>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface-hover)]"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Deal Value & Stage Advancement */}
                <div className="p-4 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">Deal Value</span>
                      <p className="text-xl font-extrabold text-emerald-500 font-mono">
                        {formatCurrency(selectedLead.value)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold">AI Intent Score</span>
                      <p className="text-xl font-extrabold text-purple-500 font-mono flex items-center gap-1">
                        <Flame size={16} className="text-amber-500" />
                        {selectedLead.score}/100
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text)] mb-1.5">Advance Pipeline Stage</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {stages.map((s) => (
                        <button
                          key={s.slug}
                          type="button"
                          onClick={() => handleUpdateLeadStage(selectedLead.id, s.slug)}
                          className={cn(
                            "px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all truncate",
                            selectedLead.stageSlug === s.slug
                              ? "bg-purple-600 text-white border-purple-400 shadow-md"
                              : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]"
                          )}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Summary Box */}
                {selectedLead.aiSummary && (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1.5">
                    <span className="text-[10px] font-bold text-purple-500 uppercase flex items-center gap-1">
                      <Sparkles size={12} />
                      AI Conversation Key Insights
                    </span>
                    <p className="text-xs text-[var(--color-text)] leading-relaxed font-sans">
                      {selectedLead.aiSummary}
                    </p>
                  </div>
                )}

                {/* Quick Outreach Actions */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={(e) => triggerQuickWhatsApp(selectedLead, e)}
                    className="p-2.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageSquare size={14} />
                    <span>WhatsApp Follow-up</span>
                  </button>
                  <button
                    onClick={(e) => triggerQuickCall(selectedLead, e)}
                    className="p-2.5 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Phone size={14} />
                    <span>Voice AI Call</span>
                  </button>
                </div>

                {/* Activity & Note History Log */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Activity History & Notes</h3>
                  
                  {/* Add Note Form */}
                  <form onSubmit={handleAddActivityNote} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add an internal follow-up note..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow transition-all shrink-0"
                    >
                      <Send size={13} />
                    </button>
                  </form>

                  {/* Activity Timeline List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(selectedLead.activities || []).map((act, i) => (
                      <div key={act.id || i} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="font-semibold text-purple-400">{act.author || 'System'}</span>
                          <span>{act.time}</span>
                        </div>
                        <p className="text-slate-300 text-xs font-sans leading-snug">{act.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteLead(selectedLead.id)}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Delete Deal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE NEW DEAL MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg">
                    <Target size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Add New Deal to Pipeline</h3>
                    <p className="text-[11px] text-slate-400">Capture lead details, estimated value, and initial notes.</p>
                  </div>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateLead} className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Deal Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diode Laser 6-Session Package"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sneha Reddy"
                      value={newCustomer}
                      onChange={(e) => setNewCustomer(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98490 12345"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Deal Value (₹)</label>
                    <input
                      type="number"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Stage</label>
                    <select
                      value={newStage}
                      onChange={(e) => setNewStage(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {stages.map(s => (
                        <option key={s.slug} value={s.slug}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Channel Source</label>
                    <select
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="VOICE">📞 AI Voice</option>
                      <option value="WHATSAPP">💬 WhatsApp</option>
                      <option value="WEB_CHAT">🌐 Web Widget</option>
                      <option value="STORE_VISIT">🏬 Walk-In</option>
                      <option value="REFERRAL">🤝 Referral</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Inquiry / AI Summary</label>
                  <textarea
                    rows={3}
                    placeholder="Brief notes about customer preferences, budget, or preferred time..."
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed font-sans"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg transition-all"
                  >
                    Create Deal
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
