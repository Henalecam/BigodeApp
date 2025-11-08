import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
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

  const client = await prisma.client.findFirst({
    where: {
      id: params.id,
      barbershopId: session.user.barbershopId
    },
    include: {
      appointments: {
        orderBy: {
          date: "desc"
        },
        include: {
          barber: true,
          services: {
            include: {
              service: true
            }
          }
        }
      }
    }
  })

  if (!client) {
    return NextResponse.json({ success: false, error: "Cliente não encontrado" }, { status: 404 })
  }

  const totalSpent = client.appointments.reduce((total, appointment) => total + (appointment.totalValue ?? 0), 0)

  return NextResponse.json({
    success: true,
    data: {
      ...client,
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

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        barbershopId: session.user.barbershopId
      }
    })

    if (!client) {
      return NextResponse.json({ success: false, error: "Cliente não encontrado" }, { status: 404 })
    }

    const updated = await prisma.client.update({
      where: { id: params.id },
      data: {
        name: data.name ?? client.name,
        phone: data.phone ?? client.phone,
        email: data.email ?? client.email,
        notes: data.notes ?? client.notes
      }
    })

    return NextResponse.json({ success: true, data: updated })
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

