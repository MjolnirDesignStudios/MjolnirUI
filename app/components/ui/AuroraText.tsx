import React from "react";

interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
}

const defaultColors = [
  "#FFD700", // gold
  "#FFA500", // orange
  "#FFB300", // yellow-orange
  "#FF8C00", // dark orange
  "#FFF700", // bright yellow
  "#B87333", // bronze
  "#FFFACD", // lemon chiffon
];

export const AuroraText: React.FC<AuroraTextProps> = ({
  children,
  className = "",
  colors = defaultColors,
  speed = 1,
}) => {
  // Animate a moving gradient background for the text using CSS variables
  const gradient = `linear-gradient(270deg, ${colors.join(", ")}, ${colors[0]})`;
  const animationDuration = `${6 / speed}s`;
    return (
      <span
        className={"aurora-text " + className}
        data-testid="aurora-text"
        {...{
          style: {
            '--aurora-gradient': gradient,
            '--aurora-duration': animationDuration,
          } as React.CSSProperties,
        }}
      >
        {children}
      </span>
    );
};
