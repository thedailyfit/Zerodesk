import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminVoice {
  id: string;
  provider: 'elevenlabs' | 'sarvam' | 'cartesia' | 'openai';
  voiceId: string;
  name: string;
  gender: 'female' | 'male' | 'neutral';
  language: string;
  accent: string;
  sampleText: string;
  isDefault: boolean;
  isActive: boolean;
  tags: string[];
  allowedTenants?: string[];
}

export interface AdminLlmModel {
  id: string;
  provider: 'openai' | 'anthropic' | 'groq' | 'sarvam' | 'deepseek';
  modelId: string;
  name: string;
  contextWindow: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  isDefault: boolean;
  isActive: boolean;
  isFallback: boolean;
  category: 'flagship' | 'fast_voice' | 'reasoning' | 'economy';
  description: string;
  tierRequirement: 'all' | 'growth' | 'enterprise';
}

export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  industry: string;
  plan: 'Starter' | 'Growth' | 'Enterprise' | 'Trial';
  status: 'Active' | 'Suspended' | 'Past Due';
  mrr: number;
  usersCount: number;
  assignedLlmId: string;
  assignedFallbackLlmId?: string;
  allowedVoiceIds: string[];
  voiceMinutesUsed: number;
  voiceMinutesLimit: number;
  whatsappMessagesUsed: number;
  whatsappMessagesLimit: number;
  llmTokensUsed: number;
  llmTokensLimit: number;
  storageUsedMB: number;
  storageLimitMB: number;
  ragChunksCount: number;
  lastActive: string;
  createdAt: string;
}

export interface SuperAdminState {
  tenants: AdminTenant[];
  voices: AdminVoice[];
  llmModels: AdminLlmModel[];
  globalFailoverEnabled: boolean;
  fallbackModelId: string;
  latencyThresholdMs: number;
  impersonatedTenantId: string | null;
  
  addTenant: (tenant: AdminTenant) => void;
  updateTenant: (id: string, data: Partial<AdminTenant>) => void;
  deleteTenant: (id: string) => void;
  impersonateTenant: (id: string | null) => void;
  
  addVoice: (voice: AdminVoice) => void;
  updateVoice: (id: string, data: Partial<AdminVoice>) => void;
  deleteVoice: (id: string) => void;
  toggleVoiceStatus: (id: string) => void;
  setVoices: (voices: AdminVoice[]) => void;
  
  addLlmModel: (model: AdminLlmModel) => void;
  updateLlmModel: (id: string, data: Partial<AdminLlmModel>) => void;
  deleteLlmModel: (id: string) => void;
  toggleLlmStatus: (id: string) => void;
  setFallbackModel: (modelId: string) => void;
  toggleGlobalFailover: () => void;
}

const DEFAULT_VOICES: AdminVoice[] = [
  {
    id: 'v-1',
    provider: 'elevenlabs',
    voiceId: '90ipbRoKi4CpHXvKVtl0',
    name: 'Kavya (Empathetic Receptionist)',
    gender: 'female',
    language: 'hi-IN',
    accent: 'Indian English & Hinglish',
    sampleText: 'Namaste! Welcome to our clinic. How may I assist you with scheduling your appointment today?',
    isDefault: true,
    isActive: true,
    tags: ['Best for OPDs', 'Warm & Empathetic', 'Bilingual Hinglish', 'ElevenLabs Turbo v2.5']
  },
  {
    id: 'v-2',
    provider: 'elevenlabs',
    voiceId: 'cgSgspJ2msm6clMCkdW9',
    name: 'Aditi (Executive Consultant)',
    gender: 'female',
    language: 'en-IN',
    accent: 'Indian English (Clear & Polished)',
    sampleText: 'Good day! Thank you for contacting our desk. I can assist you with portfolio inquiries, brochures, and site visit scheduling.',
    isDefault: false,
    isActive: true,
    tags: ['Luxury Real Estate', 'Consultancy', 'High Ticket', 'ElevenLabs Multilingual v2']
  },
  {
    id: 'v-3',
    provider: 'elevenlabs',
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Sarah (International Concierge)',
    gender: 'female',
    language: 'en-US',
    accent: 'Global Neutral Accent',
    sampleText: 'Hello and welcome! I am your 24/7 front desk concierge. How can I facilitate your visit or reservation today?',
    isDefault: false,
    isActive: true,
    tags: ['Boutique Hotels', 'NRI Friendly', 'Luxury Hospitality', 'ElevenLabs Multilingual v2']
  },
  {
    id: 'v-4',
    provider: 'elevenlabs',
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam (Senior Business Advisor)',
    gender: 'male',
    language: 'en-IN',
    accent: 'Indian English (Authoritative)',
    sampleText: 'Hello! Thank you for reaching out. I can assist you with demo class scheduling, loan schemes, or vehicle servicing bookings.',
    isDefault: false,
    isActive: true,
    tags: ['Coaching Admissions', 'Fintech Loans', 'Auto Dealerships', 'ElevenLabs Turbo v2.5']
  },
  {
    id: 'v-5',
    provider: 'elevenlabs',
    voiceId: 'onwK4e9ZLuTAKqWW03F9',
    name: 'Daniel (Medical Specialist)',
    gender: 'male',
    language: 'en-IN',
    accent: 'Indian English (Calm & Precise)',
    sampleText: 'Greetings. I am here to assist you with specialist OPD consultations, diagnostic follow-ups, and lab reports.',
    isDefault: false,
    isActive: true,
    tags: ['Hospitals', 'Diagnostics', 'Specialists', 'ElevenLabs Multilingual v2']
  },
  {
    id: 'v-6',
    provider: 'sarvam',
    voiceId: 'bulbul:kavya-hi',
    name: 'Bulbul Kavya (Native Hindi & Hinglish)',
    gender: 'female',
    language: 'hi-IN',
    accent: 'Native Hindi (Conversational Desk)',
    sampleText: 'नमस्ते! हमारे क्लिनिक में आपका स्वागत है। क्या मैं आपके लिए डॉक्टर का अपॉइंटमेंट बुक करूँ?',
    isDefault: false,
    isActive: true,
    tags: ['100% Native Hindi', 'Zero Robotic Tone', 'Bilingual Hinglish', 'Sarvam Bulbul v2']
  },
  {
    id: 'v-7',
    provider: 'sarvam',
    voiceId: 'bulbul:arjun-hi',
    name: 'Bulbul Arjun (Native Hindi Executive)',
    gender: 'male',
    language: 'hi-IN',
    accent: 'Native Hindi (Fast & Direct)',
    sampleText: 'नमस्ते! टेस्ट ड्राइव या सर्विस बुकिंग के लिए मैं आपकी पूरी मदद कर सकता हूँ। बताएं कब आना चाहेंगे?',
    isDefault: false,
    isActive: true,
    tags: ['Auto Service', 'Admissions', 'Hindi Native', 'Sarvam Bulbul v2']
  },
  {
    id: 'v-8',
    provider: 'sarvam',
    voiceId: 'bulbul:priya-te',
    name: 'Bulbul Priya (Native Telugu)',
    gender: 'female',
    language: 'te-IN',
    accent: 'Native Telugu (Warm & Polite)',
    sampleText: 'నమస్కారం! మా క్లినిక్‌కి స్వాగతం. డాక్టర్ అపాయింట్‌మెంట్ లేదా వివరాల కోసం నేను మీకు ఎలా సహాయపడగలను?',
    isDefault: false,
    isActive: true,
    tags: ['South India Hub', 'Telugu Native', 'Regional Support', 'Sarvam Bulbul v2']
  },
  {
    id: 'v-9',
    provider: 'sarvam',
    voiceId: 'bulbul:ananya-ta',
    name: 'Bulbul Ananya (Native Tamil)',
    gender: 'female',
    language: 'ta-IN',
    accent: 'Native Tamil (Polite Concierge)',
    sampleText: 'வணக்கம்! எங்கள் சேவை மையத்திற்கு வரவேற்கிறோம். இன்று உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?',
    isDefault: false,
    isActive: true,
    tags: ['Tamil Nadu Hub', 'Tamil Native', 'Regional Support', 'Sarvam Bulbul v2']
  },
  {
    id: 'v-10',
    provider: 'sarvam',
    voiceId: 'bulbul:vikram-kn',
    name: 'Bulbul Vikram (Native Kannada)',
    gender: 'male',
    language: 'kn-IN',
    accent: 'Native Kannada (Professional)',
    sampleText: 'ನಮಸ್ಕಾರ! ನಮ್ಮ ಸ್ವಾಗತ ಮೇಜಿಗೆ ಸುಸ್ವಾಗತ. ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಾಗಿ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
    isDefault: false,
    isActive: true,
    tags: ['Karnataka Hub', 'Kannada Native', 'Bangalore SMBs', 'Sarvam Bulbul v2']
  }
];

const DEFAULT_LLMS: AdminLlmModel[] = [
  {
    id: 'm-1',
    provider: 'openai',
    modelId: 'gpt-4o',
    name: 'OpenAI GPT-4o (Omnichannel Flagship)',
    contextWindow: 128000,
    costPer1kInput: 0.0025,
    costPer1kOutput: 0.0100,
    isDefault: true,
    isActive: true,
    isFallback: false,
    category: 'flagship',
    description: 'Best for complex nuance, multi-intent extraction, and high-ticket sales objection handling.',
    tierRequirement: 'growth'
  },
  {
    id: 'm-2',
    provider: 'groq',
    modelId: 'llama-3.3-70b-versatile',
    name: 'Groq LLaMA 3.3 70B (Ultra-Fast Voice)',
    contextWindow: 128000,
    costPer1kInput: 0.00059,
    costPer1kOutput: 0.00079,
    isDefault: false,
    isActive: true,
    isFallback: true,
    category: 'fast_voice',
    description: 'Blazing 350 tokens/sec generation on LPUs. Ideal for sub-second voice conversational loops.',
    tierRequirement: 'all'
  },
  {
    id: 'm-3',
    provider: 'anthropic',
    modelId: 'claude-3-5-sonnet-latest',
    name: 'Claude 3.5 Sonnet (Reasoning & Medical SOPs)',
    contextWindow: 200000,
    costPer1kInput: 0.0030,
    costPer1kOutput: 0.0150,
    isDefault: false,
    isActive: true,
    isFallback: false,
    category: 'reasoning',
    description: 'Superior document understanding and clinical/RERA compliance guardrail adherence.',
    tierRequirement: 'enterprise'
  },
  {
    id: 'm-4',
    provider: 'sarvam',
    modelId: 'sarvam-2b-indic',
    name: 'Sarvam 2B Indic (Native Regional Speech)',
    contextWindow: 32000,
    costPer1kInput: 0.00020,
    costPer1kOutput: 0.00020,
    isDefault: false,
    isActive: true,
    isFallback: false,
    category: 'economy',
    description: 'Engineered specifically for 10+ Indian languages (Hindi, Telugu, Tamil, Marathi, Bengali).',
    tierRequirement: 'all'
  },
  {
    id: 'm-5',
    provider: 'deepseek',
    modelId: 'deepseek-v3',
    name: 'DeepSeek-V3 (High Value Economy)',
    contextWindow: 64000,
    costPer1kInput: 0.00014,
    costPer1kOutput: 0.00028,
    isDefault: false,
    isActive: true,
    isFallback: false,
    category: 'economy',
    description: 'Ultra-low cost high-performing MoE model for high-volume WhatsApp automated workflows.',
    tierRequirement: 'all'
  }
];

const DEFAULT_TENANTS: AdminTenant[] = [];

export const useSuperAdminStore = create<SuperAdminState>()(
  persist(
    (set) => ({
      tenants: DEFAULT_TENANTS,
      voices: DEFAULT_VOICES,
      llmModels: DEFAULT_LLMS,
      globalFailoverEnabled: true,
      fallbackModelId: 'm-2',
      latencyThresholdMs: 1200,
      impersonatedTenantId: null,

      addTenant: (tenant: AdminTenant) =>
        set((state: SuperAdminState) => ({ tenants: [tenant, ...state.tenants] })),

      updateTenant: (id: string, data: Partial<AdminTenant>) =>
        set((state: SuperAdminState) => ({
          tenants: state.tenants.map((t: AdminTenant) => (t.id === id ? { ...t, ...data } : t)),
        })),

      deleteTenant: (id: string) =>
        set((state: SuperAdminState) => ({
          tenants: state.tenants.filter((t: AdminTenant) => t.id !== id),
        })),

      impersonateTenant: (id: string | null) =>
        set(() => ({ impersonatedTenantId: id })),

      addVoice: (voice: AdminVoice) =>
        set((state: SuperAdminState) => ({ voices: [voice, ...state.voices] })),

      updateVoice: (id: string, data: Partial<AdminVoice>) =>
        set((state: SuperAdminState) => ({
          voices: state.voices.map((v: AdminVoice) => (v.id === id ? { ...v, ...data } : v)),
        })),

      deleteVoice: (id: string) =>
        set((state: SuperAdminState) => ({
          voices: state.voices.filter((v: AdminVoice) => v.id !== id),
        })),

      toggleVoiceStatus: (id: string) =>
        set((state: SuperAdminState) => ({
          voices: state.voices.map((v: AdminVoice) =>
            v.id === id ? { ...v, isActive: !v.isActive } : v
          ),
        })),

      setVoices: (voices: AdminVoice[]) =>
        set(() => ({ voices })),

      addLlmModel: (model: AdminLlmModel) =>
        set((state: SuperAdminState) => ({ llmModels: [model, ...state.llmModels] })),

      updateLlmModel: (id: string, data: Partial<AdminLlmModel>) =>
        set((state: SuperAdminState) => ({
          llmModels: state.llmModels.map((m: AdminLlmModel) =>
            m.id === id ? { ...m, ...data } : m
          ),
        })),

      deleteLlmModel: (id: string) =>
        set((state: SuperAdminState) => ({
          llmModels: state.llmModels.filter((m: AdminLlmModel) => m.id !== id),
        })),

      toggleLlmStatus: (id: string) =>
        set((state: SuperAdminState) => ({
          llmModels: state.llmModels.map((m: AdminLlmModel) =>
            m.id === id ? { ...m, isActive: !m.isActive } : m
          ),
        })),

      setFallbackModel: (fallbackModelId: string) => set({ fallbackModelId }),

      toggleGlobalFailover: () =>
        set((state: SuperAdminState) => ({
          globalFailoverEnabled: !state.globalFailoverEnabled,
        })),
    }),
    {
      name: 'zerodesk-superadmin-storage',
    }
  )
);
