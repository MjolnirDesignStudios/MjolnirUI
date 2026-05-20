// app/(protected)/blocks/dev/mobile-preview/page.tsx
// Admin-only dev tool — preview any /blocks/* route inside a phone-sized
// iframe so you can validate the mobile design without picking up your phone.
//
// Because the iframe's viewport width drives Tailwind's responsive breakpoints,
// rendering at 390px will trigger the same `md:hidden` / hamburger / bottom-nav
// behavior you'd see on an actual iPhone.
//
// Sidebar entry lives in the DEV TOOLS section of components/Dashboards/Sidebar.tsx
// (filtered to role === "admin" only).
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Smartphone, RotateCcw, ExternalLink, RefreshCw, Sun, Moon,
  ChevronDown, MonitorSmartphone,
} from "lucide-react";

interface DevicePreset {
  id: string;
  label: string;
  /** CSS width in pixels of the viewport area */
  width: number;
  /** CSS height in pixels of the viewport area */
  height: number;
  /** Optional notch / dynamic-island bezel rendering */
  bezel?: "notch" | "island" | "none";
}

const DEVICES: DevicePreset[] = [
  { id: "iphone-se", label: "iPhone SE", width: 320, height: 568, bezel: "none" },
  { id: "iphone-13-mini", label: "iPhone 13 mini", width: 375, height: 812, bezel: "notch" },
  { id: "iphone-14", label: "iPhone 14", width: 390, height: 844, bezel: "notch" },
  { id: "iphone-14-pro", label: "iPhone 14 Pro", width: 393, height: 852, bezel: "island" },
  { id: "iphone-14-pro-max", label: "iPhone 14 Pro Max", width: 430, height: 932, bezel: "island" },
  { id: "pixel-7", label: "Pixel 7", width: 412, height: 915, bezel: "none" },
  { id: "galaxy-s23", label: "Galaxy S23", width: 360, height: 780, bezel: "none" },
];

const ROUTE_PRESETS = [
  "/blocks/dashboard",
  "/blocks/browse",
  "/blocks/background-studio",
  "/blocks/particle-engine",
  "/blocks/shader-tool",
  "/blocks/foundation/colors",
  "/blocks/foundation/typography",
  "/blocks/foundation/tokens",
  "/blocks/foundation/icons",
  "/blocks/layout/grids",
  "/blocks/layout/sections",
  "/blocks/layout/templates",
  "/blocks/canvas/backgrounds",
  "/blocks/canvas/shaders",
  "/blocks/animation/text",
  "/blocks/docs",
  "/blocks/docs/intro",
  "/blocks/account/profile",
  "/blocks/account/subscription",
  "/admin/dashboard",
  "/",
  "/pricing",
];

export default function MobilePreviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  const [device, setDevice] = useState<DevicePreset>(DEVICES[2]); // iPhone 14 default
  const [path, setPath] = useState<string>("/blocks/dashboard");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Hard gate the page — middleware also guards /admin/* but /blocks/dev is
  // accessible to all signed-in users by URL. Redirect non-admins.
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
      return;
    }
    if (userRole !== "admin") {
      router.replace("/blocks/dashboard");
    }
  }, [status, userRole, router]);

  const dimensions = useMemo(() => {
    if (orientation === "landscape") {
      return { width: device.height, height: device.width };
    }
    return { width: device.width, height: device.height };
  }, [device, orientation]);

  const iframeUrl = path.startsWith("/") ? path : `/${path}`;

  // While we wait for the role check, render a brief loading state instead
  // of leaking the dev UI. NOTE: this gate runs AFTER all hooks so we don't
  // violate the rules of hooks.
  if (status === "loading" || userRole !== "admin") {
    return (
      <div className="text-sm text-gray-500 py-12 text-center">
        Verifying access…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone size={18} className="text-[#FFCC11]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Dev Tools
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFCC11]/15 text-[#FFCC11] border border-[#FFCC11]/30">
              Admin only
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Mobile Preview</h1>
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            Iframe-based preview of any MjolnirUI route inside a phone-sized
            viewport. Tailwind&apos;s responsive breakpoints react to the iframe
            width, so what you see here matches what an actual phone renders.
          </p>
        </div>
      </div>

      {/* ── Controls ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Device picker */}
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
            Device
          </label>
          <div className="relative">
            <select
              value={device.id}
              onChange={(e) => {
                const next = DEVICES.find((d) => d.id === e.target.value);
                if (next) setDevice(next);
              }}
              className="w-full appearance-none rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-[#FFCC11]/40 transition cursor-pointer pr-8"
            >
              {DEVICES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label} ({d.width}×{d.height})
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>

        {/* Route picker */}
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
            Route
          </label>
          <input
            list="route-presets"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm font-mono text-white outline-none focus:border-[#FFCC11]/40 transition"
            placeholder="/blocks/dashboard"
          />
          <datalist id="route-presets">
            {ROUTE_PRESETS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>

        {/* Orientation + actions */}
        <div className="flex items-end gap-2">
          <button
            onClick={() => setOrientation((o) => (o === "portrait" ? "landscape" : "portrait"))}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-gray-300 hover:text-white hover:border-zinc-700 transition"
            title="Rotate"
          >
            <RotateCcw size={12} />
            {orientation === "portrait" ? "Portrait" : "Landscape"}
          </button>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-gray-300 hover:text-white hover:border-zinc-700 transition"
            title="Reload iframe"
          >
            <RefreshCw size={12} />
            Reload
          </button>
          <a
            href={iframeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFCC11] text-black text-xs font-bold hover:bg-[#FFD700] transition"
            title="Open in new tab"
          >
            <ExternalLink size={12} />
            Open
          </a>
        </div>
      </div>

      {/* ── Phone frame ─────────────────────────────────── */}
      <div className="flex items-start justify-center pt-6">
        <div className="text-center">
          <PhoneFrame
            width={dimensions.width}
            height={dimensions.height}
            bezel={device.bezel}
          >
            <iframe
              key={`${reloadKey}-${iframeUrl}`}
              ref={iframeRef}
              src={iframeUrl}
              title={`Mobile preview: ${iframeUrl}`}
              className="w-full h-full border-0 rounded-[36px] bg-black"
              /* iframe sandbox left permissive so the embedded site can use
                 cookies + storage normally (same-origin iframe). */
            />
          </PhoneFrame>
          <div className="mt-3 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
            {device.label} · {dimensions.width}×{dimensions.height} · {orientation}
          </div>
          <div className="mt-1 text-[10px] font-mono text-gray-600 truncate max-w-[400px] mx-auto">
            {iframeUrl}
          </div>
        </div>
      </div>

      {/* ── Quick links ─────────────────────────────────── */}
      <section>
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
          Quick routes
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {ROUTE_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setPath(p)}
              className={`text-[10px] font-mono px-2 py-1 rounded-md border transition ${
                path === p
                  ? "bg-[#FFCC11]/15 text-[#FFCC11] border-[#FFCC11]/40"
                  : "bg-zinc-900 text-gray-400 border-zinc-800 hover:text-white hover:border-zinc-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* ── Tips ────────────────────────────────────────── */}
      <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-300 mb-2">
          <MonitorSmartphone size={14} className="text-[#FFCC11]" />
          Tips
        </div>
        <ul className="text-xs text-gray-400 space-y-1 leading-relaxed">
          <li>
            • The iframe is same-origin so your session cookie carries over —
            you&apos;ll see the same authenticated experience as on a real phone.
          </li>
          <li>
            • The bottom nav and hamburger only render below the{" "}
            <code className="font-mono text-[#FFCC11]">md</code> breakpoint
            (768px). Any device width here triggers the mobile layout.
          </li>
          <li>
            • Hardware features (haptic feedback, real touch events, iOS gesture
            bars) are NOT simulated. Use a real device for those.
          </li>
        </ul>
      </section>
    </div>
  );
}

/* ── Phone frame chrome ─────────────────────────────────── */
function PhoneFrame({
  width,
  height,
  bezel = "notch",
  children,
}: {
  width: number;
  height: number;
  bezel?: "notch" | "island" | "none";
  children: React.ReactNode;
}) {
  // Outer bezel adds ~22px each side; inner viewport is the iframe content.
  return (
    <div
      className="relative inline-block rounded-[44px] bg-zinc-900 border border-zinc-800 shadow-[0_0_60px_-10px_rgba(0,0,0,0.8)]"
      style={{ padding: 10 }}
    >
      <div
        className="relative rounded-[36px] overflow-hidden bg-black"
        style={{ width, height }}
      >
        {/* Notch / Island */}
        {bezel === "notch" && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[55%] h-6 bg-black rounded-b-2xl z-10 pointer-events-none" />
        )}
        {bezel === "island" && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-10 pointer-events-none" />
        )}
        {children}
      </div>
      {/* Bottom home indicator (cosmetic) */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[40%] h-1 bg-zinc-700 rounded-full pointer-events-none" />
    </div>
  );
}
