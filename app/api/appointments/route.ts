import { NextResponse } from "next/server"
import { parseISO, startOfDay, endOfDay, isBefore } from "date-fns"
import { z } from "zod"
import { getDb, generateId, AppointmentStatus } from "@/lib/mock-db"
import { appointmentCreateSchema } from "@/lib/validations/appointment"
import { getCurrentSession } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")
  const barberId = searchParams.get("barberId")
  const status = searchParams.get("status")

  const db = getDb()
  let appointments = db.appointments.filter(a => a.barbershopId === session.user.barbershopId)

  if (status && ["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)) {
    appointments = appointments.filter(a => a.status === status)
  }

  if (barberId) {
    appointments = appointments.filter(a => a.barberId === barberId)
  }

  if (date) {
    const parsedDate = parseISO(date)
    const start = startOfDay(parsedDate)
    const end = endOfDay(parsedDate)
    appointments = appointments.filter(a => a.date >= start && a.date <= end)
  }

  const result = appointments
    .map(appointment => ({
      ...appointment,
      client: db.clients.find(c => c.id === appointment.clientId)!,
      barber: db.barbers.find(b => b.id === appointment.barberId)!,
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
    }))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  return NextResponse.json({ success: true, data: result })
}

export async function POST(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = appointmentCreateSchema.parse(body)

    const appointmentDate = parseISO(data.date)
    const now = new Date()
    const startDateTime = new Date(appointmentDate)
    const [startHour, startMinute] = data.startTime.split(":").map(Number)
    startDateTime.setHours(startHour, startMinute, 0, 0)

    if (isBefore(startDateTime, now)) {
      return NextResponse.json(
        { success: false, error: "Não é possível agendar em horários passados" },
        { status: 400 }
      )
    }

    const db = getDb()
    const barber = db.barbers.find(
      b => b.id === data.barberId && b.barbershopId === session.user.barbershopId && b.isActive
    )

    if (!barber) {
      return NextResponse.json(
        { success: false, error: "Barbeiro não encontrado ou inativo" },
        { status: 404 }
      )
    }

    const services = db.services.filter(
      s => data.serviceIds.includes(s.id) && s.barbershopId === session.user.barbershopId && s.isActive
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
    const barberHasAll = services.every(service => barberServiceIds.has(service.id))
    if (!barberHasAll) {
      return NextResponse.json(
        { success: false, error: "Barbeiro não executa todos os serviços escolhidos" },
        { status: 400 }
      )
    }

    const serviceDuration = services.reduce((total, service) => total + service.duration, 0)
    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(startDateTime.getMinutes() + serviceDuration)
    const endTime = `${String(endDateTime.getHours()).padStart(2, "0")}:${String(
      endDateTime.getMinutes()
    ).padStart(2, "0")}`

    const dayOfWeek = startDateTime.getDay()
    const workingHour = db.workingHours.find(
      slot => slot.barberId === barber.id && slot.dayOfWeek === dayOfWeek && slot.isActive
    )
    if (!workingHour) {
      return NextResponse.json(
        { success: false, error: "Barbeiro não atende neste dia" },
        { status: 400 }
      )
    }

    if (workingHour.startTime > data.startTime || workingHour.endTime < endTime) {
      return NextResponse.json(
        { success: false, error: "Horário fora da jornada do barbeiro" },
        { status: 400 }
      )
    }

    const start = startOfDay(appointmentDate)
    const end = endOfDay(appointmentDate)
    const conflicting = db.appointments.find(a => {
      if (a.barbershopId !== session.user.barbershopId) return false
      if (a.barberId !== data.barberId) return false
      if (a.date < start || a.date > end) return false
      if (!["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(a.status)) return false
      return !(a.endTime <= data.startTime || a.startTime >= endTime)
    })

    if (conflicting) {
      return NextResponse.json(
        { success: false, error: "Este horário já está ocupado" },
        { status: 409 }
      )
    }

    let clientId = data.clientId
    if (!clientId && data.newClient) {
      clientId = generateId()
      db.clients.push({
        id: clientId,
        name: data.newClient.name,
        phone: data.newClient.phone,
        email: data.newClient.email,
        notes: data.newClient.notes,
        barbershopId: session.user.barbershopId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Cliente inválido" },
        { status: 400 }
      )
    }

    const appointmentId = generateId()

    const appointment = {
      id: appointmentId,
      date: appointmentDate,
      startTime: data.startTime,
      endTime,
      status: "CONFIRMED" as AppointmentStatus,
      notes: data.notes,
      clientId,
      barberId: data.barberId,
      barbershopId: session.user.barbershopId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    db.appointments.push(appointment)

    services.forEach(service => {
      db.appointmentServices.push({
        appointmentId,
        serviceId: service.id,
        price: service.price
      })
    })

    const result = {
      ...appointment,
      client: db.clients.find(c => c.id === clientId)!,
      barber,
      services: db.appointmentServices
        .filter(as => as.appointmentId === appointmentId)
        .map(as => ({
          appointmentId: as.appointmentId,
          serviceId: as.serviceId,
          price: as.price,
          service: db.services.find(s => s.id === as.serviceId)!
        })),
      products: []
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
