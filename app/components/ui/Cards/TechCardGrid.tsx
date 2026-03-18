// components/ui/Cards/TechCardGrid.tsx
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { FlipCard } from "./FlipCard";
import {
  BIFROST_GRADIENTS,
  BIFROST_GLOWS,
  type TechIcon,
} from "@/data/index";
import { techStackIcons } from "@/data/tech-icons";

// ─── Blank card placeholder (no icon, just the glowing border) ────
const BLANK_ICON: TechIcon = { name: "__blank__" };

// Mix ~5% blank cards into the pool
function buildPool(): TechIcon[] {
  const blanks = Math.max(1, Math.floor(techStackIcons.length * 0.05));
  return shuffle([...techStackIcons, ...Array.from({ length: blanks }, () => BLANK_ICON)]);
}

// ─── Fisher-Yates shuffle ───────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Module-level shared pool ───────────────────────────────────
let pool: TechIcon[] = buildPool();
let poolIndex = 0;

function drawFromPool(currentName: string): TechIcon {
  if (poolIndex >= pool.length) {
    pool = buildPool();
    poolIndex = 0;
  }
  let icon = pool[poolIndex];
  poolIndex++;

  if (icon.name === currentName) {
    if (poolIndex >= pool.length) {
      pool = buildPool();
      poolIndex = 0;
    }
    icon = pool[poolIndex];
    poolIndex++;
  }
  return icon;
}

// ─── Per-card state ─────────────────────────────────────────────
type CardState = {
  icon: TechIcon;
  gradient: string;
  glowColor: string;
  transform: string;
  transitionEnabled: boolean;
  isFlipping: boolean;
  flipAxis: "X" | "Y";
  flipDirection: 1 | -1;
  showLightning: boolean;
};

function randomGradientIndex(): number {
  return Math.floor(Math.random() * BIFROST_GRADIENTS.length);
}

function randomAxis(): "X" | "Y" {
  return Math.random() < 0.7 ? "Y" : "X";
}

function randomInterval(): number {
  return 5000 + Math.random() * 6000; // 5000–11000ms (slower)
}

function buildInitialCards(count: number): CardState[] {
  return Array.from({ length: count }, (_, i) => {
    const gIdx = (i * 3) % BIFROST_GRADIENTS.length;
    const icon = techStackIcons[(i * 7) % techStackIcons.length];
    return {
      icon,
      gradient: BIFROST_GRADIENTS[gIdx],
      glowColor: BIFROST_GLOWS[gIdx],
      transform: "rotateY(0deg)",
      transitionEnabled: true,
      isFlipping: false,
      flipAxis: "Y" as const,
      flipDirection: 1 as const,
      showLightning: false,
    };
  });
}

export function TechCardGrid() {
  const [cardCount, setCardCount] = useState(12);
  const [cards, setCards] = useState<CardState[]>(() => buildInitialCards(12));
  const gridRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  const allTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const addTimer = useCallback((t: ReturnType<typeof setTimeout>) => {
    allTimers.current.add(t);
    return t;
  }, []);
  const clearAllTimers = useCallback(() => {
    allTimers.current.forEach(clearTimeout);
    allTimers.current.clear();
  }, []);

  // ─── Responsive card count ──────────────────────────────────
  useEffect(() => {
    const update = () => {
      const count = window.innerWidth >= 1024 ? 30 : 12;
      setCardCount(prev => {
        if (prev !== count) {
          setCards(buildInitialCards(count));
        }
        return count;
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ─── IntersectionObserver ───────────────────────────────────
  useEffect(() => {
    if (!gridRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { pausedRef.current = !entry.isIntersecting; },
      { threshold: 0.1 }
    );
    observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, []);

  // ─── Flip sequence for one card ─────────────────────────────
  const triggerFlip = useCallback((cardIndex: number) => {
    if (pausedRef.current) return;

    const axis = randomAxis();
    const phase1Transform = axis === "Y" ? "rotateY(90deg)" : "rotateX(90deg)";
    const phase2Start    = axis === "Y" ? "rotateY(-90deg)" : "rotateX(-90deg)";
    const phase2End      = axis === "Y" ? "rotateY(0deg)" : "rotateX(0deg)";

    // Pre-draw the next icon — lightning only strikes blank cards (~30% chance)
    const nextIcon = drawFromPool(cards[cardIndex]?.icon.name ?? "");
    const lightning = nextIcon.name === "__blank__" && Math.random() < 0.3;

    setCards(prev => {
      if (cardIndex >= prev.length) return prev;
      const next = [...prev];
      next[cardIndex] = {
        ...next[cardIndex],
        transform: phase1Transform,
        transitionEnabled: true,
        isFlipping: true,
        flipAxis: axis,
        flipDirection: 1,
        showLightning: false,
      };
      return next;
    });

    // Phase 2: swap icon at midpoint (slowed to 250ms)
    addTimer(setTimeout(() => {
      setCards(prev => {
        if (cardIndex >= prev.length) return prev;
        const next = [...prev];
        const current = next[cardIndex];
        const gIdx = randomGradientIndex();

        next[cardIndex] = {
          ...current,
          icon: nextIcon,
          gradient: BIFROST_GRADIENTS[gIdx],
          glowColor: BIFROST_GLOWS[gIdx],
          showLightning: lightning,
          transform: phase2Start,
          transitionEnabled: false,
          flipAxis: axis,
          flipDirection: -1,
        };
        return next;
      });

      addTimer(setTimeout(() => {
        setCards(prev => {
          if (cardIndex >= prev.length) return prev;
          const next = [...prev];
          next[cardIndex] = {
            ...next[cardIndex],
            transform: phase2End,
            transitionEnabled: true,
          };
          return next;
        });

        // Clear flipping after settle, lightning stays longer for full animation
        addTimer(setTimeout(() => {
          setCards(prev => {
            if (cardIndex >= prev.length) return prev;
            const next = [...prev];
            next[cardIndex] = { ...next[cardIndex], isFlipping: false };
            return next;
          });
        }, 500));

        // Clear lightning after its animation completes (800ms)
        addTimer(setTimeout(() => {
          setCards(prev => {
            if (cardIndex >= prev.length) return prev;
            const next = [...prev];
            next[cardIndex] = { ...next[cardIndex], showLightning: false };
            return next;
          });
        }, 850));
      }, 20));
    }, 250));
  }, [addTimer]);

  // ─── Per-card staggered intervals ───────────────────────────
  useEffect(() => {
    clearAllTimers();

    const scheduleCard = (index: number) => {
      const stagger = index * 120 + Math.random() * 500;
      addTimer(setTimeout(() => {
        triggerFlip(index);
        const scheduleNext = () => {
          addTimer(setTimeout(() => {
            triggerFlip(index);
            scheduleNext();
          }, randomInterval()));
        };
        scheduleNext();
      }, stagger));
    };

    for (let i = 0; i < cardCount; i++) {
      scheduleCard(i);
    }

    return clearAllTimers;
  }, [cardCount, triggerFlip, clearAllTimers, addTimer]);

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-4 lg:grid-cols-10 gap-1.5 lg:gap-2 overflow-hidden"
      style={{
        maskImage: [
          "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
          "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
        ].join(", "),
        WebkitMaskImage: [
          "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
          "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
        ].join(", "),
        maskComposite: "intersect",
        WebkitMaskComposite: "destination-in" as any,
      }}
    >
      {cards.map((card, i) => (
        <FlipCard
          key={i}
          icon={card.icon}
          gradient={card.gradient}
          glowColor={card.glowColor}
          flipAxis={card.flipAxis}
          flipDirection={card.flipDirection}
          isFlipping={card.isFlipping}
          transform={card.transform}
          transitionEnabled={card.transitionEnabled}
          showLightning={card.showLightning}
        />
      ))}
    </div>
  );
}
