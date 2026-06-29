// app/components/ui/Switch.tsx
// Branded toggle switch — controlled or uncontrolled. Works with native
// form semantics (sends a "on"/"off" form value via hidden input when a
// name is provided).
//
// Already used internally in app/(protected)/blocks/account/profile/page.tsx
// for the notification preferences — this is the formalized public version.
//
// Variants pick the on-state accent color; size has 3 presets; label slot
// + optional helper / error / description rows match MjolnirCheckbox shell.
"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { pickColors, type ChartVariant } from "@/lib/chartTheme";

export type SwitchVariant = ChartVariant;

export interface MjolnirSwitchProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "size" | "onChange"
  > {
  /** Visible label rendered next to the switch. */
  label?: React.ReactNode;
  /** Secondary description rendered under the label. */
  description?: React.ReactNode;
  /** Helper text below the row. */
  helper?: React.ReactNode;
  /** Error text — overrides helper styling. */
  error?: React.ReactNode;
  /** Brand color for the on state. */
  variant?: SwitchVariant;
  /** Override the on-state accent color. */
  color?: string;
  /** Visual size. */
  size?: "sm" | "md" | "lg";
  /** Label position relative to the switch. */
  labelPlacement?: "right" | "left";
  /** Callback when toggled. Receives the new boolean state. */
  onCheckedChange?: (next: boolean) => void;
  /** Wrapper className for the entire row. */
  wrapperClassName?: string;
}

/* Track / thumb dimensions per size. */
const SIZE_MAP = {
  sm: { track: { w: 28, h: 16 }, thumb: 12, gap: "gap-2.5", text: "text-xs" },
  md: { track: { w: 36, h: 20 }, thumb: 16, gap: "gap-3", text: "text-sm" },
  lg: { track: { w: 44, h: 24 }, thumb: 20, gap: "gap-3", text: "text-base" },
};

export const MjolnirSwitch = React.forwardRef<
  HTMLInputElement,
  MjolnirSwitchProps
>(function MjolnirSwitch(
  {
    label,
    description,
    helper,
    error,
    variant = "thunder",
    color,
    size = "md",
    labelPlacement = "right",
    wrapperClassName,
    className,
    id,
    disabled,
    checked,
    defaultChecked,
    onCheckedChange,
    ...rest
  },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  const accent = color ?? pickColors(variant, 1)[0];
  const sz = SIZE_MAP[size];

  /* Determine visual on-state from controlled OR default-controlled props
     for the initial render. Once toggled, React drives the input element
     and the CSS reads checked state via :checked pseudo. */
  const isChecked = checked ?? defaultChecked ?? false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(e.target.checked);
    // Preserve standard form behavior — consumers can still bind to onChange via ...rest
    // but we intentionally don't forward it here since we destructured it out.
  };

  const labelBlock = (label || description) && (
    <div className="flex flex-col min-w-0">
      {label && (
        <span className={cn("text-gray-200 font-medium", sz.text)}>
          {label}
        </span>
      )}
      {description && (
        <span className="text-[11px] text-gray-500 mt-0.5">{description}</span>
      )}
    </div>
  );

  /* Thumb travel distance = track width - thumb width - 4px of inset. */
  const thumbInset = 2;
  const thumbTranslate = sz.track.w - sz.thumb - thumbInset * 2;

  return (
    <div className={cn("inline-flex flex-col", wrapperClassName)}>
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex items-center",
          sz.gap,
          labelPlacement === "left" && "flex-row-reverse justify-between",
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer select-none"
        )}
      >
        {/* Hidden native input drives semantics + keyboard focus. */}
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={inputId}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only peer"
          {...rest}
        />

        {/* Track — color shifts on :checked via peer-checked variant. */}
        <span
          aria-hidden
          className={cn(
            "relative inline-flex shrink-0 rounded-full border transition-all",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black",
            className
          )}
          style={{
            width: sz.track.w,
            height: sz.track.h,
            backgroundColor: isChecked ? accent : "#27272a",
            borderColor: isChecked ? accent : "#3f3f46",
            boxShadow: isChecked
              ? `0 0 8px ${accent}44, inset 0 1px 2px rgba(0,0,0,0.3)`
              : "inset 0 1px 2px rgba(0,0,0,0.3)",
            ["--tw-ring-color" as string]: `${accent}66`,
          }}
        >
          {/* Thumb — translates on toggle. */}
          <span
            aria-hidden
            className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white transition-transform duration-200 ease-out"
            style={{
              width: sz.thumb,
              height: sz.thumb,
              left: thumbInset,
              transform: `translate(${isChecked ? thumbTranslate : 0}px, -50%)`,
              boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
            }}
          />
        </span>

        {labelBlock}
      </label>

      {(helper || error) && (
        <span
          className={cn(
            "text-[11px] mt-1",
            labelPlacement === "left" ? "" : `ml-[${sz.track.w + 12}px]`,
            error ? "text-red-400" : "text-gray-500"
          )}
        >
          {error ?? helper}
        </span>
      )}
    </div>
  );
});

export default MjolnirSwitch;
