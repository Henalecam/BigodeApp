import { NextResponse } from "next/server"
import { z } from "zod"
import { getCurrentSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { barbershopSettingsSchema } from "@/lib/validations/settings"

export async function PATCH(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = barbershopSettingsSchema.parse(body)

    const barbershop = await prisma.barbershop.findUnique({
      where: { id: session.user.barbershopId }
    })

    if (!barbershop) {
      return NextResponse.json({ success: false, error: "Barbearia não encontrada" }, { status: 404 })
    }

    const updated = await prisma.barbershop.update({
      where: { id: barbershop.id },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      )
    }
    return NextResponse.json({ success: false, error: "Erro inesperado" }, { status: 500 })
  }
}




