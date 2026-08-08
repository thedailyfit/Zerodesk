'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Bot, 
  Cpu, 
  FileCode, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  Sliders, 
  Globe2, 
  Mic2, 
  Languages, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Info,
  Zap,
  Volume2,
  Wand2,
  BookOpenCheck,
  Braces
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Hyderabad Regional Tones
const HYDERABAD_TONES = [
  {
    id: 'hyderabadi_warmth',
    name: 'Hyderabadi Warmth (Banjara Hills / Jubilee Hills)',
    tag: 'RECOMMENDED',
    description: 'Polite English mixed with warm Telugu/Hindi honorifics (Namaskaram, Ji, Aandi). Ideal for premium local patients.',
    greeting: 'Namaskaram! Welcome to Glow Skin Clinic, Jubilee Hills. How may I assist with your skin & hair care today?',
    promptStyle: 'Respectful, hospitable, uses natural local phrasing, concise 2-sentence responses.',
    badge: 'Popular in Hyderabad'
  },
  {
    id: 'hitech_corporate',
    name: 'Hitech City Express (IT Professional)',
    tag: 'FAST & PRECISE',
    description: 'Efficient, crisp English with instant slot options. Tailored for busy tech professionals in Gachibowli & Madhapur.',
    greeting: 'Hello! You have reached Glow Skin Clinic Hitech City. Are you calling to book a procedure or check doctor slots?',
    promptStyle: 'Direct, zero fluff, instant slot recommendations, bullet-fast info.',
    badge: 'High Conversion'
  },
  {
    id: 'dermatology_luxury',
    name: 'Luxury Aesthetics Concierge',
    tag: 'PREMIUM',
    description: 'Calm, elegant, reassuring tone focusing on FDA-approved lasers, HydraFacials, and anti-aging treatments.',
    greeting: 'Good day. Welcome to Glow Aesthetic Dermatology. How can our clinical specialists guide your treatment journey today?',
    promptStyle: 'Refined vocabulary, emphasizes clinical safety, FDA diode tech, luxury touch.',
    badge: 'VIP Tone'
  }
];

// Pre-configured Policy Rules
const INITIAL_RULES = [
  { id: '1', title: 'Prescription Safety Protocol', rule: 'STRICT: Never prescribe medical drugs, Botox units, or oral retinoids over the phone. Direct patient to mandatory in-person dermatologist consultation.', category: 'Safety' },
  { id: '2', title: 'Laser Patch Test Requirement', rule: 'For all Diode Laser Hair Removal inquiries, remind the patient that a 48-hour patch test is mandatory prior to full body sessions.', category: 'Clinical SOP' },
  { id: '3', title: 'Slot Booking Urgency', rule: 'Always offer 2 open time slots (e.g. "Tomorrow at 11 AM or Friday at 4 PM") to increase immediate booking conversion.', category: 'Sales' },
  { id: '4', title: 'Hyderabad Pricing Transparency', rule: 'State pricing clearly in INR (e.g. ₹500 consultation, ₹3,000 diode laser per session). Mention packages have 20% bundle discount.', category: 'Pricing' },
  { id: '5', title: 'Code-Switching Language Rule', rule: 'If caller speaks Telugu or Tenglish, reply in simple English/Telugu. Sarvam Translate will auto-convert text to native script for ElevenLabs TTS.', category: 'Language' },
];

export default function VoiceKnowledgeHubPage() {
  const [selectedTone, setSelectedTone] = useState('hyderabadi_warmth');
  const [goldenPrompt, setGoldenPrompt] = useState(
`You are 'DermAI', the expert AI receptionist for Glow Skin Clinic (Banjara Hills & Jubilee Hills, Hyderabad).
You are handling a live phone call.

PRIMARY DIRECTIVES:
1. Speak in a warm, polite, and reassuring tone.
2. Keep responses under 2 sentences (maximum 30 words). Never use bullet points, markdown, or lists.
3. Use the knowledge base to answer pricing & treatment questions accurately in INR (₹).
4. Guide every caller toward booking a consultation slot with Dr. Meenakshi.
5. If caller speaks in Telugu, Hindi, or Tenglish ("Mera appointment schedule cheyandi"), reply naturally; our translation pipeline handles script rendering.

CLINICAL BOUNDARIES:
- Never give medical diagnosis over phone.
- Emphasize US-FDA approved Diode Laser technology and dermatologist expertise.`
  );
  const [rules, setRules] = useState(INITIAL_RULES);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleContent, setNewRuleContent] = useState('');
  const [showAddRule, setShowAddRule] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeToneObj = HYDERABAD_TONES.find(t => t.id === selectedTone) || HYDERABAD_TONES[0];

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddRule = () => {
    if (!newRuleTitle || !newRuleContent) return;
    setRules([...rules, {
      id: Date.now().toString(),
      title: newRuleTitle,
      rule: newRuleContent,
      category: 'Custom Rule'
    }]);
    setNewRuleTitle('');
    setNewRuleContent('');
    setShowAddRule(false);
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(goldenPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider border border-purple-500/20">
              AI Instruction Hub
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[11px] font-mono border border-cyan-500/20">
              Hyderabad Region Optimised
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mt-2">Voice AI Knowledge Hub</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Configure the AI Receptionist’s behavioral rules, Golden Prompt, and regional tone persona for Hyderabad patients.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
        >
          {savedSuccess ? <CheckCircle2 size={18} className="text-emerald-300" /> : <Save size={18} />}
          <span>{savedSuccess ? 'Prompt & Rules Saved!' : 'Save AI Instructions'}</span>
        </button>
      </div>

      {/* Pipeline Status Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
            <Cpu size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Hybrid Pipeline Connected
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Ears: <span className="text-cyan-300 font-mono">Sarvam STT (Tenglish)</span> · Brain: <span className="text-emerald-300 font-mono">ZeroDesk + GPT-4o</span> · Mouth: <span className="text-purple-300 font-mono">ElevenLabs TTS</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 font-mono">
            Conditional Translation: <span className="text-emerald-400 font-bold">ENABLED</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Columns: Golden Prompt & Tone Tuning */}
        <div className="lg:col-span-2 space-y-6">

          {/* Golden Prompt Editor */}
          <div className="p-6 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 size={20} className="text-purple-400" />
                <h2 className="text-base font-bold text-[var(--color-text)]">Voice AI "Golden System Prompt" Editor</h2>
              </div>
              <button 
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-purple-400 transition-colors bg-[var(--color-surface)] px-2.5 py-1.5 rounded-lg border border-[var(--color-border)]"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-muted)]">
              This prompt instructs OpenAI on how to behave during live telephone calls. It enforces 2-sentence limits, natural phone etiquette, and regional tone boundaries.
            </p>

            <div className="relative">
              <textarea
                value={goldenPrompt}
                onChange={(e) => setGoldenPrompt(e.target.value)}
                rows={12}
                className="w-full p-4 rounded-xl font-mono text-xs bg-slate-950/80 text-cyan-200 border border-purple-500/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none shadow-inner leading-relaxed"
                placeholder="Enter Golden System Prompt..."
              />
              <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 font-mono">
                System Prompt · UTF-8
              </div>
            </div>

            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-2">
              <Info size={16} className="shrink-0 mt-0.5 text-purple-400" />
              <div>
                <span className="font-bold">Pro Tip for Hyderabad Clinics:</span> The backend dynamically appends live RAG pricing & open doctor slots from your <span className="font-semibold text-white underline">Company Knowledge Base</span> directly below this prompt on every call.
              </div>
            </div>
          </div>

          {/* Input Variables & Personalization Manager (Idea 1) */}
          <div className="p-6 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Braces size={20} className="text-cyan-400" />
                <h2 className="text-base font-bold text-[var(--color-text)]">Input Variables & Personalization Tokens</h2>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20 font-semibold">
                Runtime Context Injection
              </span>
            </div>

            <p className="text-xs text-[var(--color-text-muted)]">
              Define dynamic variables passed to the Voice AI before a call starts (e.g. greeting caller by name, referencing past treatments).
            </p>

            <div className="space-y-3">
              {[
                { name: 'customer_name', defaultVal: 'Valued Guest', source: 'Caller ID / Telephony Metadata', active: true, desc: 'Used in dynamic greeting e.g. "Namaskaram {{customer_name}}"' },
                { name: 'last_treatment_date', defaultVal: '30 days ago', source: 'CRM Patient File', active: true, desc: 'Used for win-back campaigns e.g. "It has been {{last_treatment_date}} since your laser session"' },
                { name: 'assigned_doctor', defaultVal: 'Dr. Meenakshi', source: 'Clinic Schedule', active: true, desc: 'Prefills primary dermatologist for doctor slot bookings' },
                { name: 'clinic_branch', defaultVal: 'Jubilee Hills Main', source: 'Phone Number Mapping', active: true, desc: 'Sets branch location and direction context' },
              ].map((v) => (
                <div key={v.name} className="p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {`{{${v.name}}}`}
                      </span>
                      <span className="text-slate-400">Default: <strong className="text-white">"{v.defaultVal}"</strong></span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] font-sans">{v.desc}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded">Source: {v.source}</span>
                    <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      SENT TO LLM
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Hyderabad Tone Selection */}
          <div className="p-6 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Languages size={20} className="text-cyan-400" />
              <h2 className="text-base font-bold text-[var(--color-text)]">Hyderabad Regional Persona & Tone Selection</h2>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Select the communication style that best aligns with your target demographic in Hyderabad (Jubilee Hills vs Hitech City vs Secunderabad).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {HYDERABAD_TONES.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => setSelectedTone(tone.id)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between h-full group",
                    selectedTone === tone.id
                      ? "bg-gradient-to-b from-purple-950/50 to-slate-900 border-purple-500 shadow-lg shadow-purple-500/10"
                      : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-purple-500/40"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                        selectedTone === tone.id ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-400"
                      )}>
                        {tone.tag}
                      </span>
                      {selectedTone === tone.id && (
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-[var(--color-text)] group-hover:text-purple-400 transition-colors">
                      {tone.name}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-snug">
                      {tone.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-cyan-400/90 font-mono">
                    💬 "{tone.greeting.slice(0, 45)}..."
                  </div>
                </button>
              ))}
            </div>

            {/* Active Tone Details */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Selected Persona Greeting Sample:</span>
                <span className="text-purple-400 font-mono text-[11px]">{activeToneObj.badge}</span>
              </div>
              <p className="text-sm font-medium text-white italic bg-slate-950 p-3 rounded-lg border border-slate-800">
                "{activeToneObj.greeting}"
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Column: AI Policy Rules Manager */}
        <div className="space-y-6">

          {/* AI Policy Rules */}
          <div className="p-6 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-400" />
                <h2 className="text-base font-bold text-[var(--color-text)]">AI Policy Rules</h2>
              </div>
              <button
                onClick={() => setShowAddRule(!showAddRule)}
                className="p-1.5 text-xs text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors flex items-center gap-1 font-semibold"
              >
                <Plus size={14} />
                <span>Add Rule</span>
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-muted)]">
              Strict operational boundaries that the Voice AI must follow at all times during phone calls.
            </p>

            {/* Add Rule Form */}
            <AnimatePresence>
              {showAddRule && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl bg-slate-900 border border-purple-500/30 space-y-3 overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="Rule Title (e.g. Booking Cancellation)"
                    value={newRuleTitle}
                    onChange={(e) => setNewRuleTitle(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-950 text-white border border-slate-700 focus:border-purple-500"
                  />
                  <textarea
                    placeholder="Rule content..."
                    value={newRuleContent}
                    onChange={(e) => setNewRuleContent(e.target.value)}
                    rows={2}
                    className="w-full p-2 rounded-lg text-xs bg-slate-950 text-white border border-slate-700 focus:border-purple-500 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddRule(false)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddRule}
                      className="px-3 py-1 text-xs font-bold bg-purple-600 text-white rounded-md hover:bg-purple-500"
                    >
                      Save Rule
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rules List */}
            <div className="space-y-3">
              {rules.map((rule) => (
                <div 
                  key={rule.id}
                  className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-purple-500/30 transition-all space-y-1.5 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                      <BookOpenCheck size={13} />
                      {rule.title}
                    </span>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Delete Rule"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {rule.rule}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Nav to Company Knowledge Base */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <Globe2 size={18} />
              <h3 className="font-bold text-sm text-white">Need to update Treatment Prices?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Medical SOPs, HydraFacial pricing, doctor schedules, and consent forms are stored in your <strong>Company Knowledge Base</strong>.
            </p>
            <a
              href="/knowledge-base"
              className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors pt-1"
            >
              <span>Go to Company Knowledge Base →</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
