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
	metadataBase: new URL("https://www.mjolnirui.com"),
	title: {
		default: "Mjolnir Design Studios | Thunderous UI/UX",
		template: "%s • Mjolnir Design Studios",
	},
	description:
		"Premium Agentic AI Agent for UI/UX Design.",
	keywords: [
		"Agentic AI",
		"Agentic AI Design Agent",
		"Mjolnir Design Studios",
		"MjolnirUI",
		"Thunderous UI/UX",
		"Electric Web Design",
		"Premium Web Components",
	],
	authors: [{ name: "Mjolnir Design Studios", url: "https://www.mjolnirui.com" }],
	creator: "Mjolnir Design Studios",
	publisher: "Mjolnir Design Studios",
	alternates: { canonical: "/" },
	robots: { index: true, follow: true },
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://www.mjolnirui.com",
		siteName: "MjolnirUI",
		title: "MjolnirUI • Agentic AI Design for Thunderous UI/UX",
		description: "Electric UI/UX Design Powered by Agentic AI.",
		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "MjolnirUI – AgenticAI Powered UI/UX Design",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		site: "@MjolnirDesignsX",
		creator: "@MjolnirDesignsX",
		title: "Mjolnir Design Studios - Thunderous Web Agency",
		description: "We don’t just build websites.. We electrify your business!",
		images: ["/og-image.jpg"],
	},
	icons: {
		icon: ["/favicon/favicon.ico"],
		shortcut: ["/favicon/favicon.ico"],
		apple: ["/favicon/apple-touch-icon.png"],
		other: [
			{ rel: "icon", url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
			{ rel: "icon", url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
		],
	},
	verification: {
		google: "your-google-site-verification",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`dark ${ubuntu.variable}`}>
			<body className="antialiased bg-black text-white">
				<Providers>
					{children}
				</Providers>
			</body>
		</html>
	);
}
