import type React from "react"
import type { Metadata } from "next"
import { Inter, Montserrat } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth"
import { AppProvider } from "@/lib/app-context"
import { ErrorBoundary } from "@/lib/error-boundary"
import { ToastProvider } from "@/lib/toast"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
})

export const metadata: Metadata = {
  title: "GymPro - Sistema de Gestión",
  description: "Sistema completo de gestión para gimnasios",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <AppProvider>
            <AuthProvider>
              <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </ThemeProvider>
            </AuthProvider>
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
