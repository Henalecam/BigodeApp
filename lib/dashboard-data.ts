import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  formatISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays
} from "date-fns"
import { getDb, AppointmentStatus } from "@/lib/mock-db"

export type DashboardMetrics = {
  dailyRevenue: number
  weeklyRevenue: number
  monthlyRevenue: number
  totalAppointments: number
  personalAppointments?: number
  personalRevenue?: number
}

export type DashboardRevenuePoint = {
  label: string
  value: number
}

export type DashboardTopBarber = {
  id: string
  name: string
  totalAppointments: number
  totalRevenue: number
}

export type DashboardUpcomingAppointment = {
  id: string
  clientName: string
  barberName: string
  startTime: string
  services: string[]
  status: AppointmentStatus
}

export type DashboardLowStockProduct = {
  id: string
  name: string
  stock: number
  minStock: number
}

export type DashboardData = {
  metrics: DashboardMetrics
  revenueTrend: DashboardRevenuePoint[]
  topBarbers: DashboardTopBarber[]
  upcomingAppointments: DashboardUpcomingAppointment[]
  lowStockProducts: DashboardLowStockProduct[]
}

type DashboardParams = {
  barbershopId: string
  role: "ADMIN" | "BARBER"
  userId: string
}

export async function getDashboardData({ barbershopId, role, userId }: DashboardParams): Promise<DashboardData> {
  const db = getDb()
  const today = new Date()
  const startToday = startOfDay(today)
  const endToday = endOfDay(today)
  const startWeek = startOfWeek(today, { weekStartsOn: 1 })
  const endWeek = endOfWeek(today, { weekStartsOn: 1 })
  const startMonthDate = startOfMonth(today)
  const endMonthDate = endOfMonth(today)
  const trendStart = startOfDay(subDays(today, 6))

  let appointments = db.appointments.filter(a => a.barbershopId === barbershopId)

  if (role === "BARBER") {
    const barber = db.barbers.find(b => b.barbershopId === barbershopId && b.name === db.users.find(u => u.id === userId)?.name)
    if (barber) {
      appointments = appointments.filter(a => a.barberId === barber.id)
    }
  }

  const completedAppointments = appointments.filter(a => a.status === "COMPLETED")

  const dailyRevenue = completedAppointments
    .filter(a => a.date >= startToday && a.date <= endToday)
    .reduce((total, a) => total + (a.totalValue ?? 0), 0)

  const weeklyRevenue = completedAppointments
    .filter(a => a.date >= startWeek && a.date <= endWeek)
    .reduce((total, a) => total + (a.totalValue ?? 0), 0)

  const monthlyRevenue = completedAppointments
    .filter(a => a.date >= startMonthDate && a.date <= endMonthDate)
    .reduce((total, a) => total + (a.totalValue ?? 0), 0)

  const totalAppointments = appointments.filter(a =>
    ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(a.status)
  ).length

  const personalAppointments = role === "BARBER"
    ? appointments.filter(a =>
        a.date >= startToday && a.date <= endToday &&
        ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(a.status)
      ).length
    : undefined

  const personalRevenue = role === "BARBER" ? monthlyRevenue : undefined

  const revenueTrendMap = new Map<string, number>()
  for (let index = 0; index < 7; index += 1) {
    const dateKey = formatISO(addDays(trendStart, index), { representation: "date" })
    revenueTrendMap.set(dateKey, 0)
  }

  completedAppointments
    .filter(a => a.date >= trendStart && a.date <= endToday)
    .forEach(appointment => {
      const dateKey = formatISO(appointment.date, { representation: "date" })
      const current = revenueTrendMap.get(dateKey) ?? 0
      revenueTrendMap.set(dateKey, current + (appointment.totalValue ?? 0))
    })

  const revenueTrend: DashboardRevenuePoint[] = Array.from(revenueTrendMap.entries()).map(([date, value]) => ({
    label: date,
    value
  }))

  const barberStatsMap = new Map<string, { totalAppointments: number; totalRevenue: number }>()

  completedAppointments
    .filter(a => a.date >= startMonthDate && a.date <= endMonthDate)
    .forEach(appointment => {
      const stats = barberStatsMap.get(appointment.barberId) ?? { totalAppointments: 0, totalRevenue: 0 }
      stats.totalAppointments += 1
      stats.totalRevenue += appointment.totalValue ?? 0
      barberStatsMap.set(appointment.barberId, stats)
    })

  const topBarbers: DashboardTopBarber[] = Array.from(barberStatsMap.entries())
    .map(([barberId, stats]) => {
      const barber = db.barbers.find(b => b.id === barberId)
      return {
        id: barberId,
        name: barber?.name ?? "Barbeiro",
        totalAppointments: stats.totalAppointments,
        totalRevenue: stats.totalRevenue
      }
    })
    .sort((a, b) => b.totalAppointments - a.totalAppointments)
    .slice(0, 3)

  const upcoming = appointments
    .filter(a => {
      if (a.date < startToday || a.date > endToday) return false
      return ["CONFIRMED", "IN_PROGRESS"].includes(a.status)
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, role === "BARBER" ? 10 : 20)

  const upcomingAppointments: DashboardUpcomingAppointment[] = upcoming.map(appointment => ({
    id: appointment.id,
    clientName: db.clients.find(c => c.id === appointment.clientId)?.name ?? "Cliente",
    barberName: db.barbers.find(b => b.id === appointment.barberId)?.name ?? "Barbeiro",
    startTime: appointment.startTime,
    services: db.appointmentServices
      .filter(as => as.appointmentId === appointment.id)
      .map(as => db.services.find(s => s.id === as.serviceId)?.name ?? "Serviço"),
    status: appointment.status
  }))

  const lowStockProducts: DashboardLowStockProduct[] = role === "ADMIN"
    ? db.products
        .filter(p => p.barbershopId === barbershopId && p.isActive && p.stock < p.minStock)
        .map(p => ({
          id: p.id,
          name: p.name,
          stock: p.stock,
          minStock: p.minStock
        }))
    : []

  return {
    metrics: {
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      totalAppointments,
      personalAppointments,
      personalRevenue
    },
    revenueTrend,
    topBarbers,
    upcomingAppointments,
    lowStockProducts
  }
}
