'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNiche } from '@/components/providers/niche-provider';
import { 
  Bot, 
  Cpu, 
  Save, 
  CheckCircle2, 
  Languages, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Info, 
  Wand2, 
  Braces,
  Edit2,
  X,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sliders
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Regional Tone Presets
const DEFAULT_TONES = [
  {
    id: 'warm_local',
    name: 'Warm & Hospitable (Regional Friendly)',
    tag: 'RECOMMENDED',
    description: 'Polite English mixed with warm, respectful honorifics (Namaskaram, Sir/Maam). Ideal for premium customer care.',
    greeting: 'Namaskaram! Welcome to {{business_name}}. How may I assist with your booking or inquiries today?',
    promptStyle: 'Respectful, hospitable, uses natural local phrasing, concise 2-sentence responses.',
    badge: 'Popular'
  },
  {
    id: 'fast_express',
    name: 'Executive Express (Fast & Precise)',
    tag: 'FAST & DIRECT',
    description: 'Efficient, crisp English with instant slot options. Tailored for busy professionals.',
    greeting: 'Hello! You have reached {{business_name}}. Are you calling to book a slot or check pricing?',
    promptStyle: 'Direct, zero fluff, instant slot recommendations, bullet-fast info.',
    badge: 'High Conversion'
  },
  {
    id: 'luxury_concierge',
    name: 'Luxury Concierge',
    tag: 'PREMIUM',
    description: 'Calm, elegant, reassuring tone focusing on top-tier service, safety protocols, and personalized care.',
    greeting: 'Good day. Welcome to {{business_name}}. How can our specialists guide your experience today?',
    promptStyle: 'Refined vocabulary, emphasizes quality safety standards, luxury touch.',
    badge: 'VIP Tone'
  }
];

// Pre-configured Policy Rules
const DEFAULT_RULES = [
  { id: '1', title: 'Medical / Treatment Prescription Safety', rule: 'STRICT: Never prescribe medical drugs, dosages, or irreversible procedures over the phone. Direct callers to mandatory in-person specialist consultation.', category: 'Safety' },
  { id: '2', title: 'Pre-Session Assessment Requirement', rule: 'For procedure inquiries, remind the caller that an initial diagnostic assessment is recommended prior to scheduling treatment.', category: 'Clinical SOP' },
  { id: '3', title: 'Slot Booking Urgency & Conversion', rule: 'Always offer 2 open time slots (e.g. "Tomorrow at 11 AM or Friday at 4 PM") to increase immediate booking conversion.', category: 'Sales' },
  { id: '4', title: 'Transparent Pricing Disclosure', rule: 'State pricing clearly in INR. Mention that multi-session packages include a 20% bundle discount.', category: 'Pricing' },
  { id: '5', title: 'Multi-Lingual Handling', rule: 'If caller speaks Telugu, Hindi, or mixed phrases, maintain courteous, clear bilingual communication.', category: 'Language' },
];

interface InputVar {
  token: string;
  label: string;
  fallback: string;
  source?: string;
}

export default function VoiceKnowledgeHubPage() {
  const { currentNiche, nicheConfig } = useNiche();

  const getInitialPrompt = () => nicheConfig?.goldenPrompt || 'You are an intelligent, courteous AI receptionist for {{business_name}}. Greet the caller warmly, answer queries using the knowledge base, and assist with scheduling appointments.';

  const getInitialRules = () => {
    if (nicheConfig?.aiRules && nicheConfig.aiRules.length > 0) {
      return (nicheConfig.aiRules as any[]).map((r, i) => ({
        id: r.id || `rule-${i}`,
        title: r.title || 'AI Rule',
        rule: r.rule || r.content || '',
        category: r.category || 'Policy'
      }));
    }
    return DEFAULT_RULES;
  };

  const getInitialVariables = (): InputVar[] => {
    if (nicheConfig?.inputVariables && nicheConfig.inputVariables.length > 0) {
      return (nicheConfig.inputVariables as any[]).map((v) => ({
        token: v.token || v.name || 'variable',
        label: v.label || v.desc || 'Dynamic variable',
        fallback: v.fallback || v.defaultVal || 'Valued Client',
        source: v.source || 'CRM Context'
      }));
    }
    return [
      { token: 'customer_name', label: 'Caller Full Name', fallback: 'Valued Client', source: 'CRM Context' },
      { token: 'assigned_staff', label: 'Doctor / Specialist Name', fallback: 'Senior Specialist', source: 'Calendar API' },
      { token: 'clinic_branch', label: 'Center Branch Location', fallback: 'Main Center', source: 'Tenant Config' },
      { token: 'last_service_date', label: 'Last Visit Date', fallback: 'Recent', source: 'Database' }
    ];
  };

  const [goldenPrompt, setGoldenPrompt] = useState(getInitialPrompt());
  const [rules, setRules] = useState(getInitialRules());
  const [inputVariables, setInputVariables] = useState<InputVar[]>(getInitialVariables());
  const [selectedTone, setSelectedTone] = useState(nicheConfig?.tones?.[0]?.id || 'warm_local');
  const [tonesList, setTonesList] = useState<any[]>(nicheConfig?.tones || DEFAULT_TONES);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Edit / Add Rule Modal
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleContent, setRuleContent] = useState('');
  const [ruleCategory, setRuleCategory] = useState('Safety');

  // Edit / Add Variable Modal
  const [isVarModalOpen, setIsVarModalOpen] = useState(false);
  const [editingVarToken, setEditingVarToken] = useState<string | null>(null);
  const [varToken, setVarToken] = useState('');
  const [varLabel, setVarLabel] = useState('');
  const [varFallback, setVarFallback] = useState('');

  // Niche change reload & local storage
  useEffect(() => {
    const savedPrompt = localStorage.getItem(`zerodesk_prompt_${currentNiche}`);
    if (savedPrompt) setGoldenPrompt(savedPrompt);
    else setGoldenPrompt(getInitialPrompt());

    const savedRules = localStorage.getItem(`zerodesk_rules_${currentNiche}`);
    if (savedRules) {
      try { setRules(JSON.parse(savedRules)); } catch (e) {}
    } else {
      setRules(getInitialRules());
    }

    const savedVars = localStorage.getItem(`zerodesk_vars_${currentNiche}`);
    if (savedVars) {
      try { setInputVariables(JSON.parse(savedVars)); } catch (e) {}
    } else {
      setInputVariables(getInitialVariables());
    }

    setTonesList(nicheConfig?.tones || DEFAULT_TONES);
  }, [currentNiche, nicheConfig]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveAll = async () => {
    localStorage.setItem(`zerodesk_prompt_${currentNiche}`, goldenPrompt);
    localStorage.setItem(`zerodesk_rules_${currentNiche}`, JSON.stringify(rules));
    localStorage.setItem(`zerodesk_vars_${currentNiche}`, JSON.stringify(inputVariables));
    
    try {
      const { apiClient } = await import('@/lib/api-client');
      const activeTone = tonesList.find((t: any) => t.id === selectedTone);
      await apiClient('/voice/config', {
        method: 'PUT',
        body: JSON.stringify({
          systemPrompt: goldenPrompt,
          greeting: activeTone?.greeting,
          niche: currentNiche,
          rules,
          variables: inputVariables,
        }),
      });
      showToast('✨ Voice AI Instructions & Golden Prompt Saved & Synced to Cloud!');
    } catch {
      showToast('✨ Voice AI Instructions Saved to Local Workspace!');
    }
  };

  const handleResetPrompt = () => {
    const def = getInitialPrompt();
    setGoldenPrompt(def);
    localStorage.setItem(`zerodesk_prompt_${currentNiche}`, def);
    showToast('Prompt reset to default');
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(goldenPrompt);
    setCopied(true);
    showToast('Golden Prompt copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const insertTokenIntoPrompt = (token: string) => {
    setGoldenPrompt(prev => `${prev} {{${token}}}`);
  };

  // Rule Handlers
  const openAddRule = () => {
    setEditingRuleId(null);
    setRuleTitle('');
    setRuleContent('');
    setRuleCategory('Safety');
    setIsRuleModalOpen(true);
  };

  const openEditRule = (r: any) => {
    setEditingRuleId(r.id);
    setRuleTitle(r.title);
    setRuleContent(r.rule);
    setRuleCategory(r.category || 'Policy');
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleTitle.trim() || !ruleContent.trim()) return;

    if (editingRuleId) {
      const updated = rules.map(r => r.id === editingRuleId ? { ...r, title: ruleTitle, rule: ruleContent, category: ruleCategory } : r);
      setRules(updated);
      localStorage.setItem(`zerodesk_rules_${currentNiche}`, JSON.stringify(updated));
      showToast('AI Rule updated!');
    } else {
      const created = {
        id: Date.now().toString(),
        title: ruleTitle,
        rule: ruleContent,
        category: ruleCategory
      };
      const updated = [...rules, created];
      setRules(updated);
      localStorage.setItem(`zerodesk_rules_${currentNiche}`, JSON.stringify(updated));
      showToast('New AI Rule added!');
    }
    setIsRuleModalOpen(false);
  };

  const handleDeleteRule = (id: string) => {
    const updated = rules.filter(r => r.id !== id);
    setRules(updated);
    localStorage.setItem(`zerodesk_rules_${currentNiche}`, JSON.stringify(updated));
    showToast('Rule removed');
  };

  // Variable Handlers
  const openAddVar = () => {
    setEditingVarToken(null);
    setVarToken('');
    setVarLabel('');
    setVarFallback('');
    setIsVarModalOpen(true);
  };

  const openEditVar = (v: InputVar) => {
    setEditingVarToken(v.token);
    setVarToken(v.token);
    setVarLabel(v.label);
    setVarFallback(v.fallback);
    setIsVarModalOpen(true);
  };

  const handleSaveVar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!varToken.trim()) return;

    const cleanedToken = varToken.replace(/[{}]/g, '').trim();

    if (editingVarToken) {
      const updated = inputVariables.map(v => v.token === editingVarToken ? { ...v, token: cleanedToken, label: varLabel, fallback: varFallback } : v);
      setInputVariables(updated);
      localStorage.setItem(`zerodesk_vars_${currentNiche}`, JSON.stringify(updated));
      showToast('Variable updated!');
    } else {
      const created: InputVar = {
        token: cleanedToken,
        label: varLabel || cleanedToken,
        fallback: varFallback || 'N/A',
        source: 'Custom Context'
      };
      const updated = [...inputVariables, created];
      setInputVariables(updated);
      localStorage.setItem(`zerodesk_vars_${currentNiche}`, JSON.stringify(updated));
      showToast('New variable token added!');
    }
    setIsVarModalOpen(false);
  };

  const handleDeleteVar = (token: string) => {
    const updated = inputVariables.filter(v => v.token !== token);
    setInputVariables(updated);
    localStorage.setItem(`zerodesk_vars_${currentNiche}`, JSON.stringify(updated));
    showToast('Variable removed');
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

      {/* Clean Page Header (Removed unwanted tags/pills as requested) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Voice AI Knowledge Hub</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Configure your Voice AI Receptionist’s behavioral rules, Golden System Prompt, and personalization tokens.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
        >
          <Save size={16} />
          <span>Save AI Instructions</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Golden Prompt Editor, Variables & Tones */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Golden Prompt Editor Card */}
          <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 size={20} className="text-blue-500" />
                <h2 className="text-base font-bold text-[var(--color-text)]">Voice AI "Golden System Prompt" Editor</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetPrompt}
                  className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors bg-[var(--color-bg)] px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] cursor-pointer"
                  title="Reset to default prompt"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
                <button 
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-blue-500 transition-colors bg-[var(--color-bg)] px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-[var(--color-text-muted)]">
              This prompt instructs OpenAI & ElevenLabs on how to speak during live phone calls. You can edit any sentence below.
            </p>

            {/* Quick Variable Token Inserters */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Click to insert token into prompt:</span>
              <div className="flex flex-wrap gap-1.5">
                {inputVariables.map((v) => (
                  <button
                    key={v.token}
                    type="button"
                    onClick={() => insertTokenIntoPrompt(v.token)}
                    className="px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/30 text-blue-600 dark:text-blue-300 font-mono text-[10px] rounded-md transition-colors cursor-pointer"
                  >
                    + {`{{${v.token}}}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <textarea
                value={goldenPrompt}
                onChange={(e) => setGoldenPrompt(e.target.value)}
                rows={11}
                className="w-full p-4 rounded-xl font-mono text-xs bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y shadow-inner leading-relaxed"
                placeholder="Enter Voice AI Golden System Prompt instructions..."
              />
              <div className="flex items-center justify-between pt-1 px-1 text-[10px] text-[var(--color-text-muted)] font-mono">
                <span>{goldenPrompt.length} characters · {goldenPrompt.split(/\s+/).filter(Boolean).length} words</span>
                <span>System Prompt · UTF-8</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
              <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
              <div>
                <span className="font-bold">Dynamic Knowledge Base Connection:</span> Live pricing and open appointment slots from your <span className="font-semibold text-[var(--color-text)] underline">Company Knowledge Base</span> are automatically injected below this prompt on every incoming call.
              </div>
            </div>
          </div>

          {/* Input Variables & Personalization Tokens */}
          <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Braces size={20} className="text-cyan-500" />
                <h2 className="text-base font-bold text-[var(--color-text)]">Input Variables & Personalization Tokens</h2>
              </div>
              <button
                onClick={openAddVar}
                className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Token</span>
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-muted)]">
              Dynamic variables passed to the Voice AI before a call starts (e.g. caller name, doctor name, clinic branch).
            </p>

            <div className="space-y-2.5">
              {inputVariables.map((v) => (
                <div 
                  key={v.token} 
                  className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs hover:border-blue-500/40 transition-all group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {`{{${v.token}}}`}
                      </span>
                      <span className="text-[var(--color-text-muted)] text-xs">
                        Fallback: <strong className="text-[var(--color-text)]">"{v.fallback}"</strong>
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] font-sans">{v.label}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-1 rounded">
                      {v.source || 'Context API'}
                    </span>
                    <button
                      onClick={() => openEditVar(v)}
                      className="p-1.5 hover:bg-blue-500/20 text-[var(--color-text-muted)] hover:text-blue-500 rounded-lg transition-colors cursor-pointer"
                      title="Edit variable"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteVar(v.token)}
                      className="p-1.5 hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                      title="Delete variable"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Tone Selection */}
          <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Languages size={20} className="text-cyan-500" />
              <h2 className="text-base font-bold text-[var(--color-text)]">Persona & Tone Persona Selection</h2>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Choose the communication demeanor for your AI receptionist.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              {tonesList.map((tone: any) => (
                <button
                  key={tone.id}
                  onClick={() => setSelectedTone(tone.id)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between h-full group cursor-pointer",
                    selectedTone === tone.id
                      ? "bg-blue-500/10 border-blue-500 shadow-sm"
                      : "bg-[var(--color-bg)] border-[var(--color-border)] hover:border-blue-500/40"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                        selectedTone === tone.id ? "bg-blue-600 text-white" : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                      )}>
                        {tone.tag || 'Style'}
                      </span>
                      {selectedTone === tone.id && (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      )}
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-[var(--color-text)] group-hover:text-blue-500 transition-colors">
                      {tone.name}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-snug">
                      {tone.description}
                    </p>
                  </div>

                  {tone.greeting && (
                    <div className="mt-3 pt-2.5 border-t border-[var(--color-border)] text-[11px] text-cyan-600 dark:text-cyan-400 font-mono line-clamp-2">
                      💬 "{tone.greeting}"
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: AI Policy Rules (Editable) */}
        <div className="space-y-6">
          <div className="p-6 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-500" />
                <h2 className="text-base font-bold text-[var(--color-text)]">AI Policy Rules</h2>
              </div>
              <button
                onClick={openAddRule}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-300 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus size={14} />
                <span>Add Rule</span>
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-muted)]">
              Operational guardrails the AI Voice Receptionist must strictly follow at all times. Click any rule to edit.
            </p>

            <div className="space-y-3">
              {rules.map((r: any) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-blue-500/40 transition-all group relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 cursor-pointer" onClick={() => openEditRule(r)}>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20">
                        {r.category || 'Policy'}
                      </span>
                      <h3 className="font-bold text-xs text-[var(--color-text)] mt-1.5 group-hover:text-blue-500 transition-colors">
                        {r.title}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                        {r.rule}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditRule(r)}
                        className="p-1.5 hover:bg-blue-500/20 text-[var(--color-text-muted)] hover:text-blue-500 rounded-lg transition-colors"
                        title="Edit rule"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(r.id)}
                        className="p-1.5 hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-500 rounded-lg transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Add / Edit AI Rule Modal */}
      <AnimatePresence>
        {isRuleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>{editingRuleId ? 'Edit AI Rule' : 'Add AI Policy Rule'}</span>
                </h3>
                <button onClick={() => setIsRuleModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveRule} className="space-y-3">
                <div>
                  <label className="block text-[var(--color-text)] font-semibold mb-1">Rule Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. No Medical Prescriptions"
                    value={ruleTitle}
                    onChange={(e) => setRuleTitle(e.target.value)}
                    className="w-full p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[var(--color-text-muted)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--color-text)] font-semibold mb-1">Category</label>
                  <select
                    value={ruleCategory}
                    onChange={(e) => setRuleCategory(e.target.value)}
                    className="w-full p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Safety">Safety & Compliance</option>
                    <option value="Clinical SOP">Clinical SOP</option>
                    <option value="Sales">Sales & Booking</option>
                    <option value="Pricing">Pricing & Discounts</option>
                    <option value="Language">Language & Tone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--color-text)] font-semibold mb-1">Rule Instruction / Constraint</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Explain the boundary or instruction the Voice AI must obey..."
                    value={ruleContent}
                    onChange={(e) => setRuleContent(e.target.value)}
                    className="w-full p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[var(--color-text-muted)] leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => setIsRuleModalOpen(false)}
                    className="px-4 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-xl hover:bg-[var(--color-surface)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md"
                  >
                    {editingRuleId ? 'Update Rule' : 'Save Rule'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Input Variable Modal */}
      <AnimatePresence>
        {isVarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
                  <Braces size={16} className="text-cyan-500" />
                  <span>{editingVarToken ? 'Edit Variable Token' : 'Add Variable Token'}</span>
                </h3>
                <button onClick={() => setIsVarModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveVar} className="space-y-3">
                <div>
                  <label className="block text-[var(--color-text)] font-semibold mb-1">Variable Token Name *</label>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-500 font-mono text-sm">{`{{`}</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. discount_code"
                      value={varToken}
                      onChange={(e) => setVarToken(e.target.value)}
                      className="flex-1 p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[var(--color-text-muted)]"
                    />
                    <span className="text-blue-500 font-mono text-sm">{`}}`}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--color-text)] font-semibold mb-1">Description / Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Promotional discount code"
                    value={varLabel}
                    onChange={(e) => setVarLabel(e.target.value)}
                    className="w-full p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[var(--color-text-muted)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--color-text)] font-semibold mb-1">Default / Fallback Value</label>
                  <input
                    type="text"
                    placeholder="e.g. None"
                    value={varFallback}
                    onChange={(e) => setVarFallback(e.target.value)}
                    className="w-full p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[var(--color-text-muted)]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => setIsVarModalOpen(false)}
                    className="px-4 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-xl hover:bg-[var(--color-surface)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md"
                  >
                    Save Token
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
