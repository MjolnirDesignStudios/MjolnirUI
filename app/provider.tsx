"use client"

import * as React from "react"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProviderProps } from "next-themes"
import { AnalyticsProvider } from "@/components/AnalyticsProvider"

export function Providers({
	children,
	...props
}: ThemeProviderProps) {
	return (
		<SessionProvider>
			<NextThemesProvider
				attribute="class"
				defaultTheme="dark"
				forcedTheme="dark"
				disableTransitionOnChange
				{...props}
			>
				{/* Fires page_view + tool_open analytics events on every route change.
				    Mount-only — renders nothing. */}
				<AnalyticsProvider />
				{children}
			</NextThemesProvider>
		</SessionProvider>
	)
}
// ...existing code...
