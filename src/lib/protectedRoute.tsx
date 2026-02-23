import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) {
    redirect('/auth/signin');
    return null;
  }
  return <>{children}</>;
}
