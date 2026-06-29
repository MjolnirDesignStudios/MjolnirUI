// app/components/ui/Toast.tsx
// Mjolnir-themed wrapper around sonner. Re-exports the <MjolnirToaster />
// host component (drop once at the root of your app) plus a `toast` API
// with branded status helpers.
//
// Usage:
//   1. Mount the host once (already done in app/(protected)/blocks/dashboard/layout.tsx):
//      <MjolnirToaster position="bottom-right" />
//
//   2. Call from anywhere:
//      import { toast } from "@/components/ui/Toast";
//      toast.success("Palette saved");
//      toast.error("Couldn't reach Stripe", { description: "Retrying in 3s…" });
//      toast.thunder("Mjolnir struck", { description: "Pro tier activated" });
//
// The underlying sonner API is preserved (toast.promise(), toast.loading(),
// etc.) — we just add branded status helpers and theme the host.
"use client";

import React from "react";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Zap,
  Sparkles,
} from "lucide-react";

export interface MjolnirToasterProps {
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  /** Stack expanded by default (true) or stacked-collapsed (false). */
  expand?: boolean;
  /** Show the close button on each toast. */
  closeButton?: boolean;
  /** Duration in ms before auto-dismiss. Default 4000. */
  duration?: number;
  /** Visual offset from the viewport edge. */
  offset?: number | string;
}

/** Branded host — render once at the root of your app. */
export function MjolnirToaster({
  position = "bottom-right",
  expand = false,
  closeButton = true,
  duration = 4000,
  offset = 24,
}: MjolnirToasterProps) {
  return (
    <SonnerToaster
      position={position}
      expand={expand}
      closeButton={closeButton}
      duration={duration}
      offset={offset}
      theme="dark"
      richColors={false}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "!bg-zinc-950 !border !border-zinc-800 !text-white !rounded-2xl !shadow-2xl !backdrop-blur-xl",
          title: "!text-white !font-semibold !text-sm",
          description: "!text-gray-400 !text-xs !leading-relaxed",
          actionButton:
            "!bg-[#FFCC11] !text-black !font-bold !rounded-lg !px-3 !py-1.5 !text-xs hover:!bg-[#FFD700]",
          cancelButton:
            "!bg-zinc-800 !text-gray-300 !rounded-lg !px-3 !py-1.5 !text-xs hover:!bg-zinc-700",
          closeButton:
            "!bg-zinc-900 !border-zinc-800 !text-gray-500 hover:!text-white hover:!bg-zinc-800",
        },
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────
   toast — branded API on top of sonner
   Use the sonner method shape:
     toast.success(message, { description?, duration?, action? })
   ───────────────────────────────────────────────────────── */

type ToastInput = string | React.ReactNode;
type ToastOpts = Parameters<typeof sonnerToast>[1];

/* Helper: render a sonner toast with a leading branded icon. */
function withIcon(
  Icon: typeof CheckCircle2,
  color: string,
  message: ToastInput,
  opts?: ToastOpts
) {
  return sonnerToast(message as any, {
    ...opts,
    icon: <Icon size={18} style={{ color }} />,
  });
}

export const toast = {
  /* Pass-through to sonner default. */
  show: (message: ToastInput, opts?: ToastOpts) =>
    sonnerToast(message as any, opts),

  /* Standard status helpers — branded colors. */
  success: (message: ToastInput, opts?: ToastOpts) =>
    withIcon(CheckCircle2, "#10B981", message, opts),
  warning: (message: ToastInput, opts?: ToastOpts) =>
    withIcon(AlertTriangle, "#FFCC11", message, opts),
  error: (message: ToastInput, opts?: ToastOpts) =>
    withIcon(XCircle, "#ef4444", message, opts),
  info: (message: ToastInput, opts?: ToastOpts) =>
    withIcon(Info, "#00f0ff", message, opts),

  /* Mjolnir-branded flair helpers. Use sparingly for "wow" moments. */
  thunder: (message: ToastInput, opts?: ToastOpts) =>
    withIcon(Zap, "#FFCC11", message, opts),
  storm: (message: ToastInput, opts?: ToastOpts) =>
    withIcon(Sparkles, "#00f0ff", message, opts),

  /* Pass-throughs for sonner's richer modes. */
  promise: sonnerToast.promise,
  loading: sonnerToast.loading,
  dismiss: sonnerToast.dismiss,
  custom: sonnerToast.custom,
};

export default MjolnirToaster;
