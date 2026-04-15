// Text Effects Showcase — /blocks/animation/text
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Components
import { AuroraText } from "@/components/ui/AuroraText";
import { TextReveal } from "@/components/ui/TextReveal";
import GradientText from "@/components/ui/GradientText";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { GlitchText } from "@/components/ui/GlitchText";

/* ─── Copy button ─── */
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:border-white/20 transition-all"
    >
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

/* ─── Showcase card ─── */
function ShowcaseCard({
  title,
  description,
  tier,
  children,
  code,
}: {
  title: string;
  description: string;
  tier: "free" | "base" | "pro";
  children: React.ReactNode;
  code: string;
}) {
  const [showCode, setShowCode] = useState(false);
  const tierColors = { free: "#3B82F6", base: "#10B981", pro: "#EAB308" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              color: tierColors[tier],
              backgroundColor: `${tierColors[tier]}15`,
              border: `1px solid ${tierColors[tier]}30`,
            }}
          >
            {tier}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCode((prev) => !prev)}
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all",
              showCode
                ? "bg-white/10 text-white"
                : "text-gray-500 hover:text-white hover:bg-white/5"
            )}
          >
            {showCode ? "Preview" : "Code"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 min-h-[140px] flex items-center justify-center">
        {showCode ? (
          <div className="w-full">
            <div className="flex justify-end mb-2">
              <CopyButton code={code} />
            </div>
            <pre className="text-xs text-gray-300 bg-black/40 rounded-xl p-4 overflow-x-auto font-mono leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        ) : (
          <div className="text-center">{children}</div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/5">
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </motion.div>
  );
}

/* ─── Page ─── */
export default function TextEffectsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Back nav */}
      <Link
        href="/blocks/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </Link>

      {/* Page header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-electric/10 border border-electric/20">
            <Zap size={20} className="text-electric" />
          </div>
          <h1 className="text-3xl font-black text-white">Text Effects</h1>
        </div>
        <p className="text-gray-400 max-w-2xl">
          Animated text components with the MjolnirUI electric aesthetic.
          From subtle aurora gradients to intense glitch distortions — drop these
          into headings, hero sections, or anywhere you want text that commands attention.
        </p>
      </div>

      {/* Showcase grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Aurora Text */}
        <ShowcaseCard
          title="AuroraText"
          description="Animated gold/orange gradient sweep across text. Perfect for hero headings and brand names."
          tier="free"
          code={`import { AuroraText } from "@/components/ui/AuroraText";

<AuroraText
  colors={["#FFD700", "#FFA500", "#B87333", "#FFF700"]}
  speed={1.5}
  className="text-5xl font-black"
>
  THUNDER REBORN
</AuroraText>`}
        >
          <AuroraText
            colors={["#FFD700", "#FFA500", "#B87333", "#FFF700", "#FF8C00"]}
            speed={1.5}
            className="text-4xl sm:text-5xl font-black"
          >
            THUNDER REBORN
          </AuroraText>
        </ShowcaseCard>

        {/* 2. Gradient Text */}
        <ShowcaseCard
          title="GradientText"
          description="Smooth animated gradient with direction control, yoyo bounce, and pause-on-hover."
          tier="free"
          code={`import GradientText from "@/components/ui/GradientText";

<GradientText
  colors={["#00f0ff", "#10B981", "#FFD700"]}
  animationSpeed={4}
  direction="horizontal"
  className="text-5xl font-black"
>
  Asgardian Tech
</GradientText>`}
        >
          <GradientText
            colors={["#00f0ff", "#10B981", "#FFD700", "#00f0ff"]}
            animationSpeed={4}
            direction="horizontal"
            className="text-4xl sm:text-5xl font-black"
          >
            Asgardian Tech
          </GradientText>
        </ShowcaseCard>

        {/* 3. Text Reveal */}
        <ShowcaseCard
          title="TextReveal"
          description="Character-by-character or word-by-word reveal with blur, slide, and fade animations."
          tier="free"
          code={`import { TextReveal } from "@/components/ui/TextReveal";

<TextReveal
  by="character"
  animation="blurInUp"
  delay={0.2}
  duration={1.5}
  className="text-4xl font-black text-white"
>
  Forged in Valhalla
</TextReveal>`}
        >
          <TextReveal
            by="character"
            animation="blurInUp"
            delay={0.1}
            duration={1.5}
            className="text-3xl sm:text-4xl font-black text-white"
          >
            Forged in Valhalla
          </TextReveal>
        </ShowcaseCard>

        {/* 4. Typewriter Text */}
        <ShowcaseCard
          title="TypewriterText"
          description="Typing effect that cycles through strings with natural timing jitter and customizable cursor."
          tier="free"
          code={`import { TypewriterText } from "@/components/ui/TypewriterText";

<TypewriterText
  text={[
    "Whosoever holds this hammer...",
    "If he be worthy...",
    "Shall possess the power of Thor!",
  ]}
  speed={50}
  cursorColor="#00f0ff"
  className="text-3xl font-bold text-white"
/>`}
        >
          <TypewriterText
            text={[
              "Whosoever holds this hammer...",
              "If he be worthy...",
              "Shall possess the power of Thor!",
            ]}
            speed={50}
            deleteDelay={1500}
            cursorColor="#00f0ff"
            className="text-2xl sm:text-3xl font-bold text-white"
          />
        </ShowcaseCard>

        {/* 5. Glitch Text — hover trigger */}
        <ShowcaseCard
          title="GlitchText"
          description="Cyberpunk-style glitch distortion with chromatic split. Hover to trigger the electric burst."
          tier="base"
          code={`import { GlitchText } from "@/components/ui/GlitchText";

<GlitchText
  intensity="medium"
  trigger="hover"
  glitchColor1="#00f0ff"
  glitchColor2="#FFD700"
  className="text-5xl font-black text-white"
>
  MJÖLNIR
</GlitchText>`}
        >
          <GlitchText
            intensity="medium"
            trigger="hover"
            glitchColor1="#00f0ff"
            glitchColor2="#FFD700"
            className="text-4xl sm:text-5xl font-black text-white cursor-pointer"
          >
            MJÖLNIR
          </GlitchText>
          <p className="text-xs text-gray-600 mt-3">Hover to glitch</p>
        </ShowcaseCard>

        {/* 6. Glitch Text — interval trigger */}
        <ShowcaseCard
          title="GlitchText (Interval)"
          description="Auto-glitching at timed intervals — great for status displays, loading screens, or dramatic reveals."
          tier="base"
          code={`import { GlitchText } from "@/components/ui/GlitchText";

<GlitchText
  intensity="intense"
  trigger="interval"
  interval={2500}
  burstDuration={400}
  glitchColor1="#f97316"
  glitchColor2="#00f0ff"
  className="text-4xl font-black text-white"
>
  SYSTEM BREACH
</GlitchText>`}
        >
          <GlitchText
            intensity="intense"
            trigger="interval"
            interval={2500}
            burstDuration={400}
            glitchColor1="#f97316"
            glitchColor2="#00f0ff"
            className="text-3xl sm:text-4xl font-black text-white"
          >
            SYSTEM BREACH
          </GlitchText>
        </ShowcaseCard>

        {/* 7. Combined — Aurora + Typewriter */}
        <ShowcaseCard
          title="Aurora + Typewriter"
          description="Composing effects — wrap TypewriterText inside AuroraText for a combined animated gradient typing effect."
          tier="free"
          code={`<AuroraText
  colors={["#00f0ff", "#10B981", "#FFD700"]}
  speed={2}
  className="text-3xl font-black"
>
  <TypewriterText
    text={["Build.", "Design.", "Ship."]}
    speed={80}
    cursorColor="#FFD700"
  />
</AuroraText>`}
        >
          <AuroraText
            colors={["#00f0ff", "#10B981", "#FFD700"]}
            speed={2}
            className="text-3xl sm:text-4xl font-black"
          >
            <TypewriterText
              text={["Build.", "Design.", "Ship.", "Conquer."]}
              speed={80}
              deleteDelay={1200}
              cursorColor="#FFD700"
            />
          </AuroraText>
        </ShowcaseCard>

        {/* 8. TextReveal — word mode */}
        <ShowcaseCard
          title="TextReveal (Word Mode)"
          description="Word-by-word reveal with blur-in-left animation. More impactful for longer phrases."
          tier="free"
          code={`<TextReveal
  by="word"
  animation="blurInLeft"
  delay={0.3}
  duration={2}
  className="text-3xl font-bold text-white"
>
  A weapon to destroy or a tool to build
</TextReveal>`}
        >
          <TextReveal
            by="word"
            animation="blurInLeft"
            delay={0.2}
            duration={2}
            className="text-2xl sm:text-3xl font-bold text-white"
          >
            A weapon to destroy or a tool to build
          </TextReveal>
        </ShowcaseCard>
      </div>

      {/* Installation section */}
      <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-lg font-bold text-white mb-4">Installation</h2>
        <pre className="text-sm text-gray-300 bg-black/40 rounded-xl p-4 overflow-x-auto font-mono">
          <code>{`npx mjolnirui add aurora-text gradient-text text-reveal typewriter-text glitch-text`}</code>
        </pre>
        <p className="text-xs text-gray-500 mt-3">
          All text effects use Framer Motion for animations. Make sure{" "}
          <code className="text-electric">framer-motion</code> is installed in your project.
        </p>
      </div>
    </div>
  );
}
