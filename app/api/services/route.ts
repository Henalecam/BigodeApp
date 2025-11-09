import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb, generateId } from "@/lib/mock-db"
import { getCurrentSession } from "@/lib/auth"
import { serviceCreateSchema } from "@/lib/validations/service"

export async function GET() {
  const session = await getCurrentSession()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  const db = getDb()
  const services = db.services
    .filter(s => s.barbershopId === session.user.barbershopId)
    .sort((a, b) => a.name.localeCompare(b.name))

  return NextResponse.json({ success: true, data: services })
}

export async function POST(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = serviceCreateSchema.parse(body)

    const db = getDb()
    const service = {
      id: generateId(),
      name: data.name,
      duration: data.duration,
      price: data.price,
      isActive: data.isActive ?? true,
      barbershopId: session.user.barbershopId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    db.services.push(service)

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
