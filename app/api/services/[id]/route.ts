import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mock-db"
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

    const db = getDb()
    const serviceIndex = db.services.findIndex(
      s => s.id === params.id && s.barbershopId === session.user.barbershopId
    )

    if (serviceIndex === -1) {
      return NextResponse.json({ success: false, error: "Serviço não encontrado" }, { status: 404 })
    }

    const service = db.services[serviceIndex]

    if (data.name !== undefined) service.name = data.name
    if (data.duration !== undefined) service.duration = data.duration
    if (data.price !== undefined) service.price = data.price
    if (data.isActive !== undefined) service.isActive = data.isActive
    service.updatedAt = new Date()

    return NextResponse.json({ success: true, data: service })
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

  const db = getDb()
  const serviceIndex = db.services.findIndex(
    s => s.id === params.id && s.barbershopId === session.user.barbershopId
  )

  if (serviceIndex === -1) {
    return NextResponse.json({ success: false, error: "Serviço não encontrado" }, { status: 404 })
  }

  db.services[serviceIndex].isActive = false
  db.services[serviceIndex].updatedAt = new Date()

  return NextResponse.json({ success: true })
}
