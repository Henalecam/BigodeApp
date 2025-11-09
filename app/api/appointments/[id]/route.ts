import { NextResponse } from "next/server"
import { parseISO, startOfDay, endOfDay, isBefore } from "date-fns"
import { z } from "zod"
import { getDb } from "@/lib/mock-db"
import { appointmentUpdateSchema } from "@/lib/validations/appointment"
import { getCurrentSession } from "@/lib/auth"

type RouteContext = {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: RouteContext) {
  const db = getDb()
  const appointment = db.appointments.find(
    a => a.id === params.id && a.barbershopId === "barbershop-1"
  )

  if (!appointment) {
    return NextResponse.json({ success: false, error: "Agendamento não encontrado" }, { status: 404 })
  }

  const result = {
    ...appointment,
    client: db.clients.find(c => c.id === appointment.clientId)!,
    barber: {
      ...db.barbers.find(b => b.id === appointment.barberId)!,
      workingHours: db.workingHours.filter(wh => wh.barberId === appointment.barberId),
      barberServices: db.barberServices
        .filter(bs => bs.barberId === appointment.barberId)
        .map(bs => ({
          barberId: bs.barberId,
          serviceId: bs.serviceId,
          service: db.services.find(s => s.id === bs.serviceId)!
        }))
    },
    services: db.appointmentServices
      .filter(as => as.appointmentId === appointment.id)
      .map(as => ({
        appointmentId: as.appointmentId,
        serviceId: as.serviceId,
        price: as.price,
        service: db.services.find(s => s.id === as.serviceId)!
      })),
    products: db.appointmentProducts
      .filter(ap => ap.appointmentId === appointment.id)
      .map(ap => ({
        appointmentId: ap.appointmentId,
        productId: ap.productId,
        quantity: ap.quantity,
        unitPrice: ap.unitPrice,
        product: db.products.find(p => p.id === ap.productId)!
      }))
  }

  return NextResponse.json({ success: true, data: result })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const body = await request.json()
    const data = appointmentUpdateSchema.parse(body)

    const db = getDb()
    const appointmentIndex = db.appointments.findIndex(
      a => a.id === params.id && a.barbershopId === "barbershop-1"
    )

    if (appointmentIndex === -1) {
      return NextResponse.json({ success: false, error: "Agendamento não encontrado" }, { status: 404 })
    }

    const appointment = db.appointments[appointmentIndex]

    const targetBarberId = data.barberId ?? appointment.barberId
    const barber = db.barbers.find(
      b => b.id === targetBarberId && b.barbershopId === "barbershop-1" && b.isActive
    )

    if (!barber) {
      return NextResponse.json(
        { success: false, error: "Barbeiro não encontrado" },
        { status: 404 }
      )
    }

    let services = db.appointmentServices
      .filter(as => as.appointmentId === appointment.id)
      .map(as => db.services.find(s => s.id === as.serviceId)!)

    if (data.serviceIds) {
      services = db.services.filter(
        s => data.serviceIds!.includes(s.id) && s.barbershopId === "barbershop-1" && s.isActive
      )
      if (services.length !== data.serviceIds.length) {
        return NextResponse.json(
          { success: false, error: "Serviço inválido" },
          { status: 400 }
        )
      }
      const barberServiceIds = new Set(
        db.barberServices.filter(bs => bs.barberId === barber.id).map(bs => bs.serviceId)
      )
      const hasAll = services.every(service => barberServiceIds.has(service.id))
      if (!hasAll) {
        return NextResponse.json(
          { success: false, error: "Barbeiro não executa todos os serviços" },
          { status: 400 }
        )
      }
    }

    const startTime = data.startTime ?? appointment.startTime
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const startDateTime = new Date(appointment.date)
    startDateTime.setHours(startHour, startMinute, 0, 0)

    if (isBefore(startDateTime, new Date()) && appointment.status === "CONFIRMED") {
      return NextResponse.json(
        { success: false, error: "Horário não pode ser alterado para o passado" },
        { status: 400 }
      )
    }

    const totalDuration = services.reduce((total, service) => total + service.duration, 0)
    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(startDateTime.getMinutes() + totalDuration)
    const endTime = `${String(endDateTime.getHours()).padStart(2, "0")}:${String(
      endDateTime.getMinutes()
    ).padStart(2, "0")}`

    const workingHour = db.workingHours.find(
      slot => slot.barberId === barber.id && slot.dayOfWeek === startDateTime.getDay() && slot.isActive
    )
    if (!workingHour) {
      return NextResponse.json(
        { success: false, error: "Barbeiro não atende neste dia" },
        { status: 400 }
      )
    }

    if (workingHour.startTime > startTime || workingHour.endTime < endTime) {
      return NextResponse.json(
        { success: false, error: "Horário fora da jornada do barbeiro" },
        { status: 400 }
      )
    }

    const start = startOfDay(appointment.date)
    const end = endOfDay(appointment.date)
    const overlapping = db.appointments.find(a => {
      if (a.id === appointment.id) return false
      if (a.barbershopId !== "barbershop-1") return false
      if (a.barberId !== targetBarberId) return false
      if (a.date < start || a.date > end) return false
      if (!["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(a.status)) return false
      return !(a.endTime <= startTime || a.startTime >= endTime)
    })

    if (overlapping) {
      return NextResponse.json(
        { success: false, error: "Este horário está ocupado" },
        { status: 409 }
      )
    }

    if (data.status) {
      const transitions: Record<string, string[]> = {
        CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
        IN_PROGRESS: ["COMPLETED", "CANCELLED"],
        COMPLETED: [],
        CANCELLED: []
      }
      const allowed = transitions[appointment.status] ?? []
      if (!allowed.includes(data.status) && appointment.status !== data.status) {
        return NextResponse.json(
          { success: false, error: "Transição de status inválida" },
          { status: 400 }
        )
      }
    }

    if (data.notes !== undefined) appointment.notes = data.notes
    appointment.startTime = startTime
    appointment.endTime = endTime
    appointment.barberId = targetBarberId
    if (data.status !== undefined) appointment.status = data.status
    appointment.updatedAt = new Date()

    if (data.serviceIds) {
      db.appointmentServices = db.appointmentServices.filter(as => as.appointmentId !== appointment.id)
      services.forEach(service => {
        db.appointmentServices.push({
          appointmentId: appointment.id,
          serviceId: service.id,
          price: service.price
        })
      })
    }

    const result = {
      ...appointment,
      client: db.clients.find(c => c.id === appointment.clientId)!,
      barber,
      services: db.appointmentServices
        .filter(as => as.appointmentId === appointment.id)
        .map(as => ({
          appointmentId: as.appointmentId,
          serviceId: as.serviceId,
          price: as.price,
          service: db.services.find(s => s.id === as.serviceId)!
        })),
      products: db.appointmentProducts
        .filter(ap => ap.appointmentId === appointment.id)
        .map(ap => ({
          appointmentId: ap.appointmentId,
          productId: ap.productId,
          quantity: ap.quantity,
          unitPrice: ap.unitPrice,
          product: db.products.find(p => p.id === ap.productId)!
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
  const appointmentIndex = db.appointments.findIndex(
    a => a.id === params.id && a.barbershopId === "barbershop-1"
  )

  if (appointmentIndex === -1) {
    return NextResponse.json({ success: false, error: "Agendamento não encontrado" }, { status: 404 })
  }

  db.appointments[appointmentIndex].status = "CANCELLED"
  db.appointments[appointmentIndex].updatedAt = new Date()

  return NextResponse.json({ success: true })
}
