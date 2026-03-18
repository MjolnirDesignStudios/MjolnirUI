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
		default: "MjolnirUI — Premium React Component Library",
		template: "%s • MjolnirUI",
	},
	description:
		"Asgardian-grade UI/UX design system. Components, shaders, 3D tools, and AI-powered design by Mjolnir Design Studios.",
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
		title: "MjolnirUI — Premium React Component Library",
		description: "Asgardian-grade UI/UX design system. Components, shaders, 3D tools, and AI-powered design.",
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
		title: "MjolnirUI — Premium React Component Library",
		description: "Asgardian-grade UI/UX design system. Components, shaders, 3D tools, and AI-powered design.",
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
