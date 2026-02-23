import { componentRegistry } from './componentRegistry';
import { isPro, isElite } from './subscriptionUtils';
import { useSession } from 'next-auth/react';
import { getUserInfo } from './userUtils';

export function useDashboardComponents() {
  const { data: session } = useSession();
  const user = getUserInfo(session) || { tier: 'base' };
  return componentRegistry.filter(
    (c) =>
      c.tier === 'base' ||
      (c.tier === 'pro' && isPro(user)) ||
      (c.tier === 'elite' && isElite(user))
  );
}

