"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, formatCurrency } from "@/lib/utils"

type MetricCardProps = {
  title: string
  value: number
  description?: string
  highlight?: "primary" | "success" | "warning"
  prefix?: string
}

export function MetricCard({ title, value, description, highlight = "primary", prefix }: MetricCardProps) {
  const formattedValue = prefix === "currency" ? formatCurrency(value) : value.toLocaleString("pt-BR")

  const highlightClasses = {
    primary: "border-l-4 border-l-accent",
    success: "border-l-4 border-l-success",
    warning: "border-l-4 border-l-warning"
  }

  const valueClasses = {
    primary: "bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent",
    success: "text-success",
    warning: "text-warning"
  }

  return (
    <Card className={cn("relative overflow-hidden", highlightClasses[highlight])}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-sm font-medium text-neutral-600">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <span className={cn("text-3xl font-bold", valueClasses[highlight])}>{formattedValue}</span>
        {description ? <span className="text-xs text-neutral-500">{description}</span> : null}
      </CardContent>
    </Card>
  )
}

