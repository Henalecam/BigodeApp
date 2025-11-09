"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

type CommissionItem = {
  barberId: string
  barberName: string
  totalAppointments: number
  totalRevenue: number
  commissionRate: number
  commissionValue: number
}

type CommissionsReportProps = {
  barbers: {
    id: string
    name: string
  }[]
}

export function CommissionsReport({ barbers }: CommissionsReportProps) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<CommissionItem[]>([])
  const [start, setStart] = useState(() => format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"))
  const [end, setEnd] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const [barberId, setBarberId] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("start", start)
        params.set("end", end)
        if (barberId) params.set("barberId", barberId)
        const response = await fetch(`/api/reports/commissions?${params.toString()}`, {
          cache: "no-store"
        })
        const json = await response.json()
        if (json.success) {
          setData(json.data)
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
  }, [start, end, barberId, addToast])

  const totals = useMemo(() => {
    return data.reduce(
      (acc, item) => {
        acc.appointments += item.totalAppointments
        acc.revenue += item.totalRevenue
        acc.commission += item.commissionValue
        return acc
      },
      { appointments: 0, revenue: 0, commission: 0 }
    )
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
        <div className="flex flex-col">
          <label className="text-xs text-neutral-500">Barbeiro</label>
          <Select value={barberId || "all"} onValueChange={value => setBarberId(value === "all" ? "" : value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {barbers.map(barber => (
                <SelectItem key={barber.id} value={barber.id}>
                  {barber.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          Exportar PDF
        </Button>
      </div>
      {loading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Barbeiro</TableHead>
              <TableHead>Atendimentos</TableHead>
              <TableHead>Faturamento</TableHead>
              <TableHead>Comissão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(item => (
              <TableRow key={item.barberId}>
                <TableCell>{item.barberName}</TableCell>
                <TableCell>{item.totalAppointments}</TableCell>
                <TableCell>{formatCurrency(item.totalRevenue)}</TableCell>
                <TableCell>
                  {formatCurrency(item.commissionValue)} ({item.commissionRate}%)
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="font-semibold">Total</TableCell>
              <TableCell className="font-semibold">{totals.appointments}</TableCell>
              <TableCell className="font-semibold">{formatCurrency(totals.revenue)}</TableCell>
              <TableCell className="font-semibold">{formatCurrency(totals.commission)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </div>
  )
}

