// components/ui/CountUp.tsx — Animated number counter with elastic easing
"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface CountUpProps {
  /** Final value to count to */
  to: number;
  /** Starting value */
  from?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Easing function name */
  easing?: "linear" | "easeOut" | "easeInOut" | "elastic";
  /** Decimal places */
  decimals?: number;
  /** Prefix (e.g., "$") */
  prefix?: string;
  /** Suffix (e.g., "+", "K", "%") */
  suffix?: string;
  /** Use thousands separator */
  separator?: string;
  /** Trigger: mount or view (intersection) */
  trigger?: "mount" | "view";
  /** Color of the number */
  color?: string;
  className?: string;
}

const easingFns: Record<string, (t: number) => number> = {
  linear: (t) => t,
  easeOut: (t) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  elastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

export function CountUp({
  to,
  from = 0,
  duration = 2,
  easing = "easeOut",
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = ",",
  trigger = "mount",
  color,
  className,
}: CountUpProps) {
  const [value, setValue] = useState(from);
  const [started, setStarted] = useState(trigger === "mount");
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // View trigger
  useEffect(() => {
    if (trigger !== "view" || !containerRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [trigger]);

  useEffect(() => {
    if (!started) return;

    const startTime = performance.now();
    const totalMs = duration * 1000;
    const easeFn = easingFns[easing];

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / totalMs, 1);
      const eased = easeFn(t);
      const current = from + (to - from) * eased;
      setValue(current);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(to);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [started, from, to, duration, easing]);

  const formatted = value.toFixed(decimals);
  // Apply thousands separator
  const [intPart, decPart] = formatted.split(".");
  const intWithSep = separator
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    : intPart;
  const display = decPart ? `${intWithSep}.${decPart}` : intWithSep;

  return (
    <span
      ref={containerRef}
      className={cn("inline-block tabular-nums", className)}
      style={{ color }}
    >
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
