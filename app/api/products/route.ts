import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/auth"
import { productCreateSchema } from "@/lib/validations/product"

export async function GET() {
  const session = await getCurrentSession()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  const products = await prisma.product.findMany({
    where: {
      barbershopId: session.user.barbershopId
    },
    orderBy: {
      name: "asc"
    }
  })

  return NextResponse.json({ success: true, data: products })
}

export async function POST(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = productCreateSchema.parse(body)

    const product = await prisma.product.create({
      data: {
        name: data.name,
        stock: data.stock,
        minStock: data.minStock,
        salePrice: data.salePrice,
        isActive: data.isActive ?? true,
        barbershopId: session.user.barbershopId
      }
    })

    return NextResponse.json({ success: true, data: product })
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

