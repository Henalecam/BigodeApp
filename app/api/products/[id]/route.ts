import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/auth"
import { productUpdateSchema } from "@/lib/validations/product"

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
    const data = productUpdateSchema.parse(body)

    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        barbershopId: session.user.barbershopId
      }
    })

    if (!product) {
      return NextResponse.json({ success: false, error: "Produto não encontrado" }, { status: 404 })
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: data.name ?? product.name,
        stock: data.stock ?? product.stock,
        minStock: data.minStock ?? product.minStock,
        salePrice: data.salePrice ?? product.salePrice,
        isActive: data.isActive ?? product.isActive
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

  const product = await prisma.product.findFirst({
    where: { id: params.id, barbershopId: session.user.barbershopId }
  })

  if (!product) {
    return NextResponse.json({ success: false, error: "Produto não encontrado" }, { status: 404 })
  }

  await prisma.product.update({
    where: { id: params.id },
    data: {
      isActive: false
    }
  })

  return NextResponse.json({ success: true })
}

