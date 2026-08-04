'use client';

import { motion } from 'framer-motion';
import { Workflow, Phone, MessageCircle, Calendar, UserPlus, Star, Bell, ChevronRight, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const workflows = [
  { id: '1', name: 'Missed Call Recovery', description: 'When a call is missed → Create lead → Send WhatsApp → Notify staff → Schedule follow-up', trigger: 'Call Missed', actions: 4, isActive: true, lastRun: '5 min ago', runs24h: 12, icon: Phone },
  { id: '2', name: 'Appointment Confirmation', description: 'When appointment is booked → Send WhatsApp confirmation → Notify staff → Add to calendar', trigger: 'Appointment Created', actions: 3, isActive: true, lastRun: '12 min ago', runs24h: 8, icon: Calendar },
  { id: '3', name: 'New Lead Nurture', description: 'When new lead is created → Qualify via AI → Assign owner → Send welcome message → Create task', trigger: 'Lead Created', actions: 4, isActive: true, lastRun: '1h ago', runs24h: 15, icon: UserPlus },
  { id: '4', name: 'Appointment Reminder (-24h)', description: 'Send WhatsApp reminder 24 hours before appointment → Check response → Update status', trigger: 'Scheduled (Cron)', actions: 3, isActive: true, lastRun: '2h ago', runs24h: 6, icon: Bell },
  { id: '5', name: 'Post-Visit Review Request', description: 'After appointment completion → Wait 2 hours → Send review request via WhatsApp', trigger: 'Appointment Completed', actions: 2, isActive: true, lastRun: '4h ago', runs24h: 3, icon: Star },
  { id: '6', name: 'Lead Re-engagement (7d)', description: 'When lead is inactive for 7 days → Send check-in WhatsApp → Notify owner → Update CRM', trigger: 'Scheduled (Cron)', actions: 3, isActive: false, lastRun: '2d ago', runs24h: 0, icon: MessageCircle },
  { id: '7', name: 'Post-Call Processing', description: 'When call ends → Save transcript → Update customer memory → Update CRM → Log analytics', trigger: 'Call Ended', actions: 4, isActive: true, lastRun: '8 min ago', runs24h: 35, icon: Zap },
];

export default function AutomationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Automations</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">AI-powered workflow automation engine (n8n)</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-400" />{workflows.filter(w => w.isActive).length} active</span>
          <span>·</span>
          <span>{workflows.reduce((s, w) => s + w.runs24h, 0)} runs in 24h</span>
        </div>
      </div>

      <div className="grid gap-3">
        {workflows.map((wf, i) => (
          <motion.div key={wf.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={cn("p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-xl hover:bg-[var(--color-glass-hover)] transition-all cursor-pointer group", !wf.isActive && "opacity-60")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-[var(--color-surface)]">
                  <wf.icon size={18} className="text-[var(--color-primary-light)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm text-[var(--color-text)]">{wf.name}</h3>
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]">{wf.actions} actions</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">{wf.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[var(--color-text-muted)]">
                    <span>Trigger: {wf.trigger}</span>
                    <span>Last run: {wf.lastRun}</span>
                    <span>{wf.runs24h} runs in 24h</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn("w-9 h-5 rounded-full transition-colors relative cursor-pointer", wf.isActive ? "bg-[var(--color-primary)]" : "bg-[var(--color-bg-tertiary)]")}>
                  <div className={cn("w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all", wf.isActive ? "left-4.5" : "left-0.5")} />
                </div>
                <ChevronRight size={16} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
