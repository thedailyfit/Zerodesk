'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNiche } from '@/components/providers/niche-provider';
import Link from 'next/link';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Save, 
  Sliders, 
  HeartHandshake, 
  Activity, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Send, 
  Bot, 
  UserCheck, 
  Zap, 
  RotateCcw,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ToneCheckPage() {
  const { currentNiche, nicheConfig } = useNiche();

  const [sensitivityThreshold, setSensitivityThreshold] = useState(35); // 0-100 (Trigger handoff if sentiment < 35%)
  const [detectAllCaps, setDetectAllCaps] = useState(true);
  const [detectProfanity, setDetectProfanity] = useState(true);
  
  const [deescalationPrompt, setDeescalationPrompt] = useState(
    `I sincerely apologize for the frustration this has caused. Your satisfaction and care at ${nicheConfig.label} are our highest priority. I am escalating this conversation immediately to our senior duty manager so this can be resolved for you without delay.`
  );

  const [negativeKeywords, setNegativeKeywords] = useState<string[]>([
    'terrible', 'worst experience', 'scam', 'cheat', 'waste of money', 
    'useless', 'rude doctor', 'horrible service', 'complaint', 'lawsuit',
    'cancel everything', 'unprofessional', 'disaster'
  ]);
  const [newKeyword, setNewKeyword] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Sentiment Simulator State
  const [testPhrase, setTestPhrase] = useState(
    "THIS IS ABSOLUTELY UNACCEPTABLE! I've been waiting for 45 minutes and nobody is attending to my appointment! I want a full refund right now!"
  );
  const [simResult, setSimResult] = useState<{
    sentimentScore: number;
    frustrationLevel: number;
    urgencyLevel: number;
    status: 'NEGATIVE_TRIGGERED' | 'NEUTRAL' | 'POSITIVE';
    triggeredActions: string[];
    aiResponse: string;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`zerodesk_tone_check_${currentNiche}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.sensitivityThreshold) setSensitivityThreshold(parsed.sensitivityThreshold);
        if (parsed.deescalationPrompt) setDeescalationPrompt(parsed.deescalationPrompt);
        if (parsed.negativeKeywords) setNegativeKeywords(parsed.negativeKeywords);
      } catch (e) {
        // fallback
      }
    }
  }, [currentNiche, nicheConfig]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveConfig = () => {
    const payload = {
      sensitivityThreshold,
      detectAllCaps,
      detectProfanity,
      deescalationPrompt,
      negativeKeywords
    };
    localStorage.setItem(`zerodesk_tone_check_${currentNiche}`, JSON.stringify(payload));
    showToast('Negative Tone Analysis engine & empathy prompts successfully updated!');
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    const clean = newKeyword.trim().toLowerCase();
    if (!negativeKeywords.includes(clean)) {
      setNegativeKeywords(prev => [...prev, clean]);
    }
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kw: string) => {
    setNegativeKeywords(prev => prev.filter(k => k !== kw));
  };

  const handleRunSimulation = (overrideText?: string) => {
    const text = overrideText || testPhrase;
    if (!text.trim()) return;

    setIsSimulating(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      const hasKeywords = negativeKeywords.some(k => lower.includes(k));
      const isShouting = text === text.toUpperCase() && text.length > 15;
      const isNegative = hasKeywords || isShouting || lower.includes('unacceptable') || lower.includes('refund');

      const sentimentScore = isNegative ? Math.floor(Math.random() * 20) + 12 : 78;
      const frustration = isNegative ? Math.floor(Math.random() * 25) + 75 : 15;
      const urgency = isNegative ? 94 : 30;

      const actions = isNegative ? [
        '⚡ Negative Tone Threshold Breached (< 35%)',
        '🛡️ Switched AI mode to "Maximum Empathy & De-escalation"',
        '🚨 Dispatched High-Priority WhatsApp Alert to Staff On-Duty',
        '🔄 Initiated Instant Live Human Hand-off Protocol'
      ] : [
        '✅ Sentiment within normal operating parameters',
        '💬 Standard AI Knowledge Retrieval active'
      ];

      setSimResult({
        sentimentScore,
        frustrationLevel: frustration,
        urgencyLevel: urgency,
        status: isNegative ? 'NEGATIVE_TRIGGERED' : 'NEUTRAL',
        triggeredActions: actions,
        aiResponse: isNegative 
          ? deescalationPrompt 
          : `Hello! I would be glad to assist you with your ${nicheConfig.label} appointment and questions today.`
      });

      setIsSimulating(false);
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-14">
      {/* Toast */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
            <span className="text-[var(--color-text)]">Human Hand-off</span>
            <ChevronRight size={12} />
            <span className="text-blue-500 font-semibold">Negative Tone Check</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2.5">
            <span>Negative Tone Analysis & Sentiment Escalation</span>
            <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full font-semibold">
              Real-time Sentiment Guard
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Detect frustration, shouting, and negative customer sentiment automatically to trigger empathetic de-escalation scripts and instant human handoff.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/human-handoff/prompts"
            className="flex items-center gap-2 px-3.5 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <UserCheck size={14} className="text-blue-500" />
            <span>Handoff Prompts</span>
          </Link>
          <button
            onClick={handleSaveConfig}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0"
          >
            <Save size={15} />
            <span>Save Tone Rules</span>
          </button>
        </div>
      </div>

      {/* 2-Column Grid: Config on Left, Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Negative Tone Prompts & Sensitivity (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Sensitivity Sliders & Guardrails */}
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-md space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={14} className="text-red-400" />
                <span>Frustration Sensitivity Thresholds</span>
              </span>
              <span className="text-[10px] text-red-400 font-bold">Auto-Trigger</span>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--color-text)]">Sentiment Escalation Trigger Point</span>
                  <span className="text-xs font-mono font-bold text-red-400">&lt; {sensitivityThreshold}% Sentiment</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={60}
                  value={sensitivityThreshold}
                  onChange={(e) => setSensitivityThreshold(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  If customer sentiment drops below {sensitivityThreshold}%, AI halts standard replies and executes de-escalation handoff.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={detectAllCaps}
                    onChange={(e) => setDetectAllCaps(e.target.checked)}
                    className="rounded accent-red-500"
                  />
                  <div>
                    <span className="font-bold text-[var(--color-text)] block">Detect ALL CAPS Shouting</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">Flags aggressive capitalization</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={detectProfanity}
                    onChange={(e) => setDetectProfanity(e.target.checked)}
                    className="rounded accent-red-500"
                  />
                  <div>
                    <span className="font-bold text-[var(--color-text)] block">Profanity & Harsh Tone Guard</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">Instant escalation on insults</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Empathy & De-escalation Prompt */}
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-md space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
                <HeartHandshake size={15} className="text-blue-400" />
                <span>Negative Tone De-escalation Response Script</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 font-bold">
                Empathy Buffer
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              What the AI says immediately to calm the customer down, validate their frustration, and confirm supervisor handover:
            </p>
            <textarea
              rows={4}
              value={deescalationPrompt}
              onChange={(e) => setDeescalationPrompt(e.target.value)}
              className="w-full p-3 bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-blue-500 rounded-xl text-xs text-[var(--color-text)] font-sans focus:ring-1 focus:ring-blue-500 focus:outline-none leading-relaxed placeholder:text-[var(--color-text-muted)]"
            />
          </div>

          {/* Flagged Negative Keywords Manager */}
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-md space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-500" />
                <span>Negative Sentiment Keywords ({negativeKeywords.length})</span>
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)]">Triggers instant sentiment check</span>
            </div>

            <form onSubmit={handleAddKeyword} className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add negative phrase (e.g. false advertising, cheat)..."
                className="flex-1 p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-[var(--color-text-muted)]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors flex items-center gap-1 shadow-sm"
              >
                <Plus size={13} />
                <span>Add</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {negativeKeywords.map(kw => (
                <span
                  key={kw}
                  className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-[11px] font-medium flex items-center gap-1.5"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="hover:text-red-700 dark:hover:text-white"
                  >
                    <Trash2 size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Simulator Sandbox (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-red-500/30 shadow-lg space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={14} className="text-red-500" />
                <span>Sentiment Analysis Sandbox</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-500 font-mono font-bold">
                Live Simulator
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-[var(--color-text)] font-semibold">Test Angry / Frustrated Customer Message:</label>
              <textarea
                rows={3}
                value={testPhrase}
                onChange={(e) => setTestPhrase(e.target.value)}
                placeholder="Type an angry message to test sentiment analysis trigger..."
                className="w-full p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:ring-2 focus:ring-red-500 focus:outline-none resize-none placeholder:text-[var(--color-text-muted)]"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRunSimulation()}
                  disabled={isSimulating || !testPhrase.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md"
                >
                  {isSimulating ? (
                    <>
                      <RotateCcw size={13} className="animate-spin" />
                      <span>Analyzing Tone...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={13} />
                      <span>Simulate Tone Check</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Simulation Results Breakdown */}
            {simResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3.5 pt-3 border-t border-[var(--color-border)]"
              >
                {/* Metric Gauges */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <span className="text-[10px] text-[var(--color-text-muted)] block">Sentiment</span>
                    <span className={cn(
                      "text-base font-bold font-mono",
                      simResult.sentimentScore < 35 ? "text-red-500" : "text-emerald-500"
                    )}>
                      {simResult.sentimentScore}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <span className="text-[10px] text-[var(--color-text-muted)] block">Frustration</span>
                    <span className="text-base font-bold font-mono text-amber-500">
                      {simResult.frustrationLevel}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <span className="text-[10px] text-[var(--color-text-muted)] block">Urgency SLA</span>
                    <span className="text-base font-bold font-mono text-blue-500">
                      {simResult.urgencyLevel}%
                    </span>
                  </div>
                </div>

                {/* Triggered Protocol Actions */}
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-bold text-red-600 dark:text-red-300 block uppercase tracking-wider">
                    Triggered Protocol Actions
                  </span>
                  <div className="space-y-1 text-[11px] text-red-600 dark:text-red-200">
                    {simResult.triggeredActions.map((act, i) => (
                      <p key={i} className="font-medium">{act}</p>
                    ))}
                  </div>
                </div>

                {/* De-escalation Speech Output */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[var(--color-text)] flex items-center gap-1.5">
                    <Bot size={13} className="text-blue-500" />
                    <span>Empathy Response Sent by AI:</span>
                  </span>
                  <div className="p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] text-[var(--color-text)] text-xs italic leading-relaxed">
                    "{simResult.aiResponse}"
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
