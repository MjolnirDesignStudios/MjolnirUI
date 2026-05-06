// app/components/ComingSoon.tsx
// Reusable Coming Soon page used by stub routes (contact, roadmap, faq, etc.)
// Shares the existing landing-page chrome (ShaderBG + nav + footer) so the
// page reads as a real part of the product, not a 404.
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Mail, Github } from "lucide-react";

interface ComingSoonProps {
  /** Page title — e.g. "Roadmap" */
  title: string;
  /** Short description of what's coming */
  description: string;
  /** Optional ETA copy (e.g. "Q3 2026") */
  eta?: string;
  /** Optional alternative action label + href (e.g. "Email support" → mailto:) */
  fallback?: { label: string; href: string };
}

export function ComingSoon({ title, description, eta, fallback }: ComingSoonProps) {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-x-hidden bg-black text-white px-6 py-16">
      {/* Soft radial glow for atmosphere — no shader needed for stub pages */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(255,204,17,0.10) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0,240,255,0.08) 0%, transparent 50%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 max-w-xl w-full text-center"
      >
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition mb-8"
        >
          <ArrowLeft size={12} />
          Back to home
        </Link>

        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FFCC11]/10 border border-[#FFCC11]/30 mb-6"
        >
          <Sparkles size={28} className="text-[#FFCC11]" />
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-black mb-3 bg-linear-to-r from-white via-[#FFCC11] to-[#00f0ff] bg-clip-text text-transparent">
          {title}
        </h1>

        <p className="text-base text-gray-400 leading-relaxed mb-2">{description}</p>

        {eta && (
          <p className="text-xs font-mono uppercase tracking-wider text-[#FFCC11]/70 mb-8">
            Target: {eta}
          </p>
        )}

        <div className="flex items-center justify-center gap-3 flex-wrap mt-8">
          {fallback && (
            <Link
              href={fallback.href}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFCC11] text-black font-semibold text-sm hover:bg-[#FFD700] transition"
            >
              <Mail size={14} />
              {fallback.label}
            </Link>
          )}
          <a
            href="https://github.com/MjolnirDesignStudios/MjolnirUI"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-semibold text-sm hover:border-[#FFCC11]/40 transition"
          >
            <Github size={14} />
            Watch on GitHub
          </a>
        </div>
      </motion.div>
    </main>
  );
}
