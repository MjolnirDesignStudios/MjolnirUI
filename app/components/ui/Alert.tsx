// app/components/ui/Alert.tsx
// Inline alert / callout. Lives within page content (not page-level).
// 5 status variants + optional dismiss + optional action CTA.
//
// Usage:
//   <MjolnirAlert variant="success" title="Saved" />
//   <MjolnirAlert variant="warning" title="Payment past due" dismissible>
//     We tried to charge your card on June 9 and it failed.
//   </MjolnirAlert>
//   <MjolnirAlert variant="error" title="Connection lost" action={
//     <button onClick={retry}>Retry</button>
//   }>
//     We couldn't reach the Stripe API.
//   </MjolnirAlert>
"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "success" | "warning" | "error" | "info" | "neutral";

const VARIANT_CONFIG: Record<
  AlertVariant,
  {
    icon: typeof CheckCircle2;
    color: string;
    bg: string;
    border: string;
    titleColor: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    color: "#10B981",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/30",
    titleColor: "text-emerald-200",
  },
  warning: {
    icon: AlertTriangle,
    color: "#FFCC11",
    bg: "bg-amber-500/8",
    border: "border-amber-500/30",
    titleColor: "text-amber-200",
  },
  error: {
    icon: XCircle,
    color: "#ef4444",
    bg: "bg-red-500/8",
    border: "border-red-500/30",
    titleColor: "text-red-200",
  },
  info: {
    icon: Info,
    color: "#00f0ff",
    bg: "bg-cyan-500/8",
    border: "border-cyan-500/30",
    titleColor: "text-cyan-200",
  },
  neutral: {
    icon: Sparkles,
    color: "#a1a1aa",
    bg: "bg-zinc-900/60",
    border: "border-zinc-700/60",
    titleColor: "text-zinc-200",
  },
};

export interface MjolnirAlertProps {
  variant?: AlertVariant;
  /** Heading line (bolder, colored to variant). */
  title?: React.ReactNode;
  /** Optional body — accepts string or JSX (links, etc.). */
  children?: React.ReactNode;
  /** Optional trailing CTA — typically a small button. */
  action?: React.ReactNode;
  /** Show an X button on the top-right that hides the alert. */
  dismissible?: boolean;
  /** Override the variant's default icon. Pass null to hide. */
  icon?: React.ReactNode | null;
  /** Fires after the user clicks dismiss. */
  onDismiss?: () => void;
  className?: string;
}

export function MjolnirAlert({
  variant = "info",
  title,
  children,
  action,
  dismissible = false,
  icon,
  onDismiss,
  className,
}: MjolnirAlertProps) {
  const [visible, setVisible] = useState(true);
  const cfg = VARIANT_CONFIG[variant];
  const Icon = cfg.icon;

  if (!visible) return null;

  const resolvedIcon =
    icon === null ? null : icon ?? <Icon size={16} style={{ color: cfg.color }} />;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      className={cn(
        "relative flex items-start gap-3 rounded-xl border p-4",
        cfg.bg,
        cfg.border,
        className
      )}
    >
      {resolvedIcon && (
        <div className="shrink-0 mt-0.5">{resolvedIcon}</div>
      )}

      <div className="flex-1 min-w-0">
        {title && (
          <div className={cn("font-bold text-sm", cfg.titleColor)}>{title}</div>
        )}
        {children && (
          <div
            className={cn(
              "text-xs text-gray-400 leading-relaxed",
              title && "mt-0.5"
            )}
          >
            {children}
          </div>
        )}
      </div>

      {action && <div className="shrink-0 self-center">{action}</div>}

      {dismissible && (
        <button
          onClick={handleDismiss}
          aria-label="Dismiss alert"
          className="shrink-0 -mr-1 -mt-1 p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/5 transition"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

export default MjolnirAlert;
