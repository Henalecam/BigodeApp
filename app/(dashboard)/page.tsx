"use client"

import { useEffect, useState } from "react"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { TopBarbersTable } from "@/components/dashboard/TopBarbersTable"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/lib/session-store"
import type { DashboardData } from "@/lib/dashboard-data"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const statusLabel: Record<string, string> = {
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado"
}

const statusVariant: Record<string, "success" | "warning" | "outline" | "danger"> = {
  CONFIRMED: "success",
  IN_PROGRESS: "warning",
  COMPLETED: "outline",
  CANCELLED: "danger"
}

export default function DashboardPage() {
  const { role } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/dashboard?role=${role}`)
        const json = await response.json()
        if (json.success) {
          setData(json.data)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [role])

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const metricsCards = [
    {
      title: "Faturamento hoje",
      value: data.metrics.dailyRevenue,
      highlight: "primary" as const,
      prefix: "currency" as const
    },
    {
      title: "Faturamento na semana",
      value: data.metrics.weeklyRevenue,
      highlight: "primary" as const,
      prefix: "currency" as const
    },
    {
      title: "Faturamento no mês",
      value: data.metrics.monthlyRevenue,
      highlight: "primary" as const,
      prefix: "currency" as const
    },
    {
      title: "Atendimentos totais",
      value: data.metrics.totalAppointments,
      highlight: "success" as const
    }
  ]

  if (typeof data.metrics.personalAppointments === "number") {
    metricsCards.push({
      title: "Seus atendimentos hoje",
      value: data.metrics.personalAppointments,
      highlight: "success" as const
    })
  }

  if (typeof data.metrics.personalRevenue === "number") {
    metricsCards.push({
      title: "Seu faturamento no mês",
      value: data.metrics.personalRevenue,
      highlight: "primary" as const,
      prefix: "currency" as const
    })
  }

  const showLowStock = role === "ADMIN"

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {metricsCards.map(card => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            highlight={card.highlight}
            prefix={card.prefix}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4 rounded-2xl border border-primary/10 bg-white/95 backdrop-blur-md shadow-lg p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Faturamento dos últimos 7 dias</h2>
            <span className="text-xs text-neutral-500">Valores consolidados por dia</span>
          </div>
          <RevenueChart data={data.revenueTrend} />
        </div>
        <div className="space-y-4 rounded-2xl border border-primary/10 bg-white/95 backdrop-blur-md shadow-lg p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Top barbeiros</h2>
            <span className="text-xs text-neutral-500">Últimos 30 dias</span>
          </div>
          <TopBarbersTable data={data.topBarbers} />
        </div>
      </div>

      <div className={`grid gap-6 ${showLowStock ? "lg:grid-cols-2" : ""}`}>
        <div className="space-y-4 rounded-2xl border border-primary/10 bg-white/95 backdrop-blur-md shadow-lg p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Próximos atendimentos</h2>
            <span className="text-xs text-neutral-500">Somente para hoje</span>
          </div>
          {data.upcomingAppointments.length ? (
            <div className="space-y-3">
              {data.upcomingAppointments.map(appointment => (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-1 rounded-xl border border-primary/10 bg-gradient-to-r from-white to-neutral-50 p-4 transition-all hover:shadow-md hover:scale-[1.02]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-primary">{appointment.startTime}</p>
                    <Badge variant={statusVariant[appointment.status]}>{statusLabel[appointment.status]}</Badge>
                  </div>
                  <p className="text-sm font-semibold text-neutral-700">{appointment.clientName}</p>
                  <p className="text-xs text-neutral-500">Barbeiro: {appointment.barberName}</p>
                  <p className="text-xs text-neutral-500">{appointment.services.join(", ")}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Nenhum atendimento agendado para hoje.</p>
          )}
        </div>
        {showLowStock ? (
          <div className="space-y-4 rounded-2xl border border-primary/10 bg-white/95 backdrop-blur-md shadow-lg p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold bg-gradient-to-r from-danger to-warning bg-clip-text text-transparent">Estoque crítico</h2>
              <span className="text-xs text-neutral-500">Produtos abaixo do mínimo</span>
            </div>
            {data.lowStockProducts.length ? (
              <div className="space-y-3">
                {data.lowStockProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between rounded-xl border border-danger/30 bg-gradient-to-r from-danger/5 to-warning/5 p-4 transition-all hover:shadow-md">
                    <div>
                      <p className="text-sm font-bold text-danger">{product.name}</p>
                      <p className="text-xs text-neutral-500">Estoque atual: {product.stock}</p>
                    </div>
                    <Badge variant="danger">Mín: {product.minStock}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">Nenhum produto abaixo do estoque mínimo.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}


