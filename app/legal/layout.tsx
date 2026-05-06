// app/legal/layout.tsx
// Shared layout for /legal/* pages — privacy, terms, cookies.
// Provides a consistent reading container with a back link.
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-black text-white">
      {/* Soft top accent */}
      <div
        className="absolute top-0 inset-x-0 h-64 pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(255,204,17,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition mb-8"
        >
          <ArrowLeft size={12} />
          Back to home
        </Link>

        <article className="prose prose-invert prose-zinc max-w-none">
          {children}
        </article>

        <div className="mt-16 pt-8 border-t border-zinc-800 text-xs text-gray-500 flex items-center justify-between flex-wrap gap-3">
          <span>© {new Date().getFullYear()} Mjolnir Design Studios.</span>
          <div className="flex items-center gap-3">
            <Link href="/legal/privacy" className="hover:text-gray-300 transition">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-gray-300 transition">Terms</Link>
            <Link href="/legal/cookies" className="hover:text-gray-300 transition">Cookies</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
