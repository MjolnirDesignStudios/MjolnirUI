// app/components/ui/Checkbox.tsx
// Branded checkbox primitive. Controlled or uncontrolled via standard
// React input semantics — works with any form library that targets
// native <input type="checkbox"> (react-hook-form, Formik, raw FormData).
//
// Three states: unchecked, checked, indeterminate (parent-of-children
// patterns). Indeterminate is a visual-only state — the underlying
// input is still `checked={false}` until the consumer flips it.
//
// Also exports MjolnirCheckboxGroup for "select N of M" layouts with a
// shared label, helper text, and error slot.
"use client";

import React, { useEffect, useRef } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { pickColors, type ChartVariant } from "@/lib/chartTheme";

export type CheckboxVariant = ChartVariant;

export interface MjolnirCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Visible label, rendered next to the box. */
  label?: React.ReactNode;
  /** Optional helper text below the label. */
  helper?: React.ReactNode;
  /** Error text — overrides helper styling. */
  error?: React.ReactNode;
  /** Brand color when checked. */
  variant?: CheckboxVariant;
  /** Override accent color directly. */
  color?: string;
  /** Indeterminate visual state. The DOM input is still unchecked. */
  indeterminate?: boolean;
  /** Box size. */
  size?: "sm" | "md" | "lg";
  /** Wrapper className. */
  wrapperClassName?: string;
}

const SIZE_MAP = {
  sm: { box: 14, icon: 10, gap: "gap-2", text: "text-xs" },
  md: { box: 18, icon: 12, gap: "gap-2.5", text: "text-sm" },
  lg: { box: 22, icon: 14, gap: "gap-3", text: "text-base" },
};

export const MjolnirCheckbox = React.forwardRef<
  HTMLInputElement,
  MjolnirCheckboxProps
>(function MjolnirCheckbox(
  {
    label,
    helper,
    error,
    variant = "thunder",
    color,
    indeterminate = false,
    size = "md",
    wrapperClassName,
    className,
    id,
    disabled,
    checked,
    defaultChecked,
    ...rest
  },
  ref
) {
  const innerRef = useRef<HTMLInputElement>(null);

  /* Forward the ref so consumers can still focus / blur the input. */
  React.useImperativeHandle(
    ref,
    () => innerRef.current as HTMLInputElement
  );

  /* Wire the indeterminate prop into the DOM. There's no React attribute
     for it — has to be set imperatively. */
  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate, checked]);

  const accent = color ?? pickColors(variant, 1)[0];
  const sz = SIZE_MAP[size];
  const inputId = id || rest.name || undefined;
  const isChecked = checked ?? defaultChecked ?? false;
  const isVisuallyOn = indeterminate || isChecked;

  return (
    <div className={cn("inline-flex flex-col", wrapperClassName)}>
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex items-center",
          sz.gap,
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer select-none"
        )}
      >
        {/* Hidden native input drives semantics + keyboard focus. */}
        <input
          ref={innerRef}
          type="checkbox"
          id={inputId}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          className="sr-only peer"
          {...rest}
        />

        {/* Custom box. peer-focus-visible mirrors keyboard focus on the input. */}
        <span
          aria-hidden
          className={cn(
            "relative inline-flex items-center justify-center shrink-0 rounded-md border transition-all",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black",
            className
          )}
          style={{
            width: sz.box,
            height: sz.box,
            backgroundColor: isVisuallyOn ? accent : "transparent",
            borderColor: isVisuallyOn ? accent : "#3f3f46",
            boxShadow: isVisuallyOn
              ? `0 0 0 1px ${accent}, 0 0 8px ${accent}33`
              : undefined,
            ["--tw-ring-color" as string]: `${accent}66`,
          }}
        >
          {indeterminate ? (
            <Minus size={sz.icon} className="text-black" strokeWidth={3} />
          ) : isChecked ? (
            <Check size={sz.icon} className="text-black" strokeWidth={3} />
          ) : null}
        </span>

        {label && (
          <span className={cn("text-gray-200", sz.text)}>{label}</span>
        )}
      </label>

      {(helper || error) && (
        <span
          className={cn(
            "text-[11px] mt-1 ml-7",
            error ? "text-red-400" : "text-gray-500"
          )}
        >
          {error ?? helper}
        </span>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
   CHECKBOX GROUP
   ═══════════════════════════════════════════════════════ */
export interface MjolnirCheckboxGroupProps {
  /** Group heading. */
  label?: React.ReactNode;
  helper?: React.ReactNode;
  error?: React.ReactNode;
  /** Layout direction. */
  orientation?: "vertical" | "horizontal";
  children: React.ReactNode;
  className?: string;
}

export function MjolnirCheckboxGroup({
  label,
  helper,
  error,
  orientation = "vertical",
  children,
  className,
}: MjolnirCheckboxGroupProps) {
  return (
    <fieldset className={cn("flex flex-col gap-2", className)}>
      {label && (
        <legend className="text-xs font-semibold text-gray-300 mb-1">
          {label}
        </legend>
      )}
      <div
        className={cn(
          orientation === "horizontal"
            ? "flex flex-row flex-wrap gap-4"
            : "flex flex-col gap-2"
        )}
      >
        {children}
      </div>
      {(helper || error) && (
        <span
          className={cn(
            "text-[11px] mt-0.5",
            error ? "text-red-400" : "text-gray-500"
          )}
        >
          {error ?? helper}
        </span>
      )}
    </fieldset>
  );
}

export default MjolnirCheckbox;
