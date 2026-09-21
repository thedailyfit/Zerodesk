import { SetMetadata } from '@nestjs/common';
import { PlanTierType } from '@zerodesk/shared';

export const PLAN_TIER_KEY = 'plan_tier';
export const PlanTier = (tier: PlanTierType) => SetMetadata(PLAN_TIER_KEY, tier);
