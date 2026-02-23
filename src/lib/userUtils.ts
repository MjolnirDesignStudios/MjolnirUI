// Utility for user info
export function getUserInfo(session) {
  if (!session || !session.user) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    tier: session.user.tier || 'base',
    role: session.user.role || 'user',
  };
}
