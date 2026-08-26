'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, Settings, Play, CheckCircle2, XCircle, 
  Trash2, Copy, Edit2, Save, Activity, Zap,
  Calendar, CalendarX, UserPlus, CreditCard, PhoneMissed, 
  FileText, Webhook, Clock, TrendingUp, Star,
  MessageSquare, Mail, Phone, Smartphone, ClipboardList, 
  Database, Globe, AlertCircle, ChevronDown, Check, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SequenceNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  triggerType?: string;
  actionType?: string;
  label: string;
  description: string;
  config: Record<string, any>;
  conditionField?: string;
  conditionOperator?: string;
  conditionValue?: string;
}

interface BuildSequence {
  id: string;
  name: string;
  description: string;
  nodes: SequenceNode[];
  isActive: boolean;
  status: 'draft' | 'active' | 'paused' | 'error';
  lastRun?: string;
  runCount: number;
  errorMessage?: string;
  createdAt: string;
  apiKeys: {
    whatsappApiKey?: string;
    emailSmtp?: string;
    webhookUrl?: string;
    voiceAiKey?: string;
  };
}

const triggerTypes = [
  { id: 'new_appointment', label: 'New Appointment Booked', icon: Calendar },
  { id: 'appointment_cancelled', label: 'Appointment Cancelled', icon: CalendarX },
  { id: 'new_patient', label: 'New Patient Registered', icon: UserPlus },
  { id: 'payment_received', label: 'Payment Received', icon: CreditCard },
  { id: 'missed_call', label: 'Missed Call', icon: PhoneMissed },
  { id: 'form_submitted', label: 'Form Submitted', icon: FileText },
  { id: 'webhook_received', label: 'Webhook Received', icon: Webhook },
  { id: 'schedule_cron', label: 'Schedule (Cron)', icon: Clock },
  { id: 'lead_status_changed', label: 'Lead Status Changed', icon: TrendingUp },
  { id: 'review_received', label: 'Review Received', icon: Star },
];

const actionTypes = [
  { id: 'send_whatsapp', label: 'Send WhatsApp', icon: MessageSquare },
  { id: 'send_email', label: 'Send Email', icon: Mail },
  { id: 'voice_ai_call', label: 'Voice AI Call', icon: Phone },
  { id: 'send_sms', label: 'Send SMS', icon: Smartphone },
  { id: 'create_task', label: 'Create Task', icon: ClipboardList },
  { id: 'update_crm', label: 'Update CRM', icon: Database },
  { id: 'add_note', label: 'Add Note', icon: FileText },
  { id: 'webhook_post', label: 'Webhook POST', icon: Globe },
];

export default function BuildSequencePage() {
  const [sequences, setSequences] = useState<BuildSequence[]>([]);
  const [activeSequence, setActiveSequence] = useState<BuildSequence | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<{ nodeId: string; status: 'running' | 'passed' | 'failed'; log?: string }[]>([]);
  const [showNodeSelectorFor, setShowNodeSelectorFor] = useState<string | null>(null); // nodeId to insert after

  useEffect(() => {
    const saved = localStorage.getItem('zerodesk_build_sequences');
    if (saved) {
      try {
        setSequences(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse sequences', e);
      }
    }
  }, []);

  const saveSequences = (newSequences: BuildSequence[]) => {
    setSequences(newSequences);
    localStorage.setItem('zerodesk_build_sequences', JSON.stringify(newSequences));
  };

  const createSequence = () => {
    const newSeq: BuildSequence = {
      id: crypto.randomUUID(),
      name: 'Untitled Sequence',
      description: '',
      nodes: [
        {
          id: crypto.randomUUID(),
          type: 'trigger',
          label: 'Trigger',
          description: 'When this happens...',
          config: {},
        }
      ],
      isActive: false,
      status: 'draft',
      runCount: 0,
      createdAt: new Date().toISOString(),
      apiKeys: {}
    };
    const updated = [...sequences, newSeq];
    saveSequences(updated);
    setActiveSequence(newSeq);
    setSelectedNodeId(newSeq.nodes[0].id);
  };

  const deleteSequence = (id: string) => {
    const updated = sequences.filter(s => s.id !== id);
    saveSequences(updated);
  };

  const duplicateSequence = (seq: BuildSequence) => {
    const duplicated: BuildSequence = {
      ...seq,
      id: crypto.randomUUID(),
      name: seq.name + ' (Copy)',
      createdAt: new Date().toISOString(),
      nodes: seq.nodes.map(n => ({ ...n, id: crypto.randomUUID() })),
    };
    const updated = [...sequences, duplicated];
    saveSequences(updated);
  };

  const updateActiveSequence = (updates: Partial<BuildSequence>) => {
    if (!activeSequence) return;
    const updated = { ...activeSequence, ...updates };
    setActiveSequence(updated);
  };

  const updateNode = (nodeId: string, updates: Partial<SequenceNode>) => {
    if (!activeSequence) return;
    const newNodes = activeSequence.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n);
    updateActiveSequence({ nodes: newNodes });
  };

  const addNode = (afterNodeId: string | null, type: SequenceNode['type']) => {
    if (!activeSequence) return;
    const newNode: SequenceNode = {
      id: crypto.randomUUID(),
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      description: 'Configure this step',
      config: {}
    };
    let newNodes = [...activeSequence.nodes];
    if (afterNodeId) {
      const idx = newNodes.findIndex(n => n.id === afterNodeId);
      newNodes.splice(idx + 1, 0, newNode);
    } else {
      newNodes.push(newNode);
    }
    updateActiveSequence({ nodes: newNodes });
    setSelectedNodeId(newNode.id);
    setShowNodeSelectorFor(null);
  };

  const deleteNode = (nodeId: string) => {
    if (!activeSequence) return;
    const newNodes = activeSequence.nodes.filter(n => n.id !== nodeId);
    updateActiveSequence({ nodes: newNodes });
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  const saveCurrentSequence = () => {
    if (!activeSequence) return;
    const updated = sequences.map(s => s.id === activeSequence.id ? activeSequence : s);
    saveSequences(updated);
  };

  const runTest = async () => {
    if (!activeSequence) return;
    saveCurrentSequence();
    setIsTestRunning(true);
    setTestResults([]);

    const results: typeof testResults = [];
    
    for (const node of activeSequence.nodes) {
      results.push({ nodeId: node.id, status: 'running' });
      setTestResults([...results]);
      
      await new Promise(r => setTimeout(r, 500));
      
      // Simulate success/fail
      const isMissingConfig = !node.triggerType && node.type === 'trigger' || !node.actionType && node.type === 'action';
      const status = isMissingConfig ? 'failed' : 'passed';
      
      results[results.length - 1] = { 
        nodeId: node.id, 
        status, 
        log: status === 'passed' ? 'Step executed successfully.' : 'Missing configuration.' 
      };
      setTestResults([...results]);

      if (status === 'failed') break;
    }

    setIsTestRunning(false);
  };

  const selectedNode = activeSequence?.nodes.find(n => n.id === selectedNodeId);

  if (!activeSequence) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Build Sequence</h1>
              <p className="text-[var(--color-text-muted)] mt-2">Automate your workflows with custom sequences.</p>
            </div>
            <button 
              onClick={createSequence}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>New Sequence</span>
            </button>
          </div>

          {sequences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-center">
              <Zap className="w-16 h-16 text-[var(--color-text-muted)] mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">No sequences yet</h3>
              <p className="text-[var(--color-text-muted)] mb-6 max-w-sm">You haven&apos;t created any sequences yet. Click + New Sequence to get started.</p>
              <button 
                onClick={createSequence}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Create First Sequence</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sequences.map(seq => (
                <div key={seq.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col hover:border-blue-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={cn("w-3 h-3 rounded-full", 
                        seq.status === 'active' ? "bg-emerald-500" :
                        seq.status === 'error' ? "bg-red-500" :
                        seq.status === 'paused' ? "bg-amber-500" : "bg-slate-400"
                      )} />
                      <h3 className="font-semibold text-lg">{seq.name}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button onClick={() => { setActiveSequence(seq); setSelectedNodeId(seq.nodes[0]?.id); }} className="p-1.5 hover:bg-[var(--color-bg)] rounded-md text-[var(--color-text-muted)] hover:text-blue-500 transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => duplicateSequence(seq)} className="p-1.5 hover:bg-[var(--color-bg)] rounded-md text-[var(--color-text-muted)] hover:text-blue-500 transition-colors" title="Duplicate">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteSequence(seq.id)} className="p-1.5 hover:bg-[var(--color-bg)] rounded-md text-[var(--color-text-muted)] hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-6 flex-grow">{seq.description || 'No description provided.'}</p>
                  <div className="flex justify-between items-center text-sm text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-4 mt-auto">
                    <span>{seq.nodes.length} Steps</span>
                    <span>{seq.runCount} Runs</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'trigger': return 'border-amber-500';
      case 'condition': return 'border-blue-500';
      case 'action': return 'border-blue-500';
      case 'delay': return 'border-emerald-500';
      default: return 'border-slate-500';
    }
  };

  const getNodeBgColor = (type: string) => {
    switch (type) {
      case 'trigger': return 'bg-amber-500/10 text-amber-600';
      case 'condition': return 'bg-blue-500/10 text-blue-600';
      case 'action': return 'bg-blue-500/10 text-blue-600';
      case 'delay': return 'bg-emerald-500/10 text-emerald-600';
      default: return 'bg-slate-500/10 text-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setActiveSequence(null)}
            className="p-2 hover:bg-[var(--color-bg)] rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            value={activeSequence.name}
            onChange={(e) => updateActiveSequence({ name: e.target.value })}
            className="bg-transparent border-none text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1"
          />
          <div className="flex items-center space-x-2 ml-4 px-3 py-1.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
            <span className={cn("w-2 h-2 rounded-full", activeSequence.isActive ? "bg-emerald-500" : "bg-amber-500")} />
            <select 
              value={activeSequence.isActive ? 'active' : 'paused'}
              onChange={(e) => updateActiveSequence({ isActive: e.target.value === 'active', status: e.target.value === 'active' ? 'active' : 'paused' })}
              className="bg-transparent text-sm text-sm border-none focus:outline-none text-[var(--color-text)] cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={saveCurrentSequence}
            className="flex items-center space-x-2 bg-[var(--color-bg)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button 
            onClick={runTest}
            disabled={isTestRunning}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>{isTestRunning ? 'Testing...' : 'Save & Test'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Panel: Canvas */}
        <div className="col-span-7 bg-[var(--color-bg)] p-8 overflow-y-auto relative flex flex-col items-center">
          <div className="w-full max-w-2xl py-8">
            {activeSequence.nodes.map((node, index) => {
              const testResult = testResults.find(tr => tr.nodeId === node.id);
              
              return (
                <div key={node.id} className="relative flex flex-col items-center">
                  <motion.div 
                    layout
                    onClick={() => setSelectedNodeId(node.id)}
                    className={cn(
                      "w-full bg-[var(--color-surface)] border-2 rounded-2xl p-4 cursor-pointer transition-all relative group overflow-hidden",
                      selectedNodeId === node.id ? "border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]" : "border-[var(--color-border)] hover:border-blue-400/50",
                      testResult?.status === 'running' && "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
                      testResult?.status === 'passed' && "border-emerald-500",
                      testResult?.status === 'failed' && "border-red-500"
                    )}
                  >
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", getNodeColor(node.type))} />
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                      className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-start space-x-4 pl-3">
                      <div className={cn("p-2 rounded-xl mt-1 flex-shrink-0", getNodeBgColor(node.type))}>
                        {node.type === 'trigger' && <Zap className="w-5 h-5" />}
                        {node.type === 'condition' && <Settings className="w-5 h-5" />}
                        {node.type === 'action' && <Activity className="w-5 h-5" />}
                        {node.type === 'delay' && <Clock className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">{node.type}</div>
                        <input 
                          type="text" 
                          value={node.label}
                          onChange={(e) => updateNode(node.id, { label: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-transparent border-none text-lg font-medium text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-1 -ml-1 w-full"
                        />
                        <p className="text-sm text-[var(--color-text-muted)] mt-1">
                          {node.type === 'trigger' && (node.triggerType ? triggerTypes.find(t => t.id === node.triggerType)?.label : 'Select a trigger event')}
                          {node.type === 'action' && (node.actionType ? actionTypes.find(t => t.id === node.actionType)?.label : 'Choose an action')}
                          {node.type === 'condition' && (node.conditionField ? `If ${node.conditionField} ${node.conditionOperator} ${node.conditionValue}` : 'Set condition rules')}
                          {node.type === 'delay' && (node.config.duration ? `Wait for ${node.config.duration} ${node.config.unit || 'minutes'}` : 'Configure delay')}
                        </p>
                      </div>
                      
                      {testResult && (
                        <div className="self-center">
                          {testResult.status === 'running' && <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />}
                          {testResult.status === 'passed' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                          {testResult.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Connector Line & Add Button */}
                  <div className="w-0.5 h-12 bg-[var(--color-border)] relative flex items-center justify-center my-1 group/connector">
                    <button 
                      onClick={() => setShowNodeSelectorFor(showNodeSelectorFor === node.id ? null : node.id)}
                      className="absolute z-10 w-6 h-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-blue-500 hover:border-blue-500 hover:scale-110 transition-all shadow-sm opacity-0 group-hover/connector:opacity-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    
                    <AnimatePresence>
                      {showNodeSelectorFor === node.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute top-1/2 left-8 z-20 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden p-2"
                        >
                          <div className="text-xs font-semibold text-[var(--color-text-muted)] px-3 py-2 uppercase tracking-wider">Add Step</div>
                          <button onClick={() => addNode(node.id, 'condition')} className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-[var(--color-bg)] rounded-lg text-left text-sm transition-colors">
                            <Settings className="w-4 h-4 text-blue-500" /> <span>Condition</span>
                          </button>
                          <button onClick={() => addNode(node.id, 'action')} className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-[var(--color-bg)] rounded-lg text-left text-sm transition-colors">
                            <Activity className="w-4 h-4 text-blue-500" /> <span>Action</span>
                          </button>
                          <button onClick={() => addNode(node.id, 'delay')} className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-[var(--color-bg)] rounded-lg text-left text-sm transition-colors">
                            <Clock className="w-4 h-4 text-emerald-500" /> <span>Delay</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
            
            <button 
              onClick={() => setShowNodeSelectorFor('bottom')}
              className="w-full border-2 border-dashed border-[var(--color-border)] rounded-2xl p-4 flex flex-col items-center justify-center text-[var(--color-text-muted)] hover:text-blue-500 hover:border-blue-500 hover:bg-blue-500/5 transition-all mt-2 relative"
            >
              <Plus className="w-6 h-6 mb-2" />
              <span className="font-medium">Add Step</span>
              
              <AnimatePresence>
                {showNodeSelectorFor === 'bottom' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-20 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden p-2"
                  >
                    <div className="text-xs font-semibold text-[var(--color-text-muted)] px-3 py-2 uppercase tracking-wider">Add Step</div>
                    <button onClick={(e) => { e.stopPropagation(); addNode(null, 'condition'); }} className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-[var(--color-bg)] rounded-lg text-left text-sm transition-colors">
                      <Settings className="w-4 h-4 text-blue-500" /> <span>Condition</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); addNode(null, 'action'); }} className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-[var(--color-bg)] rounded-lg text-left text-sm transition-colors">
                      <Activity className="w-4 h-4 text-blue-500" /> <span>Action</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); addNode(null, 'delay'); }} className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-[var(--color-bg)] rounded-lg text-left text-sm transition-colors">
                      <Clock className="w-4 h-4 text-emerald-500" /> <span>Delay</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Right Panel: Configuration */}
        <div className="col-span-5 bg-[var(--color-surface)] border-l border-[var(--color-border)] flex flex-col overflow-hidden">
          {selectedNode ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center space-x-3 mb-8">
                <div className={cn("p-2 rounded-xl", getNodeBgColor(selectedNode.type))}>
                  {selectedNode.type === 'trigger' && <Zap className="w-6 h-6" />}
                  {selectedNode.type === 'condition' && <Settings className="w-6 h-6" />}
                  {selectedNode.type === 'action' && <Activity className="w-6 h-6" />}
                  {selectedNode.type === 'delay' && <Clock className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold capitalize">{selectedNode.type} Configuration</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">Set up properties for this step.</p>
                </div>
              </div>

              {selectedNode.type === 'trigger' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Select Trigger Event</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {triggerTypes.map(trigger => {
                        const Icon = trigger.icon;
                        const isSelected = selectedNode.triggerType === trigger.id;
                        return (
                          <button
                            key={trigger.id}
                            onClick={() => updateNode(selectedNode.id, { triggerType: trigger.id })}
                            className={cn(
                              "p-3 rounded-xl border flex flex-col items-start space-y-2 text-left transition-all",
                              isSelected 
                                ? "bg-blue-500/10 border-blue-500 ring-1 ring-blue-500" 
                                : "bg-[var(--color-bg)] border-[var(--color-border)] hover:border-blue-400/50 hover:bg-[var(--color-surface)]"
                            )}
                          >
                            <Icon className={cn("w-5 h-5", isSelected ? "text-blue-500" : "text-[var(--color-text-muted)]")} />
                            <span className={cn("text-sm font-medium", isSelected ? "text-blue-600" : "text-[var(--color-text)]")}>{trigger.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {selectedNode.type === 'action' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Choose Action</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {actionTypes.map(action => {
                        const Icon = action.icon;
                        const isSelected = selectedNode.actionType === action.id;
                        return (
                          <button
                            key={action.id}
                            onClick={() => updateNode(selectedNode.id, { actionType: action.id })}
                            className={cn(
                              "p-3 rounded-xl border flex items-center space-x-3 text-left transition-all",
                              isSelected 
                                ? "bg-blue-500/10 border-blue-500 ring-1 ring-blue-500" 
                                : "bg-[var(--color-bg)] border-[var(--color-border)] hover:border-blue-400/50 hover:bg-[var(--color-surface)]"
                            )}
                          >
                            <Icon className={cn("w-5 h-5", isSelected ? "text-blue-500" : "text-[var(--color-text-muted)]")} />
                            <span className={cn("text-sm font-medium", isSelected ? "text-blue-600" : "text-[var(--color-text)]")}>{action.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {selectedNode.actionType && (
                    <div className="pt-6 border-t border-[var(--color-border)] space-y-4">
                      <h3 className="font-semibold mb-2">Action Settings</h3>
                      
                      {selectedNode.actionType === 'send_whatsapp' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Message Template</label>
                            <textarea 
                              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                              placeholder="Hello {{patient.name}}, your appointment is confirmed for..."
                              value={selectedNode.config.message || ''}
                              onChange={(e) => updateNode(selectedNode.id, { config: { ...selectedNode.config, message: e.target.value }})}
                            />
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">Use {'{{variable}}'} tags to insert dynamic data.</p>
                          </div>
                        </div>
                      )}

                      {selectedNode.actionType === 'send_email' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Subject</label>
                            <input 
                              type="text"
                              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              placeholder="Appointment Confirmation"
                              value={selectedNode.config.subject || ''}
                              onChange={(e) => updateNode(selectedNode.id, { config: { ...selectedNode.config, subject: e.target.value }})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Body</label>
                            <textarea 
                              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                              placeholder="Dear {{patient.name}}..."
                              value={selectedNode.config.body || ''}
                              onChange={(e) => updateNode(selectedNode.id, { config: { ...selectedNode.config, body: e.target.value }})}
                            />
                          </div>
                        </div>
                      )}

                      {selectedNode.actionType === 'webhook_post' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Method</label>
                            <select 
                              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              value={selectedNode.config.method || 'POST'}
                              onChange={(e) => updateNode(selectedNode.id, { config: { ...selectedNode.config, method: e.target.value }})}
                            >
                              <option value="POST">POST</option>
                              <option value="GET">GET</option>
                              <option value="PUT">PUT</option>
                              <option value="PATCH">PATCH</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">URL</label>
                            <input 
                              type="url"
                              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              placeholder="https://api.example.com/webhook"
                              value={selectedNode.config.url || ''}
                              onChange={(e) => updateNode(selectedNode.id, { config: { ...selectedNode.config, url: e.target.value }})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Headers (JSON)</label>
                            <textarea 
                              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-3 min-h-[80px] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                              placeholder={'{ "Authorization": "Bearer token" }'}
                              value={selectedNode.config.headers || ''}
                              onChange={(e) => updateNode(selectedNode.id, { config: { ...selectedNode.config, headers: e.target.value }})}
                            />
                          </div>
                        </div>
                      )}

                      {!['send_whatsapp', 'send_email', 'webhook_post'].includes(selectedNode.actionType) && (
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Description / Notes</label>
                          <textarea 
                            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-3 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                            placeholder="Add details about this action..."
                            value={selectedNode.config.description || ''}
                            onChange={(e) => updateNode(selectedNode.id, { config: { ...selectedNode.config, description: e.target.value }})}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {selectedNode.type === 'condition' && (
                <div className="space-y-6">
                  <h3 className="font-semibold mb-4">Set Condition</h3>
                  <div className="space-y-4 bg-[var(--color-bg)] p-4 rounded-xl border border-[var(--color-border)]">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Field</label>
                        <select 
                          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          value={selectedNode.conditionField || ''}
                          onChange={(e) => updateNode(selectedNode.id, { conditionField: e.target.value })}
                        >
                          <option value="">Select field...</option>
                          <option value="patient.name">patient.name</option>
                          <option value="patient.phone">patient.phone</option>
                          <option value="appointment.service">appointment.service</option>
                          <option value="appointment.status">appointment.status</option>
                          <option value="payment.amount">payment.amount</option>
                          <option value="lead.status">lead.status</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Operator</label>
                        <select 
                          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          value={selectedNode.conditionOperator || ''}
                          onChange={(e) => updateNode(selectedNode.id, { conditionOperator: e.target.value })}
                        >
                          <option value="">Select operator...</option>
                          <option value="equals">Equals</option>
                          <option value="not_equals">Does not equal</option>
                          <option value="contains">Contains</option>
                          <option value="not_contains">Does not contain</option>
                          <option value="is_empty">Is empty</option>
                          <option value="is_not_empty">Is not empty</option>
                          <option value="greater_than">Greater than</option>
                          <option value="less_than">Less than</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Value</label>
                        <input 
                          type="text"
                          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="Value..."
                          value={selectedNode.conditionValue || ''}
                          onChange={(e) => updateNode(selectedNode.id, { conditionValue: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <button className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center space-x-1">
                    <Plus className="w-4 h-4" /> <span>Add Another Condition</span>
                  </button>
                </div>
              )}

              {selectedNode.type === 'delay' && (
                <div className="space-y-6">
                  <h3 className="font-semibold mb-4">Set Delay</h3>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Wait for</label>
                      <input 
                        type="number"
                        min="1"
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={selectedNode.config.duration || ''}
                        onChange={(e) => updateNode(selectedNode.id, { config: { ...selectedNode.config, duration: parseInt(e.target.value) || 0 }})}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Unit</label>
                      <select 
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={selectedNode.config.unit || 'minutes'}
                        onChange={(e) => updateNode(selectedNode.id, { config: { ...selectedNode.config, unit: e.target.value }})}
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-[var(--color-text-muted)] opacity-50" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Step Selected</h3>
              <p className="text-[var(--color-text-muted)] text-sm max-w-[250px]">Click on a step in the canvas to view and edit its configuration.</p>
            </div>
          )}

          {/* Context Variables & Connections */}
          <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            <details className="group cursor-pointer">
              <summary className="flex items-center justify-between font-medium text-sm list-none select-none">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span>Context Variables & Connections</span>
                </div>
                <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)] group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Available Variables</h4>
                  <div className="flex flex-wrap gap-2">
                    {['{{patient.name}}', '{{patient.phone}}', '{{appointment.date}}', '{{appointment.service}}', '{{payment.amount}}'].map(v => (
                      <span key={v} className="text-xs font-mono bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-1 rounded text-blue-500 cursor-copy hover:bg-blue-500/10 transition-colors">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">API Connections</h4>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-[var(--color-text-muted)] block">WhatsApp API Key</label>
                    <div className="flex space-x-2">
                      <input 
                        type="password" 
                        placeholder="sk_live_..."
                        className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={activeSequence.apiKeys?.whatsappApiKey || ''}
                        onChange={e => updateActiveSequence({ apiKeys: { ...activeSequence.apiKeys, whatsappApiKey: e.target.value }})}
                      />
                      <button className="bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-bg)] px-3 rounded-md text-xs font-medium transition-colors">Test</button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-[var(--color-text-muted)] block">Voice AI Key</label>
                    <div className="flex space-x-2">
                      <input 
                        type="password" 
                        placeholder="v_ai_..."
                        className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={activeSequence.apiKeys?.voiceAiKey || ''}
                        onChange={e => updateActiveSequence({ apiKeys: { ...activeSequence.apiKeys, voiceAiKey: e.target.value }})}
                      />
                      <button className="bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-bg)] px-3 rounded-md text-xs font-medium transition-colors">Test</button>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Test Log Panel Sliding Up */}
      <AnimatePresence>
        {(isTestRunning || testResults.length > 0) && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed bottom-0 left-0 right-0 h-64 bg-[var(--color-surface)] border-t border-[var(--color-border)] shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Test Runner</h3>
                {isTestRunning ? (
                  <span className="ml-2 text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-medium flex items-center">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5 animate-pulse" /> Running
                  </span>
                ) : (
                  <span className={cn("ml-2 text-xs px-2 py-0.5 rounded-full font-medium flex items-center", 
                    testResults.some(r => r.status === 'failed') ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                  )}>
                    {testResults.some(r => r.status === 'failed') ? 'Test Failed' : 'Test Passed'}
                  </span>
                )}
              </div>
              <button 
                onClick={() => { setIsTestRunning(false); setTestResults([]); }}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
              {testResults.map((result, idx) => {
                const node = activeSequence.nodes.find(n => n.id === result.nodeId);
                return (
                  <div key={idx} className={cn("flex items-start space-x-3 p-3 rounded-lg border", 
                    result.status === 'running' ? "bg-amber-500/5 border-amber-500/20 text-amber-600/90" :
                    result.status === 'passed' ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600/90" :
                    "bg-red-500/5 border-red-500/20 text-red-600/90"
                  )}>
                    <div className="mt-0.5">
                      {result.status === 'running' && <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />}
                      {result.status === 'passed' && <Check className="w-4 h-4" />}
                      {result.status === 'failed' && <X className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-semibold">{node?.type.toUpperCase()} - {node?.label}</div>
                      {result.log && <div className="text-xs opacity-80 mt-1">{result.log}</div>}
                    </div>
                  </div>
                );
              })}
              {isTestRunning && (
                <div className="flex items-center space-x-2 text-[var(--color-text-muted)] p-3">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs">Waiting for step execution...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
