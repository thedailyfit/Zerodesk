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
  MessageCircle,
  Link,
  Image as ImageIcon,
  Clock,
  ToggleLeft,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Regional Tone Presets
const DEFAULT_TONES = [
  {
    id: 'warm_local',
    name: 'Warm & Hospitable (Regional Friendly)',
    tag: 'RECOMMENDED',
    description: 'Polite English mixed with warm, respectful honorifics. Ideal for premium customer care.',
    greeting: 'Namaskaram! Welcome to {{business_name}}. How may I assist with your booking or inquiries today?',
    promptStyle: 'Respectful, hospitable, uses natural local phrasing, concise 2-sentence responses.',
    badge: 'Popular'
  },
  {
    id: 'fast_express',
    name: 'Executive Express (Fast & Precise)',
    tag: 'FAST & DIRECT',
    description: 'Efficient, crisp English with instant slot options. Tailored for busy professionals.',
    greeting: 'Hello! You have reached {{business_name}}. Are you here to book a slot or check pricing?',
    promptStyle: 'Direct, zero fluff, instant slot recommendations, bullet-fast info.',
    badge: 'High Conversion'
  },
  {
    id: 'luxury_concierge',
    name: 'Luxury Concierge',
    tag: 'PREMIUM',
    description: 'Calm, elegant, reassuring tone focusing on top-tier service and personalized care.',
    greeting: 'Good day. Welcome to {{business_name}}. How can our specialists guide your experience today?',
    promptStyle: 'Refined vocabulary, emphasizes quality standards, luxury touch.',
    badge: 'VIP Tone'
  }
];

// Pre-configured Policy Rules
const DEFAULT_RULES = [
  { id: '1', title: 'Medical / Treatment Prescription Safety', rule: 'STRICT: Never prescribe medical drugs, dosages, or irreversible procedures via WhatsApp. Direct users to mandatory in-person specialist consultation.', category: 'Safety' },
  { id: '2', title: 'Pre-Session Assessment Requirement', rule: 'For procedure inquiries, remind the user that an initial diagnostic assessment is recommended prior to scheduling treatment.', category: 'Clinical SOP' },
  { id: '3', title: 'Slot Booking Urgency & Conversion', rule: 'Always offer 2 open time slots (e.g. "Tomorrow at 11 AM or Friday at 4 PM") to increase immediate booking conversion.', category: 'Sales' },
  { id: '4', title: 'Transparent Pricing Disclosure', rule: 'State pricing clearly in INR. Mention that multi-session packages include a 20% bundle discount.', category: 'Pricing' },
  { id: '5', title: 'Multi-Lingual Handling', rule: 'If user speaks Telugu, Hindi, or mixed phrases, maintain courteous, clear bilingual communication.', category: 'Language' },
];

interface InputVar {
  token: string;
  label: string;
  fallback: string;
  source?: string;
}

export default function WhatsAppKnowledgeHubPage() {
  const { currentNiche, nicheConfig } = useNiche();

  const getInitialPrompt = () => nicheConfig?.goldenPrompt || 'You are an intelligent, courteous AI WhatsApp assistant for {{business_name}}. Greet the user warmly, answer queries using the knowledge base, and assist with scheduling appointments via WhatsApp.';

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
      { token: 'customer_name', label: 'WhatsApp Profile Name', fallback: 'Friend', source: 'WhatsApp API' },
      { token: 'assigned_staff', label: 'Doctor / Specialist Name', fallback: 'Senior Specialist', source: 'Calendar API' },
      { token: 'clinic_branch', label: 'Center Branch Location', fallback: 'Main Center', source: 'Tenant Config' },
      { token: 'last_interaction', label: 'Last Chat Date', fallback: 'Recently', source: 'Database' }
    ];
  };

  const [goldenPrompt, setGoldenPrompt] = useState(getInitialPrompt());
  const [rules, setRules] = useState(getInitialRules());
  const [inputVariables, setInputVariables] = useState<InputVar[]>(getInitialVariables());
  const [selectedTone, setSelectedTone] = useState(nicheConfig?.tones?.[0]?.id || 'warm_local');
  const [tonesList, setTonesList] = useState<any[]>(nicheConfig?.tones || DEFAULT_TONES);
  
  // WhatsApp Specific State
  const [linkedTemplate, setLinkedTemplate] = useState('welcome_template_01');
  const [autoAttachImages, setAutoAttachImages] = useState(true);
  const [autoAttachPdfs, setAutoAttachPdfs] = useState(false);
  const [autoAttachLocation, setAutoAttachLocation] = useState(true);
  const [businessHoursEnabled, setBusinessHoursEnabled] = useState(false);
  const [outsideHoursMessage, setOutsideHoursMessage] = useState('We are currently closed. We will get back to you during working hours.');
  const [responseDelay, setResponseDelay] = useState(3);
  
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
    const savedPrompt = localStorage.getItem(`zerodesk_whatsapp_prompt_${currentNiche}`);
    if (savedPrompt) setGoldenPrompt(savedPrompt);
    else setGoldenPrompt(getInitialPrompt());

    const savedRules = localStorage.getItem(`zerodesk_whatsapp_rules_${currentNiche}`);
    if (savedRules) {
      try { setRules(JSON.parse(savedRules)); } catch (e) {}
    } else {
      setRules(getInitialRules());
    }

    const savedVars = localStorage.getItem(`zerodesk_whatsapp_vars_${currentNiche}`);
    if (savedVars) {
      try { setInputVariables(JSON.parse(savedVars)); } catch (e) {}
    } else {
      setInputVariables(getInitialVariables());
    }

    const savedSettings = localStorage.getItem(`zerodesk_whatsapp_settings_${currentNiche}`);
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setLinkedTemplate(settings.linkedTemplate || 'welcome_template_01');
        setAutoAttachImages(settings.autoAttachImages ?? true);
        setAutoAttachPdfs(settings.autoAttachPdfs ?? false);
        setAutoAttachLocation(settings.autoAttachLocation ?? true);
        setBusinessHoursEnabled(settings.businessHoursEnabled ?? false);
        setOutsideHoursMessage(settings.outsideHoursMessage || 'We are currently closed. We will get back to you during working hours.');
        setResponseDelay(settings.responseDelay || 3);
      } catch (e) {}
    }

    setTonesList(nicheConfig?.tones || DEFAULT_TONES);
  }, [currentNiche, nicheConfig]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveAll = () => {
    localStorage.setItem(`zerodesk_whatsapp_prompt_${currentNiche}`, goldenPrompt);
    localStorage.setItem(`zerodesk_whatsapp_rules_${currentNiche}`, JSON.stringify(rules));
    localStorage.setItem(`zerodesk_whatsapp_vars_${currentNiche}`, JSON.stringify(inputVariables));
    localStorage.setItem(`zerodesk_whatsapp_settings_${currentNiche}`, JSON.stringify({
      linkedTemplate,
      autoAttachImages,
      autoAttachPdfs,
      autoAttachLocation,
      businessHoursEnabled,
      outsideHoursMessage,
      responseDelay
    }));
    showToast('✨ WhatsApp AI System Prompt, Rules & Settings Saved!');
  };

  const handleResetPrompt = () => {
    const def = getInitialPrompt();
    setGoldenPrompt(def);
    localStorage.setItem(`zerodesk_whatsapp_prompt_${currentNiche}`, def);
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
      showToast('New AI Rule added!');
    }
    setIsRuleModalOpen(false);
  };

  const handleDeleteRule = (id: string) => {
    const updated = rules.filter(r => r.id !== id);
    setRules(updated);
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
      showToast('New variable token added!');
    }
    setIsVarModalOpen(false);
  };

  const handleDeleteVar = (token: string) => {
    const updated = inputVariables.filter(v => v.token !== token);
    setInputVariables(updated);
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">WhatsApp AI Knowledge Hub</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Configure your WhatsApp bot's behavior, message templates, auto-replies, and AI prompts.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
        >
          <Save size={16} />
          <span>Save WhatsApp Settings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Golden Prompt Editor */}
          <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 size={20} className="text-green-500" />
                <h2 className="text-base font-bold text-[var(--color-text)]">WhatsApp "Golden System Prompt" Editor</h2>
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
                  className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-green-500 transition-colors bg-[var(--color-bg)] px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-[var(--color-text-muted)]">
              This prompt instructs your WhatsApp AI bot on how to chat with customers on WhatsApp.
            </p>

            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">Click to insert token into prompt:</span>
              <div className="flex flex-wrap gap-1.5">
                {inputVariables.map((v) => (
                  <button
                    key={v.token}
                    type="button"
                    onClick={() => insertTokenIntoPrompt(v.token)}
                    className="px-2 py-0.5 bg-green-500/10 hover:bg-green-500/25 border border-green-500/30 text-green-600 dark:text-green-300 font-mono text-[10px] rounded-md transition-colors cursor-pointer"
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
                rows={8}
                className="w-full p-4 rounded-xl font-mono text-xs bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all resize-y shadow-inner leading-relaxed"
                placeholder="Enter WhatsApp Golden System Prompt instructions..."
              />
              <div className="flex items-center justify-between pt-1 px-1 text-[10px] text-[var(--color-text-muted)] font-mono">
                <span>{goldenPrompt.length} characters · {goldenPrompt.split(/\s+/).filter(Boolean).length} words</span>
                <span>System Prompt · UTF-8</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Specific Settings */}
          <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-6 shadow-sm">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} className="text-emerald-500" />
              <h2 className="text-base font-bold text-[var(--color-text)]">WhatsApp Experience Settings</h2>
            </div>

            <div className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Template Linker */}
                <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Link size={16} className="text-emerald-500" />
                    <span className="text-sm font-semibold text-[var(--color-text)]">Message Template Linker</span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] mb-3">Select the Meta pre-approved template for first contact.</p>
                  <select
                    value={linkedTemplate}
                    onChange={(e) => setLinkedTemplate(e.target.value)}
                    className="w-full p-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="welcome_template_01">Welcome template 01</option>
                    <option value="appointment_reminder_01">Appointment Reminder 01</option>
                    <option value="follow_up_01">Follow Up 01</option>
                  </select>
                </div>

                {/* Response Delay */}
                <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-emerald-500" />
                    <span className="text-sm font-semibold text-[var(--color-text)]">Natural Response Delay</span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] mb-3">Delay before AI responds to simulate natural typing (seconds)</p>
                  <input
                    type="number"
                    value={responseDelay}
                    onChange={(e) => setResponseDelay(parseInt(e.target.value))}
                    className="w-full p-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:ring-2 focus:ring-emerald-500"
                    min="0"
                    step="1"
                  />
                </div>
              </div>

              {/* Media Response Rules */}
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
                 <div className="flex items-center gap-2 mb-3">
                  <ImageIcon size={16} className="text-emerald-500" />
                  <span className="text-sm font-semibold text-[var(--color-text)]">Media Response Rules</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={autoAttachImages} onChange={(e) => setAutoAttachImages(e.target.checked)} className="rounded bg-[var(--color-surface)] border-[var(--color-border)] text-emerald-500" />
                    <span className="text-sm text-[var(--color-text)]">Auto-attach Images</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={autoAttachPdfs} onChange={(e) => setAutoAttachPdfs(e.target.checked)} className="rounded bg-[var(--color-surface)] border-[var(--color-border)] text-emerald-500" />
                    <span className="text-sm text-[var(--color-text)]">Auto-attach PDFs</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={autoAttachLocation} onChange={(e) => setAutoAttachLocation(e.target.checked)} className="rounded bg-[var(--color-surface)] border-[var(--color-border)] text-emerald-500" />
                    <span className="text-sm text-[var(--color-text)]">Auto-attach Location Pin</span>
                  </label>
                </div>
              </div>

              {/* Business Hours */}
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ToggleLeft size={16} className="text-emerald-500" />
                    <span className="text-sm font-semibold text-[var(--color-text)]">Business Hours Auto-Reply</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={businessHoursEnabled} onChange={(e) => setBusinessHoursEnabled(e.target.checked)} />
                    <div className="w-9 h-5 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <textarea
                  value={outsideHoursMessage}
                  onChange={(e) => setOutsideHoursMessage(e.target.value)}
                  disabled={!businessHoursEnabled}
                  rows={2}
                  className="w-full p-3 rounded-lg text-sm bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-emerald-500 text-[var(--color-text)] disabled:opacity-50"
                  placeholder="Enter message to send outside business hours..."
                />
              </div>

            </div>
          </div>

          {/* Variables & Tones */}
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
            
            <div className="space-y-2.5">
              {inputVariables.map((v) => (
                <div 
                  key={v.token} 
                  className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs hover:border-green-500/40 transition-all group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 dark:text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
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
                    <button onClick={() => openEditVar(v)} className="p-1.5 hover:bg-green-500/20 text-[var(--color-text-muted)] hover:text-green-500 rounded-lg transition-colors cursor-pointer">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDeleteVar(v.token)} className="p-1.5 hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-500 rounded-lg transition-colors cursor-pointer">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: AI Policy Rules (Editable) */}
        <div className="space-y-6">
          <div className="p-6 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-400" />
                <h2 className="text-base font-bold text-[var(--color-text)]">WhatsApp Policy Rules</h2>
              </div>
              <button
                onClick={openAddRule}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-600 dark:text-green-300 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus size={14} />
                <span>Add Rule</span>
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-muted)]">
              Operational guardrails the AI WhatsApp bot must strictly follow at all times.
            </p>

            <div className="space-y-3">
              {rules.map((r: any) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-green-500/40 transition-all group relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 cursor-pointer" onClick={() => openEditRule(r)}>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-green-400 border border-green-500/20 dark:text-green-300">
                        {r.category || 'Policy'}
                      </span>
                      <h3 className="font-bold text-xs text-[var(--color-text)] mt-1.5 group-hover:text-green-400 transition-colors">
                        {r.title}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                        {r.rule}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEditRule(r)} className="p-1.5 hover:bg-green-500/20 text-[var(--color-text-muted)] hover:text-green-400 rounded-lg transition-colors cursor-pointer">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDeleteRule(r.id)} className="p-1.5 hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400 rounded-lg transition-colors cursor-pointer">
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

      {/* Modals for Rules and Variables */}
      <AnimatePresence>
        {isRuleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>{editingRuleId ? 'Edit AI Rule' : 'Add AI Policy Rule'}</span>
                </h3>
                <button onClick={() => setIsRuleModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveRule} className="space-y-3">
                <div>
                  <label className="block text-[var(--color-text)] font-semibold mb-1">Rule Title</label>
                  <input
                    type="text"
                    required
                    value={ruleTitle}
                    onChange={(e) => setRuleTitle(e.target.value)}
                    className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-text)] font-semibold mb-1">Category</label>
                  <select
                    value={ruleCategory}
                    onChange={(e) => setRuleCategory(e.target.value)}
                    className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    value={ruleContent}
                    onChange={(e) => setRuleContent(e.target.value)}
                    className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                  <button type="button" onClick={() => setIsRuleModalOpen(false)} className="px-4 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-xl cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl cursor-pointer">Save Rule</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isVarModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
                  <Braces size={16} className="text-cyan-500" />
                  <span>{editingVarToken ? 'Edit Variable Token' : 'Add Variable Token'}</span>
                </h3>
                <button onClick={() => setIsVarModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveVar} className="space-y-3">
                <div>
                  <label className="block text-[var(--color-text)] font-semibold mb-1">Variable Token Name *</label>
                  <div className="flex items-center gap-1">
                    <span className="text-green-500 font-mono text-sm">{`{{`}</span>
                    <input
                      type="text"
                      required
                      value={varToken}
                      onChange={(e) => setVarToken(e.target.value)}
                      className="flex-1 p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-green-500 font-mono text-sm">{`}}`}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[var(--color-text)] font-semibold mb-1">Description / Label</label>
                  <input
                    type="text"
                    value={varLabel}
                    onChange={(e) => setVarLabel(e.target.value)}
                    className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-text)] font-semibold mb-1">Default / Fallback Value</label>
                  <input
                    type="text"
                    value={varFallback}
                    onChange={(e) => setVarFallback(e.target.value)}
                    className="w-full p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                  <button type="button" onClick={() => setIsVarModalOpen(false)} className="px-4 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-xl cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl cursor-pointer">Save Token</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
