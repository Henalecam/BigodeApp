import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/auth"
import { barberCreateSchema } from "@/lib/validations/barber"

export async function GET() {
  const session = await getCurrentSession()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  const barbers = await prisma.barber.findMany({
    where: {
      barbershopId: session.user.barbershopId
    },
    include: {
      workingHours: true,
      barberServices: {
        include: {
          service: true
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  })

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

    const barber = await prisma.barber.create({
      data: {
        name: data.name,
        phone: data.phone,
        commissionRate: data.commissionRate,
        barbershopId: session.user.barbershopId,
        workingHours: {
          create: data.workingHours.map(hour => ({
            dayOfWeek: hour.dayOfWeek,
            startTime: hour.startTime,
            endTime: hour.endTime,
            isActive: hour.isActive ?? true
          }))
        },
        barberServices: {
          create: data.serviceIds.map(serviceId => ({
            serviceId
          }))
        }
      },
      include: {
        workingHours: true,
        barberServices: {
          include: {
            service: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: barber })
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

