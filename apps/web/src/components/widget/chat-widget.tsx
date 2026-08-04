'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Paperclip, 
  Smile, 
  RotateCcw,
  CheckCheck,
  ChevronDown
} from 'lucide-react';

export interface ChatWidgetProps {
  botName?: string;
  primaryColor?: string;
  tone?: string;
  welcomeMessage?: string;
  avatarUrl?: string;
  isPreview?: boolean;
}

const TONE_MESSAGES: Record<string, string> = {
  professional: "Good day! Welcome to our clinic. How may I assist you with your medical or appointment inquiries today?",
  friendly: "Hey there! 👋 Welcome! How can I help you out today?",
  empathetic: "Hello! We're so glad you're here. How are you feeling today, and how can we support your health journey?",
  enthusiastic: "Hi! 🌟 Welcome to our clinic! We're thrilled to assist you. What can we do for you today?",
  direct: "Welcome. Please let me know what information or service you need.",
  humorous: "Hello! Don't worry, I'm an AI doctor's assistant—I won't tell you to eat apples! How can I help you today?"
};

const SUGGESTIONS = [
  "✨ Book an Appointment",
  "💰 Pricing & Treatments",
  "⏰ Working Hours",
  "📍 Clinic Location"
];

export function ChatWidget({
  botName = 'Glow AI Assistant',
  primaryColor = '#8b5cf6',
  tone = 'empathetic',
  welcomeMessage,
  avatarUrl,
  isPreview = false
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(isPreview ? true : false);
  const [messages, setMessages] = useState<Array<{ id: string; sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      id: '1',
      sender: 'bot',
      text: welcomeMessage || TONE_MESSAGES[tone] || TONE_MESSAGES.empathetic,
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update initial message when tone or welcomeMessage prop changes
  useEffect(() => {
    setMessages(prev => [
      {
        ...prev[0],
        text: welcomeMessage || TONE_MESSAGES[tone] || TONE_MESSAGES.empathetic
      },
      ...prev.slice(1)
    ]);
  }, [tone, welcomeMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Simulate AI response based on tone
    setTimeout(() => {
      let botResponse = "Thank you for reaching out! I've noted your enquiry and our team will get back to you shortly.";
      
      if (text.includes('Appointment') || text.includes('Book')) {
        botResponse = "I can certainly help you schedule a consultation! What date and time works best for you?";
      } else if (text.includes('Pricing') || text.includes('Treatment')) {
        botResponse = "Our treatment packages start from $199. Would you like me to send the complete digital brochure to your WhatsApp?";
      } else if (text.includes('Hours')) {
        botResponse = "We are open Monday to Saturday, 9:00 AM – 8:00 PM. Would you like to reserve a spot?";
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className={isPreview ? "relative w-full h-[520px] max-w-sm mx-auto" : "fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans"}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`w-[360px] sm:w-[380px] h-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20 dark:border-white/10 backdrop-blur-xl bg-slate-900/95 text-white ${
              isPreview ? 'w-full h-full' : 'mb-4'
            }`}
          >
            {/* Header */}
            <div 
              className="p-4 flex items-center justify-between shadow-md relative overflow-hidden shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 text-white font-bold shadow-inner">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={botName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Bot size={22} />
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                </div>

                <div>
                  <h3 className="font-semibold text-base leading-tight text-white flex items-center gap-1.5">
                    {botName}
                    <Sparkles size={14} className="text-yellow-300 animate-pulse" />
                  </h3>
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <span>Active Now</span>
                    <span>•</span>
                    <span className="capitalize">{tone} Mode</span>
                  </p>
                </div>
              </div>

              {!isPreview && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-white flex items-center justify-center transition-colors relative z-10"
                >
                  <ChevronDown size={18} />
                </button>
              )}
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-950 to-slate-900 scrollbar-thin scrollbar-thumb-slate-700">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div 
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shrink-0 mt-1 shadow"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Bot size={14} />
                    </div>
                  )}

                  <div className={`max-w-[78%] space-y-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'text-white rounded-br-none shadow-md'
                          : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-bl-none shadow'
                      }`}
                      style={msg.sender === 'user' ? { backgroundColor: primaryColor } : undefined}
                    >
                      {msg.text}
                    </div>
                    <p className={`text-[10px] text-slate-400 flex items-center gap-1 px-1 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      {msg.time}
                      {msg.sender === 'user' && <CheckCheck size={12} className="text-emerald-400" />}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5 items-center"
                >
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Bot size={14} />
                  </div>
                  <div className="bg-slate-800 border border-slate-700/60 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}

              {/* Quick Suggestions */}
              {messages.length === 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="pt-2 flex flex-col gap-2"
                >
                  <p className="text-xs text-slate-400 font-medium px-1">Quick prompts:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((chip, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(chip)}
                        className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/70 px-3 py-1.5 rounded-full transition-all text-left hover:scale-[1.02] active:scale-95 shadow-sm"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 focus-within:border-slate-600 transition-colors"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                />
                
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-40 hover:scale-105 active:scale-95 shadow"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Send size={15} />
                </button>
              </form>
              <p className="text-[10px] text-center text-slate-500 mt-2 flex items-center justify-center gap-1">
                <span>⚡ Powered by</span>
                <span className="font-semibold text-slate-400">ZeroDesk AI</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      {!isPreview && !isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white relative group overflow-hidden border-2 border-white/20"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-25" />
          <MessageSquare size={24} className="relative z-10" />
          
          <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-full" />
        </motion.button>
      )}
    </div>
  );
}
