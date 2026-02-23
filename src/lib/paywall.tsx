import { isPro, isElite } from './subscriptionUtils';
import { useSession } from 'next-auth/react';

export function Paywall({ tier, children }: { tier: 'pro' | 'elite', children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const user = session?.user || { tier: 'base' };

  if (status === 'loading') return <div>Loading...</div>;
  if ((tier === 'pro' && !isPro(user)) || (tier === 'elite' && !isElite(user))) {
    return (
      <div className="p-8 bg-black/60 rounded-xl border border-zinc-800 text-center text-white">
        <h2 className="text-2xl font-black mb-4">Premium Content</h2>
        <p className="mb-6">This feature is available for MjolnirUI Pro or Elite subscribers.</p>
        <button className="py-3 px-6 bg-linear-to-r from-cyan-500 to-emerald-500 text-black font-bold rounded-xl hover:brightness-110 transition">
          Upgrade Now
        </button>
      </div>
    );
  }
  return <>{children}</>;
}
