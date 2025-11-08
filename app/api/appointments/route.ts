import { NextResponse } from "next/server"
import { parseISO, startOfDay, endOfDay, isBefore } from "date-fns"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
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

  const filters: Prisma.AppointmentWhereInput = {
    barbershopId: session.user.barbershopId
  }

  if (status) {
    filters.status = status
  }

  if (barberId) {
    filters.barberId = barberId
  }

  if (date) {
    const parsedDate = parseISO(date)
    filters.date = {
      gte: startOfDay(parsedDate),
      lte: endOfDay(parsedDate)
    }
  }

  const appointments = await prisma.appointment.findMany({
    where: filters,
    orderBy: {
      startTime: "asc"
    },
    include: {
      client: true,
      barber: true,
      services: {
        include: {
          service: true
        }
      },
      products: {
        include: {
          product: true
        }
      }
    }
  })

  return NextResponse.json({ success: true, data: appointments })
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

    const barber = await prisma.barber.findFirst({
      where: {
        id: data.barberId,
        barbershopId: session.user.barbershopId,
        isActive: true
      },
      include: {
        barberServices: true,
        workingHours: true
      }
    })
    if (!barber) {
      return NextResponse.json(
        { success: false, error: "Barbeiro não encontrado ou inativo" },
        { status: 404 }
      )
    }

    const services = await prisma.service.findMany({
      where: {
        id: { in: data.serviceIds },
        barbershopId: session.user.barbershopId,
        isActive: true
      }
    })

    if (services.length !== data.serviceIds.length) {
      return NextResponse.json(
        { success: false, error: "Serviço inválido" },
        { status: 400 }
      )
    }

    const barberServiceIds = new Set(barber.barberServices.map(item => item.serviceId))
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
    const workingHour = barber.workingHours.find(
      slot => slot.dayOfWeek === dayOfWeek && slot.isActive
    )
    if (!workingHour) {
      return NextResponse.json(
        { success: false, error: "Barbeiro não atende neste dia" },
        { status: 400 }
      )
    }

    if (
      workingHour.startTime > data.startTime ||
      workingHour.endTime < endTime
    ) {
      return NextResponse.json(
        { success: false, error: "Horário fora da jornada do barbeiro" },
        { status: 400 }
      )
    }

    const conflicting = await prisma.appointment.findFirst({
      where: {
        barbershopId: session.user.barbershopId,
        barberId: data.barberId,
        date: {
          gte: startOfDay(appointmentDate),
          lte: endOfDay(appointmentDate)
        },
        status: {
          in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"]
        },
        NOT: {
          OR: [
            {
              endTime: {
                lte: data.startTime
              }
            },
            {
              startTime: {
                gte: endTime
              }
            }
          ]
        }
      }
    })

    if (conflicting) {
      return NextResponse.json(
        { success: false, error: "Este horário já está ocupado" },
        { status: 409 }
      )
    }

    let clientId = data.clientId
    if (!clientId && data.newClient) {
      const client = await prisma.client.create({
        data: {
          name: data.newClient.name,
          phone: data.newClient.phone,
          email: data.newClient.email,
          notes: data.newClient.notes,
          barbershopId: session.user.barbershopId
        }
      })
      clientId = client.id
    }

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Cliente inválido" },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        startTime: data.startTime,
        endTime,
        status: "CONFIRMED",
        notes: data.notes,
        clientId,
        barberId: data.barberId,
        barbershopId: session.user.barbershopId,
        services: {
          create: services.map(service => ({
            serviceId: service.id,
            price: service.price
          }))
        }
      },
      include: {
        client: true,
        barber: true,
        services: {
          include: {
            service: true
          }
        },
        products: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: appointment })
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

