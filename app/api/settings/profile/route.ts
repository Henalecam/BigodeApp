import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mock-db"
import { getCurrentSession } from "@/lib/auth"

const profileSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().min(6).optional(),
  newPassword: z.string().min(6).optional()
})

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const data = profileSchema.parse(body)

    const db = getDb()
    const userIndex = db.users.findIndex(u => u.id === "user-admin-1")

    if (userIndex === -1) {
      return NextResponse.json({ success: false, error: "Usuário não encontrado" }, { status: 404 })
    }

    const user = db.users[userIndex]

    if (data.email && data.email !== user.email) {
      const emailExists = db.users.some(u => u.email === data.email && u.id !== user.id)
      if (emailExists) {
        return NextResponse.json(
          { success: false, error: "Email já está em uso" },
          { status: 400 }
        )
      }
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json(
          { success: false, error: "Senha atual é obrigatória" },
          { status: 400 }
        )
      }
      user.password = data.newPassword
    }

    if (data.name !== undefined) user.name = data.name
    if (data.email !== undefined) user.email = data.email
    user.updatedAt = new Date()

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
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
