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
        "inline-flex h-14 items-center justify-center rounded-xl",
        variantClasses.border,
        variantClasses.bg,
        "animate-shimmer",
        "px-6 font-bold text-xl text-white transition-all",
        // 3D bezel effect
        "shadow-[0_4px_0_rgba(0,0,0,0.4),0_6px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]",
        "hover:shadow-[0_6px_0_rgba(0,0,0,0.4),0_8px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]",
        "hover:translate-y-[-2px]",
        // Pressed effect
        "active:shadow-[0_1px_0_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(0,0,0,0.3)]",
        "active:translate-y-[2px]",
        variantClasses.focus,
        "whitespace-nowrap overflow-hidden",
        "w-full sm:w-auto sm:min-w-[240px]",
        otherClasses
      )}
      style={{ backgroundSize: '200% 100%' }}
    >
      <span className="flex items-center gap-3 truncate">
        {position === "left" && (icon || <Zap className="w-6 h-6 shrink-0" />)}
        <span className="truncate">{title}</span>
        {position === "right" && (icon || <Zap className="w-6 h-6 shrink-0" />)}
      </span>
    </button>
  );
}
