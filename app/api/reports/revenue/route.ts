import { NextResponse } from "next/server"
import { parseISO, startOfMonth, endOfDay } from "date-fns"
import { getDb } from "@/lib/mock-db"
import { getCurrentSession } from "@/lib/auth"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const startParam = searchParams.get("start")
  const endParam = searchParams.get("end")

  const startDate = startParam ? parseISO(startParam) : startOfMonth(new Date())
  const endDate = endParam ? endOfDay(parseISO(endParam)) : endOfDay(new Date())

  const db = getDb()
  const appointments = db.appointments.filter(
    a =>
      a.barbershopId === "barbershop-1" &&
      a.status === "COMPLETED" &&
      a.date >= startDate &&
      a.date <= endDate
  )

  const totalRevenue = appointments.reduce((total, a) => total + (a.totalValue ?? 0), 0)

  const revenueByPayment = appointments.reduce<Record<string, number>>((acc, appointment) => {
    if (!appointment.paymentMethod) return acc
    acc[appointment.paymentMethod] = (acc[appointment.paymentMethod] ?? 0) + (appointment.totalValue ?? 0)
    return acc
  }, {})

  const revenueByBarberMap = new Map<
    string,
    {
      barberId: string
      barberName: string
      totalRevenue: number
      totalAppointments: number
    }
  >()

  appointments.forEach(appointment => {
    const barber = db.barbers.find(b => b.id === appointment.barberId)!
    const item = revenueByBarberMap.get(appointment.barberId) ?? {
      barberId: appointment.barberId,
      barberName: barber.name,
      totalRevenue: 0,
      totalAppointments: 0
    }
    item.totalRevenue += appointment.totalValue ?? 0
    item.totalAppointments += 1
    revenueByBarberMap.set(appointment.barberId, item)
  })

  const dailyRevenueMap = new Map<string, number>()
  appointments.forEach(appointment => {
    const dayKey = appointment.date.toISOString().split("T")[0]
    dailyRevenueMap.set(dayKey, (dailyRevenueMap.get(dayKey) ?? 0) + (appointment.totalValue ?? 0))
  })

  const revenueTrend = Array.from(dailyRevenueMap.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([date, value]) => ({ date, value }))

  return NextResponse.json({
    success: true,
    data: {
      totalRevenue,
      revenueByPayment,
      revenueByBarber: Array.from(revenueByBarberMap.values()),
      revenueTrend
    }
  })
}
