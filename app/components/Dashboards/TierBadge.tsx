// components/Dashboards/TierBadge.tsx
"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { getTierConfig, type TierName } from "@/lib/tierConfig";

interface TierBadgeProps {
  tier: TierName;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export function TierBadge({ tier, size = "md", showIcon = true, className }: TierBadgeProps) {
  const config = getTierConfig(tier);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };

  const iconSizes = { sm: 12, md: 14, lg: 16 };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold border",
        sizeClasses[size],
        className
      )}
      style={{
        color: config.color,
        backgroundColor: `${config.color}15`,
        borderColor: `${config.color}40`,
      }}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {config.label}
    </span>
  );
}
