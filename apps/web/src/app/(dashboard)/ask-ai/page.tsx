'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ArrowRight, 
  RefreshCw, 
  Zap, 
  Mic, 
  MicOff, 
  TrendingUp, 
  Calendar, 
  PhoneCall, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Compass,
  DollarSign,
  HeartHandshake,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNiche } from '@/components/providers/niche-provider';
import type { ActiveNicheId } from '@/config/niches/types';
import Link from 'next/link';

interface MessageAction {
  label: string;
  href?: string;
  onClickAction?: string;
  icon?: any;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  chips?: string[];
  metrics?: { label: string; value: string; trend?: string }[];
  actions?: MessageAction[];
}

const NICHE_SAMPLE_CHIPS: Record<ActiveNicheId, string[]> = {
  skin: [
    "Which high-ticket laser packages have pending quotes?",
    "Show unconfirmed sittings today & trigger WhatsApp reminder",
    "What is our HydraFacial vs Chemical Peel conversion rate?",
    "Check patient adverse reaction alerts or aftercare SOS queries"
  ],
  dental: [
    "Which patients are overdue for 6-month hygiene scaling?",
    "Show pending clear aligner treatment proposals (> ₹40k)",
    "Check emergency toothache triage calls & doctor chair occupancy",
    "How many post-extraction check-ins are scheduled today?"
  ],
  spa: [
    "Which guests haven't booked in 30+ days for their favorite therapist?",
    "Analyze midweek off-peak suite vacancy & suggest flash drop",
    "Couples retreat package revenue this month vs last month",
    "Expiring wellness club memberships requiring concierge renewal"
  ],
  realestate: [
    "List hot leads with > 2 site visits who haven't paid token amount",
    "Site visit cab completion rate & cost per lead this week",
    "Which luxury units have pending cost sheet follow-ups?",
    "Show overseas NRI inquiries awaiting 3D virtual tour"
  ],
  hotel: [
    "Today's arrivals with airport chauffeur dispatch status",
    "Which suite guests have not reserved a sunset dinner table?",
    "Review score summary on Google & TripAdvisor past 7 days",
    "Direct booking revenue vs OTA commissions (MakeMyTrip / Booking)"
  ]
};

type AIPersona = 'ops' | 'growth' | 'care';

export default function AskAiFrontdeskPage() {
  const { currentNiche, nicheConfig } = useNiche();
  const [persona, setPersona] = useState<AIPersona>('ops');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Welcome Message per Niche
  useEffect(() => {
    setMessages([
      {
        id: 'init-1',
        sender: 'ai',
        text: `Welcome to your **ZeroDesk AI Executive Command Center** for ${nicheConfig?.label || 'your business'}.

I continuously track your inbound telephony via LiveKit, Meta Cloud WhatsApp chats, scheduled ${nicheConfig?.terminology?.appointments?.toLowerCase() || 'appointments'}, and revenue real-time. 

Ask me any operational question, request custom performance analytics, or direct me to trigger autonomous workflows.`,
        time: 'Just now',
        actions: [
          { label: 'View 1-Click Automations', href: '/automations', icon: Zap },
          { label: 'Check Outbound Campaigns', href: '/outbound-campaigns', icon: TrendingUp }
        ]
      }
    ]);
  }, [currentNiche, nicheConfig]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Voice dictation using Web Speech API
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setToastMessage('Voice dictation is not supported in this browser. Please use Chrome/Edge.');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    if (!isListening) {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText = '';
      let metrics: { label: string; value: string; trend?: string }[] | undefined;
      let actions: MessageAction[] | undefined;

      const lower = text.toLowerCase();
      const customerWord = nicheConfig?.terminology?.customer?.toLowerCase() || 'client';
      const aptWord = nicheConfig?.terminology?.appointment?.toLowerCase() || 'appointment';

      if (lower.includes('revenue') || lower.includes('sales') || lower.includes('ticket') || lower.includes('collection')) {
        aiResponseText = `**Financial Pulse Analysis (Live Sync):**

• **Total Collection This Week:** ₹2,48,500 across 54 completed transactions.
• **Growth vs Last Week:** **+18.4%** due to strong conversion on high-value ${nicheConfig?.label || ''} packages.
• **Average Ticket Size:** ₹4,600 (up from ₹3,950).
• **Projected Month-End Realization:** ₹9,80,000.`;
        metrics = [
          { label: 'This Week', value: '₹2,48,500', trend: '+18.4%' },
          { label: 'Last Week', value: '₹2,09,800' },
          { label: 'Avg Ticket', value: '₹4,600', trend: '+16%' }
        ];
        actions = [
          { label: "View Today's Revenue", href: '/todays-revenue', icon: TrendingUp },
          { label: 'Check Billing Invoices', href: '/invoices', icon: DollarSign }
        ];
      } else if (lower.includes('unconfirmed') || lower.includes('reminder') || lower.includes('no-show') || lower.includes('sitting')) {
        aiResponseText = `**Schedule Verification & Triage:**

You currently have **3 unconfirmed ${aptWord}s** for today:
1. **Pooja Sharma** (11:30 AM) — Sent WhatsApp 2h reminder, awaiting reply.
2. **Karan Verma** (02:30 PM) — 1 attempt made via AI Voice receptionist, returned idle.
3. **Dr. Nidhi Rao** (05:00 PM) — Follow-up sitting pending confirmation.

Would you like me to trigger an immediate omnichannel 2-step voice confirmation call?`;
        actions = [
          { label: 'Run 1-Click Reminder Blast', href: '/automations', icon: Zap },
          { label: 'Open Schedule Calendar', href: '/calendar', icon: Calendar }
        ];
      } else if (lower.includes('quote') || lower.includes('package') || lower.includes('high-ticket') || lower.includes('proposal')) {
        aiResponseText = `**High-Ticket Proposal Tracking:**

Identified **6 high-value quotes** issued in the last 7 days awaiting customer closure (Total Value: **₹3,15,000**).
• **Top Opportunity:** ₹85,000 comprehensive package for Rohit Mehta.
• **AI Recommendation:** The 24h follow-up window is closing. Disseminate an automated WhatsApp financing / EMI calculator breakdown.`;
        actions = [
          { label: 'Launch Outbound Follow-up', href: '/outbound-campaigns', icon: PhoneCall },
          { label: 'Review CRM Pipeline', href: '/crm', icon: ArrowRight }
        ];
      } else if (lower.includes('overdue') || lower.includes('recall') || lower.includes('scaling') || lower.includes('hydrafacial') || lower.includes('re-engage')) {
        aiResponseText = `**Autonomous Retention Opportunity:**

Detected **64 ${customerWord}s** who have passed their recommended 30-to-60 day maintenance interval.
• **Historical Recovery Rate:** 26% when prompted via WhatsApp interactive buttons.
• **Estimated Recoverable Pipeline:** ₹1,45,000.
• **Recommended Action:** Turn on the pre-installed Smart Action recall template.`;
        actions = [
          { label: 'Activate Recall Sequence', href: '/automations', icon: Zap },
          { label: 'Customer EMR Directory', href: '/customers', icon: FileText }
        ];
      } else if (lower.includes('prescription') || lower.includes('rx') || lower.includes('medicine') || lower.includes('doctor')) {
        aiResponseText = `**Clinical Rx Operations:**

ZeroDesk Pro provides an integrated **Digital Prescription Builder** with custom clinic letterhead header/footer uploads, verified drug databases, and 1-tap WhatsApp delivery to the ${customerWord}.

Would you like to open the prescription writer?`;
        actions = [
          { label: 'Write Digital Prescription', href: '/prescriptions', icon: FileText },
          { label: 'Doctor Calendar', href: '/doctor-calendar', icon: Calendar }
        ];
      } else {
        aiResponseText = `I have processed your query regarding: **"${text}"**.

Your ZeroDesk AI system is operating with **98.6% autonomous resolution** across WhatsApp and Voice telephony. 

No system anomalies or dropped calls detected in the last 24 hours. Let me know if you would like me to trigger an outbound broadcast, summarize patient feedback, or inspect team calendars.`;
        actions = [
          { label: 'Explore Smart Automations', href: '/automations', icon: Zap },
          { label: 'Open Unified Inbox', href: '/unified-inbox', icon: MessageSquare }
        ];
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        metrics,
        actions
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const currentChips = NICHE_SAMPLE_CHIPS[currentNiche] || NICHE_SAMPLE_CHIPS.skin;

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] max-w-5xl mx-auto space-y-3 pb-2">
      
      {/* Header Bar with Persona Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[var(--color-text)] tracking-tight">Ask AI Frontdesk</h1>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Assistant
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Executive decision intelligence for {nicheConfig?.label || 'your business'}
            </p>
          </div>
        </div>

        {/* Action / Mode Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[var(--color-surface)] p-1 rounded-xl border border-[var(--color-border)] text-xs">
            <button
              onClick={() => setPersona('ops')}
              className={cn(
                "px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1",
                persona === 'ops' ? "bg-blue-600 text-white shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
            >
              <Compass size={12} />
              <span>Operations</span>
            </button>
            <button
              onClick={() => setPersona('growth')}
              className={cn(
                "px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1",
                persona === 'growth' ? "bg-blue-600 text-white shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
            >
              <DollarSign size={12} />
              <span>Revenue</span>
            </button>
            <button
              onClick={() => setPersona('care')}
              className={cn(
                "px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1",
                persona === 'care' ? "bg-blue-600 text-white shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
            >
              <HeartHandshake size={12} />
              <span>Care</span>
            </button>
          </div>

          <button 
            onClick={() => setMessages([
              {
                id: 'init-reset',
                sender: 'ai',
                text: `Conversation cleared. How can I assist you with your ${nicheConfig?.label || 'business'} operations right now?`,
                time: 'Just now'
              }
            ])}
            className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors shrink-0"
            title="Start New Chat"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-3 max-w-3xl",
              msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-sm",
              msg.sender === 'user'
                ? "bg-blue-600 text-white"
                : "bg-[var(--color-surface)] border border-[var(--color-border)] text-blue-400"
            )}>
              {msg.sender === 'user' ? <User size={14} /> : <Bot size={16} />}
            </div>

            {/* Bubble Content */}
            <div className="space-y-2 max-w-[90%]">
              <div className={cn(
                "p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm",
                msg.sender === 'user'
                  ? "bg-blue-600 text-white rounded-tr-sm font-medium"
                  : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-tl-sm"
              )}>
                {msg.text}

                {/* Metrics Badges */}
                {msg.metrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
                    {msg.metrics.map((m, idx) => (
                      <div key={idx} className="bg-[var(--color-bg)] p-2.5 rounded-xl border border-[var(--color-border)]">
                        <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold block">{m.label}</span>
                        <span className="text-sm font-bold text-[var(--color-text)] font-mono">{m.value}</span>
                        {m.trend && <span className="text-[10px] text-emerald-400 font-bold ml-1">{m.trend}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Executable Action Cards */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-[var(--color-border)]">
                    {msg.actions.map((act, idx) => {
                      const Icon = act.icon || ArrowRight;
                      return act.href ? (
                        <Link
                          key={idx}
                          href={act.href}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-bg)] hover:bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold transition-all hover:scale-102"
                        >
                          <Icon size={12} />
                          <span>{act.label}</span>
                          <ChevronRight size={11} className="opacity-50" />
                        </Link>
                      ) : (
                        <button
                          key={idx}
                          onClick={() => {
                            setToastMessage(`Executing: ${act.label}`);
                            setTimeout(() => setToastMessage(null), 3500);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-bg)] hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-all"
                        >
                          <Icon size={12} />
                          <span>{act.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={cn("text-[10px] text-[var(--color-text-muted)] px-1 font-mono", msg.sender === 'user' ? "text-right" : "text-left")}>
                {msg.time}
              </div>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 mr-auto"
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-blue-400">
              <Bot size={16} />
            </div>
            <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-xs flex items-center gap-2 text-[var(--color-text-muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="font-medium text-[var(--color-text)]">Analyzing {nicheConfig?.label || ''} telemetry & CRM records...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Bottom Control Panel */}
      <div className="pt-2 border-t border-[var(--color-border)] space-y-2.5 shrink-0">
        
        {/* Niche-Specific Quick Prompt Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap size={11} className="text-amber-400" />
            Suggest:
          </span>
          {currentChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="text-[11px] px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-blue-500/40 hover:bg-blue-500/5 text-[var(--color-text-muted)] hover:text-blue-400 whitespace-nowrap transition-all shrink-0 flex items-center gap-1"
            >
              <span>{chip}</span>
              <ArrowRight size={10} className="opacity-40" />
            </button>
          ))}
        </div>

        {/* Input Bar with Voice Dictation & Send Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isListening ? "Listening... speak now" : `Ask about revenue, unconfirmed ${nicheConfig?.terminology?.appointments?.toLowerCase() || 'bookings'}, doctor idle time, or patient recalls...`}
            className={cn(
              "w-full bg-[var(--color-surface)] border rounded-xl pl-4 pr-24 py-3 text-xs sm:text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-all",
              isListening ? "border-red-500 ring-2 ring-red-500/20 bg-red-500/5" : "border-[var(--color-border)] focus:border-blue-500"
            )}
          />

          <div className="absolute right-1.5 flex items-center gap-1">
            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isListening 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
              )}
              title={isListening ? "Stop listening" : "Click to speak voice prompt"}
            >
              {isListening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>

            {/* Submit Send Button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white transition-all shadow-sm"
              title="Send Prompt"
            >
              <Send size={15} />
            </button>
          </div>
        </form>
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 border border-blue-500/40 text-blue-200 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-medium"
          >
            <Sparkles size={14} className="text-blue-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
