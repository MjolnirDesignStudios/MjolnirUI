"use client"

import * as React from "react"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProviderProps } from "next-themes"

export function Providers({
	children,
	...props
}: ThemeProviderProps) {
	return (
		<SessionProvider>
			<NextThemesProvider {...props}>{children}</NextThemesProvider>
		</SessionProvider>
	)
}
// ...existing code...
