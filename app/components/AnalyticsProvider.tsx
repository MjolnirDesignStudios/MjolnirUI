// app/components/AnalyticsProvider.tsx
// Mounts once near the top of the app tree (in app/provider.tsx) and fires
// page_view + tool_open events on every Next.js route change.
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { analytics, pathToToolSlug } from "@/lib/analytics";

export function AnalyticsProvider() {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    // Dedupe — Next.js can fire multiple navigations for the same path during
    // soft transitions; only fire one event per actual path change.
    if (lastPathRef.current === pathname) return;

    const previous = lastPathRef.current;
    lastPathRef.current = pathname;

    // Always send the page view
    analytics.pageView({
      page: pathname,
      referrer: previous ?? (typeof document !== "undefined" ? document.referrer : undefined),
    });

    // If this path corresponds to a known tool, also fire tool_open
    const tool = pathToToolSlug(pathname);
    if (tool) {
      analytics.toolOpen({ tool });
    }
  }, [pathname]);

  return null;
}
