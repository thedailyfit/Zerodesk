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
    provider: 'sarvam',
    voiceId: 'sarvam-kavya-hi-in',
    name: 'Kavya (Hindi & English)',
    gender: 'female',
    language: 'hi-IN',
    accent: 'Indian Neutral',
    sampleText: 'Namaste! Welcome to our reception desk. How may I assist you today?',
    isDefault: true,
    isActive: true,
    tags: ['Best for Clinics', 'Warm & Empathetic', 'Bilingual']
  },
  {
    id: 'v-2',
    provider: 'elevenlabs',
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    name: 'Sarah (Global English)',
    gender: 'female',
    language: 'en-US',
    accent: 'American Professional',
    sampleText: 'Hello! Thank you for calling. I am your 24/7 AI front desk assistant.',
    isDefault: false,
    isActive: true,
    tags: ['High Clarity', 'Corporate', 'Hospitality']
  },
  {
    id: 'v-3',
    provider: 'sarvam',
    voiceId: 'sarvam-rahul-hi-in',
    name: 'Rahul (Confident Executive)',
    gender: 'male',
    language: 'hi-IN',
    accent: 'Indian Corporate',
    sampleText: 'Namaste! I can schedule your VIP site visit or check 3BHK unit pricing.',
    isDefault: false,
    isActive: true,
    tags: ['Real Estate', 'Dealerships', 'Energetic']
  },
  {
    id: 'v-4',
    provider: 'elevenlabs',
    voiceId: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Priya (Telugu & English)',
    gender: 'female',
    language: 'te-IN',
    accent: 'South Indian Professional',
    sampleText: 'Namaskaram! How can I assist you with your appointment today?',
    isDefault: false,
    isActive: true,
    tags: ['Regional Specialist', 'Hyderabad Focus']
  },
  {
    id: 'v-5',
    provider: 'cartesia',
    voiceId: 'cartesia-sonic-vikram',
    name: 'Vikram (Ultra Fast Sonic)',
    gender: 'male',
    language: 'en-IN',
    accent: 'Indian Neutral',
    sampleText: 'ZeroDesk voice dispatch ready. Sub-120ms response time enabled.',
    isDefault: false,
    isActive: true,
    tags: ['Sub-150ms Latency', 'Fast Inbound']
  },
  {
    id: 'v-6',
    provider: 'sarvam',
    voiceId: 'sarvam-aarav-ta-in',
    name: 'Aarav (Tamil & English)',
    gender: 'male',
    language: 'ta-IN',
    accent: 'Tamil Corporate',
    sampleText: 'Vanakkam! Welcome to our advisory service.',
    isDefault: false,
    isActive: true,
    tags: ['Regional Specialist', 'Tamil Nadu Focus']
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

const DEFAULT_TENANTS: AdminTenant[] = [
  {
    id: 't-1',
    name: 'GlowSkin Aesthetics & Laser Clinic',
    slug: 'glowskin-clinic',
    industry: 'Skin & Dermatology Clinic',
    plan: 'Enterprise',
    status: 'Active',
    mrr: 14999,
    usersCount: 14,
    assignedLlmId: 'm-1',
    allowedVoiceIds: ['v-1', 'v-2', 'v-4'],
    voiceMinutesUsed: 4120,
    voiceMinutesLimit: 5000,
    whatsappMessagesUsed: 14200,
    whatsappMessagesLimit: 20000,
    llmTokensUsed: 18450000,
    llmTokensLimit: 25000000,
    storageUsedMB: 340.5,
    storageLimitMB: 2000,
    ragChunksCount: 1240,
    lastActive: '2 mins ago',
    createdAt: '2026-06-12'
  },
  {
    id: 't-2',
    name: 'Prestige Realty & Developers',
    slug: 'prestige-realty',
    industry: 'Real Estate & Properties',
    plan: 'Enterprise',
    status: 'Active',
    mrr: 14999,
    usersCount: 22,
    assignedLlmId: 'm-2',
    allowedVoiceIds: ['v-1', 'v-3', 'v-5'],
    voiceMinutesUsed: 6250,
    voiceMinutesLimit: 8000,
    whatsappMessagesUsed: 22400,
    whatsappMessagesLimit: 30000,
    llmTokensUsed: 29800000,
    llmTokensLimit: 40000000,
    storageUsedMB: 680.0,
    storageLimitMB: 5000,
    ragChunksCount: 2890,
    lastActive: 'Just now',
    createdAt: '2026-05-20'
  },
  {
    id: 't-3',
    name: 'Radiance Dental Studio',
    slug: 'radiance-dental',
    industry: 'Dental Care & Surgery',
    plan: 'Growth',
    status: 'Active',
    mrr: 7499,
    usersCount: 8,
    assignedLlmId: 'm-1',
    allowedVoiceIds: ['v-1', 'v-2'],
    voiceMinutesUsed: 1840,
    voiceMinutesLimit: 2500,
    whatsappMessagesUsed: 6200,
    whatsappMessagesLimit: 10000,
    llmTokensUsed: 8900000,
    llmTokensLimit: 15000000,
    storageUsedMB: 125.0,
    storageLimitMB: 1000,
    ragChunksCount: 650,
    lastActive: '12 mins ago',
    createdAt: '2026-07-04'
  },
  {
    id: 't-4',
    name: 'The Grand Heritage Palace Resort',
    slug: 'grand-heritage',
    industry: 'Hotel & Luxury Resort',
    plan: 'Enterprise',
    status: 'Active',
    mrr: 14999,
    usersCount: 31,
    assignedLlmId: 'm-3',
    allowedVoiceIds: ['v-1', 'v-2', 'v-4', 'v-6'],
    voiceMinutesUsed: 7890,
    voiceMinutesLimit: 10000,
    whatsappMessagesUsed: 28900,
    whatsappMessagesLimit: 40000,
    llmTokensUsed: 38400000,
    llmTokensLimit: 50000000,
    storageUsedMB: 840.2,
    storageLimitMB: 5000,
    ragChunksCount: 3410,
    lastActive: 'Just now',
    createdAt: '2026-04-15'
  },
  {
    id: 't-5',
    name: 'Apex IIT-JEE & NEET Academy',
    slug: 'apex-academy',
    industry: 'Coaching & Education',
    plan: 'Growth',
    status: 'Active',
    mrr: 7499,
    usersCount: 12,
    assignedLlmId: 'm-2',
    allowedVoiceIds: ['v-1', 'v-3'],
    voiceMinutesUsed: 2410,
    voiceMinutesLimit: 3000,
    whatsappMessagesUsed: 9800,
    whatsappMessagesLimit: 15000,
    llmTokensUsed: 11200000,
    llmTokensLimit: 20000000,
    storageUsedMB: 210.0,
    storageLimitMB: 1500,
    ragChunksCount: 980,
    lastActive: '25 mins ago',
    createdAt: '2026-07-18'
  },
  {
    id: 't-6',
    name: 'Novus FinServe SMB Loans',
    slug: 'novus-finserve',
    industry: 'SMB Fintech & Credit',
    plan: 'Starter',
    status: 'Active',
    mrr: 3999,
    usersCount: 4,
    assignedLlmId: 'm-5',
    allowedVoiceIds: ['v-1'],
    voiceMinutesUsed: 890,
    voiceMinutesLimit: 1000,
    whatsappMessagesUsed: 3100,
    whatsappMessagesLimit: 5000,
    llmTokensUsed: 3800000,
    llmTokensLimit: 5000000,
    storageUsedMB: 65.0,
    storageLimitMB: 500,
    ragChunksCount: 310,
    lastActive: '1 hr ago',
    createdAt: '2026-08-01'
  },
  {
    id: 't-7',
    name: 'Heritage Auto Showroom & Workshop',
    slug: 'heritage-auto',
    industry: 'Automobile Dealership',
    plan: 'Growth',
    status: 'Active',
    mrr: 7499,
    usersCount: 9,
    assignedLlmId: 'm-2',
    allowedVoiceIds: ['v-1', 'v-3', 'v-5'],
    voiceMinutesUsed: 2100,
    voiceMinutesLimit: 2500,
    whatsappMessagesUsed: 7400,
    whatsappMessagesLimit: 10000,
    llmTokensUsed: 9400000,
    llmTokensLimit: 15000000,
    storageUsedMB: 180.0,
    storageLimitMB: 1000,
    ragChunksCount: 720,
    lastActive: '40 mins ago',
    createdAt: '2026-07-22'
  },
  {
    id: 't-8',
    name: 'Balaji Consumer Goods & Logistics',
    slug: 'balaji-fmcg',
    industry: 'FMCG Wholesale & Supply',
    plan: 'Starter',
    status: 'Active',
    mrr: 3999,
    usersCount: 5,
    assignedLlmId: 'm-4',
    allowedVoiceIds: ['v-1', 'v-4'],
    voiceMinutesUsed: 720,
    voiceMinutesLimit: 1000,
    whatsappMessagesUsed: 2900,
    whatsappMessagesLimit: 5000,
    llmTokensUsed: 2900000,
    llmTokensLimit: 5000000,
    storageUsedMB: 48.0,
    storageLimitMB: 500,
    ragChunksCount: 220,
    lastActive: '3 hrs ago',
    createdAt: '2026-08-10'
  }
];

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
