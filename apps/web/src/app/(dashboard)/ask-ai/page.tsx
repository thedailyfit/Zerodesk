'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ArrowRight,
  RefreshCw,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNiche } from '@/components/providers/niche-provider';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  chips?: string[];
  metrics?: { label: string; value: string; trend?: string }[];
}

const SAMPLE_CHIPS = [
  'Show me this week\'s revenue vs last week',
  'Which appointments are unconfirmed today?',
  'What can I do to increase bookings this month?',
  'Summarise customer/patient feedback from this week'
];

export default function AskAiFrontdeskPage() {
  const { nicheConfig } = useNiche();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello! I am your ZeroDesk AI Business Frontdesk Assistant for ${nicheConfig?.label || 'your business'}. I continuously monitor your incoming calls, WhatsApp chats, booking schedules, and financial metrics. How can I help you grow and optimize your business operations today?`,
      time: 'Just now',
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Realistic AI Business Analyst Logic
    setTimeout(() => {
      let aiResponseText = '';
      let metrics: { label: string; value: string; trend?: string }[] | undefined;

      const lower = text.toLowerCase();
      if (lower.includes('revenue') || lower.includes('sales')) {
        aiResponseText = `Based on current records, this week's gross collection is ₹1,84,500 across 42 completed transactions. This is a +14.2% increase compared to last week (₹1,61,500), primarily driven by higher package conversion and VIP treatments.`;
        metrics = [
          { label: "This Week", value: "₹1,84,500", trend: "+14.2%" },
          { label: "Last Week", value: "₹1,61,500" },
          { label: "Avg Ticket Size", value: "₹4,390", trend: "+8%" }
        ];
      } else if (lower.includes('unconfirmed') || lower.includes('appointment')) {
        aiResponseText = `You currently have 3 unconfirmed appointments scheduled for today:\n1. Deepak Menon (10:00 AM) — Awaiting reply on WhatsApp.\n2. Meera Joshi (02:00 PM) — Call attempted, no response.\n3. Suresh Raina (04:30 PM) — Follow-up sitting pending.\n\nWould you like me to trigger the ZeroDesk AI 2-step confirmation voice call?`;
      } else if (lower.includes('increase') || lower.includes('boost') || lower.includes('growth')) {
        aiResponseText = `Here are 3 high-impact AI recommendations to increase bookings this month:\n\n1. Win-Back Inactive Customers: 48 customers haven't visited in 60+ days. An automated WhatsApp promotion could recover ~12 bookings.\n2. Fill Tuesday & Wednesday Slot Gaps: Afternoon 2 PM - 4 PM has 40% empty slots. Trigger a flash discount campaign.\n3. Meta Ads Retargeting: Boost budget by 15% on high-performing 'Glow Offer' ad set (current CPL is only ₹145).`;
      } else if (lower.includes('feedback') || lower.includes('review') || lower.includes('sentiment')) {
        aiResponseText = `Overall patient sentiment this week is 94% Positive! Top praises mentioned polite AI desk assistance and prompt doctor consultation. 2 patients mentioned waiting 15 minutes past scheduled time around 2 PM.`;
      } else {
        aiResponseText = `I have analyzed your request regarding "${text}". Your ZeroDesk system is operating smoothly with 98.4% AI frontdesk resolution. You can assign automated tasks, pull custom reports, or review financial forecasts anytime.`;
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metrics
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
              Ask AI Frontdesk
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                Admin Intelligence
              </span>
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Ask any question or assign strategic business tasks to your ZeroDesk AI Manager.
            </p>
          </div>
        </div>

        <button 
          onClick={() => setMessages([{
            id: 'init-1',
            sender: 'ai',
            text: `Conversation reset. How can I assist with your ${nicheConfig?.label || 'business'} metrics today?`,
            time: 'Just now'
          }])}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text-muted)] transition-colors"
        >
          <RefreshCw size={12} />
          New Chat
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-2 custom-scrollbar">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-3 max-w-3xl",
              msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-md",
              msg.sender === 'user'
                ? "bg-blue-600 text-white"
                : "bg-[var(--color-surface)] border border-[var(--color-border)] text-blue-400"
            )}>
              {msg.sender === 'user' ? <User size={14} /> : <Bot size={16} />}
            </div>

            <div className="space-y-2 max-w-[85%]">
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm",
                msg.sender === 'user'
                  ? "bg-blue-600 text-white rounded-tr-sm"
                  : "bg-[var(--color-glass)] border border-[var(--color-glass-border)] text-[var(--color-text)] rounded-tl-sm backdrop-blur-xl"
              )}>
                {msg.text}

                {msg.metrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-[var(--color-border)]/40">
                    {msg.metrics.map((m, idx) => (
                      <div key={idx} className="bg-[var(--color-bg)]/80 p-2.5 rounded-xl border border-[var(--color-border)]">
                        <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold block">{m.label}</span>
                        <span className="text-sm font-bold text-[var(--color-text)] font-mono">{m.value}</span>
                        {m.trend && <span className="text-[10px] text-emerald-400 font-bold ml-1">{m.trend}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={cn("text-[10px] text-[var(--color-text-muted)] px-1", msg.sender === 'user' ? "text-right" : "text-left")}>
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
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-blue-400">
              <Bot size={16} />
            </div>
            <div className="p-3.5 bg-[var(--color-glass)] border border-[var(--color-glass-border)] rounded-2xl text-xs flex items-center gap-1.5 text-[var(--color-text-muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="ml-1 font-medium">Analyzing real-time business data...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips & Prompt Input */}
      <div className="pt-3 border-t border-[var(--color-border)] space-y-3 shrink-0">
        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap size={12} className="text-amber-400" />
            Try:
          </span>
          {SAMPLE_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-blue-500/50 hover:bg-blue-500/10 text-[var(--color-text-muted)] hover:text-blue-400 whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>{chip}</span>
              <ArrowRight size={11} className="opacity-60" />
            </button>
          ))}
        </div>

        {/* Input Box with Clean Blue Gradient Glow */}
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
            placeholder="Ask AI Frontdesk about revenue, bookings, staff performance, or campaigns..."
            className="w-full bg-[var(--color-surface)] border border-blue-500/40 rounded-2xl pl-4 pr-12 py-3.5 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md shadow-blue-500/5"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white transition-all shadow-md shadow-blue-500/20"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
