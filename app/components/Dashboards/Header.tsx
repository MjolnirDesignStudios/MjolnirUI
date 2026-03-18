// components/Dashboards/Header.tsx
"use client";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { TierBadge } from "./TierBadge";
import { type TierName } from "@/lib/tierConfig";

export function MjolnirHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  const userTier = (session?.user?.tier as TierName) || 'free';

  return (
    <header className="w-full flex items-center justify-between py-6 px-8 border-b border-zinc-800/50 bg-black/30 backdrop-blur-lg">
      <div className="flex items-center gap-4">
        <div className="font-black text-xl text-white">
          Dashboard
        </div>
        {session?.user && (
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>{session.user.name || session.user.email}</span>
            <TierBadge tier={userTier} size="sm" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/blocks/account/profile')}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-700 text-gray-400 hover:text-white hover:border-zinc-500 transition"
          title="Profile"
        >
          <User size={16} />
        </button>
        {userTier === 'free' && (
          <button
            onClick={() => router.push('/#pricing')}
            className="px-4 py-2 bg-[#FFCC11] text-black font-bold rounded-xl hover:brightness-110 transition"
          >
            Upgrade
          </button>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="px-4 py-2 bg-zinc-900 text-white font-bold rounded-xl border border-zinc-700 hover:bg-zinc-800 transition"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
