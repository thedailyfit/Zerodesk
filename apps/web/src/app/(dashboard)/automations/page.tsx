"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Plus, Trash2, Edit2, Copy, Save, X, Search,
  MessageSquare, Mail, Phone, Calendar, CheckCircle, Clock,
  FileText, Activity, AlertCircle, RefreshCw, Zap,
  Smartphone, User, CreditCard, Tag, FileSpreadsheet, Star,
  ArrowRight, HeartPulse, RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNiche } from '@/components/providers/niche-provider';
import {
  WorkflowItem,
  WorkflowStep,
  StepActionType,
  getWorkflowsForNiche,
  getCategoriesForNiche,
  CATEGORY_COLORS
} from '@/config/niches';

export type { WorkflowItem, WorkflowStep, StepActionType };

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
  email: 'bg-blue-500',
  wait: 'bg-slate-400',
  task: 'bg-emerald-500',
  crm_update: 'bg-blue-600',
  call: 'bg-cyan-500',
  survey: 'bg-yellow-500',
  invoice: 'bg-indigo-500'
};

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
  const { currentNiche, nicheConfig } = useNiche();
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(() => getWorkflowsForNiche(currentNiche));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);

  const categories = useMemo(() => {
    return ['All', ...getCategoriesForNiche(currentNiche)];
  }, [currentNiche]);

  // Reset activeCategory if it does not exist in the new niche
  useEffect(() => {
    if (activeCategory !== 'All' && !getCategoriesForNiche(currentNiche).includes(activeCategory)) {
      setActiveCategory('All');
    }
  }, [currentNiche, activeCategory]);

  // Initialize and react to niche changes with namespaced storage
  useEffect(() => {
    const storageKey = `zd_automations_v4_${currentNiche}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasRealSteps = parsed.some(wf => wf.steps && wf.steps.length > 1);
          if (hasRealSteps) {
            setWorkflows(parsed);
            return;
          }
        }
      }
    } catch (e) {
      console.error(`Failed to load workflows for ${currentNiche}`, e);
    }
    // Fallback to rich 12 niche-specific templates
    const fresh = getWorkflowsForNiche(currentNiche);
    setWorkflows(fresh);
    try {
      localStorage.setItem(storageKey, JSON.stringify(fresh));
    } catch (e) {
      console.error(e);
    }
  }, [currentNiche]);

  // Save to local storage whenever workflows or currentNiche change
  useEffect(() => {
    if (workflows && workflows.length > 0) {
      const storageKey = `zd_automations_v4_${currentNiche}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(workflows));
      } catch (e) {
        console.error(e);
      }
    }
  }, [workflows, currentNiche]);

  const resetToDefaults = () => {
    const label = nicheConfig?.label || currentNiche;
    if (confirm(`Restore all 12 pre-installed ${label} workflow templates?`)) {
      const fresh = getWorkflowsForNiche(currentNiche);
      setWorkflows(fresh);
      const storageKey = `zd_automations_v4_${currentNiche}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(fresh));
      } catch (e) {
        console.error(e);
      }
      setEditingId(null);
    }
  };

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
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              ZeroDesk Smart Engine • {nicheConfig?.label || 'Omnichannel'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">1-Click Smart Actions</h1>
          <p className="text-[var(--color-text-muted)] mt-2 max-w-2xl text-base">
            Automate {nicheConfig?.terminology?.customer ? `${nicheConfig.terminology.customer.toLowerCase()} journeys` : 'inquiry journeys'}, missed-call WhatsApp follow-ups, and retention with 1-click pre-configured AI triggers for {nicheConfig?.label || 'your business'}.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-surface)] hover:bg-[var(--color-border)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl font-medium text-sm transition-all shadow-sm cursor-pointer"
            title={`Restore default ${nicheConfig?.label || 'niche'} templates`}
          >
            <RotateCcw className="w-4 h-4 text-blue-500" />
            Restore Templates
          </button>

          <button 
            onClick={() => {
              const currentCategory = getCategoriesForNiche(currentNiche)[0] || 'Operations';
              const newWf: WorkflowItem = {
                id: 'wf_' + Math.random().toString(36).substr(2, 9),
                name: `Custom ${nicheConfig?.label || ''} Sequence`,
                category: currentCategory,
                active: false,
                steps: [
                  { id: 's1', type: 'trigger', label: `New ${nicheConfig?.terminology?.customer || 'Client'} Inquiry`, details: 'Inbound channel' },
                  { id: 's2', type: 'whatsapp', label: 'Instant WhatsApp Welcome', details: 'Automated greeting' },
                  { id: 's3', type: 'wait', label: 'Wait 24h', details: 'Delay 1 day' },
                  { id: 's4', type: 'call', label: 'AI Voice Follow-up Call', details: 'Agent check-in' }
                ]
              };
              setWorkflows([newWf, ...workflows]);
              setEditingId(newWf.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Create Custom
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-[var(--color-surface)] p-2 rounded-2xl border border-[var(--color-border)] shadow-sm">
        <div className="flex overflow-x-auto hide-scrollbar w-full py-2 px-2 gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer",
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
