'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNiche } from '@/components/providers/niche-provider';
import { 
  Workflow, 
  Phone, 
  MessageSquare, 
  Calendar, 
  UserPlus, 
  Bell, 
  ChevronRight, 
  CheckCircle2, 
  Zap,
  Plus, 
  X, 
  Play, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Check,
  Edit3,
  Trash2,
  Sliders,
  Layers,
  FileText,
  Mail,
  Smartphone,
  Database,
  ArrowDown,
  RotateCcw,
  Save,
  CheckCircle,
  Activity,
  AlertCircle,
  Copy,
  Webhook,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WorkflowStep {
  id: string;
  type: 'TRIGGER' | 'CONDITION' | 'ACTION' | 'DELAY';
  actionType?: 'WHATSAPP' | 'VOICE_CALL' | 'EMAIL' | 'CREATE_TASK' | 'UPDATE_CRM' | 'WAIT_DELAY' | 'CUSTOM' | 'WEBHOOK';
  label: string;
  detail: string;
  config?: Record<string, any>;
}

export interface WorkflowItem {
  id: string;
  name: string;
  triggerEvent: string;
  description: string;
  steps: WorkflowStep[];
  actionsCount: number;
  isActive: boolean;
  lastRun: string;
  runs24h: number;
  category: 'Voice AI' | 'WhatsApp' | 'Appointments' | 'Cron Schedule' | 'Clinical Care';
}

const STEP_ICONS: Record<string, any> = {
  TRIGGER: Zap,
  CONDITION: Sliders,
  ACTION: Workflow,
  DELAY: Clock,
  WHATSAPP: MessageSquare,
  VOICE_CALL: Phone,
  EMAIL: Mail,
  CREATE_TASK: Bell,
  UPDATE_CRM: Database,
  WAIT_DELAY: Clock,
  WEBHOOK: Webhook,
};

const STEP_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  TRIGGER: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  CONDITION: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  ACTION: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  DELAY: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

const INITIAL_WORKFLOWS: WorkflowItem[] = [
  {
    id: 'wf_1',
    name: 'New Customer & Patient Onboarding',
    triggerEvent: '👤 New Registration / Lead Created',
    description: 'When a new client registers → Send WhatsApp Welcome Kit & Medical Form → Wait for submission → Update CRM profile',
    steps: [
      { id: 's1', type: 'TRIGGER', label: 'Trigger: New Registration', detail: 'Triggered when new contact profile is created in CRM' },
      { id: 's2', type: 'ACTION', actionType: 'WHATSAPP', label: 'Action 1: WhatsApp Welcome', detail: 'Send welcome message with digital intake form link' },
      { id: 's3', type: 'DELAY', actionType: 'WAIT_DELAY', label: 'Delay: Wait 4 Hours', detail: 'Wait for client to complete digital intake form' },
      { id: 's4', type: 'ACTION', actionType: 'UPDATE_CRM', label: 'Action 2: Update CRM & EMR', detail: 'Mark intake form status as received and ready for review' }
    ],
    actionsCount: 4,
    isActive: true,
    lastRun: '4 min ago',
    runs24h: 18,
    category: 'Clinical Care'
  },
  {
    id: 'wf_2',
    name: 'Post-Procedure Care & Aftercare Sequence',
    triggerEvent: '🏷️ Procedure / Service Completed',
    description: 'When appointment is completed → Send instant WhatsApp care guide → Wait 24h → Send follow-up recovery check',
    steps: [
      { id: 's1', type: 'TRIGGER', label: 'Trigger: Service Completed', detail: 'When specialist marks appointment as completed' },
      { id: 's2', type: 'ACTION', actionType: 'WHATSAPP', label: 'Action 1: Send Aftercare Guide', detail: 'Send customized PDF aftercare protocol and SPF instructions' },
      { id: 's3', type: 'DELAY', actionType: 'WAIT_DELAY', label: 'Delay: Wait 24 Hours', detail: 'Allow recovery period before follow-up check' },
      { id: 's4', type: 'ACTION', actionType: 'WHATSAPP', label: 'Action 2: Recovery Check & Review', detail: 'Automated check-in asking how patient is feeling + Google review prompt' }
    ],
    actionsCount: 4,
    isActive: true,
    lastRun: '12 min ago',
    runs24h: 24,
    category: 'WhatsApp'
  },
  {
    id: 'wf_3',
    name: 'Missed Appointment & No-Show Reactivation',
    triggerEvent: '❌ Status: Appointment No-Show',
    description: 'When customer misses appointment → Send 1-click reschedule link → Wait 24h → Create frontdesk call task',
    steps: [
      { id: 's1', type: 'TRIGGER', label: 'Trigger: No-Show Status', detail: 'Triggered when appointment marked as no-show' },
      { id: 's2', type: 'ACTION', actionType: 'WHATSAPP', label: 'Action 1: Reschedule Link', detail: 'WhatsApp: "We missed you today! Tap here to pick a new slot"' },
      { id: 's3', type: 'DELAY', actionType: 'WAIT_DELAY', label: 'Delay: Wait 24 Hours', detail: 'Wait to see if user self-reschedules' },
      { id: 's4', type: 'ACTION', actionType: 'CREATE_TASK', label: 'Action 2: Frontdesk Follow-up Task', detail: 'Assign high-priority call task to frontdesk staff' }
    ],
    actionsCount: 4,
    isActive: true,
    lastRun: '1h ago',
    runs24h: 7,
    category: 'Appointments'
  },
  {
    id: 'wf_4',
    name: 'Voice AI Inbound Missed Call Recovery',
    triggerEvent: '📵 Missed Phone Call',
    description: 'When incoming phone call is missed → Send instant interactive WhatsApp DM → Assign CRM lead',
    steps: [
      { id: 's1', type: 'TRIGGER', label: 'Trigger: Missed Call Received', detail: 'Inbound call unattended on business line' },
      { id: 's2', type: 'ACTION', actionType: 'WHATSAPP', label: 'Action 1: Instant WhatsApp Responder', detail: 'Send menu: 1-Book appointment, 2-Pricing, 3-Talk to Doctor' },
      { id: 's3', type: 'ACTION', actionType: 'UPDATE_CRM', label: 'Action 2: Log Lead in CRM', detail: 'Create new contact marked "Missed Call Lead"' }
    ],
    actionsCount: 3,
    isActive: true,
    lastRun: '2h ago',
    runs24h: 15,
    category: 'Voice AI'
  }
];

export default function AutomationsPage() {
  const { currentNiche, nicheConfig } = useNiche();

  const getDefaultWorkflows = (): WorkflowItem[] => {
    if (nicheConfig?.initialWorkflows && nicheConfig.initialWorkflows.length > 0) {
      return (nicheConfig.initialWorkflows as any[]).map((w, idx) => ({
        id: w.id || `wf-${idx}`,
        name: w.name || 'Automated Pipeline',
        triggerEvent: w.triggerEvent || 'Trigger: System Event',
        description: w.description || 'Automated multi-step event sequence',
        steps: (w.steps || []).map((s: any, sIdx: number) => ({
          id: `step-${sIdx}`,
          type: s.type || 'ACTION',
          actionType: s.type === 'TRIGGER' ? undefined : (s.label?.toLowerCase().includes('whatsapp') ? 'WHATSAPP' : s.label?.toLowerCase().includes('wait') ? 'WAIT_DELAY' : 'UPDATE_CRM'),
          label: s.label || `Step ${sIdx + 1}`,
          detail: s.detail || ''
        })),
        actionsCount: w.actionsCount || (w.steps?.length || 3),
        isActive: w.isActive !== false,
        lastRun: w.lastRun || 'Recent',
        runs24h: w.runs24h || Math.floor(Math.random() * 20) + 5,
        category: (w.category as any) || 'Clinical Care'
      }));
    }
    return INITIAL_WORKFLOWS;
  };

  const [workflows, setWorkflows] = useState<WorkflowItem[]>(getDefaultWorkflows());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Zapier-Style Canvas Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowItem | null>(null);
  const [isNewWorkflow, setIsNewWorkflow] = useState(false);

  // Step Editing Drawer State
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [stepLabel, setStepLabel] = useState('');
  const [stepDetail, setStepDetail] = useState('');
  const [stepType, setStepType] = useState<WorkflowStep['type']>('ACTION');
  const [stepActionType, setStepActionType] = useState<WorkflowStep['actionType']>('WHATSAPP');

  // Test Run Simulator State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedStepIndex, setSimulatedStepIndex] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`zerodesk_workflows_${currentNiche}`);
    if (saved) {
      try {
        setWorkflows(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    setWorkflows(getDefaultWorkflows());
  }, [currentNiche, nicheConfig]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const saveWorkflows = (updated: WorkflowItem[]) => {
    setWorkflows(updated);
    localStorage.setItem(`zerodesk_workflows_${currentNiche}`, JSON.stringify(updated));
  };

  const toggleWorkflow = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = workflows.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w);
    saveWorkflows(updated);
    showToast(updated.find(w => w.id === id)?.isActive ? 'Workflow activated!' : 'Workflow paused');
  };

  const openCanvasEditor = (wf: WorkflowItem) => {
    setActiveWorkflow(JSON.parse(JSON.stringify(wf)));
    setIsNewWorkflow(false);
    setEditingStepIndex(null);
    setIsEditorOpen(true);
  };

  const openCreateNewCanvas = () => {
    const newWf: WorkflowItem = {
      id: `wf_${Date.now()}`,
      name: 'Untitled Automation Sequence',
      triggerEvent: '⚡ Event Trigger',
      description: 'Configure multi-step trigger and connected actions',
      steps: [
        { id: 's1', type: 'TRIGGER', label: 'Trigger: Inbound Event', detail: 'When event occurs in system' },
        { id: 's2', type: 'ACTION', actionType: 'WHATSAPP', label: 'Action 1: WhatsApp Notification', detail: 'Send customized message to customer' }
      ],
      actionsCount: 2,
      isActive: true,
      lastRun: 'Never',
      runs24h: 0,
      category: 'Clinical Care'
    };
    setActiveWorkflow(newWf);
    setIsNewWorkflow(true);
    setEditingStepIndex(null);
    setIsEditorOpen(true);
  };

  const handleSaveActiveWorkflow = () => {
    if (!activeWorkflow) return;
    if (!activeWorkflow.name.trim()) {
      showToast('Please enter a workflow name');
      return;
    }

    const updatedWorkflow: WorkflowItem = {
      ...activeWorkflow,
      actionsCount: activeWorkflow.steps.length
    };

    let updatedList: WorkflowItem[];
    if (isNewWorkflow) {
      updatedList = [updatedWorkflow, ...workflows];
    } else {
      updatedList = workflows.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w);
    }

    saveWorkflows(updatedList);
    setIsEditorOpen(false);
    showToast(`⚡ Workflow "${activeWorkflow.name}" saved & active!`);
  };

  const handleAddStepToCanvas = (index: number) => {
    if (!activeWorkflow) return;
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: 'ACTION',
      actionType: 'WHATSAPP',
      label: 'New Action Step',
      detail: 'Send automated WhatsApp message'
    };

    const newSteps = [...activeWorkflow.steps];
    newSteps.splice(index + 1, 0, newStep);
    setActiveWorkflow({ ...activeWorkflow, steps: newSteps });
    openStepEditor(index + 1, newStep);
  };

  const handleDeleteStepFromCanvas = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeWorkflow) return;
    if (activeWorkflow.steps.length <= 1) {
      showToast('Workflow must have at least 1 step');
      return;
    }

    const newSteps = activeWorkflow.steps.filter((_, i) => i !== index);
    setActiveWorkflow({ ...activeWorkflow, steps: newSteps });
    if (editingStepIndex === index) {
      setEditingStepIndex(null);
    }
  };

  const openStepEditor = (index: number, step: WorkflowStep) => {
    setEditingStepIndex(index);
    setStepLabel(step.label);
    setStepDetail(step.detail);
    setStepType(step.type);
    setStepActionType(step.actionType || 'WHATSAPP');
  };

  const handleSaveStepDetails = () => {
    if (!activeWorkflow || editingStepIndex === null) return;
    const updatedSteps = [...activeWorkflow.steps];
    updatedSteps[editingStepIndex] = {
      ...updatedSteps[editingStepIndex],
      label: stepLabel,
      detail: stepDetail,
      type: stepType,
      actionType: stepType === 'TRIGGER' ? undefined : stepActionType
    };

    setActiveWorkflow({ ...activeWorkflow, steps: updatedSteps });
    setEditingStepIndex(null);
    showToast('Step configuration updated');
  };

  const handleRunSimulation = () => {
    if (!activeWorkflow) return;
    setIsSimulating(true);
    setSimulatedStepIndex(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current < activeWorkflow.steps.length) {
        setSimulatedStepIndex(current);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsSimulating(false);
          setSimulatedStepIndex(null);
          showToast('✅ Sequence test run completed successfully!');
        }, 800);
      }
    }, 900);
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
            <span>Workflow Automations</span>
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-medium">
              Zapier-Style Pipeline Engine
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Build, edit, and automate connected event-driven sequences connecting WhatsApp, Voice AI calls, calendar reminders, and staff tasks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] px-3.5 py-2 rounded-xl border border-[var(--color-border)] font-mono">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <CheckCircle2 size={14} />
              {workflows.filter(w => w.isActive).length} Active Pipelines
            </span>
            <span>•</span>
            <span className="text-purple-300 font-bold">{workflows.reduce((s, w) => s + w.runs24h, 0)} runs in 24h</span>
          </div>

          <button
            onClick={openCreateNewCanvas}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
          >
            <Plus size={18} />
            <span>Create Automation Sequence</span>
          </button>
        </div>
      </div>

      {/* Preset Automation Templates */}
      <div className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <Sparkles size={14} />
            1-Click Pre-Installed Workflow Sequences ({nicheConfig?.label || 'Industry Best Practices'})
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">Click to launch in Canvas Editor</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(nicheConfig?.automationPresets || [
            { title: 'Post-Procedure Care Sequence', trigger: '🏷️ Procedure Completed', desc: 'Automatically send aftercare instructions via WhatsApp 2 hours after treatment.', category: 'Customer Care' },
            { title: 'Ready Notification Alert', trigger: '📦 Lab/Order Arrived', desc: 'Notify customer immediately when custom lab order or report is ready.', category: 'Operations' },
            { title: '6-Month Routine Recall', trigger: '⏰ 6 Months Inactive', desc: 'Send automated recall reminder for routine checkup and preventive care.', category: 'Retention' },
            { title: 'Unscheduled Lead Recovery', trigger: '⏳ Lead Stalled', desc: 'Follow up with inquiries who agreed to treatment but have not booked.', category: 'Conversion' }
          ]).map((tmpl: any, idx: number) => (
            <button
              key={idx}
              onClick={() => {
                const newWf: WorkflowItem = {
                  id: `wf_${Date.now()}`,
                  name: tmpl.title,
                  triggerEvent: tmpl.trigger,
                  description: tmpl.desc,
                  steps: [
                    { id: 's1', type: 'TRIGGER', label: `Trigger: ${tmpl.trigger}`, detail: 'Event trigger configured from pre-installed template' },
                    { id: 's2', type: 'ACTION', actionType: 'WHATSAPP', label: 'Action 1: WhatsApp Automated Outreach', detail: tmpl.desc },
                    { id: 's3', type: 'DELAY', actionType: 'WAIT_DELAY', label: 'Delay: Wait 24h', detail: 'Wait for client response or confirmation' },
                    { id: 's4', type: 'ACTION', actionType: 'CREATE_TASK', label: 'Action 2: Staff Escalation Alert', detail: 'Notify assigned coordinator if no reply' }
                  ],
                  actionsCount: 4,
                  isActive: true,
                  lastRun: 'Just added',
                  runs24h: 0,
                  category: tmpl.category || 'Clinical Care'
                };
                setActiveWorkflow(newWf);
                setIsNewWorkflow(true);
                setIsEditorOpen(true);
              }}
              className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-purple-500/50 text-left transition-all group relative overflow-hidden"
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
              <div className="mt-2.5 text-[10px] font-semibold text-purple-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Open in Canvas Editor →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workflow Sequences List (Connected Zapier Style Preview) */}
      <div className="space-y-4">
        {workflows.map((wf, i) => (
          <motion.div
            key={wf.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => openCanvasEditor(wf)}
            className={cn(
              "p-5 rounded-2xl border transition-all space-y-4 group shadow-sm cursor-pointer hover:shadow-xl hover:border-purple-500/60 relative",
              wf.isActive
                ? "bg-[var(--color-glass)] backdrop-blur border-[var(--color-glass-border)]"
                : "bg-slate-950/40 border-slate-800/60 opacity-70"
            )}
          >
            {/* Header Line */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3.5">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2.5 rounded-xl shrink-0 border",
                  wf.isActive ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-slate-800 text-slate-500 border-slate-700"
                )}>
                  <Workflow size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-bold text-base text-[var(--color-text)] group-hover:text-purple-300 transition-colors">
                      {wf.name}
                    </h3>
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
                  onClick={(e) => toggleWorkflow(wf.id, e)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-bold transition-all border",
                    wf.isActive
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                  )}
                >
                  {wf.isActive ? 'Active (ON)' : 'Paused (OFF)'}
                </button>

                <div className="p-2 hover:bg-purple-500/20 text-slate-400 hover:text-purple-300 rounded-xl transition-colors">
                  <Edit3 size={15} />
                </div>
              </div>
            </div>

            {/* Zapier-Style Connected Sequence Nodes Row */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 pt-1 overflow-x-auto pb-2">
              {wf.steps.map((step, idx) => {
                const conf = STEP_COLORS[step.type] || STEP_COLORS.ACTION;
                const Icon = STEP_ICONS[step.actionType || step.type] || Zap;
                const isLast = idx === wf.steps.length - 1;

                return (
                  <div key={step.id || idx} className="flex flex-1 md:flex-initial items-center gap-2 min-w-[210px]">
                    <div className={cn(
                      "flex-1 p-3 rounded-xl border bg-[var(--color-surface)] relative space-y-1 group-hover:border-purple-500/40 transition-colors shadow-sm",
                      conf.border
                    )}>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={cn("font-mono font-bold uppercase tracking-wider", conf.text)}>
                          {step.type}
                        </span>
                        <span className="text-slate-400 font-mono">Step #{idx + 1}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <Icon size={14} className={conf.text} />
                        <p className="font-bold text-white text-xs truncate">{step.label}</p>
                      </div>

                      <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-1 font-sans">{step.detail}</p>
                    </div>

                    {/* Connecting Connector Arrow between steps */}
                    {!isLast && (
                      <div className="hidden md:flex items-center justify-center text-purple-400/70 shrink-0">
                        <ArrowRight size={16} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom prompt */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-purple-400 font-semibold">
              <span className="flex items-center gap-1">
                <Sliders size={12} />
                Click to open interactive Zapier Sequence Canvas & edit steps
              </span>
              <span className="text-slate-400 font-mono text-[10px]">Last run: {wf.lastRun}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FULL-SCREEN / MODAL ZAPIER-STYLE SEQUENCE CANVAS BUILDER */}
      <AnimatePresence>
        {isEditorOpen && activeWorkflow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="w-full max-w-5xl bg-[#0b0f17] border border-purple-500/40 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl my-8 max-h-[92vh] flex flex-col justify-between overflow-hidden"
            >
              {/* Canvas Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400">
                    <Workflow size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={activeWorkflow.name}
                        onChange={(e) => setActiveWorkflow({ ...activeWorkflow, name: e.target.value })}
                        className="font-bold text-lg sm:text-xl text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-purple-500 focus:outline-none transition-colors px-1 py-0.5"
                        placeholder="Sequence Name..."
                      />
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                        Zapier Canvas Mode
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure connected triggers, conditions, WhatsApp messages, and staff actions.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900/50 text-white rounded-xl text-xs font-semibold shadow-md transition-all shrink-0"
                    title="Simulate live execution of this pipeline"
                  >
                    <Play size={13} className={cn(isSimulating && "animate-spin text-emerald-200")} />
                    <span>{isSimulating ? 'Testing Run...' : 'Test Sequence'}</span>
                  </button>

                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Canvas Interactive Sequence Body */}
              <div className="flex-1 overflow-y-auto space-y-6 py-2 px-1 sm:px-4">
                
                {/* Workflow Trigger Configuration Card */}
                <div className="p-4 bg-slate-900/80 border border-amber-500/40 rounded-2xl space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                      <Zap size={14} />
                      Sequence Trigger (Event Initiator)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">STEP #1</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 font-semibold mb-1">Trigger Event</label>
                      <select
                        value={activeWorkflow.triggerEvent}
                        onChange={(e) => setActiveWorkflow({ ...activeWorkflow, triggerEvent: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-amber-300 font-bold focus:border-purple-500 focus:outline-none"
                      >
                        <option value="👤 New Registration / Lead Created">👤 New Registration / Lead Created in CRM</option>
                        <option value="🏷️ Procedure / Service Completed">🏷️ Procedure / Service Completed in Clinic</option>
                        <option value="❌ Status: Appointment No-Show">❌ Status: Appointment No-Show</option>
                        <option value="📵 Missed Phone Call">📵 Missed Phone Call on Business Number</option>
                        <option value="⏰ Scheduled (Cron Timer - Daily 5 PM)">⏰ Scheduled (Cron Timer - Daily 5 PM)</option>
                        <option value="📅 Appointment Created">📅 Appointment Created in Doctor Calendar</option>
                        <option value="📦 Lab Order Received">📦 Lab / Diagnostic Report Received</option>
                        <option value="🔗 Incoming Webhook (External Trigger)">🔗 Incoming Webhook (External Trigger)</option>
                      </select>
                    </div>
                  </div>

                  {activeWorkflow.triggerEvent === '🔗 Incoming Webhook (External Trigger)' && (
                    <div className="mt-3 p-3 bg-slate-950 border border-indigo-500/30 rounded-xl">
                      <label className="block text-[11px] text-slate-300 font-semibold mb-1">Incoming Webhook URL</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`https://api.zerodesk.io/webhooks/wf-${activeWorkflow.id}`}
                          className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-indigo-300 font-mono"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`https://api.zerodesk.io/webhooks/wf-${activeWorkflow.id}`);
                            showToast('Webhook URL copied!');
                          }}
                          className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex shrink-0"
                          title="Copy URL"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5">Trigger this workflow from Zapier, Make.com, or any external system.</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] text-slate-300 font-semibold mb-1">Pipeline Description</label>
                    <input
                      type="text"
                      value={activeWorkflow.description}
                      onChange={(e) => setActiveWorkflow({ ...activeWorkflow, description: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                      placeholder="Brief summary of this automation pipeline..."
                    />
                  </div>
                </div>

                {/* Zapier Vertical Connected Flow Builder */}
                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[19px] sm:before:left-[27px] before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-purple-500 before:via-cyan-500 before:to-emerald-500">
                  {activeWorkflow.steps.map((step, idx) => {
                    const conf = STEP_COLORS[step.type] || STEP_COLORS.ACTION;
                    const Icon = STEP_ICONS[step.actionType || step.type] || Zap;
                    const isSimActive = simulatedStepIndex === idx;

                    return (
                      <div key={step.id || idx} className="relative group">
                        {/* Node Connector Circle Pin on Left Vertical Rail */}
                        <div className={cn(
                          "absolute -left-[27px] sm:-left-[35px] top-4 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center bg-slate-950 z-10",
                          isSimActive
                            ? "border-emerald-400 bg-emerald-500 ring-4 ring-emerald-500/30 scale-125"
                            : "border-purple-500 group-hover:scale-110 group-hover:border-purple-400"
                        )}>
                          {isSimActive && <Check size={10} className="text-slate-950 stroke-[3]" />}
                        </div>

                        {/* Step Card Box */}
                        <div 
                          onClick={() => openStepEditor(idx, step)}
                          className={cn(
                            "p-4 rounded-2xl border bg-slate-900/90 transition-all cursor-pointer shadow-lg space-y-2 hover:border-purple-500/70 relative",
                            editingStepIndex === idx ? "border-purple-500 ring-2 ring-purple-500/30" : "border-slate-800",
                            isSimActive && "border-emerald-500 bg-emerald-950/20"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={cn("px-2 py-0.5 text-[10px] font-mono font-bold rounded-md border", conf.border, conf.bg, conf.text)}>
                                {step.type}
                              </span>
                              <span className="text-xs font-mono text-slate-400">Step #{idx + 1}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => { e.stopPropagation(); openStepEditor(idx, step); }}
                                className="p-1 hover:bg-purple-500/20 text-slate-400 hover:text-purple-300 rounded-lg transition-colors text-[10px] flex items-center gap-1 font-semibold"
                              >
                                <Edit3 size={12} />
                                <span>Configure</span>
                              </button>
                              <button
                                onClick={(e) => handleDeleteStepFromCanvas(idx, e)}
                                className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                title="Delete Step"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className={cn("p-2 rounded-xl border shrink-0", conf.bg, conf.border)}>
                              <Icon size={16} className={conf.text} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-sm text-white">{step.label}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">{step.detail}</p>
                            </div>
                          </div>
                        </div>

                        {/* + Add Step Connector Button directly between nodes */}
                        <div className="flex items-center justify-center my-2 -ml-6 sm:-ml-8">
                          <button
                            type="button"
                            onClick={() => handleAddStepToCanvas(idx)}
                            className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-purple-600 border border-purple-500/30 hover:border-purple-400 text-purple-300 hover:text-white rounded-full text-[10px] font-bold shadow-md transition-all hover:scale-105"
                          >
                            <Plus size={11} />
                            <span>Add Step After</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Step Configuration Drawer (Appears when step is clicked) */}
                {editingStepIndex !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/50 space-y-4 shadow-xl text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Sliders size={16} className="text-purple-400" />
                        <h4 className="font-bold text-sm text-white">Configure Step #{editingStepIndex + 1}</h4>
                      </div>
                      <button onClick={() => setEditingStepIndex(null)} className="text-slate-400 hover:text-white">
                        <X size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Step Type</label>
                        <select
                          value={stepType}
                          onChange={(e) => setStepType(e.target.value as any)}
                          className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                        >
                          <option value="TRIGGER">TRIGGER (Event Starter)</option>
                          <option value="ACTION">ACTION (Perform Task)</option>
                          <option value="DELAY">DELAY (Wait Timer)</option>
                          <option value="CONDITION">CONDITION (Filter / Check)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Action Channel / Utility</label>
                        <select
                          value={stepActionType}
                          onChange={(e) => setStepActionType(e.target.value as any)}
                          className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                        >
                          <option value="WHATSAPP">💬 WhatsApp Message DM</option>
                          <option value="VOICE_CALL">📞 Voice AI Outbound Call</option>
                          <option value="EMAIL">✉️ Email Notification</option>
                          <option value="CREATE_TASK">🔔 Frontdesk / Doctor Task</option>
                          <option value="UPDATE_CRM">🗄️ Update CRM / EMR Status</option>
                          <option value="WAIT_DELAY">⏳ Wait Delay Timer</option>
                          <option value="WEBHOOK">🌐 Send Webhook (Zapier / Make.com)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Step Title / Label</label>
                        <input
                          type="text"
                          value={stepLabel}
                          onChange={(e) => setStepLabel(e.target.value)}
                          className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                          placeholder="e.g. Action 1: Send WhatsApp Aftercare"
                        />
                      </div>
                    </div>

                    {stepType === 'ACTION' && stepActionType === 'WEBHOOK' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Webhook URL</label>
                          <input
                            type="text"
                            value={activeWorkflow.steps[editingStepIndex]?.config?.url || ''}
                            onChange={(e) => {
                              const newSteps = [...activeWorkflow.steps];
                              newSteps[editingStepIndex] = {
                                ...newSteps[editingStepIndex],
                                config: { ...newSteps[editingStepIndex].config, url: e.target.value }
                              };
                              setActiveWorkflow({ ...activeWorkflow, steps: newSteps });
                            }}
                            placeholder="https://hooks.zapier.com/..."
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">HTTP Method</label>
                          <select
                            value={activeWorkflow.steps[editingStepIndex]?.config?.method || 'POST'}
                            onChange={(e) => {
                              const newSteps = [...activeWorkflow.steps];
                              newSteps[editingStepIndex] = {
                                ...newSteps[editingStepIndex],
                                config: { ...newSteps[editingStepIndex].config, method: e.target.value }
                              };
                              setActiveWorkflow({ ...activeWorkflow, steps: newSteps });
                            }}
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-purple-500"
                          >
                            <option value="POST">POST</option>
                            <option value="GET">GET</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-slate-300 font-semibold mb-1">JSON Payload Preview</label>
                          <textarea
                            rows={3}
                            value={activeWorkflow.steps[editingStepIndex]?.config?.payload || '{\n  "contact_name": "{{contact.name}}",\n  "phone": "{{contact.phone}}"\n}'}
                            onChange={(e) => {
                              const newSteps = [...activeWorkflow.steps];
                              newSteps[editingStepIndex] = {
                                ...newSteps[editingStepIndex],
                                config: { ...newSteps[editingStepIndex].config, payload: e.target.value }
                              };
                              setActiveWorkflow({ ...activeWorkflow, steps: newSteps });
                            }}
                            className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-indigo-300 font-mono focus:border-purple-500"
                          />
                        </div>
                      </div>
                    )}

                    {stepType === 'ACTION' && (stepActionType === 'WHATSAPP' || stepActionType === 'VOICE_CALL') && (
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                        <label className="block text-slate-300 font-semibold mb-1">Select Template</label>
                        <select
                          value={activeWorkflow.steps[editingStepIndex]?.config?.templateId || ''}
                          onChange={(e) => {
                            const selectedTemp = nicheConfig?.templates?.find((t: any) => t.id === e.target.value);
                            const newSteps = [...activeWorkflow.steps];
                            newSteps[editingStepIndex] = {
                              ...newSteps[editingStepIndex],
                              config: { ...newSteps[editingStepIndex].config, templateId: e.target.value },
                              detail: selectedTemp ? selectedTemp.content : newSteps[editingStepIndex].detail
                            };
                            setActiveWorkflow({ ...activeWorkflow, steps: newSteps });
                            if (selectedTemp) {
                              setStepDetail(selectedTemp.content);
                            }
                          }}
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-purple-500"
                        >
                          <option value="">-- Custom Message (Type below) --</option>
                          {nicheConfig?.templates
                            ?.filter((t: any) => t.channel === (stepActionType === 'WHATSAPP' ? 'whatsapp' : 'voice'))
                            .map((t: any) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Action Details & Message Instruction</label>
                      <textarea
                        rows={3}
                        value={stepDetail}
                        onChange={(e) => setStepDetail(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none leading-relaxed font-mono text-[11px]"
                        placeholder="Write exact action parameters, delay duration (e.g. 'Wait 24h'), or message template..."
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingStepIndex(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveStepDetails}
                        className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md"
                      >
                        Apply Step Changes
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Canvas Footer Bar */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveActiveWorkflow}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
                  >
                    <Save size={15} />
                    <span>Save & Deploy Sequence</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
