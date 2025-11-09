import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb, generateId } from "@/lib/mock-db"
import { getCurrentSession } from "@/lib/auth"
import { productCreateSchema } from "@/lib/validations/product"

export async function GET() {
  const db = getDb()
  const products = db.products
    .filter(p => p.barbershopId === "barbershop-1")
    .sort((a, b) => a.name.localeCompare(b.name))

  return NextResponse.json({ success: true, data: products })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = productCreateSchema.parse(body)

    const db = getDb()
    const product = {
      id: generateId(),
      name: data.name,
      stock: data.stock,
      minStock: data.minStock,
      salePrice: data.salePrice,
      isActive: data.isActive ?? true,
      barbershopId: "barbershop-1",
      createdAt: new Date(),
      updatedAt: new Date()
    }

    db.products.push(product)

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
