import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  })
}

export function formatPhone(value: string) {
  if (!value) return ""
  const digits = value.replace(/\D/g, "")
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim()
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim()
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (!hours) return `${mins} min`
  if (!mins) return `${hours} h`
  return `${hours} h ${mins} min`
}

