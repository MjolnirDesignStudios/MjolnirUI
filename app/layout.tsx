import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";

const ubuntu = Ubuntu({
	subsets: ["latin"],
	variable: "--font-ubuntu",
	weight: ["300", "400", "500", "700"],
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: "Mjolnir Design Studios | Thunderous UI/UX",
		template: "%s • Mjolnir Design Studios",
	},
	description: "Premium Agentic AI Agent for UI/UX Design.",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`dark ${ubuntu.variable}`}>
			<body className="antialiased">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
