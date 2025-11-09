import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mock-db"
import { getCurrentSession } from "@/lib/auth"

const settingsSchema = z.object({
  name: z.string().min(3).optional(),
  phone: z.string().min(10).optional(),
  address: z.string().min(5).optional()
})

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const data = settingsSchema.parse(body)

    const db = getDb()
    const barbershopIndex = db.barbershops.findIndex(b => b.id === "barbershop-1")

    if (barbershopIndex === -1) {
      return NextResponse.json({ success: false, error: "Barbearia não encontrada" }, { status: 404 })
    }

    const barbershop = db.barbershops[barbershopIndex]

    if (data.name !== undefined) barbershop.name = data.name
    if (data.phone !== undefined) barbershop.phone = data.phone
    if (data.address !== undefined) barbershop.address = data.address
    barbershop.updatedAt = new Date()

    return NextResponse.json({ success: true, data: barbershop })
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
