// components/ui/DecryptText.tsx — Matrix-style decryption reveal
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface DecryptTextProps {
  /** Final text to reveal */
  children: string;
  /** Characters used in the scramble pool */
  characters?: string;
  /** Speed in ms between scramble frames */
  speed?: number;
  /** Time per character to lock in place (ms) */
  revealSpeed?: number;
  /** Trigger mode */
  trigger?: "mount" | "hover" | "view";
  /** Color of unresolved (scrambling) characters */
  scrambleColor?: string;
  /** Color of resolved characters */
  revealColor?: string;
  /** Auto-replay every N ms (0 = no replay) */
  replayInterval?: number;
  className?: string;
}

const DEFAULT_CHARS =
  "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ!<>-_\\/[]{}—=+*^?#________";

export function DecryptText({
  children,
  characters = DEFAULT_CHARS,
  speed = 40,
  revealSpeed = 60,
  trigger = "mount",
  scrambleColor = "#00f0ff",
  revealColor = "#ffffff",
  replayInterval = 0,
  className,
}: DecryptTextProps) {
  const target = children;
  const [output, setOutput] = useState<{ char: string; resolved: boolean }[]>(
    () =>
      target.split("").map((c) => ({
        char: c === " " ? " " : "",
        resolved: c === " ",
      }))
  );
  const [running, setRunning] = useState(trigger === "mount");
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const frameRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const start = useCallback(() => {
    setOutput(
      target.split("").map((c) => ({
        char: c === " " ? " " : "",
        resolved: c === " ",
      }))
    );
    startTimeRef.current = Date.now();
    setRunning(true);
  }, [target]);

  // Hover trigger
  const handleMouseEnter = trigger === "hover" ? start : undefined;

  // View (intersection) trigger
  useEffect(() => {
    if (trigger !== "view" || !containerRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [trigger, start]);

  // Replay interval
  useEffect(() => {
    if (!replayInterval) return;
    const id = setInterval(start, replayInterval);
    return () => clearInterval(id);
  }, [replayInterval, start]);

  // Animation loop
  useEffect(() => {
    if (!running) return;

    const tick = () => {
      const elapsed = Date.now() - (startTimeRef.current ?? Date.now());
      const charsResolved = Math.floor(elapsed / revealSpeed);

      setOutput((prev) => {
        const next = target.split("").map((finalChar, i) => {
          if (finalChar === " ") return { char: " ", resolved: true };
          if (i < charsResolved) return { char: finalChar, resolved: true };
          // Random scramble char from pool
          const r = characters[Math.floor(Math.random() * characters.length)];
          return { char: r, resolved: false };
        });
        return next;
      });

      if (charsResolved >= target.length) {
        setRunning(false);
        return;
      }
      frameRef.current = setTimeout(tick, speed);
    };
    frameRef.current = setTimeout(tick, speed);

    return () => {
      if (frameRef.current) clearTimeout(frameRef.current);
    };
  }, [running, target, characters, speed, revealSpeed]);

  return (
    <span
      ref={containerRef}
      className={cn("inline-block font-mono", className)}
      onMouseEnter={handleMouseEnter}
      aria-label={target}
    >
      {output.map((o, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            color: o.resolved ? revealColor : scrambleColor,
            transition: o.resolved ? "color 0.2s" : undefined,
            display: "inline-block",
            minWidth: o.char === " " ? "0.3em" : undefined,
          }}
        >
          {o.char || "\u00A0"}
        </span>
      ))}
    </span>
  );
}
