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
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: number;
  isActive: boolean;
  lastRun: string;
  runs24h: number;
  icon: typeof Phone;
}

const INITIAL_WORKFLOWS: WorkflowItem[] = [
  { id: '1', name: 'Missed Call Recovery', description: 'When a call is missed → Create lead → Send WhatsApp → Notify staff → Schedule follow-up', trigger: 'Call Missed', actions: 4, isActive: true, lastRun: '5 min ago', runs24h: 12, icon: Phone },
  { id: '2', name: 'Appointment Confirmation', description: 'When appointment is booked → Send WhatsApp confirmation → Notify staff → Add to calendar', trigger: 'Appointment Created', actions: 3, isActive: true, lastRun: '12 min ago', runs24h: 8, icon: Calendar },
  { id: '3', name: 'New Lead Nurture', description: 'When new lead is created → Qualify via AI → Assign owner → Send welcome message → Create task', trigger: 'Lead Created', actions: 4, isActive: true, lastRun: '1h ago', runs24h: 15, icon: UserPlus },
  { id: '4', name: 'Appointment Reminder (-24h)', description: 'Send WhatsApp reminder 24 hours before appointment → Check response → Update status', trigger: 'Scheduled (Cron)', actions: 3, isActive: true, lastRun: '2h ago', runs24h: 6, icon: Bell },
  { id: '5', name: 'Post-Visit Review Request', description: 'After appointment completion → Wait 2 hours → Send review request via WhatsApp', trigger: 'Appointment Completed', actions: 2, isActive: true, lastRun: '4h ago', runs24h: 3, icon: Star },
  { id: '6', name: 'Lead Re-engagement (7d)', description: 'When lead is inactive for 7 days → Send check-in WhatsApp → Notify owner → Update CRM', trigger: 'Scheduled (Cron)', actions: 3, isActive: false, lastRun: '2d ago', runs24h: 0, icon: MessageCircle },
  { id: '7', name: 'Post-Call Processing', description: 'When call ends → Save transcript → Update customer memory → Update CRM → Log analytics', trigger: 'Call Ended', actions: 4, isActive: true, lastRun: '8 min ago', runs24h: 35, icon: Zap },
];

export default function AutomationsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(INITIAL_WORKFLOWS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal State
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('Call Missed');
  const [description, setDescription] = useState('');

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w));
  };

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const created: WorkflowItem = {
      id: Date.now().toString(),
      name,
      description: description || `When ${trigger} → Trigger automated multi-channel sequence`,
      trigger,
      actions: 3,
      isActive: true,
      lastRun: 'Just now',
      runs24h: 0,
      icon: Zap
    };

    setWorkflows([created, ...workflows]);
    setIsModalOpen(false);
    setName('');
    setDescription('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Workflow Automations</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            AI-powered event triggers and multi-channel background execution workflows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] px-3 py-2 rounded-xl border border-[var(--color-border)]">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <CheckCircle2 size={14} />
              {workflows.filter(w => w.isActive).length} Active Workflows
            </span>
            <span>•</span>
            <span className="font-mono text-purple-300 font-bold">{workflows.reduce((s, w) => s + w.runs24h, 0)} runs in 24h</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shrink-0"
          >
            <Plus size={16} />
            Create Automation
          </button>
        </div>
      </div>

      {/* Workflow List */}
      <div className="grid gap-3">
        {workflows.map((wf, i) => {
          const Icon = wf.icon;
          return (
            <motion.div
              key={wf.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "p-4 rounded-2xl border transition-all flex items-center justify-between group",
                wf.isActive
                  ? "bg-[var(--color-glass)] backdrop-blur border-[var(--color-glass-border)] hover:border-purple-500/40"
                  : "bg-slate-950/40 border-slate-800/60 opacity-60"
              )}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={cn(
                  "p-3 rounded-xl shrink-0 border",
                  wf.isActive ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-slate-800 text-slate-500 border-slate-700"
                )}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-sm text-[var(--color-text)]">{wf.name}</h3>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-[var(--color-bg-tertiary)] text-purple-300 border border-[var(--color-border)]">
                      {wf.actions} actions
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] rounded-full font-semibold border",
                      wf.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      {wf.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 truncate">{wf.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-[var(--color-text-muted)] font-mono">
                    <span>Trigger: <strong className="text-slate-200">{wf.trigger}</strong></span>
                    <span>•</span>
                    <span>Last run: {wf.lastRun}</span>
                    <span>•</span>
                    <span className="text-purple-300">{wf.runs24h} runs today</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-4">
                {/* Active Toggle Switch */}
                <button
                  onClick={() => toggleWorkflow(wf.id)}
                  title={wf.isActive ? "Pause Workflow" : "Enable Workflow"}
                  className={cn(
                    "w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer border",
                    wf.isActive ? "bg-purple-600 border-purple-500" : "bg-slate-800 border-slate-700"
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full bg-white transition-transform shadow-md",
                      wf.isActive ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* New Automation Modal */}
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
                  <Zap size={18} className="text-purple-400" />
                  Create Automation Workflow
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateWorkflow} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Workflow Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. VIP Consultation WhatsApp Trigger"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Trigger Event</label>
                  <select
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    <option value="Call Missed">📞 Call Missed</option>
                    <option value="Appointment Created">📅 Appointment Created</option>
                    <option value="Lead Created">🎯 Lead Created</option>
                    <option value="Appointment Completed">⭐ Appointment Completed</option>
                    <option value="Scheduled (Cron)">⏰ Scheduled (Cron Timer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Description / Sequence Steps</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="When trigger occurs → Send WhatsApp message → Notify Manager on Slack → Create follow-up task"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
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
