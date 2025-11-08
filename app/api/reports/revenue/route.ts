import { NextResponse } from "next/server"
import { parseISO, startOfMonth, endOfDay } from "date-fns"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const startParam = searchParams.get("start")
  const endParam = searchParams.get("end")

  const startDate = startParam ? parseISO(startParam) : startOfMonth(new Date())
  const endDate = endParam ? endOfDay(parseISO(endParam)) : endOfDay(new Date())

  const appointments = await prisma.appointment.findMany({
    where: {
      barbershopId: session.user.barbershopId,
      status: "COMPLETED",
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      barber: true
    }
  })

  const totalRevenue = appointments.reduce((total, appointment) => total + (appointment.totalValue ?? 0), 0)

  const revenueByPayment = appointments.reduce<Record<string, number>>((acc, appointment) => {
    if (!appointment.paymentMethod) return acc
    acc[appointment.paymentMethod] = (acc[appointment.paymentMethod] ?? 0) + (appointment.totalValue ?? 0)
    return acc
  }, {})

  const revenueByBarber = appointments.reduce<
    Record<
      string,
      {
        barberId: string
        barberName: string
        totalRevenue: number
        totalAppointments: number
      }
    >
  >((acc, appointment) => {
    const key = appointment.barberId
    if (!acc[key]) {
      acc[key] = {
        barberId: appointment.barberId,
        barberName: appointment.barber.name,
        totalRevenue: 0,
        totalAppointments: 0
      }
    }
    acc[key].totalRevenue += appointment.totalValue ?? 0
    acc[key].totalAppointments += 1
    return acc
  }, {})

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
      revenueByBarber: Object.values(revenueByBarber),
      revenueTrend
    }
  })
}

