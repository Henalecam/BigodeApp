import { NextResponse } from "next/server"
import { parseISO, startOfDay, endOfDay, isBefore } from "date-fns"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { appointmentUpdateSchema } from "@/lib/validations/appointment"
import { getCurrentSession } from "@/lib/auth"

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

  const appointment = await prisma.appointment.findFirst({
    where: { id: params.id, barbershopId: session.user.barbershopId },
    include: {
      client: true,
      barber: {
        include: {
          workingHours: true,
          barberServices: {
            include: {
              service: true
            }
          }
        }
      },
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

  if (!appointment) {
    return NextResponse.json({ success: false, error: "Agendamento não encontrado" }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: appointment })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getCurrentSession()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = appointmentUpdateSchema.parse(body)

    const appointment = await prisma.appointment.findFirst({
      where: { id: params.id, barbershopId: session.user.barbershopId },
      include: {
        services: {
          include: {
            service: true
          }
        },
        barber: {
          include: {
            workingHours: true,
            barberServices: true
          }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json({ success: false, error: "Agendamento não encontrado" }, { status: 404 })
    }

    const targetBarberId = data.barberId ?? appointment.barberId
    const barber = await prisma.barber.findFirst({
      where: {
        id: targetBarberId,
        barbershopId: session.user.barbershopId,
        isActive: true
      },
      include: {
        workingHours: true,
        barberServices: true
      }
    })

    if (!barber) {
      return NextResponse.json(
        { success: false, error: "Barbeiro não encontrado" },
        { status: 404 }
      )
    }

    let services = appointment.services.map(item => item.service)
    if (data.serviceIds) {
      services = await prisma.service.findMany({
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
      const hasAll = services.every(service => barberServiceIds.has(service.id))
      if (!hasAll) {
        return NextResponse.json(
          { success: false, error: "Barbeiro não executa todos os serviços" },
          { status: 400 }
        )
      }
    }

    const appointmentDate = appointment.date
    const startTime = data.startTime ?? appointment.startTime
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const startDateTime = new Date(appointmentDate)
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

    const workingHour = barber.workingHours.find(slot => slot.dayOfWeek === startDateTime.getDay() && slot.isActive)
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

    const overlapping = await prisma.appointment.findFirst({
      where: {
        barbershopId: session.user.barbershopId,
        barberId: targetBarberId,
        date: {
          gte: startOfDay(appointmentDate),
          lte: endOfDay(appointmentDate)
        },
        id: { not: appointment.id },
        status: {
          in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"]
        },
        NOT: {
          OR: [
            {
              endTime: {
                lte: startTime
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

    const updated = await prisma.$transaction(async tx => {
      const updatedAppointment = await tx.appointment.update({
        where: { id: appointment.id },
        data: {
          notes: data.notes ?? appointment.notes,
          startTime,
          endTime,
          barberId: targetBarberId,
          status: data.status ?? appointment.status
        }
      })

      if (data.serviceIds) {
        await tx.appointmentService.deleteMany({
          where: { appointmentId: appointment.id }
        })
        await tx.appointmentService.createMany({
          data: services.map(service => ({
            appointmentId: appointment.id,
            serviceId: service.id,
            price: service.price
          }))
        })
      }

      return updatedAppointment
    })

    const result = await prisma.appointment.findUnique({
      where: { id: updated.id },
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
  const session = await getCurrentSession()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id: params.id, barbershopId: session.user.barbershopId }
  })

  if (!appointment) {
    return NextResponse.json({ success: false, error: "Agendamento não encontrado" }, { status: 404 })
  }

  await prisma.appointment.update({
    where: { id: params.id },
    data: {
      status: "CANCELLED"
    }
  })

  return NextResponse.json({ success: true })
}

