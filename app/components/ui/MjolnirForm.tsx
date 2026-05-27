// app/components/ui/MjolnirForm.tsx
// Branded form primitives — MjolnirInput, MjolnirTextarea, MjolnirSelect.
// Share styling tokens: dark surface, gold/cyan focus ring, label / helper /
// error slots, optional leading icon.
//
// Each component is a styled wrapper around the native HTML control, so
// they remain accessible (real focus management, real form submission)
// without pulling in a headless-UI dep.
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, AlertCircle } from "lucide-react";

export type MjolnirFieldVariant = "storm" | "thunder" | "bifrost" | "forge";

const VARIANT_FOCUS: Record<MjolnirFieldVariant, string> = {
  storm: "focus:border-cyan-500/60 focus:ring-cyan-500/30",
  thunder: "focus:border-[#FFCC11]/60 focus:ring-[#FFCC11]/30",
  bifrost: "focus:border-violet-500/60 focus:ring-violet-500/30",
  forge: "focus:border-orange-500/60 focus:ring-orange-500/30",
};

interface FieldShellProps {
  label?: React.ReactNode;
  htmlFor?: string;
  helper?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

function FieldShell({
  label,
  htmlFor,
  helper,
  error,
  required,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-xs font-semibold text-gray-300 flex items-center gap-1.5"
        >
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <div className="flex items-center gap-1.5 text-[11px] text-red-400">
          <AlertCircle size={11} />
          <span>{error}</span>
        </div>
      ) : helper ? (
        <span className="text-[11px] text-gray-500">{helper}</span>
      ) : null}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   INPUT
   ═══════════════════════════════════════════════════════ */
export interface MjolnirInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: React.ReactNode;
  helper?: React.ReactNode;
  error?: React.ReactNode;
  variant?: MjolnirFieldVariant;
  size?: "sm" | "md" | "lg";
  /** Optional leading icon */
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  /** Outer wrapper className (shell). */
  wrapperClassName?: string;
}

const INPUT_SIZE_MAP = {
  sm: "h-9 text-sm px-3",
  md: "h-11 text-sm px-4",
  lg: "h-13 text-base px-5",
};

export const MjolnirInput = React.forwardRef<HTMLInputElement, MjolnirInputProps>(
  function MjolnirInput(
    {
      label,
      helper,
      error,
      variant = "thunder",
      size = "md",
      icon: Icon,
      wrapperClassName,
      className,
      id,
      required,
      ...rest
    },
    ref
  ) {
    const inputId = id || rest.name || undefined;
    return (
      <FieldShell
        label={label}
        htmlFor={inputId}
        helper={helper}
        error={error}
        required={required}
        className={wrapperClassName}
      >
        <div className="relative">
          {Icon && (
            <Icon
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          )}
          <input
            ref={ref}
            id={inputId}
            required={required}
            className={cn(
              "w-full rounded-xl bg-zinc-950 border border-zinc-800 text-white outline-none placeholder:text-gray-600",
              "transition-colors focus:ring-2",
              INPUT_SIZE_MAP[size],
              VARIANT_FOCUS[variant],
              Icon && "pl-9",
              error && "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            {...rest}
          />
        </div>
      </FieldShell>
    );
  }
);

/* ═══════════════════════════════════════════════════════
   TEXTAREA
   ═══════════════════════════════════════════════════════ */
export interface MjolnirTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  helper?: React.ReactNode;
  error?: React.ReactNode;
  variant?: MjolnirFieldVariant;
  wrapperClassName?: string;
}

export const MjolnirTextarea = React.forwardRef<HTMLTextAreaElement, MjolnirTextareaProps>(
  function MjolnirTextarea(
    {
      label,
      helper,
      error,
      variant = "thunder",
      wrapperClassName,
      className,
      id,
      required,
      rows = 4,
      ...rest
    },
    ref
  ) {
    const inputId = id || rest.name || undefined;
    return (
      <FieldShell
        label={label}
        htmlFor={inputId}
        helper={helper}
        error={error}
        required={required}
        className={wrapperClassName}
      >
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          required={required}
          className={cn(
            "w-full rounded-xl bg-zinc-950 border border-zinc-800 text-white outline-none placeholder:text-gray-600 px-4 py-3 text-sm resize-none",
            "transition-colors focus:ring-2",
            VARIANT_FOCUS[variant],
            error && "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...rest}
        />
      </FieldShell>
    );
  }
);

/* ═══════════════════════════════════════════════════════
   SELECT
   ═══════════════════════════════════════════════════════ */
export interface MjolnirSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface MjolnirSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: React.ReactNode;
  helper?: React.ReactNode;
  error?: React.ReactNode;
  variant?: MjolnirFieldVariant;
  size?: "sm" | "md" | "lg";
  options: MjolnirSelectOption[];
  /** Placeholder option (renders as disabled first item when no value). */
  placeholder?: string;
  wrapperClassName?: string;
}

export const MjolnirSelect = React.forwardRef<HTMLSelectElement, MjolnirSelectProps>(
  function MjolnirSelect(
    {
      label,
      helper,
      error,
      variant = "thunder",
      size = "md",
      options,
      placeholder,
      wrapperClassName,
      className,
      id,
      required,
      ...rest
    },
    ref
  ) {
    const inputId = id || rest.name || undefined;
    return (
      <FieldShell
        label={label}
        htmlFor={inputId}
        helper={helper}
        error={error}
        required={required}
        className={wrapperClassName}
      >
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            required={required}
            className={cn(
              "w-full appearance-none rounded-xl bg-zinc-950 border border-zinc-800 text-white outline-none cursor-pointer",
              "transition-colors focus:ring-2 pr-9",
              INPUT_SIZE_MAP[size],
              VARIANT_FOCUS[variant],
              error && "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        </div>
      </FieldShell>
    );
  }
);

export default MjolnirInput;
