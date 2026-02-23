import React from "react";
import { motion } from "framer-motion";

interface TextRevealProps {
	children: string | React.ReactNode;
	className?: string;
	delay?: number;
	duration?: number;
	by?: "character" | "word";
	animation?: "blurInLeft" | "blurInUp" | "fadeInLeft";
	as?: React.ElementType;
}

const defaultVariants = {
	blurInLeft: {
		hidden: { opacity: 0, filter: "blur(8px)", x: -40 },
		visible: { opacity: 1, filter: "blur(0px)", x: 0 },
	},
	blurInUp: {
		hidden: { opacity: 0, filter: "blur(8px)", y: 40 },
		visible: { opacity: 1, filter: "blur(0px)", y: 0 },
	},
	fadeInLeft: {
		hidden: { opacity: 0, x: -40 },
		visible: { opacity: 1, x: 0 },
	},
};

export function TextReveal({
	children,
	className = "",
	delay = 0,
	duration = 0.75,
	by = "character",
	animation = "blurInLeft",
	as: Tag = "span",
}: React.PropsWithChildren<TextRevealProps>) {
	// Only animate if children is a string, else just render as is
	if (typeof children !== "string") {
		return React.createElement(Tag, { className }, children);
	}
	const textArray = by === "word" ? children.split(" ") : children.split("");

	return React.createElement(
		Tag,
		{ className },
		textArray.map((char, i) => (
			<motion.span
				key={i}
				initial="hidden"
				animate="visible"
				variants={defaultVariants[animation]}
				transition={{
					delay: delay + i * (duration / textArray.length),
					duration: duration,
					ease: "easeOut",
				}}
				style={{ display: "inline-block", whiteSpace: "pre" }}
			>
				{char === " " && by === "word" ? "\u00A0" : char}
			</motion.span>
		))
	);
}
