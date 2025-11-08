"use client"

import * as React from "react"

type ToastVariant = "default" | "destructive" | "success"

export type Toast = {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  action?: React.ReactNode
}

type ToastState = {
  toasts: Toast[]
}

const ToastContext = React.createContext<{
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
} | null>(null)

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ToastState>({ toasts: [] })

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    setState(current => ({
      toasts: [...current.toasts, { id: crypto.randomUUID(), ...toast }]
    }))
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setState(current => ({
      toasts: current.toasts.filter(toast => toast.id !== id)
    }))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

export { ToastProvider, useToast }

