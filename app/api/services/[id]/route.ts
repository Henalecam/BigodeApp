import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/auth"
import { serviceUpdateSchema } from "@/lib/validations/service"

type RouteContext = {
  params: {
    id: string
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getCurrentSession()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = serviceUpdateSchema.parse(body)

    const service = await prisma.service.findFirst({
      where: {
        id: params.id,
        barbershopId: session.user.barbershopId
      }
    })

    if (!service) {
      return NextResponse.json({ success: false, error: "Serviço não encontrado" }, { status: 404 })
    }

    const updated = await prisma.service.update({
      where: { id: params.id },
      data: {
        name: data.name ?? service.name,
        duration: data.duration ?? service.duration,
        price: data.price ?? service.price,
        isActive: data.isActive ?? service.isActive
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

export async function DELETE(request: Request, { params }: RouteContext) {
  const session = await getCurrentSession()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  const service = await prisma.service.findFirst({
    where: { id: params.id, barbershopId: session.user.barbershopId }
  })

  if (!service) {
    return NextResponse.json({ success: false, error: "Serviço não encontrado" }, { status: 404 })
  }

  await prisma.service.update({
    where: { id: params.id },
    data: {
      isActive: false
    }
  })

  return NextResponse.json({ success: true })
}

