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
  setTenants: (tenants: AdminTenant[]) => void;
  upsertTenant: (tenant: AdminTenant) => void;
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

const DEFAULT_TENANTS: AdminTenant[] = [];

export const useSuperAdminStore = create<SuperAdminState>()(
  persist(
    (set) => ({
      tenants: DEFAULT_TENANTS,
      voices: [],
      llmModels: [],
      globalFailoverEnabled: false,
      fallbackModelId: '',
      latencyThresholdMs: 1200,
      impersonatedTenantId: null,

      addTenant: (tenant: AdminTenant) =>
        set((state: SuperAdminState) => ({ tenants: [tenant, ...state.tenants] })),

      setTenants: (tenants: AdminTenant[]) =>
        set(() => ({ tenants })),

      upsertTenant: (tenant: AdminTenant) =>
        set((state: SuperAdminState) => {
          const index = state.tenants.findIndex((t) => t.id === tenant.id);
          if (index >= 0) {
            const next = [...state.tenants];
            next[index] = { ...next[index], ...tenant };
            return { tenants: next };
          }
          return { tenants: [tenant, ...state.tenants] };
        }),

      updateTenant: (id: string, data: Partial<AdminTenant>) =>
        set((state: SuperAdminState) => {
          const exists = state.tenants.some((t: AdminTenant) => t.id === id);
          if (!exists) {
            return { tenants: [{ id, ...data } as AdminTenant, ...state.tenants] };
          }
          return {
            tenants: state.tenants.map((t: AdminTenant) => (t.id === id ? { ...t, ...data } : t)),
          };
        }),

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
      version: 2,
      migrate: () => ({}),
      partialize: () => ({}),
    }
  )
);
