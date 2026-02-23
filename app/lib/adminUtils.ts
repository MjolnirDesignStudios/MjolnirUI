// Utility for admin role check
interface UserWithRole {
  role?: string;
}

export function isAdmin(user: UserWithRole | null | undefined) {
  return user && user.role === 'admin';
}

