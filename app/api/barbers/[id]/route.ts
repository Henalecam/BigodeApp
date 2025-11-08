import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/auth"
import { barberUpdateSchema } from "@/lib/validations/barber"

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

  const barber = await prisma.barber.findFirst({
    where: {
      id: params.id,
      barbershopId: session.user.barbershopId
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

  if (!barber) {
    return NextResponse.json({ success: false, error: "Barbeiro não encontrado" }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: barber })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getCurrentSession()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = barberUpdateSchema.parse(body)

    const barber = await prisma.barber.findFirst({
      where: {
        id: params.id,
        barbershopId: session.user.barbershopId
      }
    })

    if (!barber) {
      return NextResponse.json({ success: false, error: "Barbeiro não encontrado" }, { status: 404 })
    }

    if (data.serviceIds) {
      const services = await prisma.service.findMany({
        where: {
          id: { in: data.serviceIds },
          barbershopId: session.user.barbershopId
        }
      })
      if (services.length !== data.serviceIds.length) {
        return NextResponse.json(
          { success: false, error: "Serviço inválido" },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.$transaction(async tx => {
      const updatedBarber = await tx.barber.update({
        where: { id: params.id },
        data: {
          name: data.name ?? barber.name,
          phone: data.phone ?? barber.phone,
          commissionRate: data.commissionRate ?? barber.commissionRate,
          isActive: data.isActive ?? barber.isActive
        }
      })

      if (data.workingHours) {
        await tx.workingHours.deleteMany({
          where: { barberId: params.id }
        })
        await tx.workingHours.createMany({
          data: data.workingHours.map(hour => ({
            barberId: params.id,
            dayOfWeek: hour.dayOfWeek,
            startTime: hour.startTime,
            endTime: hour.endTime,
            isActive: hour.isActive ?? true
          }))
        })
      }

      if (data.serviceIds) {
        await tx.barberService.deleteMany({
          where: { barberId: params.id }
        })
        await tx.barberService.createMany({
          data: data.serviceIds.map(serviceId => ({
            barberId: params.id,
            serviceId
          }))
        })
      }

      return updatedBarber
    })

    const result = await prisma.barber.findUnique({
      where: { id: updated.id },
      include: {
        workingHours: true,
        barberServices: {
          include: {
            service: true
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
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  const barber = await prisma.barber.findFirst({
    where: { id: params.id, barbershopId: session.user.barbershopId }
  })

  if (!barber) {
    return NextResponse.json({ success: false, error: "Barbeiro não encontrado" }, { status: 404 })
  }

  await prisma.barber.update({
    where: { id: params.id },
    data: {
      isActive: false
    }
  })

  return NextResponse.json({ success: true })
}

