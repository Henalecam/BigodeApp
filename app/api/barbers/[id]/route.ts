import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb, generateId } from "@/lib/mock-db"
import { getCurrentSession } from "@/lib/auth"
import { barberUpdateSchema } from "@/lib/validations/barber"

type RouteContext = {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: RouteContext) {
  const db = getDb()
  const barber = db.barbers.find(
    b => b.id === params.id && b.barbershopId === "barbershop-1"
  )

  if (!barber) {
    return NextResponse.json({ success: false, error: "Barbeiro não encontrado" }, { status: 404 })
  }

  const result = {
    ...barber,
    workingHours: db.workingHours.filter(wh => wh.barberId === barber.id),
    barberServices: db.barberServices
      .filter(bs => bs.barberId === barber.id)
      .map(bs => ({
        barberId: bs.barberId,
        serviceId: bs.serviceId,
        service: db.services.find(s => s.id === bs.serviceId)!
      }))
  }

  return NextResponse.json({ success: true, data: result })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const body = await request.json()
    const data = barberUpdateSchema.parse(body)

    const db = getDb()
    const barberIndex = db.barbers.findIndex(
      b => b.id === params.id && b.barbershopId === "barbershop-1"
    )

    if (barberIndex === -1) {
      return NextResponse.json({ success: false, error: "Barbeiro não encontrado" }, { status: 404 })
    }

    if (data.serviceIds) {
      const services = db.services.filter(
        s => data.serviceIds!.includes(s.id) && s.barbershopId === "barbershop-1"
      )
      if (services.length !== data.serviceIds.length) {
        return NextResponse.json(
          { success: false, error: "Serviço inválido" },
          { status: 400 }
        )
      }
    }

    const barber = db.barbers[barberIndex]
    
    if (data.name !== undefined) barber.name = data.name
    if (data.phone !== undefined) barber.phone = data.phone
    if (data.commissionRate !== undefined) barber.commissionRate = data.commissionRate
    if (data.isActive !== undefined) barber.isActive = data.isActive
    barber.updatedAt = new Date()

      if (data.workingHours) {
      db.workingHours = db.workingHours.filter(wh => wh.barberId !== params.id)
      data.workingHours.forEach(hour => {
        db.workingHours.push({
          id: generateId(),
            barberId: params.id,
            dayOfWeek: hour.dayOfWeek,
            startTime: hour.startTime,
            endTime: hour.endTime,
            isActive: hour.isActive ?? true
        })
        })
      }

      if (data.serviceIds) {
      db.barberServices = db.barberServices.filter(bs => bs.barberId !== params.id)
      data.serviceIds.forEach(serviceId => {
        db.barberServices.push({
            barberId: params.id,
            serviceId
        })
        })
      }

    const result = {
      ...barber,
      workingHours: db.workingHours.filter(wh => wh.barberId === barber.id),
      barberServices: db.barberServices
        .filter(bs => bs.barberId === barber.id)
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

export async function DELETE(request: Request, { params }: RouteContext) {
  const db = getDb()
  const barberIndex = db.barbers.findIndex(
    b => b.id === params.id && b.barbershopId === "barbershop-1"
  )

  if (barberIndex === -1) {
    return NextResponse.json({ success: false, error: "Barbeiro não encontrado" }, { status: 404 })
  }

  db.barbers[barberIndex].isActive = false
  db.barbers[barberIndex].updatedAt = new Date()

  return NextResponse.json({ success: true })
}
