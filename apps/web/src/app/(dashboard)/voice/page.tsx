'use client';

import { useState, useEffect, useRef } from 'react';
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
  Settings2,
  AlertTriangle,
  Radio,
  VolumeX,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useNiche } from '@/components/providers/niche-provider';
import type { NicheId } from '@/config/niches/types';

// Curated Neural Indian Voice Personas Fleet
export interface VoicePersona {
  id: string;
  voiceId: string;
  tierBadge: 'Ultra HD Neural' | 'Bilingual AI' | 'Natural Flow';
  name: string;
  gender: string;
  language: string;
  accent: string;
  sampleText: string;
  tags: string[];
  isDefault?: boolean;
}

const DEFAULT_VOICES_LIBRARY: VoicePersona[] = [
  {
    id: 'v_1',
    voiceId: '90ipbRoKi4CpHXvKVtl0',
    tierBadge: 'Ultra HD Neural',
    name: 'Kavya (Empathetic Receptionist)',
    gender: 'Female',
    language: 'hi-IN',
    accent: 'Indian English & Hinglish',
    sampleText: 'Namaste! Welcome to our desk. How may I assist you with scheduling your appointment today?',
    tags: ['Best for OPDs', 'Warm & Empathetic', 'Bilingual Hinglish'],
    isDefault: true,
  },
  {
    id: 'v_2',
    voiceId: 'cgSgspJ2msm6clMCkdW9',
    tierBadge: 'Ultra HD Neural',
    name: 'Aditi (Executive Consultant)',
    gender: 'Female',
    language: 'en-IN',
    accent: 'Indian English (Clear & Polished)',
    sampleText: 'Good day! Thank you for contacting our desk. I can assist you with portfolio inquiries, brochures, and scheduling.',
    tags: ['Luxury Real Estate', 'Consultancy', 'High Ticket'],
  },
  {
    id: 'v_3',
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    tierBadge: 'Natural Flow',
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
    tierBadge: 'Ultra HD Neural',
    name: 'Adam (Senior Business Advisor)',
    gender: 'Male',
    language: 'en-IN',
    accent: 'Indian English (Authoritative)',
    sampleText: 'Hello! Thank you for reaching out. I can assist you with demo class scheduling, advisory consultations, and bookings.',
    tags: ['Executive Advisory', 'High Trust', 'Clear Diction'],
  },
  {
    id: 'v_5',
    voiceId: 'onwK4e9ZLuTAKqWW03F9',
    tierBadge: 'Natural Flow',
    name: 'Daniel (Medical Specialist)',
    gender: 'Male',
    language: 'en-IN',
    accent: 'Indian English (Calm & Precise)',
    sampleText: 'Greetings. I am here to assist you with specialist consultations, diagnostic follow-ups, and clinic schedules.',
    tags: ['Hospitals', 'Diagnostics', 'Specialists'],
  },
  {
    id: 'v_6',
    voiceId: 'bulbul:kavya-hi',
    tierBadge: 'Bilingual AI',
    name: 'Bulbul Kavya (Native Hindi & Hinglish)',
    gender: 'Female',
    language: 'hi-IN',
    accent: 'Native Hindi (Conversational Desk)',
    sampleText: 'नमस्ते! हमारे सेंटर में आपका स्वागत है। क्या मैं आपके लिए अपॉइंटमेंट या कंसल्टेशन शेड्यूल करूँ?',
    tags: ['100% Native Hindi', 'Zero Robotic Tone', 'Bilingual Hinglish'],
  },
  {
    id: 'v_7',
    voiceId: 'bulbul:arjun-hi',
    tierBadge: 'Bilingual AI',
    name: 'Bulbul Arjun (Native Hindi Executive)',
    gender: 'Male',
    language: 'hi-IN',
    accent: 'Native Hindi (Fast & Direct)',
    sampleText: 'नमस्ते! सर्विस बुकिंग और जानकारी के लिए मैं आपकी पूरी मदद कर सकता हूँ। बताएं कब आना चाहेंगे?',
    tags: ['Direct Support', 'Admissions', 'Hindi Native'],
  },
  {
    id: 'v_8',
    voiceId: 'bulbul:priya-te',
    tierBadge: 'Bilingual AI',
    name: 'Bulbul Priya (Native Telugu)',
    gender: 'Female',
    language: 'te-IN',
    accent: 'Native Telugu (Warm & Polite)',
    sampleText: 'నమస్కారం! మా సెంటర్‌కు స్వాగతం. అపాయింట్‌మెంట్ లేదా వివరాల కోసం నేను మీకు ఎలా సహాయపడగలను?',
    tags: ['South India Hub', 'Telugu Native', 'Regional Support'],
  },
  {
    id: 'v_9',
    voiceId: 'bulbul:ananya-ta',
    tierBadge: 'Bilingual AI',
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
    tierBadge: 'Bilingual AI',
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
  const { currentNiche, nicheConfig } = useNiche();
  const [voices, setVoices] = useState<VoicePersona[]>(DEFAULT_VOICES_LIBRARY);
  const [selectedVoiceId, setSelectedVoiceId] = useState(DEFAULT_VOICES_LIBRARY[0].voiceId);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  
  // Client Configuration State
  const [displayName, setDisplayName] = useState('Frontdesk AI');
  const [preferredLanguage, setPreferredLanguage] = useState('en-in');
  const [roleDescription, setRoleDescription] = useState(
    'You are a helpful and polite receptionist. Your main responsibility is to answer inbound calls, schedule appointments, and answer basic questions about our services and operating hours.'
  );

  // Live Testing State
  const [isLiveTesting, setIsLiveTesting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [callTranscript, setCallTranscript] = useState<{ sender: 'user' | 'agent'; text: string; time: string }[]>([]);
  const [liveUserSpeech, setLiveUserSpeech] = useState<string>('');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Audio Context & Recognition Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Fetch live personas synchronized from Super-Admin & Global Registry
    apiClient<any[]>('/voice/personas')
      .then((res) => {
        if (isMounted && Array.isArray(res) && res.length > 0) {
          // Clean vendor labels and normalize badges
          const sanitized = res.map((v: any, index: number) => ({
            ...v,
            tierBadge: v.tierBadge || (v.language?.startsWith('en') ? 'Ultra HD Neural' : 'Bilingual AI'),
          }));
          setVoices(sanitized);
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

    return () => { 
      isMounted = false; 
      stopLiveTestingSession();
    };
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
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(null);
    } else {
      setIsPlayingAudio(id);
      const voiceObj = voices.find(v => (v.voiceId === id || v.id === id));
      if (voiceObj && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(voiceObj.sampleText);
        utterance.onend = () => setIsPlayingAudio(null);
        utterance.onerror = () => setIsPlayingAudio(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlayingAudio(null), 3000);
      }
    }
  };

  // Generate contextual AI response for test calls
  const generateAgentResponse = (userText: string) => {
    const lower = userText.toLowerCase();
    const serviceName = nicheConfig?.label || 'our center';
    const apptWord = nicheConfig?.terminology?.appointment?.toLowerCase() || 'appointment';
    const customerWord = nicheConfig?.terminology?.customer?.toLowerCase() || 'client';

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('namaste')) {
      return `Namaste! Thank you for calling ${serviceName}. I am ${displayName}, your AI frontdesk assistant. How may I assist you with scheduling your ${apptWord} today?`;
    } else if (lower.includes('timing') || lower.includes('hours') || lower.includes('open')) {
      return `We are open Monday through Saturday from 9:00 AM to 8:00 PM. Would you like me to book a slot for you today or later this week?`;
    } else if (lower.includes('price') || lower.includes('cost') || lower.includes('charge') || lower.includes('fee')) {
      return `Our consultation fees and package pricing are fully transparent. Standard consultation starts from ₹500, and our specialized services vary based on consultation. May I know which treatment you are interested in?`;
    } else if (lower.includes('book') || lower.includes('appointment') || lower.includes('schedule') || lower.includes('visit')) {
      return `I would be happy to book an ${apptWord} for you! We have available openings today at 3:30 PM and 5:00 PM. Which one works better for you?`;
    } else if (lower.includes('doctor') || lower.includes('specialist') || lower.includes('expert')) {
      return `Our senior specialists are on duty today. May I have your name so I can check their exact open chair slots and reserve your consultation?`;
    } else {
      return `Thank you for sharing that. I've noted your request for ${serviceName}. Would you like me to confirm this and send a WhatsApp confirmation directly to your phone?`;
    }
  };

  // Speak agent response using SpeechSynthesis
  const speakAgentResponse = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Pick a voice matching language if available
    const availableSynthVoices = window.speechSynthesis.getVoices();
    const preferredVoice = availableSynthVoices.find(v => v.lang.includes('IN') || v.lang.includes('en'));
    if (preferredVoice) utterance.voice = preferredVoice;

    setIsAgentSpeaking(true);

    utterance.onstart = () => {
      setIsAgentSpeaking(true);
    };

    utterance.onend = () => {
      setIsAgentSpeaking(false);
    };

    utterance.onerror = () => {
      setIsAgentSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Sync test log to SuperAdmin / localStorage
  const syncTestCallLog = (transcriptHistory: any[]) => {
    const selectedVoiceObj = voices.find(v => v.voiceId === selectedVoiceId || v.id === selectedVoiceId) || voices[0];
    const logItem = {
      id: `test_call_${Date.now()}`,
      timestamp: new Date().toISOString(),
      voiceId: selectedVoiceObj?.voiceId,
      voiceName: selectedVoiceObj?.name,
      language: preferredLanguage,
      agentName: displayName,
      niche: currentNiche,
      status: 'COMPLETED',
      turnsCount: transcriptHistory.length,
      history: transcriptHistory,
    };

    try {
      const existing = JSON.parse(localStorage.getItem('zerodesk_voice_test_log') || '[]');
      existing.unshift(logItem);
      localStorage.setItem('zerodesk_voice_test_log', JSON.stringify(existing.slice(0, 20)));
    } catch {}

    // Send to SuperAdmin telephony API if reachable
    apiClient('/admin/telephony/test-calls', {
      method: 'POST',
      body: JSON.stringify(logItem)
    }).catch(() => {});
  };

  // Start Live Mic & Speech Recognition
  const handleStartLiveTesting = async () => {
    setMicPermissionError(null);
    setIsConnecting(true);

    try {
      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // 2. Setup AudioContext and AnalyserNode for real audio metering
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // 3. Setup Web Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = preferredLanguage === 'hi-in' ? 'hi-IN' : 'en-IN';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              const userTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
              const userMessage = { sender: 'user' as const, text: transcript.trim(), time: userTime };
              
              setCallTranscript(prev => {
                const updated = [...prev, userMessage];
                // Trigger empathetic agent response
                setTimeout(() => {
                  const agentReplyText = generateAgentResponse(transcript);
                  const agentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                  const agentMessage = { sender: 'agent' as const, text: agentReplyText, time: agentTime };
                  
                  const finalUpdated = [...updated, agentMessage];
                  setCallTranscript(finalUpdated);
                  speakAgentResponse(agentReplyText);
                  syncTestCallLog(finalUpdated);
                }, 400);
                return updated;
              });
              setLiveUserSpeech('');
            } else {
              currentTranscript += transcript;
              setLiveUserSpeech(currentTranscript);
            }
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition status:', e.error);
        };

        recognition.onend = () => {
          // Restart if still testing
          if (recognitionRef.current && isLiveTesting) {
            try {
              recognition.start();
            } catch {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      setIsConnecting(false);
      setIsLiveTesting(true);

      // Play introductory greeting from the agent
      const greeting = `Namaste! You have reached ${nicheConfig?.label || 'ZeroDesk'}. I am ${displayName}. I can hear you clearly through your microphone. How can I help you today?`;
      const initMessage = {
        sender: 'agent' as const,
        text: greeting,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      setCallTranscript([initMessage]);
      speakAgentResponse(greeting);

    } catch (err: any) {
      console.error('Microphone access failed:', err);
      setIsConnecting(false);
      setIsLiveTesting(false);
      setMicPermissionError(
        'Microphone permission was denied or is unavailable. Please click the lock or settings icon in your browser address bar, allow microphone access, and try again.'
      );
    }
  };

  const stopLiveTestingSession = () => {
    setIsLiveTesting(false);
    setIsConnecting(false);
    setIsAgentSpeaking(false);
    setLiveUserSpeech('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const selectedVoice = voices.find(v => (v.voiceId === selectedVoiceId || v.id === selectedVoiceId)) || voices[0] || DEFAULT_VOICES_LIBRARY[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header - Single synchronized library title with zero vendor clutter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight">Voice AI Persona Library</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1.5">
            Select and configure the AI voice persona that represents your brand. All voices are synced with zero vendor logos.
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
                {voices.length} Synchronized Personas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {voices.map((voice) => {
                const targetId = voice.voiceId || voice.id;
                const isSelected = selectedVoiceId === targetId;
                const tier = voice.tierBadge || 'Ultra HD Neural';

                return (
                  <motion.div
                    key={targetId}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={cn("font-bold text-base", isSelected ? "text-blue-500" : "text-[var(--color-text)]")}>
                            {voice.name}
                          </h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                            tier === 'Ultra HD Neural' 
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                              : tier === 'Bilingual AI'
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          )}>
                            {tier}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{voice.gender} • {voice.accent || voice.language}</p>
                      </div>

                      <button 
                        onClick={(e) => toggleAudio(targetId, e)}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm shrink-0",
                          isPlayingAudio === targetId 
                            ? "bg-amber-500 text-white" 
                            : isSelected ? "bg-blue-500 text-white" : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-slate-200 dark:hover:bg-slate-700"
                        )}
                        title={isPlayingAudio === targetId ? "Pause Preview" : "Play Sample Voice"}
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
                      <div className="absolute top-3 right-12 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
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

        {/* RIGHT COLUMN: Live Testing / ChatGPT Style Voice Orb */}
        <div className="xl:col-span-5">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-xl sticky top-8 flex flex-col h-[680px]">
            {/* Header */}
            <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-bg)] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Activity size={18} className="text-emerald-500" />
                  Live Voice Testing
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Talk to '{selectedVoice.name}' in real-time.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  isLiveTesting ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                )} />
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  isLiveTesting ? "text-emerald-500" : "text-slate-400"
                )}>
                  {isConnecting ? 'Connecting...' : isLiveTesting ? 'Active Call' : 'System Ready'}
                </span>
              </div>
            </div>

            {/* Error Notice if Mic Permission Denied */}
            {micPermissionError && (
              <div className="p-4 mx-4 mt-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-xs text-red-400">
                <AlertTriangle size={18} className="shrink-0 text-red-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">{micPermissionError}</p>
                  <button 
                    onClick={handleStartLiveTesting}
                    className="underline hover:text-red-300 font-bold"
                  >
                    Click here to retry granting permission
                  </button>
                </div>
              </div>
            )}

            {/* Main Interactive Stage */}
            <div className="flex-1 flex flex-col items-center justify-between p-6 relative bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-900/50 overflow-hidden">
              
              {/* ChatGPT style reactive voice animated orb */}
              <div className="relative flex items-center justify-center w-52 h-52 my-auto">
                {isLiveTesting && (
                  <>
                    {/* Outer glowing halo reacts to real mic input / AI speech */}
                    <motion.div 
                      animate={{ 
                        scale: isAgentSpeaking ? [1.1, 1.45, 1.1] : [1, 1 + (audioLevel / 120), 1], 
                        opacity: isAgentSpeaking ? [0.4, 0.7, 0.4] : [0.25, 0.25 + (audioLevel / 150), 0.25] 
                      }}
                      transition={{ duration: isAgentSpeaking ? 1.2 : 0.4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-blue-500 rounded-full blur-2xl"
                    />
                    <motion.div 
                      animate={{ 
                        scale: isAgentSpeaking ? [1, 1.3, 1] : [1, 1 + (audioLevel / 160), 1], 
                        opacity: isAgentSpeaking ? [0.5, 0.9, 0.5] : [0.35, 0.35 + (audioLevel / 180), 0.35] 
                      }}
                      transition={{ duration: isAgentSpeaking ? 1.0 : 0.35, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                      className="absolute inset-4 bg-emerald-500 rounded-full blur-xl"
                    />
                  </>
                )}
                
                <div className={cn(
                  "relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl",
                  isLiveTesting 
                    ? isAgentSpeaking
                      ? "bg-gradient-to-tr from-emerald-600 to-teal-500 ring-4 ring-emerald-400/40 shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                      : "bg-slate-900 ring-4 ring-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.3)]" 
                    : "bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700"
                )}>
                  <Headphones 
                    size={46} 
                    className={cn(
                      "transition-colors duration-300", 
                      isLiveTesting 
                        ? isAgentSpeaking ? "text-white animate-pulse" : "text-blue-400" 
                        : "text-slate-400"
                    )} 
                  />
                  {isLiveTesting && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 mt-1">
                      {isAgentSpeaking ? 'Agent Speaking' : 'Listening...'}
                    </span>
                  )}
                </div>
              </div>

              {/* Status and Live Conversation Display */}
              <div className="w-full space-y-3">
                {isLiveTesting ? (
                  <div className="bg-[var(--color-bg)]/80 backdrop-blur-md border border-[var(--color-border)] rounded-2xl p-3.5 space-y-2 max-h-36 overflow-y-auto">
                    {callTranscript.length === 0 && !liveUserSpeech && (
                      <p className="text-center text-xs text-[var(--color-text-muted)] animate-pulse">
                        Speak into your microphone. Say "Hello", ask for timings, or request an appointment.
                      </p>
                    )}

                    {callTranscript.slice(-3).map((item, index) => (
                      <div key={index} className={cn("text-xs leading-relaxed", item.sender === 'user' ? "text-blue-400 font-medium" : "text-[var(--color-text)]")}>
                        <span className="font-bold uppercase text-[10px] opacity-75 mr-1.5">
                          {item.sender === 'user' ? 'You:' : `${displayName}:`}
                        </span>
                        {item.text}
                      </div>
                    ))}

                    {liveUserSpeech && (
                      <div className="text-xs text-blue-400/80 italic animate-pulse">
                        <span className="font-bold uppercase text-[10px] mr-1.5">Hearing:</span>
                        "{liveUserSpeech}..."
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-sm font-medium text-[var(--color-text)]">
                    Press Start to begin a real-time live test conversation.
                  </p>
                )}

                {/* Audit sync badge */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
                  <Radio size={12} className="text-emerald-500 animate-pulse" />
                  <span>Activity synced to SuperAdmin Telephony Log</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
              <button
                onClick={isLiveTesting ? stopLiveTestingSession : handleStartLiveTesting}
                disabled={isConnecting}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50",
                  isLiveTesting 
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20" 
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25"
                )}
              >
                {isConnecting ? (
                  <>
                    <RotateCcw size={18} className="animate-spin" /> Connecting Microphone...
                  </>
                ) : isLiveTesting ? (
                  <>
                    <Pause size={18} /> Stop Live Session
                  </>
                ) : (
                  <>
                    <Mic size={18} /> Start Live Voice Testing
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
