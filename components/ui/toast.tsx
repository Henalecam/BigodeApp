"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast, Toast } from "./use-toast"

function ToastView({ toast }: { toast: Toast }) {
  const { removeToast } = useToast()

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [removeToast, toast.id])

  return (
    <div
      className={cn(
        "flex w-full min-w-[280px] max-w-sm items-start gap-3 rounded-md border border-primary/10 bg-white p-4 shadow-lg",
        toast.variant === "destructive" && "border-danger bg-danger/10 text-danger",
        toast.variant === "success" && "border-success bg-success/10 text-success"
      )}
    >
      <div className="flex-1">
        {toast.title ? <p className="text-sm font-semibold">{toast.title}</p> : null}
        {toast.description ? <p className="text-sm text-neutral-600">{toast.description}</p> : null}
        {toast.action}
      </div>
      <button
        type="button"
        onClick={() => removeToast(toast.id)}
        className="rounded-sm p-1 text-neutral-500 transition hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Fechar</span>
      </button>
    </div>
  )
}

function Toaster() {
  const { toasts } = useToast()

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map(toast => (
        <ToastView key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

export { Toaster }

