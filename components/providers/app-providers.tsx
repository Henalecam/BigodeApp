"use client"

import { SessionProvider } from "next-auth/react"
import { ToastProvider } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toast"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
        <Toaster />
      </ToastProvider>
    </SessionProvider>
  )
}

