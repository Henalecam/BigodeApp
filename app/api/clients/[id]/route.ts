import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mock-db"
import { getCurrentSession } from "@/lib/auth"
import { clientUpdateSchema } from "@/lib/validations/client"

type RouteContext = {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: RouteContext) {
  const session = await getCurrentSession()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  const db = getDb()
  const client = db.clients.find(
    c => c.id === params.id && c.barbershopId === session.user.barbershopId
  )

  if (!client) {
    return NextResponse.json({ success: false, error: "Cliente não encontrado" }, { status: 404 })
  }

  const appointments = db.appointments
    .filter(a => a.clientId === client.id)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map(appointment => ({
      ...appointment,
      barber: db.barbers.find(b => b.id === appointment.barberId)!,
      services: db.appointmentServices
        .filter(as => as.appointmentId === appointment.id)
        .map(as => ({
          appointmentId: as.appointmentId,
          serviceId: as.serviceId,
          price: as.price,
          service: db.services.find(s => s.id === as.serviceId)!
        }))
    }))

  const totalSpent = appointments.reduce((total, a) => total + (a.totalValue ?? 0), 0)

  return NextResponse.json({
    success: true,
    data: {
      ...client,
      appointments,
      totalSpent
    }
  })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getCurrentSession()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = clientUpdateSchema.parse(body)

    const db = getDb()
    const clientIndex = db.clients.findIndex(
      c => c.id === params.id && c.barbershopId === session.user.barbershopId
    )

    if (clientIndex === -1) {
      return NextResponse.json({ success: false, error: "Cliente não encontrado" }, { status: 404 })
    }

    const client = db.clients[clientIndex]

    if (data.name !== undefined) client.name = data.name
    if (data.phone !== undefined) client.phone = data.phone
    if (data.email !== undefined) client.email = data.email
    if (data.notes !== undefined) client.notes = data.notes
    client.updatedAt = new Date()

    return NextResponse.json({ success: true, data: client })
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
