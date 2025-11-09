import { NextResponse } from "next/server"
import { parseISO, startOfMonth, endOfDay } from "date-fns"
import { getDb } from "@/lib/mock-db"
import { getCurrentSession } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const startParam = searchParams.get("start")
  const endParam = searchParams.get("end")
  const barberId = searchParams.get("barberId")

  const startDate = startParam ? parseISO(startParam) : startOfMonth(new Date())
  const endDate = endParam ? endOfDay(parseISO(endParam)) : endOfDay(new Date())

  const db = getDb()
  let appointments = db.appointments.filter(
    a =>
      a.barbershopId === session.user.barbershopId &&
      a.status === "COMPLETED" &&
      a.date >= startDate &&
      a.date <= endDate
  )

  if (barberId) {
    appointments = appointments.filter(a => a.barberId === barberId)
  }

  const resultMap = new Map<
    string,
    {
      barberId: string
      barberName: string
      commissionRate: number
      totalAppointments: number
      totalRevenue: number
    }
  >()

  appointments.forEach(appointment => {
    const barber = db.barbers.find(b => b.id === appointment.barberId)!
    const item = resultMap.get(appointment.barberId) ?? {
      barberId: appointment.barberId,
      barberName: barber.name,
      commissionRate: barber.commissionRate,
      totalAppointments: 0,
      totalRevenue: 0
    }
    item.totalAppointments += 1
    item.totalRevenue += appointment.totalValue ?? 0
    resultMap.set(appointment.barberId, item)
  })

  const data = Array.from(resultMap.values()).map(item => ({
    barberId: item.barberId,
    barberName: item.barberName,
    totalAppointments: item.totalAppointments,
    totalRevenue: item.totalRevenue,
    commissionRate: item.commissionRate,
    commissionValue: (item.totalRevenue * item.commissionRate) / 100
  }))

  return NextResponse.json({
    success: true,
    data
  })
}
