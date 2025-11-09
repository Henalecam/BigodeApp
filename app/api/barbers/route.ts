import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb, generateId } from "@/lib/mock-db"
import { getCurrentSession } from "@/lib/auth"
import { barberCreateSchema } from "@/lib/validations/barber"

export async function GET() {
  const session = await getCurrentSession()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  const db = getDb()
  const barbers = db.barbers
    .filter(b => b.barbershopId === session.user.barbershopId)
    .map(barber => ({
      ...barber,
      workingHours: db.workingHours.filter(wh => wh.barberId === barber.id),
      barberServices: db.barberServices
        .filter(bs => bs.barberId === barber.id)
        .map(bs => ({
          barberId: bs.barberId,
          serviceId: bs.serviceId,
          service: db.services.find(s => s.id === bs.serviceId)!
        }))
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return NextResponse.json({ success: true, data: barbers })
}

export async function POST(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = barberCreateSchema.parse(body)

    const db = getDb()
    const services = db.services.filter(
      s => data.serviceIds.includes(s.id) && s.barbershopId === session.user.barbershopId && s.isActive
    )

    if (services.length !== data.serviceIds.length) {
      return NextResponse.json(
        { success: false, error: "Serviço inválido" },
        { status: 400 }
      )
    }

    const barberId = generateId()

    const barber = {
      id: barberId,
      name: data.name,
      phone: data.phone,
      commissionRate: data.commissionRate,
      isActive: true,
      barbershopId: session.user.barbershopId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    db.barbers.push(barber)

    data.workingHours.forEach(hour => {
      db.workingHours.push({
        id: generateId(),
        barberId,
        dayOfWeek: hour.dayOfWeek,
        startTime: hour.startTime,
        endTime: hour.endTime,
        isActive: hour.isActive ?? true
      })
    })

    data.serviceIds.forEach(serviceId => {
      db.barberServices.push({
        barberId,
        serviceId
      })
    })

    const result = {
      ...barber,
      workingHours: db.workingHours.filter(wh => wh.barberId === barberId),
      barberServices: db.barberServices
        .filter(bs => bs.barberId === barberId)
        .map(bs => ({
          barberId: bs.barberId,
          serviceId: bs.serviceId,
          service: db.services.find(s => s.id === bs.serviceId)!
        }))
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: "Erro inesperado" },
      { status: 500 }
    )
  }
}
