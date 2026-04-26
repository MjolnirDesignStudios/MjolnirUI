// components/ui/TypewriterText.tsx — Character-by-character typing effect
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface TypewriterTextProps {
  /** Text string(s) to type out — cycles through array */
  text: string | string[];
  /** Typing speed in ms per character */
  speed?: number;
  /** Delay before deleting (ms) — only used when cycling multiple strings */
  deleteDelay?: number;
  /** Delete speed in ms per character */
  deleteSpeed?: number;
  /** Delay before starting (ms) */
  startDelay?: number;
  /** Show blinking cursor */
  cursor?: boolean;
  /** Cursor character */
  cursorChar?: string;
  /** Cursor color — defaults to electric cyan */
  cursorColor?: string;
  /** Loop forever (default true when multiple strings) */
  loop?: boolean;
  /** Callback fired when a full string is typed */
  onComplete?: (index: number) => void;
  className?: string;
}

export function TypewriterText({
  text,
  speed = 60,
  deleteDelay = 2000,
  deleteSpeed = 35,
  startDelay = 500,
  cursor = true,
  cursorChar = "|",
  cursorColor = "#00f0ff",
  loop = true,
  onComplete,
  className,
}: TypewriterTextProps) {
  const strings = Array.isArray(text) ? text : [text];
  const [displayText, setDisplayText] = useState("");
  const [stringIndex, setStringIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [started, setStarted] = useState(false);

  // Start delay
  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(timer);
  }, [startDelay]);

  const tick = useCallback(() => {
    const currentString = strings[stringIndex];
    const shouldCycle = strings.length > 1 || loop;

    if (!isDeleting) {
      // Typing forward
      const nextText = currentString.slice(0, displayText.length + 1);
      setDisplayText(nextText);

      if (nextText === currentString) {
        onComplete?.(stringIndex);
        if (shouldCycle) {
          setTimeout(() => setIsDeleting(true), deleteDelay);
        }
        return;
      }
    } else {
      // Deleting
      const nextText = currentString.slice(0, displayText.length - 1);
      setDisplayText(nextText);

      if (nextText === "") {
        setIsDeleting(false);
        setStringIndex((prev) => (prev + 1) % strings.length);
        return;
      }
    }
  }, [displayText, isDeleting, stringIndex, strings, deleteDelay, loop, onComplete]);

  useEffect(() => {
    if (!started) return;

    const currentSpeed = isDeleting ? deleteSpeed : speed;
    // Add slight randomness for natural feel
    const jitter = Math.random() * 30 - 15;
    const timer = setTimeout(tick, currentSpeed + jitter);

    return () => clearTimeout(timer);
  }, [started, tick, isDeleting, speed, deleteSpeed]);

  return (
    <span className={cn("inline-flex items-baseline", className)}>
      <span>{displayText}</span>
      {cursor && (
        <span
          className="animate-pulse ml-0.5 font-light"
          style={{ color: cursorColor }}
          aria-hidden="true"
        >
          {cursorChar}
        </span>
      )}
    </span>
  );
}
