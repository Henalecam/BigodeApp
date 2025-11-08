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

  return (
    <Card className={cn("border-primary/10", highlight === "success" && "border-success/30", highlight === "warning" && "border-warning/30")}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-sm font-medium text-neutral-500">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <span className="text-2xl font-semibold text-primary">{formattedValue}</span>
        {description ? <span className="text-xs text-neutral-500">{description}</span> : null}
      </CardContent>
    </Card>
  )
}

