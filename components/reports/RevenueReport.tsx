"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { useToast } from "@/components/ui/use-toast"

type RevenueResponse = {
  totalRevenue: number
  revenueByPayment: Record<string, number>
  revenueByBarber: {
    barberId: string
    barberName: string
    totalRevenue: number
    totalAppointments: number
  }[]
  revenueTrend: {
    date: string
    value: number
  }[]
}

export function RevenueReport() {
  const { addToast } = useToast()
  const [start, setStart] = useState(() => format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"))
  const [end, setEnd] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const [data, setData] = useState<RevenueResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("start", start)
        params.set("end", end)
        const response = await fetch(`/api/reports/revenue?${params.toString()}`, {
          cache: "no-store"
        })
        const json = await response.json()
        if (json.success) {
          setData(json.data as RevenueResponse)
        } else {
          addToast({
            variant: "destructive",
            title: "Erro ao carregar relatório",
            description: json.error ?? "Tente novamente"
          })
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [start, end, addToast])

  const paymentRows = useMemo(() => {
    if (!data) return []
    const entries = Object.entries(data.revenueByPayment)
    return entries.sort((a, b) => b[1] - a[1])
  }, [data])

  const trendData = useMemo(() => {
    if (!data) return []
    return data.revenueTrend.map(point => ({
      label: point.date,
      value: point.value
    }))
  }, [data])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col">
          <label className="text-xs text-neutral-500">Início</label>
          <Input type="date" value={start} onChange={event => setStart(event.target.value)} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-neutral-500">Fim</label>
          <Input type="date" value={end} onChange={event => setEnd(event.target.value)} />
        </div>
      </div>

      {loading || !data ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Total faturado"
              value={data.totalRevenue}
              highlight="primary"
              prefix="currency"
              description={`Período de ${format(new Date(start), "dd/MM/yyyy")} a ${format(new Date(end), "dd/MM/yyyy")}`}
            />
            <MetricCard
              title="Formas de pagamento"
              value={paymentRows.length}
              highlight="success"
              description="Métodos com movimentação no período"
            />
            <MetricCard
              title="Barbeiros envolvidos"
              value={data.revenueByBarber.length}
              highlight="success"
              description="Profissionais com atendimentos concluídos"
            />
          </div>

          <div className="rounded-lg border border-primary/10 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Faturamento diário</h2>
              <span className="text-xs text-neutral-500">Agrupado por data</span>
            </div>
            <div className="mt-6">
              <RevenueChart data={trendData} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-primary/10 bg-white p-6">
              <h3 className="text-lg font-semibold text-primary">Por forma de pagamento</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Método</TableHead>
                    <TableHead className="text-right">Faturamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentRows.map(([method, value]) => (
                    <TableRow key={method}>
                      <TableCell>{method}</TableCell>
                      <TableCell className="text-right">{value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="rounded-lg border border-primary/10 bg-white p-6">
              <h3 className="text-lg font-semibold text-primary">Por barbeiro</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barbeiro</TableHead>
                    <TableHead>Atendimentos</TableHead>
                    <TableHead className="text-right">Faturamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.revenueByBarber
                    .sort((a, b) => b.totalRevenue - a.totalRevenue)
                    .map(item => (
                      <TableRow key={item.barberId}>
                        <TableCell>{item.barberName}</TableCell>
                        <TableCell>{item.totalAppointments}</TableCell>
                        <TableCell className="text-right">
                          {item.totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}




