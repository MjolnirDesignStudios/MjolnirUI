// app/components/LazyMount.tsx
// Defer the mount of a heavy child component until it scrolls within
// `rootMargin` of the viewport. Combined with next/dynamic, this means
// expensive client components (shader sections, animated grids) never
// hit the renderer until the user actually scrolls toward them.
//
// Usage:
//   <LazyMount>
//     <Pricing />
//   </LazyMount>
//
// While unmounted, the slot reserves its space via a min-height
// placeholder so the page layout doesn't jump when the real content
// mounts. Default placeholder is the full viewport height which works
// for the marketing homepage sections that are all ~100vh tall.
"use client";

import React, { useEffect, useRef, useState } from "react";

export interface LazyMountProps {
  children: React.ReactNode;
  /** IntersectionObserver rootMargin — how far ahead of the viewport
   *  the child starts mounting. Default 400px gives the bundle time to
   *  hydrate before the user actually sees the section. */
  rootMargin?: string;
  /** Placeholder min-height while waiting. Default 60vh. */
  placeholderMinHeight?: string;
  /** Optional custom skeleton — usually you just want the empty
   *  placeholder so the next section's animation entrance is what the
   *  user sees first. */
  fallback?: React.ReactNode;
}

export function LazyMount({
  children,
  rootMargin = "400px",
  placeholderMinHeight = "60vh",
  fallback,
}: LazyMountProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted, rootMargin]);

  if (mounted) return <>{children}</>;

  return (
    <div
      ref={sentinelRef}
      style={{ minHeight: placeholderMinHeight }}
      aria-hidden
    >
      {fallback}
    </div>
  );
}

export default LazyMount;
