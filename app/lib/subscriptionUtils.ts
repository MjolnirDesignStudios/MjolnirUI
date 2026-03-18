// Utility to check user subscription tier
import { type TierName, TIER_CONFIG, hasAccess } from './tierConfig';

interface UserWithTier {
  tier?: string;
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function getUserTier(user: UserWithTier | null | undefined): TierName {
  if (!user || !user.tier) return 'free'; // Default to 'free' (not 'base')
  return (user.tier as TierName) || 'free';
}

export function isFree(user: UserWithTier | null | undefined): boolean {
  return getUserTier(user) === 'free';
}

export function isBase(user: UserWithTier | null | undefined): boolean {
  return hasAccess(getUserTier(user), 'base');
}

export function isPro(user: UserWithTier | null | undefined): boolean {
  return hasAccess(getUserTier(user), 'pro');
}

export function isElite(user: UserWithTier | null | undefined): boolean {
  return hasAccess(getUserTier(user), 'elite');
}

/** Numeric tier level for comparisons: free=0, base=1, pro=2, elite=3 */
export function tierLevel(user: UserWithTier | null | undefined): number {
  return TIER_CONFIG[getUserTier(user)].level;
}
