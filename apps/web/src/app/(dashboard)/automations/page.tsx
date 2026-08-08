'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Workflow, 
  Phone, 
  MessageCircle, 
  Calendar, 
  UserPlus, 
  Star, 
  Bell, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Zap,
  Plus,
  X,
  Play,
  ArrowRight,
  Clock,
  PhoneOff,
  Sparkles,
  Layers,
  Filter,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowSequenceStep {
  type: 'TRIGGER' | 'CONDITION' | 'ACTION';
  label: string;
  detail: string;
}

interface WorkflowItem {
  id: string;
  name: string;
  triggerEvent: string;
  description: string;
  steps: WorkflowSequenceStep[];
  actionsCount: number;
  isActive: boolean;
  lastRun: string;
  runs24h: number;
  icon: typeof Phone;
  category: 'Voice AI' | 'WhatsApp' | 'Appointments' | 'Cron Schedule';
}

const PRESET_TEMPLATES = [
  {
    title: 'Missed Call Auto-Recovery (Hyderabad)',
    trigger: '📵 Missed Call Received',
    desc: 'When call is missed → Send Tenglish WhatsApp auto-reply → Notify reception → Add lead to CRM',
    category: 'Voice AI'
  },
  {
    title: 'Post-Call Booking Confirmation + Maps Pin',
    trigger: '🏷️ Post-Call Disposition (BOOKED_APPOINTMENT)',
    desc: 'When call ends with booking → Send WhatsApp confirmation + Jubilee Hills location pin → Create staff task',
    category: 'WhatsApp'
  },
  {
    title: '24h Pre-Peel & Laser Care Guidelines',
    trigger: '⏰ Scheduled (Cron Timer - Daily 5 PM)',
    desc: '24h before appointment → Send SPF & Acid care guidelines via WhatsApp & Email → Check confirmation',
    category: 'Appointments'
  },
  {
    title: '90-Day Diode Laser Touchup Win-back',
    trigger: '⏰ Scheduled (Cron Timer - Monthly)',
    desc: 'If no visit in 90 days → Launch Voice AI Dialer campaign → Offer 20% touchup discount',
    category: 'Cron Schedule'
  }
];

const INITIAL_WORKFLOWS: WorkflowItem[] = [
  {
    id: 'wf_1',
    name: 'Voice AI Missed Call Recovery Sequence',
    triggerEvent: '📵 Missed Call Received',
    description: 'When an inbound call is missed → Trigger Tenglish WhatsApp auto-reply → Create lead in CRM → Notify manager',
    steps: [
      { type: 'TRIGGER', label: 'Trigger: Missed Call', detail: 'Inbound call missed on +91 40 1234 5678' },
      { type: 'CONDITION', label: 'Condition Check', detail: 'If lead is not blacklisted' },
      { type: 'ACTION', label: 'Action 1: WhatsApp DM', detail: 'Send template "w4_missed_call_recovery"' },
      { type: 'ACTION', label: 'Action 2: Staff Alert', detail: 'Push notification to receptionist dashboard' }
    ],
    actionsCount: 4,
    isActive: true,
    lastRun: '4 min ago',
    runs24h: 14,
    icon: PhoneOff,
    category: 'Voice AI'
  },
  {
    id: 'wf_2',
    name: 'Post-Call Appointment Confirmation & Maps Location Pin',
    triggerEvent: '🏷️ Post-Call Disposition (BOOKED_APPOINTMENT)',
    description: 'When Voice AI completes appointment booking → Send WhatsApp confirmation with Google Maps location pin → Add to Doctor Calendar',
    steps: [
      { type: 'TRIGGER', label: 'Trigger: Call Disposition', detail: 'When call disposition == BOOKED_APPOINTMENT' },
      { type: 'ACTION', label: 'Action 1: WhatsApp DM', detail: 'Send template "w5_booking_confirmation_map"' },
      { type: 'ACTION', label: 'Action 2: Calendar Slot', detail: 'Block doctor slot in Doctor Calendar' }
    ],
    actionsCount: 3,
    isActive: true,
    lastRun: '12 min ago',
    runs24h: 22,
    icon: CheckCircle2,
    category: 'Voice AI'
  },
  {
    id: 'wf_3',
    name: '24h Pre-Procedure Skin Prep & SPF Care Guidelines',
    triggerEvent: '⏰ Scheduled (Cron Timer - Daily 5 PM)',
    description: 'Every evening at 5 PM → Scan next day appointments → Send pre-care guidelines (No active acids, apply SPF)',
    steps: [
      { type: 'TRIGGER', label: 'Trigger: Cron Schedule', detail: 'Daily at 17:00 IST' },
      { type: 'CONDITION', label: 'Condition Check', detail: 'If treatment == Diode Laser OR Chemical Peel' },
      { type: 'ACTION', label: 'Action 1: Multi-Channel DM', detail: 'Send WhatsApp + Email Aftercare' }
    ],
    actionsCount: 3,
    isActive: true,
    lastRun: '1h ago',
    runs24h: 8,
    icon: Clock,
    category: 'Appointments'
  },
  {
    id: 'wf_4',
    name: 'Emergency Doctor Escalation Alert',
    triggerEvent: '📞 Voice Call Ended',
    description: 'When Voice AI detects medical emergency or severe post-treatment swelling → Instantly alert senior dermatologist Dr. Meenakshi',
    steps: [
      { type: 'TRIGGER', label: 'Trigger: Call Ended', detail: 'When call disposition == DOCTOR_HANDOFF' },
      { type: 'ACTION', label: 'Action 1: High-Priority Alert', detail: 'SMS & WhatsApp alert to Dr. Meenakshi' }
    ],
    actionsCount: 2,
    isActive: true,
    lastRun: '3h ago',
    runs24h: 2,
    icon: Zap,
    category: 'Voice AI'
  }
];

export default function AutomationsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(INITIAL_WORKFLOWS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal State matching user screenshot
  const [workflowTitle, setWorkflowTitle] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('⏰ Scheduled (Cron Timer)');
  const [conditionFilter, setConditionFilter] = useState('');
  const [sequenceDescription, setSequenceDescription] = useState('When trigger occurs → Send WhatsApp message → Notify Manager on Slack → Create follow-up task');

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w));
  };

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflowTitle.trim()) return;

    const created: WorkflowItem = {
      id: Date.now().toString(),
      name: workflowTitle,
      triggerEvent: triggerEvent,
      description: sequenceDescription || `When ${triggerEvent} → Trigger automated multi-channel sequence`,
      steps: [
        { type: 'TRIGGER', label: `Trigger: ${triggerEvent}`, detail: 'Configured event trigger' },
        { type: 'ACTION', label: 'Action: Sequence Flow', detail: sequenceDescription.slice(0, 45) + '...' }
      ],
      actionsCount: 3,
      isActive: true,
      lastRun: 'Just now',
      runs24h: 0,
      icon: Zap,
      category: 'Voice AI'
    };

    setWorkflows([created, ...workflows]);
    setIsModalOpen(false);
    setWorkflowTitle('');
    setSequenceDescription('When trigger occurs → Send WhatsApp message → Notify Manager on Slack → Create follow-up task');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider border border-purple-500/20">
              Autonomous Sequences
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-mono border border-emerald-500/20">
              Background Automation Engine Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mt-2">Workflow Automations</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Build event-driven automation pipelines connecting Voice AI calls, WhatsApp DMs, Doctor Calendars, and Staff Alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] px-3 py-2 rounded-xl border border-[var(--color-border)] font-mono">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <CheckCircle2 size={14} />
              {workflows.filter(w => w.isActive).length} Active Pipelines
            </span>
            <span>•</span>
            <span className="text-purple-300 font-bold">{workflows.reduce((s, w) => s + w.runs24h, 0)} runs in 24h</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
          >
            <Plus size={18} />
            <span>Create Automation Workflow</span>
          </button>
        </div>
      </div>

      {/* Preset Clinic Templates Bar */}
      <div className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <Sparkles size={14} />
            1-Click Hyderabad Clinic Automation Templates
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">Pre-Configured Best Practices</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => {
                setWorkflowTitle(tmpl.title);
                setTriggerEvent(tmpl.trigger);
                setSequenceDescription(tmpl.desc);
                setIsModalOpen(true);
              }}
              className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-purple-500/50 text-left transition-all group"
            >
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {tmpl.category}
              </span>
              <h3 className="font-bold text-xs text-[var(--color-text)] mt-2 group-hover:text-purple-400 transition-colors">
                {tmpl.title}
              </h3>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1 line-clamp-2">
                {tmpl.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Workflow Sequence List */}
      <div className="space-y-4">
        {workflows.map((wf, i) => {
          const Icon = wf.icon;
          return (
            <motion.div
              key={wf.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "p-5 rounded-2xl border transition-all space-y-4 group shadow-sm",
                wf.isActive
                  ? "bg-[var(--color-glass)] backdrop-blur border-[var(--color-glass-border)] hover:border-purple-500/40"
                  : "bg-slate-950/40 border-slate-800/60 opacity-60"
              )}
            >
              {/* Header Line */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl shrink-0 border",
                    wf.isActive ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-slate-800 text-slate-500 border-slate-700"
                  )}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-base text-[var(--color-text)]">{wf.name}</h3>
                      <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {wf.triggerEvent}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{wf.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <span className="text-xs text-slate-400 font-mono">
                    24h Runs: <strong className="text-emerald-400">{wf.runs24h}</strong>
                  </span>

                  <button
                    onClick={() => toggleWorkflow(wf.id)}
                    className={cn(
                      "px-3 py-1 rounded-xl text-xs font-bold transition-all border",
                      wf.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                    )}
                  >
                    {wf.isActive ? 'Active (ON)' : 'Paused (OFF)'}
                  </button>
                </div>
              </div>

              {/* Visual Sequence Step Builder Nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                {wf.steps.map((step, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] relative space-y-1 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-purple-400 uppercase">{step.type}</span>
                      <span>Step #{idx + 1}</span>
                    </div>
                    <p className="font-bold text-white text-xs">{step.label}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] font-sans">{step.detail}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal: Create Automation Workflow (Refactored to match user screenshot) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0d1117] border border-purple-500/30 rounded-2xl p-6 text-white space-y-5 shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Zap size={20} className="text-purple-400" />
                  <h3 className="font-bold text-lg text-white">Create Automation Workflow</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateWorkflow} className="space-y-4 text-xs">
                {/* Workflow Title */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Workflow Title</label>
                  <input
                    type="text"
                    placeholder="e.g. VIP Consultation WhatsApp Trigger"
                    value={workflowTitle}
                    onChange={(e) => setWorkflowTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Trigger Event */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Trigger Event</label>
                  <select
                    value={triggerEvent}
                    onChange={(e) => setTriggerEvent(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold focus:border-purple-500 focus:outline-none cursor-pointer"
                  >
                    <option value="⏰ Scheduled (Cron Timer)">⏰ Scheduled (Cron Timer)</option>
                    <option value="📞 Voice Call Ended">📞 Voice Call Ended</option>
                    <option value="🏷️ Post-Call Disposition Extracted">🏷️ Post-Call Disposition Extracted (BOOKED_APPOINTMENT)</option>
                    <option value="📵 Missed Call Received">📵 Missed Call Received</option>
                    <option value="💬 WhatsApp Keyword Received">💬 WhatsApp Keyword Received (e.g. "PRICING")</option>
                    <option value="📅 Appointment Created">📅 Appointment Created in Doctor Calendar</option>
                  </select>
                </div>

                {/* Optional Condition Filter */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Condition Filter (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. If Sentiment == ESCALATED or Branch == Jubilee Hills"
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-xs placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Description / Sequence Steps */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Description / Sequence Steps</label>
                  <textarea
                    rows={3}
                    value={sequenceDescription}
                    onChange={(e) => setSequenceDescription(e.target.value)}
                    placeholder="When trigger occurs → Send WhatsApp message → Notify Manager on Slack → Create follow-up task"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-xs placeholder:text-slate-500 focus:border-purple-500 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Modal Footer Actions */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all"
                  >
                    Save & Activate
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
