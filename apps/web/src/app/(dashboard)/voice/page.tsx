'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Volume2, 
  Globe, 
  Play, 
  Pause,
  Check,
  User,
  Sparkles,
  Briefcase,
  Activity,
  Headphones,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useNiche } from '@/components/providers/niche-provider';
import type { NicheId } from '@/config/niches/types';

// Curated Indian Voice Personas Fleet (ElevenLabs & Sarvam AI)
const DEFAULT_VOICES_LIBRARY = [
  {
    id: 'v_1',
    voiceId: '90ipbRoKi4CpHXvKVtl0',
    provider: 'elevenlabs',
    name: 'Kavya (Empathetic Receptionist)',
    gender: 'Female',
    language: 'hi-IN',
    accent: 'Indian English & Hinglish',
    sampleText: 'Namaste! Welcome to our clinic. How may I assist you with scheduling your appointment today?',
    tags: ['Best for OPDs', 'Warm & Empathetic', 'Bilingual Hinglish'],
    isDefault: true,
  },
  {
    id: 'v_2',
    voiceId: 'cgSgspJ2msm6clMCkdW9',
    provider: 'elevenlabs',
    name: 'Aditi (Executive Consultant)',
    gender: 'Female',
    language: 'en-IN',
    accent: 'Indian English (Clear & Polished)',
    sampleText: 'Good day! Thank you for contacting our desk. I can assist you with portfolio inquiries, brochures, and site visit scheduling.',
    tags: ['Luxury Real Estate', 'Consultancy', 'High Ticket'],
  },
  {
    id: 'v_3',
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    provider: 'elevenlabs',
    name: 'Sarah (International Concierge)',
    gender: 'Female',
    language: 'en-US',
    accent: 'Global Neutral Accent',
    sampleText: 'Hello and welcome! I am your 24/7 front desk concierge. How can I facilitate your visit or reservation today?',
    tags: ['Boutique Hotels', 'NRI Friendly', 'Luxury Hospitality'],
  },
  {
    id: 'v_4',
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    provider: 'elevenlabs',
    name: 'Adam (Senior Business Advisor)',
    gender: 'Male',
    language: 'en-IN',
    accent: 'Indian English (Authoritative)',
    sampleText: 'Hello! Thank you for reaching out. I can assist you with demo class scheduling, loan schemes, or vehicle servicing bookings.',
    tags: ['Coaching Admissions', 'Fintech Loans', 'Auto Dealerships'],
  },
  {
    id: 'v_5',
    voiceId: 'onwK4e9ZLuTAKqWW03F9',
    provider: 'elevenlabs',
    name: 'Daniel (Medical Specialist)',
    gender: 'Male',
    language: 'en-IN',
    accent: 'Indian English (Calm & Precise)',
    sampleText: 'Greetings. I am here to assist you with specialist OPD consultations, diagnostic follow-ups, and lab reports.',
    tags: ['Hospitals', 'Diagnostics', 'Specialists'],
  },
  {
    id: 'v_6',
    voiceId: 'bulbul:kavya-hi',
    provider: 'sarvam',
    name: 'Bulbul Kavya (Native Hindi & Hinglish)',
    gender: 'Female',
    language: 'hi-IN',
    accent: 'Native Hindi (Conversational Desk)',
    sampleText: 'नमस्ते! हमारे क्लिनिक में आपका स्वागत है। क्या मैं आपके लिए डॉक्टर का अपॉइंटमेंट बुक करूँ?',
    tags: ['100% Native Hindi', 'Zero Robotic Tone', 'Bilingual Hinglish'],
  },
  {
    id: 'v_7',
    voiceId: 'bulbul:arjun-hi',
    provider: 'sarvam',
    name: 'Bulbul Arjun (Native Hindi Executive)',
    gender: 'Male',
    language: 'hi-IN',
    accent: 'Native Hindi (Fast & Direct)',
    sampleText: 'नमस्ते! टेस्ट ड्राइव या सर्विस बुकिंग के लिए मैं आपकी पूरी मदद कर सकता हूँ। बताएं कब आना चाहेंगे?',
    tags: ['Auto Service', 'Admissions', 'Hindi Native'],
  },
  {
    id: 'v_8',
    voiceId: 'bulbul:priya-te',
    provider: 'sarvam',
    name: 'Bulbul Priya (Native Telugu)',
    gender: 'Female',
    language: 'te-IN',
    accent: 'Native Telugu (Warm & Polite)',
    sampleText: 'నమస్కారం! మా క్లినిక్‌కి స్వాगతం. డాక్టర్ అపాయింట్‌మెంట్ లేదా వివరాల కోసం నేను మీకు ఎలా సహాయపడగలను?',
    tags: ['South India Hub', 'Telugu Native', 'Regional Support'],
  },
  {
    id: 'v_9',
    voiceId: 'bulbul:ananya-ta',
    provider: 'sarvam',
    name: 'Bulbul Ananya (Native Tamil)',
    gender: 'Female',
    language: 'ta-IN',
    accent: 'Native Tamil (Polite Concierge)',
    sampleText: 'வணக்கம்! எங்கள் சேவை மையத்திற்கு வரவேற்கிறோம். இன்று உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?',
    tags: ['Tamil Nadu Hub', 'Tamil Native', 'Regional Support'],
  },
  {
    id: 'v_10',
    voiceId: 'bulbul:vikram-kn',
    provider: 'sarvam',
    name: 'Bulbul Vikram (Native Kannada)',
    gender: 'Male',
    language: 'kn-IN',
    accent: 'Native Kannada (Professional)',
    sampleText: 'ನಮಸ್ಕಾರ! ನಮ್ಮ ಸ್ವಾಗತ ಮೇಜಿಗೆ ಸುಸ್ವಾಗತ. ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಾಗಿ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
    tags: ['Karnataka Hub', 'Kannada Native', 'Bangalore SMBs'],
  },
];

const LANGUAGES = [
  { id: 'en-in', name: 'English (India)' },
  { id: 'en-us', name: 'English (US)' },
  { id: 'hi-in', name: 'Hindi (हिंदी)' },
  { id: 'te-in', name: 'Telugu (తెలుగు)' },
  { id: 'ta-in', name: 'Tamil (தமிழ்)' },
  { id: 'kn-in', name: 'Kannada (ಕನ್ನಡ)' },
  { id: 'hi-en', name: 'Hinglish (Hybrid)' },
];

export default function VoiceAgentLibraryPage() {
  const { currentNiche } = useNiche();
  const [voices, setVoices] = useState<any[]>(DEFAULT_VOICES_LIBRARY);
  const [selectedVoiceId, setSelectedVoiceId] = useState(DEFAULT_VOICES_LIBRARY[0].voiceId);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  
  // Client Configuration State
  const [displayName, setDisplayName] = useState('Frontdesk AI');
  const [preferredLanguage, setPreferredLanguage] = useState('en-in');
  const [roleDescription, setRoleDescription] = useState('You are a helpful and polite receptionist. Your main responsibility is to answer inbound calls, schedule appointments, and answer basic questions about our services and operating hours.');

  // Live Testing State
  const [isLiveTesting, setIsLiveTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Fetch live personas synchronized from Super-Admin & Global Registry
    apiClient<any[]>('/voice/personas')
      .then((res) => {
        if (isMounted && Array.isArray(res) && res.length > 0) {
          setVoices(res);
        }
      })
      .catch((err) => console.warn('Using default voice personas:', err));

    apiClient<any>('/voice/config')
      .then((res) => {
        if (isMounted && res) {
          if (res.voiceId) setSelectedVoiceId(res.voiceId);
          if (res.agentName) setDisplayName(res.agentName);
          if (res.language) setPreferredLanguage(res.language);
          if (res.systemPrompt) setRoleDescription(res.systemPrompt);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handleSaveVoiceConfig = async () => {
    try {
      await apiClient('/voice/config', {
        method: 'PUT',
        body: JSON.stringify({
          voiceId: selectedVoiceId,
          agentName: displayName,
          language: preferredLanguage,
          systemPrompt: roleDescription,
        }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn('Failed to save voice config:', err);
    }
  };

  const toggleAudio = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAudio === id) {
      setIsPlayingAudio(null);
    } else {
      setIsPlayingAudio(id);
      setTimeout(() => setIsPlayingAudio(null), 3000); // Audio preview duration
    }
  };

  const selectedVoice = voices.find(v => (v.voiceId === selectedVoiceId || v.id === selectedVoiceId)) || voices[0] || DEFAULT_VOICES_LIBRARY[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">Voice AI Persona Library</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1.5">
            Select and configure the AI voice persona that best represents your brand. 
            All voices are provisioned from the master directory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/voice-knowledge-hub"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <Sparkles size={16} />
            <span>Voice Knowledge Hub →</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Voice Selection & Configuration */}
        <div className="xl:col-span-7 space-y-8">
          
          {/* Voices Bento Grid */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                <Mic className="text-blue-500" size={20} />
                Select a Voice Model
              </h2>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full">
                {voices.length} Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {voices.map((voice) => {
                const targetId = voice.voiceId || voice.id;
                const isSelected = selectedVoiceId === targetId;
                return (
                  <motion.div
                    key={targetId}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedVoiceId(targetId)}
                    className={cn(
                      "relative p-4 rounded-2xl border cursor-pointer transition-all overflow-hidden group",
                      isSelected 
                        ? "border-blue-500 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)] ring-1 ring-blue-500/20" 
                        : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-blue-500/30"
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={cn("font-bold text-base", isSelected ? "text-blue-500" : "text-[var(--color-text)]")}>
                            {voice.name}
                          </h3>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                            voice.provider === 'elevenlabs' ? "bg-purple-500/15 text-purple-400" : "bg-orange-500/15 text-orange-400"
                          )}>
                            {voice.provider || 'AI'}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{voice.gender} • {voice.accent || voice.language}</p>
                      </div>
                      <button 
                        onClick={(e) => toggleAudio(targetId, e)}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm",
                          isPlayingAudio === targetId 
                            ? "bg-amber-500 text-white" 
                            : isSelected ? "bg-blue-500 text-white" : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-slate-200 dark:hover:bg-slate-700"
                        )}
                      >
                        {isPlayingAudio === targetId ? <Pause size={14} className="animate-pulse" /> : <Play size={14} className="ml-0.5" />}
                      </button>
                    </div>

                    {voice.sampleText && (
                      <p className="text-[11px] text-[var(--color-text-muted)] italic line-clamp-2 mb-3 bg-[var(--color-surface)] p-2 rounded-lg border border-[var(--color-border)]">
                        "{voice.sampleText}"
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {voice.tags && voice.tags.map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-medium text-slate-600 dark:text-slate-400">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {isSelected && (
                      <div className="absolute top-3 right-12 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Configuration Form */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-4">
              <Settings2 className="text-emerald-500" size={20} />
              Persona Configuration
            </h2>

            <div className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-2 flex items-center gap-2">
                  <User size={16} className="text-[var(--color-text-muted)]" />
                  Your Display Name
                </label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Frontdesk Assistant"
                  className="w-full p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1.5">How this AI will refer to itself when answering calls.</p>
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-2 flex items-center gap-2">
                  <Globe size={16} className="text-[var(--color-text-muted)]" />
                  Choose Preferred Language
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => setPreferredLanguage(lang.id)}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-medium transition-all text-center",
                        preferredLanguage === lang.id 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400" 
                          : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-emerald-500/50"
                      )}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role & Responsibilities */}
              <div>
                <label className="block text-sm font-semibold text-[var(--color-text)] mb-2 flex items-center gap-2">
                  <Briefcase size={16} className="text-[var(--color-text-muted)]" />
                  Persona Role and Responsibilities
                </label>
                <textarea 
                  rows={5}
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Describe the exact role and duties of this AI agent..."
                  className="w-full p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none leading-relaxed"
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1.5">This tells the AI how to behave and what its boundaries are during a live call.</p>
              </div>

              <div className="pt-4 border-t border-[var(--color-border)] flex justify-end">
                <button onClick={handleSaveVoiceConfig} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                  {saveSuccess && <Check size={16} className="text-emerald-300" />}
                  <span>{saveSuccess ? 'Configuration Saved!' : 'Save Configuration'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Testing / ChatGPT Style Orb */}
        <div className="xl:col-span-5">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-xl sticky top-8 flex flex-col h-[600px]">
            <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-bg)] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Activity size={18} className="text-emerald-500" />
                  Live Voice Testing
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Talk to '{selectedVoice.name}' in real-time.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">System Ready</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 relative bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-900/50">
              
              {/* ChatGPT style animated orb */}
              <div className="relative flex items-center justify-center w-48 h-48">
                {isLiveTesting && (
                  <>
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-blue-500 rounded-full blur-xl"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                      className="absolute inset-4 bg-emerald-500 rounded-full blur-xl"
                    />
                  </>
                )}
                
                <div className={cn(
                  "relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl",
                  isLiveTesting 
                    ? "bg-slate-900 ring-4 ring-slate-800 shadow-[0_0_40px_rgba(59,130,246,0.3)]" 
                    : "bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700"
                )}>
                  <Headphones size={48} className={cn("transition-colors duration-500", isLiveTesting ? "text-blue-400" : "text-slate-400")} />
                </div>
              </div>

              <p className="mt-12 text-center text-sm font-medium text-[var(--color-text)]">
                {isLiveTesting 
                  ? "Listening... Speak into your microphone." 
                  : "Press Start to begin a test conversation."}
              </p>
            </div>

            <div className="p-6 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
              <button
                onClick={() => setIsLiveTesting(!isLiveTesting)}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg",
                  isLiveTesting 
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20" 
                    : "bg-[var(--color-text)] hover:bg-slate-800 dark:hover:bg-slate-200 text-[var(--color-bg)]"
                )}
              >
                {isLiveTesting ? (
                  <>
                    <Pause size={18} /> Stop Testing
                  </>
                ) : (
                  <>
                    <Mic size={18} /> Start Live Testing
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
