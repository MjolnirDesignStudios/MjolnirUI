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
  // Animate a moving gradient background for the text
  const gradient = `linear-gradient(270deg, ${colors.join(", ")}, ${colors[0]})`;
  const animationDuration = `${6 / speed}s`;
  return (
    <span
      className={"aurora-text " + className}
      data-gradient={gradient}
      data-animation-duration={animationDuration}
      data-testid="aurora-text"
    >
      {children}
    </span>
  );
};
