// app/components/ui/MjolnirModal.tsx
// Branded modal/dialog with backdrop blur, spring entrance, and 5 variant
// accents. Headless API (title/description/children/footer slots) so the
// caller decides the contents.
//
// Usage:
//   <MjolnirModal
//     open={open}
//     onClose={() => setOpen(false)}
//     variant="thunder"
//     title="Forge the rune"
//     description="This action will permanently mark the component."
//     footer={<div className="flex gap-2"><Button>Cancel</Button><Button variant="thunder">Confirm</Button></div>}
//   >
//     Inner body content.
//   </MjolnirModal>
"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type MjolnirModalVariant = "storm" | "thunder" | "bifrost" | "void" | "forge";

const VARIANT_ACCENT: Record<MjolnirModalVariant, string> = {
  storm: "#00f0ff",
  thunder: "#FFCC11",
  bifrost: "#a78bfa",
  void: "#a1a1aa",
  forge: "#f97316",
};

export interface MjolnirModalProps {
  /** Controlled open state. */
  open: boolean;
  /** Fires when backdrop is clicked or Esc is pressed. */
  onClose: () => void;
  /** Optional heading. */
  title?: React.ReactNode;
  /** Optional sub-heading rendered under the title. */
  description?: React.ReactNode;
  /** Optional footer slot — usually action buttons. */
  footer?: React.ReactNode;
  /** Accent color variant. */
  variant?: MjolnirModalVariant;
  /** Sizing — max width tier. Default 'md'. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Whether clicking the backdrop closes the modal. Default true. */
  closeOnBackdrop?: boolean;
  /** Whether to show the X close button. Default true. */
  showClose?: boolean;
  /** Main body content. */
  children?: React.ReactNode;
  className?: string;
}

const SIZE_MAP = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function MjolnirModal({
  open,
  onClose,
  title,
  description,
  footer,
  variant = "storm",
  size = "md",
  closeOnBackdrop = true,
  showClose = true,
  children,
  className,
}: MjolnirModalProps) {
  const accent = VARIANT_ACCENT[variant];

  // ESC to close + body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="mjolnir-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden
          />
          <motion.div
            key="mjolnir-modal-panel"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "mjolnir-modal-title" : undefined}
            className={cn(
              "fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
            )}
          >
            <div
              className={cn(
                "relative w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto",
                SIZE_MAP[size],
                className
              )}
              style={{ boxShadow: `0 0 60px ${accent}20, 0 0 0 1px ${accent}25` }}
            >
              {/* Top accent hairline */}
              <div
                className="absolute top-0 inset-x-6 h-px pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                }}
              />

              {/* Close button */}
              {showClose && (
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition z-10"
                >
                  <X size={16} />
                </button>
              )}

              {/* Header */}
              {(title || description) && (
                <div className="px-6 pt-6 pb-4 border-b border-zinc-800/60">
                  {title && (
                    <h2
                      id="mjolnir-modal-title"
                      className="text-lg font-bold text-white pr-8"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-gray-400 mt-1 pr-8">
                      {description}
                    </p>
                  )}
                </div>
              )}

              {/* Body */}
              {children && (
                <div className="px-6 py-5 text-sm text-gray-300">
                  {children}
                </div>
              )}

              {/* Footer */}
              {footer && (
                <div className="px-6 py-4 border-t border-zinc-800/60 bg-black/30">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default MjolnirModal;
