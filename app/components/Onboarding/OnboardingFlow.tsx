// app/components/Onboarding/OnboardingFlow.tsx
// First-run onboarding: welcome modal → 4 popover tour steps → done.
//
// Mounted once in the dashboard layout. On mount:
//   1. Read localStorage[ONBOARDING_FLAG_KEY] — if present, render nothing.
//   2. Otherwise show the welcome modal (step 0). User can Skip → flag, or
//      Start → advance to step 1.
//   3. Steps 1-N anchor popovers to [data-onboarding="<id>"] DOM elements
//      via querySelector + getBoundingClientRect. The popover repositions on
//      scroll + resize.
//   4. When the user reaches the final step and clicks "Done" (or skips
//      anywhere along the way), set the flag.
//
// Analytics: fires tour_open events through the existing analytics helper
// so the admin dashboard's funnel can see step completion rates.
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { TierBadge } from "@/components/Dashboards/TierBadge";
import { analytics } from "@/lib/analytics";
import { useSafeSessionUser } from "@/lib/devPreview";
import {
  ONBOARDING_STEPS,
  ONBOARDING_FLAG_KEY,
  type OnboardingStep,
} from "./onboardingConfig";
import type { TierName } from "@/lib/tierConfig";

interface AnchorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function OnboardingFlow() {
  const { data: session, status } = useSession();
  const viewer = useSafeSessionUser(session?.user);
  const [stepIndex, setStepIndex] = useState<number | null>(null); // null = not started
  const [anchorRect, setAnchorRect] = useState<AnchorRect | null>(null);

  const currentStep: OnboardingStep | null =
    stepIndex !== null ? ONBOARDING_STEPS[stepIndex] : null;

  /* On mount — decide whether to start the tour. We delay the kickoff by a
     beat so the dashboard finishes its first paint, otherwise the welcome
     modal feels jarring. */
  useEffect(() => {
    if (status !== "authenticated") return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(ONBOARDING_FLAG_KEY)) return; // already done

    const timer = window.setTimeout(() => {
      setStepIndex(0);
      analytics.toolOpen({ tool: "onboarding-tour" });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [status]);

  /* When the active step is a popover, look up its anchor element and
     track its position. Re-measure on scroll + resize so the popover
     stays glued even if the user scrolls the sidebar. */
  useEffect(() => {
    if (!currentStep || currentStep.kind !== "popover") {
      setAnchorRect(null);
      return;
    }
    const measure = () => {
      const el = document.querySelector<HTMLElement>(currentStep.anchor);
      if (!el) {
        // Anchor missing — skip this step gracefully (it might be an admin-
        // only / tier-locked item the current user can't see).
        advance();
        return;
      }
      const r = el.getBoundingClientRect();
      setAnchorRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    };

    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const complete = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ONBOARDING_FLAG_KEY, new Date().toISOString());
      } catch {
        /* localStorage might be blocked (privacy mode) — just continue */
      }
    }
    setStepIndex(null);
  }, []);

  const advance = useCallback(() => {
    setStepIndex((i) => {
      if (i === null) return null;
      const next = i + 1;
      if (next >= ONBOARDING_STEPS.length) {
        // Done — set flag.
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              ONBOARDING_FLAG_KEY,
              new Date().toISOString()
            );
          } catch {
            /* ignore */
          }
        }
        return null;
      }
      return next;
    });
  }, []);

  /* Don't even render the bundle for users who've already done it. */
  if (stepIndex === null || !currentStep) return null;

  // Welcome modal — step 0.
  if (currentStep.kind === "modal") {
    return (
      <AnimatePresence>
        <WelcomeModal
          step={currentStep}
          userTier={(session?.user?.tier as TierName) || "free"}
          displayName={viewer.name?.split(" ")[0] || "Builder"}
          totalSteps={ONBOARDING_STEPS.length - 1 /* exclude self */}
          onStart={advance}
          onSkip={complete}
        />
      </AnimatePresence>
    );
  }

  // Popover step.
  return (
    <AnimatePresence>
      <PopoverStep
        step={currentStep}
        anchorRect={anchorRect}
        stepNumber={stepIndex}
        totalSteps={ONBOARDING_STEPS.length - 1}
        isFinal={stepIndex === ONBOARDING_STEPS.length - 1}
        onNext={advance}
        onSkip={complete}
      />
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════
   WELCOME MODAL
   ═══════════════════════════════════════════════════════ */
function WelcomeModal({
  step,
  userTier,
  displayName,
  totalSteps,
  onStart,
  onSkip,
}: {
  step: Extract<OnboardingStep, { kind: "modal" }>;
  userTier: TierName;
  displayName: string;
  totalSteps: number;
  onStart: () => void;
  onSkip: () => void;
}) {
  return (
    <>
      <motion.div
        key="onboarding-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
        onClick={onSkip}
      />
      <motion.div
        key="onboarding-modal"
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="relative max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl pointer-events-auto overflow-hidden">
          {/* Top-corner gold glow */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-40 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, #FFCC11 0%, transparent 70%)",
            }}
          />

          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition z-10"
            aria-label="Skip onboarding"
          >
            <X size={16} />
          </button>

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} className="text-[#FFCC11]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFCC11]">
                First-time setup
              </span>
            </div>

            <h2 className="text-3xl font-black text-white mb-1">
              {step.title}, {displayName}
            </h2>
            <div className="mb-5 flex items-center gap-2">
              <span className="text-xs text-gray-500">You&apos;re on</span>
              <TierBadge tier={userTier} size="sm" />
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              {step.body}
            </p>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                {totalSteps} quick stops
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onSkip}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition"
                >
                  {step.secondaryCta}
                </button>
                <button
                  onClick={onStart}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#FFCC11] text-black hover:bg-[#FFD700] transition"
                >
                  {step.primaryCta}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   POPOVER STEP — anchored to a DOM element
   ═══════════════════════════════════════════════════════ */
function PopoverStep({
  step,
  anchorRect,
  stepNumber,
  totalSteps,
  isFinal,
  onNext,
  onSkip,
}: {
  step: Extract<OnboardingStep, { kind: "popover" }>;
  anchorRect: AnchorRect | null;
  stepNumber: number;
  totalSteps: number;
  isFinal: boolean;
  onNext: () => void;
  onSkip: () => void;
}) {
  if (!anchorRect) return null;

  /* Compute popover position from the anchor rect + placement. */
  const offset = 16;
  const popW = 320;
  const popH = 180; // rough — actual height comes from content

  let top = anchorRect.top;
  let left = anchorRect.left;

  switch (step.placement) {
    case "right":
      top = anchorRect.top + anchorRect.height / 2 - popH / 2;
      left = anchorRect.left + anchorRect.width + offset;
      break;
    case "left":
      top = anchorRect.top + anchorRect.height / 2 - popH / 2;
      left = anchorRect.left - popW - offset;
      break;
    case "bottom":
      top = anchorRect.top + anchorRect.height + offset;
      left = anchorRect.left + anchorRect.width / 2 - popW / 2;
      break;
    case "top":
      top = anchorRect.top - popH - offset;
      left = anchorRect.left + anchorRect.width / 2 - popW / 2;
      break;
  }

  // Clamp to viewport so popovers don't escape the screen.
  if (typeof window !== "undefined") {
    const margin = 12;
    top = Math.max(margin, Math.min(top, window.innerHeight - popH - margin));
    left = Math.max(margin, Math.min(left, window.innerWidth - popW - margin));
  }

  return (
    <>
      {/* Spotlight ring around the anchor */}
      <motion.div
        key={`onboarding-spotlight-${step.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed z-[100] pointer-events-none rounded-2xl"
        style={{
          top: anchorRect.top - 4,
          left: anchorRect.left - 4,
          width: anchorRect.width + 8,
          height: anchorRect.height + 8,
          boxShadow:
            "0 0 0 9999px rgba(0,0,0,0.55), 0 0 0 2px #FFCC11, 0 0 30px rgba(255,204,17,0.5)",
        }}
      />

      {/* Popover card */}
      <motion.div
        key={`onboarding-popover-${step.id}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="fixed z-[101] bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-2xl"
        style={{
          top,
          left,
          width: popW,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFCC11]">
            Step {stepNumber} of {totalSteps}
          </span>
          <button
            onClick={onSkip}
            className="p-1 -mr-1 rounded text-gray-500 hover:text-white hover:bg-white/5 transition"
            aria-label="Skip tour"
          >
            <X size={14} />
          </button>
        </div>

        <h3 className="text-base font-bold text-white mb-1.5">{step.title}</h3>
        <p className="text-xs text-gray-400 leading-relaxed mb-4">
          {step.body}
        </p>

        <div className="flex items-center justify-between gap-2">
          {/* Progress dots */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition ${
                  i + 1 === stepNumber
                    ? "bg-[#FFCC11]"
                    : i + 1 < stepNumber
                      ? "bg-[#FFCC11]/40"
                      : "bg-zinc-700"
                }`}
              />
            ))}
          </div>

          <button
            onClick={onNext}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FFCC11] text-black hover:bg-[#FFD700] transition"
          >
            {isFinal ? "Got it" : "Next"}
            {!isFinal && <ArrowRight size={11} />}
          </button>
        </div>
      </motion.div>
    </>
  );
}
