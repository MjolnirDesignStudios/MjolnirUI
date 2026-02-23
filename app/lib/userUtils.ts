// Utility for user info
import { Session } from 'next-auth';

export function getUserInfo(session: Session | null) {
  if (!session || !session.user) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    tier: session.user.tier || 'base',
    role: session.user.role || 'user',
  };
}

