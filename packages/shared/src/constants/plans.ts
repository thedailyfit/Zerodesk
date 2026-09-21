export interface PlanFeatures {
  multiDoctorRoundRobin: boolean;
  customVoiceCloning: boolean;
  whatsappBroadcastCampaigns: boolean;
  outboundVoiceCampaigns: boolean;
  advancedAnalytics: boolean;
  customLlmRouting: boolean;
  auditLogs: boolean;
  ragKnowledgeBase: boolean;
  customIntegrations: boolean;
}

export interface PlanDefinition {
  id: 'STARTER' | 'PRO';
  name: string;
  tier: 'starter' | 'pro';
  monthlyPriceINR: number;
  annualPriceINR: number;
  voiceMinutesIncluded: number;
  whatsappMessagesIncluded: number;
  llmTokensIncluded: number;
  storageLimitMB: number;
  maxStaffMembers: number;
  features: PlanFeatures;
}

export const PLANS_REGISTRY: Record<'STARTER' | 'PRO', PlanDefinition> = {
  STARTER: {
    id: 'STARTER',
    name: 'AI Receptionist',
    tier: 'starter',
    monthlyPriceINR: 4919,
    annualPriceINR: 47220,
    voiceMinutesIncluded: 100,
    whatsappMessagesIncluded: 500,
    llmTokensIncluded: 1000000,
    storageLimitMB: 1000,
    maxStaffMembers: 1,
    features: {
      multiDoctorRoundRobin: false,
      customVoiceCloning: false,
      whatsappBroadcastCampaigns: false,
      outboundVoiceCampaigns: false,
      advancedAnalytics: false,
      customLlmRouting: false,
      auditLogs: false,
      ragKnowledgeBase: true,
      customIntegrations: false,
    },
  },
  PRO: {
    id: 'PRO',
    name: 'Omnichannel AI Practice Suite',
    tier: 'pro',
    monthlyPriceINR: 9941,
    annualPriceINR: 95430,
    voiceMinutesIncluded: 500,
    whatsappMessagesIncluded: 2500,
    llmTokensIncluded: 5000000,
    storageLimitMB: 10000,
    maxStaffMembers: 10,
    features: {
      multiDoctorRoundRobin: true,
      customVoiceCloning: true,
      whatsappBroadcastCampaigns: true,
      outboundVoiceCampaigns: true,
      advancedAnalytics: true,
      customLlmRouting: true,
      auditLogs: true,
      ragKnowledgeBase: true,
      customIntegrations: true,
    },
  },
} as const;

export type PlanTierType = 'STARTER' | 'PRO';

export function getPlanConfig(planId: string): PlanDefinition {
  const normalized = (planId || '').toUpperCase().trim();
  if (normalized === 'PRO') {
    return PLANS_REGISTRY.PRO;
  }
  return PLANS_REGISTRY.STARTER;
}

export function isFeatureAllowed(planId: string, feature: keyof PlanFeatures): boolean {
  const plan = getPlanConfig(planId);
  return Boolean(plan.features[feature]);
}
