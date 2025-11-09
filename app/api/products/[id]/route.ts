import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mock-db"
import { getCurrentSession } from "@/lib/auth"
import { productUpdateSchema } from "@/lib/validations/product"

type RouteContext = {
  params: {
    id: string
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const body = await request.json()
    const data = productUpdateSchema.parse(body)

    const db = getDb()
    const productIndex = db.products.findIndex(
      p => p.id === params.id && p.barbershopId === "barbershop-1"
    )

    if (productIndex === -1) {
      return NextResponse.json({ success: false, error: "Produto não encontrado" }, { status: 404 })
    }

    const product = db.products[productIndex]

    if (data.name !== undefined) product.name = data.name
    if (data.stock !== undefined) product.stock = data.stock
    if (data.minStock !== undefined) product.minStock = data.minStock
    if (data.salePrice !== undefined) product.salePrice = data.salePrice
    if (data.isActive !== undefined) product.isActive = data.isActive
    product.updatedAt = new Date()

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

export async function DELETE(request: Request, { params }: RouteContext) {
  const db = getDb()
  const productIndex = db.products.findIndex(
    p => p.id === params.id && p.barbershopId === "barbershop-1"
  )

  if (productIndex === -1) {
    return NextResponse.json({ success: false, error: "Produto não encontrado" }, { status: 404 })
  }

  db.products[productIndex].isActive = false
  db.products[productIndex].updatedAt = new Date()

  return NextResponse.json({ success: true })
}
