// Utility to check user subscription tier
interface UserWithTier {
  tier?: string;
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function getUserTier(user: UserWithTier | null | undefined) {
  // Example: user.tier could be 'base', 'pro', 'elite'
  if (!user || !user.tier) return 'base';
  return user.tier;
}

export function isPro(user: UserWithTier | null | undefined) {
  return getUserTier(user) === 'pro' || getUserTier(user) === 'elite';
}

export function isElite(user: UserWithTier | null | undefined) {
  return getUserTier(user) === 'elite';
}

export function isBase(user) {
  return getUserTier(user) === 'base';
}
