import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb, generateId } from "@/lib/mock-db"
import { getCurrentSession } from "@/lib/auth"
import { clientCreateSchema } from "@/lib/validations/client"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query") ?? ""

  const db = getDb()
  const clients = db.clients
    .filter(c => {
      if (c.barbershopId !== "barbershop-1") return false
      if (!query) return true
      const lowerQuery = query.toLowerCase()
      return (
        c.name.toLowerCase().includes(lowerQuery) ||
        c.phone.toLowerCase().includes(lowerQuery)
      )
    })
    .map(client => {
      const clientAppointments = db.appointments
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

      return {
        ...client,
      _count: {
          appointments: clientAppointments.length
      },
        appointments: clientAppointments
            }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  return NextResponse.json({ success: true, data: clients })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = clientCreateSchema.parse(body)

    const db = getDb()
    const client = {
      id: generateId(),
      name: data.name,
      phone: data.phone,
      email: data.email,
      notes: data.notes,
      barbershopId: "barbershop-1",
      createdAt: new Date(),
      updatedAt: new Date()
    }

    db.clients.push(client)

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
