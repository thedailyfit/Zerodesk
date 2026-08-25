'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNiche } from '@/components/providers/niche-provider';
import type { NicheId } from '@/config/niches/types';
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
  PhoneOutgoing,
  MessageSquare,
  Image as ImageIcon,
  ChevronRight,
  ArrowRight,
  Check,
  Edit3,
  Trash2,
  Sliders,
  MoreVertical,
  Activity,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Types ---
interface CampaignStat {
  sent: number;
  delivered: number;
  replied: number;
}

interface CampaignItem {
  id: string;
  name: string;
  goal: string;
  channels: string[];
  audienceSize: number;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  createdDate: string;
  stats: CampaignStat;
}

interface WizardStep {
  id: string;
  type: 'TRIGGER' | 'ACTION' | 'DELAY' | 'CONDITION';
  actionType?: 'WHATSAPP' | 'VOICE_CALL';
  label: string;
  config: Record<string, any>;
}

const DEFAULT_OUTBOUND_BY_NICHE: Record<NicheId, CampaignItem[]> = {
  skin: [
    {
      id: 'camp_sk_1',
      name: '90-Day Dormant Client Win-back',
      goal: 'Win-back Dormant Clients',
      channels: ['Voice AI', 'WhatsApp'],
      audienceSize: 250,
      status: 'ACTIVE',
      createdDate: '2026-08-15',
      stats: { sent: 250, delivered: 240, replied: 85 }
    },
    {
      id: 'camp_sk_2',
      name: 'Monsoon Glow Chemical Peel Promo',
      goal: 'Promotional Offer',
      channels: ['WhatsApp'],
      audienceSize: 1200,
      status: 'COMPLETED',
      createdDate: '2026-07-20',
      stats: { sent: 1200, delivered: 1180, replied: 420 }
    }
  ],
  dental: [
    {
      id: 'camp_dt_1',
      name: '6-Month Routine Scaling & Hygiene Recall',
      goal: 'Win-back Dormant Clients',
      channels: ['Voice AI', 'WhatsApp'],
      audienceSize: 340,
      status: 'ACTIVE',
      createdDate: '2026-08-18',
      stats: { sent: 340, delivered: 330, replied: 112 }
    },
    {
      id: 'camp_dt_2',
      name: 'Invisalign Aligners Free 3D Scan Broadcast',
      goal: 'Promotional Offer',
      channels: ['WhatsApp'],
      audienceSize: 850,
      status: 'ACTIVE',
      createdDate: '2026-08-01',
      stats: { sent: 850, delivered: 820, replied: 245 }
    },
    {
      id: 'camp_dt_3',
      name: 'Post-Root Canal Care & Crown Fitting Check',
      goal: 'Post-Treatment Follow-up',
      channels: ['Voice AI'],
      audienceSize: 45,
      status: 'COMPLETED',
      createdDate: '2026-08-10',
      stats: { sent: 45, delivered: 45, replied: 38 }
    }
  ],
  spa: [
    {
      id: 'camp_sp_1',
      name: 'Weekend Couples Sanctuary Re-engagement',
      goal: 'Win-back Dormant Clients',
      channels: ['WhatsApp', 'Voice AI'],
      audienceSize: 180,
      status: 'ACTIVE',
      createdDate: '2026-08-12',
      stats: { sent: 180, delivered: 175, replied: 64 }
    },
    {
      id: 'camp_sp_2',
      name: 'Ayurvedic Monsoon Detox Special',
      goal: 'Promotional Offer',
      channels: ['WhatsApp'],
      audienceSize: 620,
      status: 'ACTIVE',
      createdDate: '2026-08-05',
      stats: { sent: 620, delivered: 605, replied: 190 }
    }
  ],
  salon: [
    {
      id: 'camp_sl_1',
      name: '4-Week Root Touch-up & Keratin Maintenance',
      goal: 'Appointment Reminder',
      channels: ['WhatsApp'],
      audienceSize: 410,
      status: 'ACTIVE',
      createdDate: '2026-08-14',
      stats: { sent: 410, delivered: 395, replied: 156 }
    },
    {
      id: 'camp_sl_2',
      name: 'Bridal Season 2026 Early Bird Makeup Slots',
      goal: 'Promotional Offer',
      channels: ['WhatsApp', 'Voice AI'],
      audienceSize: 950,
      status: 'ACTIVE',
      createdDate: '2026-08-02',
      stats: { sent: 950, delivered: 920, replied: 310 }
    }
  ],
  realestate: [
    {
      id: 'camp_re_1',
      name: 'Ultra-Luxury 4BHK Villa Project Launch Invite',
      goal: 'Promotional Offer',
      channels: ['Voice AI', 'WhatsApp'],
      audienceSize: 500,
      status: 'ACTIVE',
      createdDate: '2026-08-10',
      stats: { sent: 500, delivered: 480, replied: 140 }
    }
  ],
  hotel: [
    {
      id: 'camp_ht_1',
      name: 'Long Weekend Suite Staycation Exclusive',
      goal: 'Promotional Offer',
      channels: ['WhatsApp'],
      audienceSize: 1500,
      status: 'ACTIVE',
      createdDate: '2026-08-08',
      stats: { sent: 1500, delivered: 1460, replied: 380 }
    }
  ]
};

const GOAL_OPTIONS = [
  { id: 'winback', title: 'Win-back Dormant Clients', desc: 'Re-engage customers who have not visited in 3+ months', icon: UserCheck },
  { id: 'reminder', title: 'Appointment Reminder', desc: 'Day-before and same-day reminders to reduce no-shows', icon: Clock },
  { id: 'followup', title: 'Post-Treatment Follow-up', desc: 'Care instructions and feedback collection', icon: Activity },
  { id: 'promo', title: 'Promotional Offer', desc: 'Seasonal offers, new service announcements', icon: Megaphone },
  { id: 'review', title: 'Review & Feedback Collection', desc: 'Automated Google review requests', icon: TrendingUp },
];

const CHANNEL_OPTIONS = [
  { id: 'voice', title: 'Voice AI Call', icon: PhoneOutgoing, desc: 'Human-like conversational voice agent' },
  { id: 'whatsapp', title: 'WhatsApp Message', icon: MessageSquare, desc: 'Rich text and media messages' },
  { id: 'omni', title: 'Omnichannel Sequence', icon: Zap, desc: 'WhatsApp first → Voice call if no reply' },
];

const DEFAULT_SEQUENCE: WizardStep[] = [
  { id: 's1', type: 'TRIGGER', label: 'Audience Selection', config: { source: 'csv' } },
  { id: 's2', type: 'ACTION', actionType: 'WHATSAPP', label: 'First Outreach (WhatsApp)', config: { template: '', image: null } },
  { id: 's3', type: 'DELAY', label: 'Wait Period', config: { duration: '1 day' } },
  { id: 's4', type: 'CONDITION', label: 'If no reply/answer', config: {} },
  { id: 's5', type: 'ACTION', actionType: 'VOICE_CALL', label: 'Follow-up (Voice AI)', config: { script: '' } }
];

export default function OutboundCampaignsPage() {
  const { currentNiche, nicheConfig } = useNiche();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(() => DEFAULT_OUTBOUND_BY_NICHE[currentNiche] || DEFAULT_OUTBOUND_BY_NICHE.skin);

  useEffect(() => {
    setCampaigns(DEFAULT_OUTBOUND_BY_NICHE[currentNiche] || DEFAULT_OUTBOUND_BY_NICHE.skin);
  }, [currentNiche]);

  const [search, setSearch] = useState('');
  
  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1 to 4
  const [newCampaign, setNewCampaign] = useState<{
    name: string;
    goalId: string;
    channelId: string;
    sequence: WizardStep[];
    schedule: { date: string; time: string; traiHours: string };
  }>({
    name: '',
    goalId: '',
    channelId: '',
    sequence: [...DEFAULT_SEQUENCE],
    schedule: { date: '', time: '', traiHours: 'day' }
  });

  const [editingNodeIndex, setEditingNodeIndex] = useState<number | null>(null);

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.goal.toLowerCase().includes(search.toLowerCase())
  );

  const handleLaunch = (status: 'DRAFT' | 'ACTIVE') => {
    const campaign: CampaignItem = {
      id: `camp_\${Date.now()}`,
      name: newCampaign.name || 'Untitled Campaign',
      goal: GOAL_OPTIONS.find(g => g.id === newCampaign.goalId)?.title || 'Custom Campaign',
      channels: newCampaign.channelId === 'omni' ? ['WhatsApp', 'Voice AI'] : [newCampaign.channelId === 'voice' ? 'Voice AI' : 'WhatsApp'],
      audienceSize: 0,
      status,
      createdDate: new Date().toISOString().split('T')[0],
      stats: { sent: 0, delivered: 0, replied: 0 }
    };
    setCampaigns([campaign, ...campaigns]);
    setIsWizardOpen(false);
    setWizardStep(1);
    setNewCampaign({
      name: '', goalId: '', channelId: '', sequence: [...DEFAULT_SEQUENCE], schedule: { date: '', time: '', traiHours: 'day' }
    });
  };

  const renderWizardStep = () => {
    switch(wizardStep) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h3 className="text-lg font-bold text-[var(--color-text)]">Step 1: What is the goal of this campaign?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {GOAL_OPTIONS.map(goal => {
                const Icon = goal.icon;
                const isSelected = newCampaign.goalId === goal.id;
                return (
                  <div 
                    key={goal.id} 
                    onClick={() => setNewCampaign({ ...newCampaign, goalId: goal.id, name: newCampaign.name || goal.title })}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all",
                      isSelected ? "border-blue-500 bg-blue-500/10" : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-blue-500/50"
                    )}
                  >
                    <Icon className={isSelected ? "text-blue-400" : "text-[var(--color-text-muted)]"} size={24} />
                    <h4 className="font-bold text-[var(--color-text)] mt-3">{goal.title}</h4>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{goal.desc}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h3 className="text-lg font-bold text-[var(--color-text)]">Step 2: Select Outreach Channels</h3>
            <div className="grid grid-cols-1 gap-4 mt-4">
              {CHANNEL_OPTIONS.map(channel => {
                const Icon = channel.icon;
                const isSelected = newCampaign.channelId === channel.id;
                return (
                  <div 
                    key={channel.id} 
                    onClick={() => {
                      let newSeq = [...DEFAULT_SEQUENCE];
                      if (channel.id === 'whatsapp') {
                        newSeq = [
                          { id: 's1', type: 'TRIGGER', label: 'Audience Selection', config: { source: 'csv' } },
                          { id: 's2', type: 'ACTION', actionType: 'WHATSAPP', label: 'Send WhatsApp Blast', config: { template: '', image: null } }
                        ];
                      } else if (channel.id === 'voice') {
                        newSeq = [
                          { id: 's1', type: 'TRIGGER', label: 'Audience Selection', config: { source: 'csv' } },
                          { id: 's2', type: 'ACTION', actionType: 'VOICE_CALL', label: 'Voice AI Blast', config: { script: '' } }
                        ];
                      }
                      setNewCampaign({ ...newCampaign, channelId: channel.id, sequence: newSeq });
                    }}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4",
                      isSelected ? "border-blue-500 bg-blue-500/10" : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-blue-500/50"
                    )}
                  >
                    <div className={cn("p-3 rounded-xl", isSelected ? "bg-blue-500/20 text-blue-400" : "bg-slate-800 text-slate-400")}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--color-text)]">{channel.title}</h4>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{channel.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-6">Step 3: Build Outreach Sequence</h3>
              <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:to-emerald-500">
                {newCampaign.sequence.map((node, idx) => (
                  <div key={node.id} className="relative">
                    <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full border-2 border-blue-500 bg-slate-950 z-10" />
                    <div 
                      onClick={() => setEditingNodeIndex(idx)}
                      className={cn(
                        "p-4 rounded-xl border cursor-pointer transition-all bg-[var(--color-surface)]",
                        editingNodeIndex === idx ? "border-blue-500 ring-2 ring-blue-500/20" : "border-[var(--color-border)] hover:border-blue-500/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">{node.type}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">Step {idx + 1}</span>
                      </div>
                      <h4 className="font-bold text-sm text-[var(--color-text)] mt-1">{node.label}</h4>
                      
                      {node.type === 'TRIGGER' && <p className="text-xs text-[var(--color-text-muted)] mt-1">Source: {node.config.source === 'csv' ? 'CSV Upload' : 'CRM Segment'}</p>}
                      {node.type === 'ACTION' && node.actionType === 'WHATSAPP' && <p className="text-xs text-[var(--color-text-muted)] mt-1">Template: {node.config.template || 'Not selected'}</p>}
                      {node.type === 'ACTION' && node.actionType === 'VOICE_CALL' && <p className="text-xs text-[var(--color-text-muted)] mt-1">{node.config.script ? 'Script configured' : 'No script configured'}</p>}
                      {node.type === 'DELAY' && <p className="text-xs text-[var(--color-text-muted)] mt-1">Wait: {node.config.duration}</p>}
                    </div>

                    {idx < newCampaign.sequence.length - 1 && (
                      <div className="flex justify-center my-2 -ml-6">
                        <button 
                          onClick={() => {
                            const newSeq = [...newCampaign.sequence];
                            newSeq.splice(idx + 1, 0, { id: `n_${Date.now()}`, type: 'ACTION', actionType: 'WHATSAPP', label: 'New Action', config: {} });
                            setNewCampaign({ ...newCampaign, sequence: newSeq });
                          }}
                          className="w-6 h-6 rounded-full bg-[var(--color-surface)] border border-blue-500 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Node Config Panel */}
            {editingNodeIndex !== null && (
              <div className="w-full md:w-80 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 shrink-0 h-fit">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                  <h4 className="font-bold text-[var(--color-text)]">Configure Node</h4>
                  <button onClick={() => setEditingNodeIndex(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"><X size={16} /></button>
                </div>
                
                {(() => {
                  const node = newCampaign.sequence[editingNodeIndex];
                  const updateNode = (updates: any) => {
                    const newSeq = [...newCampaign.sequence];
                    newSeq[editingNodeIndex] = { ...node, ...updates, config: { ...node.config, ...(updates.config || {}) } };
                    setNewCampaign({ ...newCampaign, sequence: newSeq });
                  };

                  if (node.type === 'TRIGGER') {
                    return (
                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-[var(--color-text)]">Audience Source</label>
                        <select 
                          value={node.config.source} 
                          onChange={(e) => updateNode({ config: { source: e.target.value } })}
                          className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] focus:border-blue-500"
                        >
                          <option value="csv">Upload CSV File</option>
                          <option value="crm">Select CRM Segment</option>
                        </select>
                        {node.config.source === 'csv' && (
                          <div className="p-4 border-2 border-dashed border-[var(--color-border)] rounded-lg text-center cursor-pointer hover:border-blue-500">
                            <Upload className="mx-auto text-[var(--color-text-muted)] mb-2" size={20} />
                            <span className="text-xs text-[var(--color-text)]">Click to upload audience CSV</span>
                          </div>
                        )}
                        {node.config.source === 'crm' && (
                          <select className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] focus:border-blue-500">
                            <option>All Past 90 Days No-Shows</option>
                            <option>VIP Clients</option>
                          </select>
                        )}
                      </div>
                    );
                  }

                  if (node.type === 'ACTION' && node.actionType === 'WHATSAPP') {
                    return (
                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-[var(--color-text)]">Message Template</label>
                        <select 
                          value={node.config.template}
                          onChange={(e) => updateNode({ config: { template: e.target.value } })}
                          className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] focus:border-blue-500"
                        >
                          <option value="">-- Select Template --</option>
                          {nicheConfig?.templates?.filter((t:any) => t.channel === 'whatsapp').map((t:any) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        
                        <label className="block text-xs font-semibold text-[var(--color-text)] mt-4">Promotional Image (Optional)</label>
                        <div className="p-4 border-2 border-dashed border-[var(--color-border)] rounded-lg text-center cursor-pointer hover:border-blue-500 bg-[var(--color-bg)]">
                          <ImageIcon className="mx-auto text-[var(--color-text-muted)] mb-2" size={20} />
                          <span className="text-xs text-[var(--color-text)]">Upload Image (1080x1080px)</span>
                        </div>
                      </div>
                    );
                  }

                  if (node.type === 'ACTION' && node.actionType === 'VOICE_CALL') {
                    return (
                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-[var(--color-text)]">Agent Script / Prompt</label>
                        <textarea 
                          rows={5}
                          value={node.config.script || ''}
                          onChange={(e) => updateNode({ config: { script: e.target.value } })}
                          placeholder="You are an AI assistant calling on behalf of..."
                          className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] focus:border-blue-500"
                        />
                      </div>
                    );
                  }

                  if (node.type === 'DELAY') {
                    return (
                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-[var(--color-text)]">Wait Duration</label>
                        <select 
                          value={node.config.duration}
                          onChange={(e) => updateNode({ config: { duration: e.target.value } })}
                          className="w-full p-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] focus:border-blue-500"
                        >
                          <option value="1 hour">1 Hour</option>
                          <option value="2 hours">2 Hours</option>
                          <option value="4 hours">4 Hours</option>
                          <option value="1 day">1 Day</option>
                          <option value="2 days">2 Days</option>
                        </select>
                      </div>
                    );
                  }
                  
                  return <div className="text-xs text-slate-500">No configuration needed for this node.</div>;
                })()}
                
                <div className="pt-2">
                  <button 
                    onClick={() => {
                      const newSeq = newCampaign.sequence.filter((_, i) => i !== editingNodeIndex);
                      setNewCampaign({ ...newCampaign, sequence: newSeq });
                      setEditingNodeIndex(null);
                    }}
                    className="w-full py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Remove Step
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h3 className="text-lg font-bold text-[var(--color-text)]">Step 4: Schedule & Launch</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[var(--color-text)]">Campaign Name</label>
                <input 
                  type="text" 
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="e.g. Diwali Mega Promo"
                  className="w-full p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:border-blue-500"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[var(--color-text)]">Start Date & Time</label>
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    value={newCampaign.schedule.date}
                    onChange={(e) => setNewCampaign({ ...newCampaign, schedule: { ...newCampaign.schedule, date: e.target.value } })}
                    className="w-full p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:border-blue-500"
                  />
                  <input 
                    type="time" 
                    value={newCampaign.schedule.time}
                    onChange={(e) => setNewCampaign({ ...newCampaign, schedule: { ...newCampaign.schedule, time: e.target.value } })}
                    className="w-full p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3 sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--color-text)] flex items-center gap-2">
                  TRAI Compliant Calling Hours 
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] rounded-full">Required</span>
                </label>
                <select 
                  value={newCampaign.schedule.traiHours}
                  onChange={(e) => setNewCampaign({ ...newCampaign, schedule: { ...newCampaign.schedule, traiHours: e.target.value } })}
                  className="w-full p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:border-blue-500"
                >
                  <option value="day">10:00 AM to 06:00 PM (Recommended)</option>
                  <option value="evening">04:00 PM to 08:00 PM</option>
                </select>
                <p className="text-xs text-[var(--color-text-muted)]">Voice calls will be automatically paused outside these hours to maintain compliance.</p>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Outbound Campaigns</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Build multi-channel outreach sequences using WhatsApp and Voice AI.
          </p>
        </div>

        <button
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
        >
          <Plus size={18} />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Campaigns List */}
      {!isWizardOpen ? (
        <>
          <div className="bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)] flex items-center gap-2">
            <Search size={18} className="text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none text-sm text-[var(--color-text)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-500/40 transition-colors shadow-sm"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-[var(--color-text)]">{camp.name}</h3>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      camp.status === 'ACTIVE' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      camp.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      camp.status === 'PAUSED' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    )}>
                      {camp.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-1.5"><TrendingUp size={14} /> Goal: {camp.goal}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5"><Activity size={14} /> Channels: {camp.channels.join(', ')}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5"><Users size={14} /> Audience: {camp.audienceSize}</span>
                  </div>
                </div>

                <div className="flex items-center gap-8 md:border-l md:border-[var(--color-border)] md:pl-8">
                  <div className="text-center">
                    <p className="text-xl font-bold text-[var(--color-text)]">{camp.stats.sent}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Sent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-emerald-400">{camp.stats.delivered}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Delivered</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-400">{camp.stats.replied}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Replied</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Campaign Wizard View */
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-6">
            <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
              <Megaphone className="text-blue-500" /> 
              Campaign Builder
            </h2>
            <button onClick={() => setIsWizardOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-2">
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex-1 flex flex-col gap-2">
                <div className={cn(
                  "h-1.5 rounded-full transition-colors",
                  wizardStep >= step ? "bg-blue-500" : "bg-[var(--color-border)]"
                )} />
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  wizardStep >= step ? "text-blue-400" : "text-[var(--color-text-muted)]"
                )}>
                  Step {step}
                </span>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {renderWizardStep()}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--color-border)]">
            <button 
              onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setIsWizardOpen(false)}
              className="px-5 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-sm font-semibold hover:border-[var(--color-text-muted)] transition-colors"
            >
              {wizardStep === 1 ? 'Cancel' : 'Back'}
            </button>
            
            <div className="flex items-center gap-3">
              {wizardStep === 4 && (
                <button 
                  onClick={() => handleLaunch('DRAFT')}
                  className="px-5 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-sm font-semibold hover:border-[var(--color-text-muted)] transition-colors"
                >
                  Save as Draft
                </button>
              )}
              <button 
                onClick={() => {
                  if (wizardStep < 4) {
                    if (wizardStep === 1 && !newCampaign.goalId) return;
                    if (wizardStep === 2 && !newCampaign.channelId) return;
                    setWizardStep(wizardStep + 1);
                  } else {
                    handleLaunch('ACTIVE');
                  }
                }}
                disabled={(wizardStep === 1 && !newCampaign.goalId) || (wizardStep === 2 && !newCampaign.channelId)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {wizardStep === 4 ? 'Launch Campaign' : 'Continue'} 
                {wizardStep < 4 && <ChevronRight size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
