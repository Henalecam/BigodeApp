import { NextResponse } from "next/server"
import { z } from "zod"
import { getCurrentSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { profileSettingsSchema } from "@/lib/validations/settings"

export async function PATCH(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = profileSettingsSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "Usuário não encontrado" }, { status: 404 })
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name
      },
      select: {
        id: true,
        name: true,
        email: true
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




