// components/ui/Buttons/ShimmerButton.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface Props {
  title: string;
  icon?: React.ReactNode;
  position?: string;
  handleClick?: () => void;
  otherClasses?: string;
  variant?: "primary" | "bronze" | "silver" | "gold" | "emerald";
}

export default function ShimmerButton({
  title,
  icon,
  position = "left",
  handleClick,
  otherClasses,
  variant = "primary",
}: Props) {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return {
          border: "border-slate-800",
          bg: "bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)]",
          shadow: "shadow-2xl hover:shadow-gold-300/50",
          focus: "focus:ring-4 focus:ring-white/20",
        };
      case "bronze":
        return {
          border: "border-orange-600/50",
          bg: "bg-[linear-gradient(110deg,#000103,45%,#9a3412,55%,#000103)]",
          shadow: "shadow-2xl hover:shadow-orange-600/50",
          focus: "focus:ring-4 focus:ring-orange-600/30",
        };
      case "silver":
        return {
          border: "border-gray-400/50",
          bg: "bg-[linear-gradient(110deg,#000103,45%,#6b7280,55%,#000103)]",
          shadow: "shadow-2xl hover:shadow-gray-400/50",
          focus: "focus:ring-4 focus:ring-gray-400/30",
        };
      case "gold":
        return {
          border: "border-amber-500/50",
          bg: "bg-[linear-gradient(110deg,#000103,45%,#b45309,55%,#000103)]",
          shadow: "shadow-2xl hover:shadow-amber-500/50",
          focus: "focus:ring-4 focus:ring-amber-500/30",
        };
      case "emerald":
        return {
          border: "border-emerald-500/50",
          bg: "bg-[linear-gradient(110deg,#000103,45%,#065f46,55%,#000103)]",
          shadow: "shadow-2xl hover:shadow-emerald-500/50",
          focus: "focus:ring-4 focus:ring-emerald-500/30",
        };
      default:
        return {
          border: "border-slate-800",
          bg: "bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)]",
          shadow: "shadow-2xl hover:shadow-gold-300/50",
          focus: "focus:ring-4 focus:ring-white/20",
        };
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex h-14 w-84 items-center justify-center rounded-xl",
        variantClasses.border,
        variantClasses.bg,
        "bg-size-[200%_100%] animate-shimmer",
        "px-6 font-bold text-xl text-white transition-all hover:scale-105",
        variantClasses.shadow,
        variantClasses.focus,
        "whitespace-nowrap overflow-hidden",
        // Mobile: full width, Desktop: fixed width
        "w-92 sm:w-92",
        otherClasses
      )}
    >
      <span className="flex items-center gap-3 truncate">
        {position === "left" && (icon || <Zap className="w-6 h-6 shrink-0" />)}
        <span className="truncate">{title}</span>
        {position === "right" && (icon || <Zap className="w-6 h-6 shrink-0" />)}
      </span>
    </button>
  );
}