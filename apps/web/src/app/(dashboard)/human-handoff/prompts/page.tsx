'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNiche } from '@/components/providers/niche-provider';
import Link from 'next/link';
import { 
  UserCheck, 
  PhoneCall, 
  MessageSquare, 
  Bot, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Save, 
  Sliders, 
  Bell, 
  Clock, 
  Users, 
  ChevronRight, 
  Zap, 
  Plus, 
  Trash2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EscalationTrigger {
  id: string;
  name: string;
  condition: string;
  channel: 'ALL' | 'VOICE' | 'WHATSAPP' | 'WEBCHAT';
  isEnabled: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'CRITICAL';
}

export default function HumanHandoffPromptsPage() {
  const { currentNiche, nicheConfig } = useNiche();

  const [voiceTransferPhrase, setVoiceTransferPhrase] = useState(
    `I understand your request. Let me immediately connect you to our senior ${nicheConfig.terminology.staff || 'frontdesk manager'}, who is on the line right now. Please hold for just a moment.`
  );

  const [whatsappTransferPhrase, setWhatsappTransferPhrase] = useState(
    `I have escalated your inquiry to our on-duty manager at ${nicheConfig.label}. A specialist has received your chat history and will reply directly in this thread within 2 minutes.`
  );

  const [webchatTransferPhrase, setWebchatTransferPhrase] = useState(
    `Connecting you to live human support. Your ticket has been assigned to our frontdesk team with high priority. Please stay on this screen.`
  );

  const [fallbackTriggerCount, setFallbackTriggerCount] = useState(2);
  const [notifyStaffViaWhatsApp, setNotifyStaffViaWhatsApp] = useState(true);
  const [notifyStaffViaSMS, setNotifyStaffViaSMS] = useState(false);
  const [staffPhone, setStaffPhone] = useState('+91 98765 43210');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [triggers, setTriggers] = useState<EscalationTrigger[]>([
    {
      id: 't1',
      name: 'Explicit Human Request',
      condition: 'Customer types or says: "talk to human", "speak with doctor/manager", "real person", "call agent"',
      channel: 'ALL',
      isEnabled: true,
      priority: 'CRITICAL'
    },
    {
      id: 't2',
      name: 'Consecutive Unrecognized Queries',
      condition: 'AI fails to match verified Knowledge Base chunks for 2 consecutive responses',
      channel: 'ALL',
      isEnabled: true,
      priority: 'HIGH'
    },
    {
      id: 't3',
      name: 'Severe Pain / Medical Emergency',
      condition: 'Mentions keywords: "severe pain", "bleeding", "swelling", "infection", "acute dizziness"',
      channel: 'VOICE',
      isEnabled: true,
      priority: 'CRITICAL'
    },
    {
      id: 't4',
      name: 'Payment / Refund Dispute',
      condition: 'Mentions "refund money", "double charged", "payment dispute", "wrong deduction"',
      channel: 'WHATSAPP',
      isEnabled: true,
      priority: 'HIGH'
    },
    {
      id: 't5',
      name: 'VIP High-Value Client Flag',
      condition: 'Caller identified as LTV > ₹50,000 in tenant CRM database',
      channel: 'ALL',
      isEnabled: true,
      priority: 'MEDIUM'
    }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem(`zerodesk_handoff_prompts_${currentNiche}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.voiceTransferPhrase) setVoiceTransferPhrase(parsed.voiceTransferPhrase);
        if (parsed.whatsappTransferPhrase) setWhatsappTransferPhrase(parsed.whatsappTransferPhrase);
        if (parsed.webchatTransferPhrase) setWebchatTransferPhrase(parsed.webchatTransferPhrase);
        if (parsed.triggers) setTriggers(parsed.triggers);
        if (parsed.staffPhone) setStaffPhone(parsed.staffPhone);
      } catch (e) {
        // fallback
      }
    }
  }, [currentNiche, nicheConfig]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveAll = () => {
    const payload = {
      voiceTransferPhrase,
      whatsappTransferPhrase,
      webchatTransferPhrase,
      fallbackTriggerCount,
      notifyStaffViaWhatsApp,
      notifyStaffViaSMS,
      staffPhone,
      triggers
    };
    localStorage.setItem(`zerodesk_handoff_prompts_${currentNiche}`, JSON.stringify(payload));
    showToast('Human Hand-off configuration & transition prompts successfully saved!');
  };

  const handleToggleTrigger = (id: string) => {
    setTriggers(prev => prev.map(t => t.id === id ? { ...t, isEnabled: !t.isEnabled } : t));
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

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
            <span className="text-[var(--color-text)]">Human Hand-off</span>
            <ChevronRight size={12} />
            <span className="text-blue-500 font-semibold">Prompts & Escalation Rules</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2.5">
            <span>Human Hand-off Prompts & Rules</span>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-semibold">
              Fail-safe Protocol
            </span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Configure automated escalation triggers, seamless transfer phrases, and staff dispatch notifications when AI transfers conversations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/human-handoff/tone-check"
            className="flex items-center gap-2 px-3.5 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <ShieldAlert size={14} className="text-red-400" />
            <span>Tone Check Engine</span>
          </Link>
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0"
          >
            <Save size={15} />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Prompts and Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transfer Phrases for each channel */}
        <div className="lg:col-span-7 space-y-5">
          {/* Voice AI Transfer Phrase */}
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
                <PhoneCall size={15} className="text-amber-400" />
                <span>Voice AI Telephony Warm Transfer Script</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                Spoken aloud to caller
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              The AI Voice Agent will speak this phrase before initiating the live SIP telephone transfer to your reception phone line.
            </p>
            <textarea
              rows={3}
              value={voiceTransferPhrase}
              onChange={(e) => setVoiceTransferPhrase(e.target.value)}
              className="w-full p-3 bg-slate-950/80 border border-[var(--color-border)] focus:border-blue-500 rounded-xl text-xs text-[var(--color-text)] font-sans focus:ring-1 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* WhatsApp Transfer Phrase */}
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
                <MessageSquare size={15} className="text-emerald-400" />
                <span>WhatsApp AI Hand-off Message</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Sent in WhatsApp chat
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Sent immediately to the customer when human assistance is triggered in WhatsApp chat threads.
            </p>
            <textarea
              rows={3}
              value={whatsappTransferPhrase}
              onChange={(e) => setWhatsappTransferPhrase(e.target.value)}
              className="w-full p-3 bg-slate-950/80 border border-[var(--color-border)] focus:border-blue-500 rounded-xl text-xs text-[var(--color-text)] font-sans focus:ring-1 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* WebChat Transfer Phrase */}
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
                <Bot size={15} className="text-blue-400" />
                <span>WebChat Live Agent Queue Notice</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                Website Widget
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Displayed in the website widget chat window when delegating to live human agent desk.
            </p>
            <textarea
              rows={3}
              value={webchatTransferPhrase}
              onChange={(e) => setWebchatTransferPhrase(e.target.value)}
              className="w-full p-3 bg-slate-950/80 border border-[var(--color-border)] focus:border-blue-500 rounded-xl text-xs text-[var(--color-text)] font-sans focus:ring-1 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Right Column: Escalation Triggers & Staff Routing */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Escalation Triggers */}
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={14} className="text-amber-400" />
                <span>Escalation Triggers</span>
              </span>
              <span className="text-[10px] text-blue-400 font-semibold">{triggers.filter(t => t.isEnabled).length} Active</span>
            </div>

            <div className="space-y-2.5">
              {triggers.map(t => (
                <div
                  key={t.id}
                  className={cn(
                    "p-3 rounded-xl border transition-all space-y-1.5 text-xs bg-[var(--color-surface)]",
                    t.isEnabled ? "border-[var(--color-border)]" : "border-dashed opacity-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--color-text)]">{t.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase",
                        t.priority === 'CRITICAL' ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      )}>
                        {t.priority}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleTrigger(t.id)}
                        className={cn(
                          "w-8 h-4 rounded-full transition-colors relative p-0.5 focus:outline-none",
                          t.isEnabled ? "bg-blue-600" : "bg-slate-700"
                        )}
                      >
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full bg-white transition-transform",
                            t.isEnabled ? "translate-x-4" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                    {t.condition}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* On-call Staff Alert Setup */}
          <div className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-md space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-1.5">
                <Bell size={14} className="text-blue-500" />
                <span>On-Call Staff Alerts</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">Live Routing</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Escalation Receiver Phone Number</label>
                <input
                  type="text"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyStaffViaWhatsApp}
                    onChange={(e) => setNotifyStaffViaWhatsApp(e.target.checked)}
                    className="rounded accent-blue-600"
                  />
                  <span className="text-[var(--color-text)] font-medium">Send instant WhatsApp alert to manager on hand-off</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyStaffViaSMS}
                    onChange={(e) => setNotifyStaffViaSMS(e.target.checked)}
                    className="rounded accent-blue-600"
                  />
                  <span className="text-[var(--color-text)] font-medium">Send fallback SMS notification with customer transcript</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
