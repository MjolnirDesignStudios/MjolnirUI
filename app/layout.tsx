import type { Metadata, Viewport } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";

const ubuntu = Ubuntu({
	subsets: ["latin"],
	variable: "--font-ubuntu",
	weight: ["300", "400", "500", "700"],
	display: "swap",
});

/* ── Viewport (separate export for Next.js 14+) ─────── */
export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: dark)", color: "#020617" },
		{ media: "(prefers-color-scheme: light)", color: "#020617" },
	],
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
};

/* ── Metadata — covers Google, iMessage/SMS, FB/IG/Meta, X ── */
export const metadata: Metadata = {
	metadataBase: new URL("https://www.mjolnirui.com"),
	title: {
		default: "MjolnirUI — Premium React Component Library",
		template: "%s • MjolnirUI",
	},
	description:
		"Asgardian-grade UI/UX design system. Premium React components, GLSL shaders, 3D tools, and AI-powered design by Mjolnir Design Studios.",
	keywords: [
		"Agentic AI",
		"Agentic AI Design Agent",
		"Mjolnir Design Studios",
		"MjolnirUI",
		"React Component Library",
		"UI/UX Design System",
		"GLSL Shaders",
		"Three.js Components",
		"Thunderous UI/UX",
		"Electric Web Design",
		"Premium Web Components",
		"Next.js Components",
		"Tailwind Components",
	],
	authors: [{ name: "Mjolnir Design Studios", url: "https://www.mjolnirui.com" }],
	creator: "Mjolnir Design Studios",
	publisher: "Mjolnir Design Studios",
	alternates: { canonical: "/" },
	robots: { index: true, follow: true },
	// Apple web app
	appleWebApp: {
		capable: true,
		title: "MjolnirUI",
		statusBarStyle: "black-translucent",
	},
	// ─── OpenGraph (Facebook, Instagram, Meta, iMessage, SMS, LinkedIn, Discord) ───
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://www.mjolnirui.com",
		siteName: "MjolnirUI",
		title: "MjolnirUI — Premium React Component Library",
		description:
			"Asgardian-grade UI/UX design system. Components, shaders, 3D tools, and AI-powered design by Mjolnir Design Studios.",
		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "MjolnirUI – Asgardian-Grade UI/UX Design System",
				type: "image/jpeg",
			},
			{
				url: "/og-image-square.jpg",
				width: 1200,
				height: 1200,
				alt: "MjolnirUI Logo – Mjolnir Design Studios",
				type: "image/jpeg",
			},
		],
	},
	// ─── Twitter / X ───────────────────────────────────────
	twitter: {
		card: "summary_large_image",
		site: "@MjolnirDesignsX",
		creator: "@MjolnirDesignsX",
		title: "MjolnirUI — Premium React Component Library",
		description:
			"Asgardian-grade UI/UX design system. Components, shaders, 3D tools, and AI-powered design.",
		images: {
			url: "/og-image.jpg",
			alt: "MjolnirUI – Asgardian-Grade UI/UX Design System",
		},
	},
	// ─── Icons & Favicons ──────────────────────────────────
	icons: {
		icon: [
			{ url: "/favicon/favicon.ico", sizes: "any" },
			{ url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
			{ url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
		],
		shortcut: ["/favicon/favicon.ico"],
		apple: [
			{ url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
		],
	},
	// ─── Manifest (PWA-ready) ──────────────────────────────
	manifest: "/manifest.json",
	// ─── Google Search Console ─────────────────────────────
	verification: {
		google: "your-google-site-verification",
	},
	// ─── Additional structured hints ───────────────────────
	other: {
		"msapplication-TileColor": "#020617",
		"msapplication-TileImage": "/favicon/favicon-32x32.png",
		"apple-mobile-web-app-title": "MjolnirUI",
		"application-name": "MjolnirUI",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`dark ${ubuntu.variable}`} suppressHydrationWarning>
			<body className="antialiased bg-black text-white">
				<Providers>
					{children}
				</Providers>
			</body>
		</html>
	);
}
