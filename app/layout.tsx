import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProviders } from "@/components/providers/app-providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "BarberPro",
  description: "Gestão completa para barbearias modernas"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-neutral-100 text-neutral-900`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}

