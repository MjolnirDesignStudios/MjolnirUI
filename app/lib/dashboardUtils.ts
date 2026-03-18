import { COMPONENT_REGISTRY } from './componentRegistry';
import { hasAccess, type TierName } from './tierConfig';
import { useSession } from 'next-auth/react';

export function useDashboardComponents() {
  const { data: session } = useSession();
  const userTier = (session?.user?.tier as TierName) || 'free';
  return COMPONENT_REGISTRY.filter((c) => hasAccess(userTier, c.requiredTier));
}
