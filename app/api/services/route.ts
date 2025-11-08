import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/auth"
import { serviceCreateSchema } from "@/lib/validations/service"

export async function GET() {
  const session = await getCurrentSession()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  const services = await prisma.service.findMany({
    where: {
      barbershopId: session.user.barbershopId
    },
    orderBy: {
      name: "asc"
    }
  })

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

    const service = await prisma.service.create({
      data: {
        name: data.name,
        duration: data.duration,
        price: data.price,
        isActive: data.isActive ?? true,
        barbershopId: session.user.barbershopId
      }
    })

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

