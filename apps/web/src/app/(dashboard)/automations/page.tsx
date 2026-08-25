"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Plus, Trash2, Edit2, Copy, Save, X, Search,
  MessageSquare, Mail, Phone, Calendar, CheckCircle, Clock,
  FileText, Activity, AlertCircle, RefreshCw, Zap,
  Smartphone, User, CreditCard, Tag, FileSpreadsheet, Star,
  ArrowRight, HeartPulse
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNiche } from '@/components/providers/niche-provider';

// ---------------------------
// TYPES
// ---------------------------

export type StepActionType =
  | 'trigger'
  | 'whatsapp'
  | 'sms'
  | 'email'
  | 'wait'
  | 'task'
  | 'crm_update'
  | 'call'
  | 'survey'
  | 'invoice';

export interface WorkflowStep {
  id: string;
  type: StepActionType;
  label: string;
  details?: string;
  icon?: any;
}

export type CategoryType = 
  | 'Patient Care' 
  | 'Marketing' 
  | 'Appointments' 
  | 'Billing' 
  | 'Voice AI' 
  | 'WhatsApp' 
  | 'Reviews' 
  | 'Operations';

export interface WorkflowItem {
  id: string;
  name: string;
  category: CategoryType;
  active: boolean;
  steps: WorkflowStep[];
  lastRun?: string;
  runCount24h?: number;
  successRate?: number;
}

const ALL_CATEGORIES: ('All' | CategoryType)[] = [
  'All',
  'Patient Care',
  'Marketing',
  'Appointments',
  'Billing',
  'Voice AI',
  'WhatsApp',
  'Reviews',
  'Operations'
];

const CATEGORY_COLORS: Record<CategoryType, string> = {
  'Patient Care': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Marketing': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Appointments': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'Billing': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'Voice AI': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  'WhatsApp': 'bg-green-500/10 text-green-600 border-green-500/20',
  'Reviews': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  'Operations': 'bg-slate-500/10 text-slate-600 border-slate-500/20'
};

const STEP_ICONS: Record<StepActionType, any> = {
  trigger: Zap,
  whatsapp: MessageSquare,
  sms: Smartphone,
  email: Mail,
  wait: Clock,
  task: CheckCircle,
  crm_update: User,
  call: Phone,
  survey: Star,
  invoice: CreditCard
};

const STEP_COLORS: Record<StepActionType, string> = {
  trigger: 'bg-amber-500',
  whatsapp: 'bg-green-500',
  sms: 'bg-blue-400',
  email: 'bg-purple-500',
  wait: 'bg-slate-400',
  task: 'bg-emerald-500',
  crm_update: 'bg-blue-600',
  call: 'bg-cyan-500',
  survey: 'bg-yellow-500',
  invoice: 'bg-indigo-500'
};

// ---------------------------
// DEFAULT TEMPLATES
// ---------------------------
const INITIAL_WORKFLOWS: WorkflowItem[] = [
  {
    id: 'wf_1',
    name: 'New Patient Onboarding',
    category: 'Patient Care',
    active: true,
    lastRun: '10 mins ago',
    runCount24h: 12,
    successRate: 100,
    steps: [
      { id: 's1', type: 'trigger', label: 'New Registration', details: 'Form submitted' },
      { id: 's2', type: 'whatsapp', label: 'WhatsApp Welcome Kit', details: 'Template: welcome_01' },
      { id: 's3', type: 'wait', label: 'Wait 4h', details: 'Delay 4 hours' },
      { id: 's4', type: 'crm_update', label: 'Update CRM Profile', details: 'Set status: Onboarded' }
    ]
  },
  {
    id: 'wf_2',
    name: 'Post-Procedure Aftercare',
    category: 'Patient Care',
    active: false,
    lastRun: '2 hours ago',
    runCount24h: 4,
    successRate: 98,
    steps: [
      { id: 's1', type: 'trigger', label: 'Service Completed', details: 'Status = Done' },
      { id: 's2', type: 'email', label: 'Send Care Guide', details: 'PDF attachment' },
      { id: 's3', type: 'wait', label: 'Wait 24h', details: 'Delay 24 hours' },
      { id: 's4', type: 'whatsapp', label: 'Recovery Check', details: '+ Review Prompt' }
    ]
  },
  {
    id: 'wf_3',
    name: 'Missed Appointment Recovery',
    category: 'Appointments',
    active: true,
    lastRun: '1 hour ago',
    runCount24h: 3,
    successRate: 85,
    steps: [
      { id: 's1', type: 'trigger', label: 'No-Show Status', details: 'Appt missed' },
      { id: 's2', type: 'whatsapp', label: 'WhatsApp Reschedule', details: 'Send scheduling link' },
      { id: 's3', type: 'wait', label: 'Wait 24h', details: 'Delay 1 day' },
      { id: 's4', type: 'task', label: 'Frontdesk Call Task', details: 'Assign to staff' }
    ]
  },
  {
    id: 'wf_4',
    name: 'Missed Call Recovery',
    category: 'Voice AI',
    active: true,
    lastRun: '5 mins ago',
    runCount24h: 22,
    successRate: 95,
    steps: [
      { id: 's1', type: 'trigger', label: 'Missed Call', details: 'Inbound failed' },
      { id: 's2', type: 'whatsapp', label: 'WhatsApp Interactive', details: 'Menu options' },
      { id: 's3', type: 'crm_update', label: 'Log CRM Lead', details: 'Source: Missed Call' }
    ]
  },
  {
    id: 'wf_5',
    name: 'Appointment Confirmation',
    category: 'Appointments',
    active: true,
    lastRun: 'Just now',
    runCount24h: 45,
    successRate: 99,
    steps: [
      { id: 's1', type: 'trigger', label: 'Booking Created', details: 'New appt' },
      { id: 's2', type: 'whatsapp', label: 'WhatsApp Confirmation', details: 'Date/Time details' },
      { id: 's3', type: 'wait', label: 'Wait 1h before appt', details: 'Relative delay' },
      { id: 's4', type: 'sms', label: 'SMS Reminder', details: 'Final nudge' }
    ]
  },
  {
    id: 'wf_6',
    name: 'Birthday & Anniversary Offers',
    category: 'Marketing',
    active: false,
    lastRun: 'Yesterday',
    runCount24h: 8,
    successRate: 100,
    steps: [
      { id: 's1', type: 'trigger', label: 'Birthday Match', details: 'Date matches today' },
      { id: 's2', type: 'whatsapp', label: 'Birthday Offer', details: 'Discount code' },
      { id: 's3', type: 'wait', label: 'Wait 3d', details: 'Delay 3 days' },
      { id: 's4', type: 'sms', label: 'Follow-up DM', details: 'Reminder to claim' }
    ]
  },
  {
    id: 'wf_7',
    name: 'Payment & Invoice Receipt',
    category: 'Billing',
    active: true,
    lastRun: '30 mins ago',
    runCount24h: 18,
    successRate: 100,
    steps: [
      { id: 's1', type: 'trigger', label: 'Payment Received', details: 'Stripe webhook' },
      { id: 's2', type: 'email', label: 'Email Invoice', details: 'PDF attachment' },
      { id: 's3', type: 'whatsapp', label: 'WhatsApp Receipt', details: 'Quick conf' },
      { id: 's4', type: 'invoice', label: 'Update Ledger', details: 'Sync accounting' }
    ]
  },
  {
    id: 'wf_8',
    name: 'Google Review Request',
    category: 'Reviews',
    active: true,
    lastRun: '4 hours ago',
    runCount24h: 15,
    successRate: 75,
    steps: [
      { id: 's1', type: 'trigger', label: 'Appt Completed', details: 'Status = Done' },
      { id: 's2', type: 'wait', label: 'Wait 2h', details: 'Cooldown' },
      { id: 's3', type: 'whatsapp', label: 'WhatsApp Review Link', details: 'Google My Business' },
      { id: 's4', type: 'wait', label: 'Wait 48h', details: 'Delay 2 days' },
      { id: 's5', type: 'sms', label: 'SMS Reminder', details: 'Gentle nudge' }
    ]
  },
  {
    id: 'wf_9',
    name: 'Lead Nurture Drip',
    category: 'Marketing',
    active: false,
    lastRun: '12 hours ago',
    runCount24h: 5,
    successRate: 90,
    steps: [
      { id: 's1', type: 'trigger', label: 'New Lead', details: 'Source: Website' },
      { id: 's2', type: 'email', label: 'Email Welcome', details: 'Intro brand' },
      { id: 's3', type: 'wait', label: 'Wait 2d', details: 'Delay' },
      { id: 's4', type: 'whatsapp', label: 'WhatsApp Offer', details: 'Special deal' },
      { id: 's5', type: 'wait', label: 'Wait 5d', details: 'Delay' },
      { id: 's6', type: 'task', label: 'Call Task', details: 'Assign sales' }
    ]
  },
  {
    id: 'wf_10',
    name: 'Staff Shift Reminder',
    category: 'Operations',
    active: true,
    lastRun: 'Today 7:00 AM',
    runCount24h: 1,
    successRate: 100,
    steps: [
      { id: 's1', type: 'trigger', label: 'Cron Daily 7AM', details: 'Schedule' },
      { id: 's2', type: 'whatsapp', label: 'WhatsApp Roster', details: 'To staff group' },
      { id: 's3', type: 'task', label: 'Log Attendance', details: 'Create record' }
    ]
  },
  {
    id: 'wf_11',
    name: 'Low Stock Alert',
    category: 'Operations',
    active: true,
    lastRun: '2 days ago',
    runCount24h: 0,
    successRate: 100,
    steps: [
      { id: 's1', type: 'trigger', label: 'Inventory Low', details: '< Threshold' },
      { id: 's2', type: 'email', label: 'Manager Alert', details: 'To admin' },
      { id: 's3', type: 'task', label: 'Restock Task', details: 'Order supplies' }
    ]
  },
  {
    id: 'wf_12',
    name: 'VIP Patient Follow-up',
    category: 'Patient Care',
    active: true,
    lastRun: 'Yesterday',
    runCount24h: 2,
    successRate: 100,
    steps: [
      { id: 's1', type: 'trigger', label: 'VIP Tag Applied', details: 'CRM update' },
      { id: 's2', type: 'whatsapp', label: 'Personalized Welcome', details: 'Concierge msg' },
      { id: 's3', type: 'wait', label: 'Wait 7d', details: 'Delay 1 week' },
      { id: 's4', type: 'survey', label: 'Feedback Survey', details: 'NPS' }
    ]
  }
];

// ---------------------------
// INLINE EDITOR COMPONENT
// ---------------------------
function InlineEditor({ 
  workflow, 
  onSave, 
  onCancel 
}: { 
  workflow: WorkflowItem; 
  onSave: (w: WorkflowItem) => void;
  onCancel: () => void;
}) {
  const [localWorkflow, setLocalWorkflow] = useState<WorkflowItem>(JSON.parse(JSON.stringify(workflow)));

  const updateStep = (index: number, key: keyof WorkflowStep, value: any) => {
    const newSteps = [...localWorkflow.steps];
    newSteps[index] = { ...newSteps[index], [key]: value };
    setLocalWorkflow({ ...localWorkflow, steps: newSteps });
  };

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'task',
      label: 'New Task',
      details: ''
    };
    setLocalWorkflow({ ...localWorkflow, steps: [...localWorkflow.steps, newStep] });
  };

  const removeStep = (index: number) => {
    const newSteps = localWorkflow.steps.filter((_, i) => i !== index);
    setLocalWorkflow({ ...localWorkflow, steps: newSteps });
  };

  const moveStep = (index: number, dir: 1 | -1) => {
    if (index + dir < 0 || index + dir >= localWorkflow.steps.length) return;
    const newSteps = [...localWorkflow.steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[index + dir];
    newSteps[index + dir] = temp;
    setLocalWorkflow({ ...localWorkflow, steps: newSteps });
  };

  return (
    <div className="bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] p-4 md:p-6 mt-4 shadow-inner">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-blue-500" />
            Editing Workflow
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Modify steps and actions for this template</p>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={localWorkflow.name}
            onChange={(e) => setLocalWorkflow({ ...localWorkflow, name: e.target.value })}
            className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        {localWorkflow.steps.map((step, idx) => (
          <div key={step.id} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)] relative group">
            <div className="flex flex-col items-center justify-center gap-1 w-6 opacity-50 hover:opacity-100 transition-opacity">
               <button onClick={() => moveStep(idx, -1)} disabled={idx === 0} className="disabled:opacity-20 hover:text-blue-500">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg>
               </button>
               <button onClick={() => moveStep(idx, 1)} disabled={idx === localWorkflow.steps.length - 1} className="disabled:opacity-20 hover:text-blue-500">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
               </button>
            </div>
            
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm", STEP_COLORS[step.type] || 'bg-blue-500')}>
               {React.createElement(STEP_ICONS[step.type] || Zap, { className: "w-5 h-5 text-white" })}
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
              <select 
                value={step.type}
                onChange={(e) => updateStep(idx, 'type', e.target.value as StepActionType)}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] outline-none focus:border-blue-500"
              >
                {Object.keys(STEP_ICONS).map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
              
              <input 
                type="text" 
                value={step.label}
                onChange={(e) => updateStep(idx, 'label', e.target.value)}
                placeholder="Step Label"
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] outline-none focus:border-blue-500"
              />

              <input 
                type="text" 
                value={step.details || ''}
                onChange={(e) => updateStep(idx, 'details', e.target.value)}
                placeholder="Details (Optional)"
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] outline-none focus:border-blue-500"
              />
            </div>

            <button 
              onClick={() => removeStep(idx)}
              className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-auto md:ml-0"
              title="Remove step"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <button 
          onClick={addStep}
          className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Step
        </button>
      </div>

      <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
        <button 
          onClick={onCancel}
          className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface)] hover:bg-[var(--color-border)] border border-[var(--color-border)] rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={() => onSave(localWorkflow)}
          className="flex items-center gap-2 px-6 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors font-medium shadow-sm"
        >
          <Save className="w-4 h-4" />
          Save Workflow
        </button>
      </div>
    </div>
  );
}

// ---------------------------
// MAIN COMPONENT
// ---------------------------
export default function AutomationsPage() {
  const { nicheConfig } = useNiche();
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(INITIAL_WORKFLOWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | CategoryType>('All');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Initialize from local storage or niche config
  useEffect(() => {
    const saved = localStorage.getItem('zd_automations');
    if (saved) {
      try {
        setWorkflows(JSON.parse(saved));
      } catch (e) {
        // use initial
      }
    } else if (nicheConfig?.initialWorkflows) {
      // Basic mapping if niche config exists
      // We'll stick to our initial 12 as default base
      setWorkflows(INITIAL_WORKFLOWS);
    }
  }, [nicheConfig]);

  // Save to local storage whenever workflows change
  useEffect(() => {
    localStorage.setItem('zd_automations', JSON.stringify(workflows));
  }, [workflows]);

  const toggleActive = (id: string) => {
    setWorkflows(wfs => wfs.map(wf => 
      wf.id === id ? { ...wf, active: !wf.active } : wf
    ));
  };

  const deleteWorkflow = (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      setWorkflows(wfs => wfs.filter(wf => wf.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  const duplicateWorkflow = (wf: WorkflowItem) => {
    const newWf = { 
      ...wf, 
      id: 'wf_' + Math.random().toString(36).substr(2, 9),
      name: wf.name + ' (Copy)',
      active: false
    };
    setWorkflows([newWf, ...workflows]);
  };

  const saveEditedWorkflow = (updatedWf: WorkflowItem) => {
    setWorkflows(wfs => wfs.map(wf => wf.id === updatedWf.id ? updatedWf : wf));
    setEditingId(null);
  };

  const filteredWorkflows = workflows.filter(wf => {
    const matchesSearch = wf.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || wf.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">Workflow Templates</h1>
          <p className="text-[var(--color-text-muted)] mt-2 max-w-2xl text-lg">
            Automate your patient journey, marketing, and operations with intelligent pre-built pipelines.
          </p>
        </div>
        
        <button 
          onClick={() => {
            const newWf: WorkflowItem = {
              id: 'wf_' + Math.random().toString(36).substr(2, 9),
              name: 'New Custom Workflow',
              category: 'Operations',
              active: false,
              steps: [
                { id: 's1', type: 'trigger', label: 'Custom Trigger', details: '' }
              ]
            };
            setWorkflows([newWf, ...workflows]);
            setEditingId(newWf.id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-md shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          Create Custom
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-[var(--color-surface)] p-2 rounded-2xl border border-[var(--color-border)] shadow-sm">
        <div className="flex overflow-x-auto hide-scrollbar w-full py-2 px-2 gap-2">
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                activeCategory === cat 
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-72 shrink-0 px-2 lg:px-0 lg:pr-2 pb-2 lg:pb-0">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] lg:left-3" />
          <input 
            type="text" 
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[var(--color-text)]"
          />
        </div>
      </div>

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
        <div className="text-center py-20 bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)]">
          <div className="w-16 h-16 bg-[var(--color-bg)] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--color-border)]">
            <Zap className="w-8 h-8 text-[var(--color-text-muted)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">No workflows found</h3>
          <p className="text-[var(--color-text-muted)]">Try adjusting your filters or search query.</p>
          <button 
            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredWorkflows.map(wf => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={wf.id}
                className={cn(
                  "bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow",
                  !wf.active && "opacity-75"
                )}
              >
                {/* Card Header */}
                <div className="p-5 md:p-6 border-b border-[var(--color-border)] flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn(
                        "px-2.5 py-1 text-xs font-semibold rounded-lg border",
                        CATEGORY_COLORS[wf.category] || CATEGORY_COLORS['Operations']
                      )}>
                        {wf.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          wf.active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-slate-400"
                        )}></span>
                        {wf.active ? 'Active' : 'Paused'}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--color-text)] truncate">{wf.name}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleActive(wf.id)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]",
                        wf.active ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          wf.active ? 'translate-x-2.5' : '-translate-x-2.5'
                        )}
                      />
                    </button>
                    
                    <div className="relative group/menu">
                      <button className="p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] rounded-xl transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 top-full mt-1 w-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 py-1">
                        <button 
                          onClick={() => setEditingId(editingId === wf.id ? null : wf.id)}
                          className="w-full text-left px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" /> {editingId === wf.id ? 'Close Editor' : 'Edit Steps'}
                        </button>
                        <button 
                          onClick={() => duplicateWorkflow(wf)}
                          className="w-full text-left px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" /> Duplicate
                        </button>
                        <div className="h-px bg-[var(--color-border)] my-1"></div>
                        <button 
                          onClick={() => deleteWorkflow(wf.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pipeline Preview */}
                <div className="p-5 md:p-6 bg-[var(--color-bg)]/50">
                  <div className="flex items-center overflow-x-auto hide-scrollbar py-2">
                    {wf.steps.map((step, idx) => (
                      <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center gap-2 shrink-0 group relative cursor-help">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-white/10 relative z-10 transition-transform group-hover:scale-110",
                            STEP_COLORS[step.type] || 'bg-blue-500'
                          )}>
                            {React.createElement(STEP_ICONS[step.type] || Zap, { className: "w-6 h-6 text-white" })}
                          </div>
                          
                          {/* Tooltip */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-800 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-20 shadow-lg pointer-events-none before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-b-slate-800">
                            <span className="font-semibold block mb-0.5">{step.label}</span>
                            {step.details && <span className="text-slate-300">{step.details}</span>}
                          </div>
                        </div>

                        {idx < wf.steps.length - 1 && (
                          <div className="w-8 md:w-12 h-0.5 bg-[var(--color-border)] shrink-0 mx-1 md:mx-2 relative">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 border-t-2 border-r-2 border-[var(--color-border)] rotate-45"></div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="px-5 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] grid grid-cols-3 gap-4 text-sm divide-x divide-[var(--color-border)]">
                  <div className="flex flex-col">
                    <span className="text-[var(--color-text-muted)] text-xs mb-1">Last Run</span>
                    <span className="font-medium text-[var(--color-text)]">{wf.lastRun || 'Never'}</span>
                  </div>
                  <div className="flex flex-col pl-4">
                    <span className="text-[var(--color-text-muted)] text-xs mb-1">Runs (24h)</span>
                    <span className="font-medium text-[var(--color-text)]">{wf.runCount24h || 0}</span>
                  </div>
                  <div className="flex flex-col pl-4">
                    <span className="text-[var(--color-text-muted)] text-xs mb-1">Success</span>
                    <span className="font-medium text-[var(--color-text)] flex items-center gap-1">
                      {wf.successRate || 0}%
                      {(wf.successRate || 0) >= 95 && <CheckCircle className="w-3 h-3 text-green-500" />}
                    </span>
                  </div>
                </div>

                {/* Inline Editor Area */}
                <AnimatePresence>
                  {editingId === wf.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden bg-[var(--color-surface)]"
                    >
                      <div className="px-5 pb-5">
                        <InlineEditor 
                          workflow={wf} 
                          onSave={saveEditedWorkflow} 
                          onCancel={() => setEditingId(null)} 
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
