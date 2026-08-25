import type { NicheConfig, NicheId } from './types';
import { SKIN_CLINIC_CONFIG } from './skin-clinic';
import { SPA_WELLNESS_CONFIG } from './spa-wellness';
import { LUXURY_SALON_CONFIG } from './luxury-salon';
import { REAL_ESTATE_CONFIG } from './real-estate';
import { DENTAL_CLINIC_CONFIG } from './dental-clinic';
import { HOTEL_RESORT_CONFIG } from './hotel-resort';

// ============================================================
// MASTER NICHE REGISTRY
// ============================================================

export const NICHE_REGISTRY: Record<NicheId, NicheConfig> = {
  skin: SKIN_CLINIC_CONFIG,
  spa: SPA_WELLNESS_CONFIG,
  salon: LUXURY_SALON_CONFIG,
  realestate: REAL_ESTATE_CONFIG,
  dental: DENTAL_CLINIC_CONFIG,
  hotel: HOTEL_RESORT_CONFIG,
};

export const NICHE_LIST: { id: NicheId; label: string; icon: string; tagline: string; accentColor: string }[] = [
  { id: 'skin', label: SKIN_CLINIC_CONFIG.label, icon: SKIN_CLINIC_CONFIG.icon, tagline: SKIN_CLINIC_CONFIG.tagline, accentColor: SKIN_CLINIC_CONFIG.accentColor },
  { id: 'spa', label: SPA_WELLNESS_CONFIG.label, icon: SPA_WELLNESS_CONFIG.icon, tagline: SPA_WELLNESS_CONFIG.tagline, accentColor: SPA_WELLNESS_CONFIG.accentColor },
  { id: 'salon', label: LUXURY_SALON_CONFIG.label, icon: LUXURY_SALON_CONFIG.icon, tagline: LUXURY_SALON_CONFIG.tagline, accentColor: LUXURY_SALON_CONFIG.accentColor },
  { id: 'realestate', label: REAL_ESTATE_CONFIG.label, icon: REAL_ESTATE_CONFIG.icon, tagline: REAL_ESTATE_CONFIG.tagline, accentColor: REAL_ESTATE_CONFIG.accentColor },
  { id: 'dental', label: DENTAL_CLINIC_CONFIG.label, icon: DENTAL_CLINIC_CONFIG.icon, tagline: DENTAL_CLINIC_CONFIG.tagline, accentColor: DENTAL_CLINIC_CONFIG.accentColor },
  { id: 'hotel', label: HOTEL_RESORT_CONFIG.label, icon: HOTEL_RESORT_CONFIG.icon, tagline: HOTEL_RESORT_CONFIG.tagline, accentColor: HOTEL_RESORT_CONFIG.accentColor },
];

export const DEFAULT_NICHE: NicheId = 'skin';

export type { NicheConfig, NicheId };
export {
  SKIN_CLINIC_CONFIG,
  SPA_WELLNESS_CONFIG,
  LUXURY_SALON_CONFIG,
  REAL_ESTATE_CONFIG,
  DENTAL_CLINIC_CONFIG,
  HOTEL_RESORT_CONFIG,
};
