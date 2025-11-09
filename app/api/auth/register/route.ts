import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb, generateId } from "@/lib/mock-db"

const registerSchema = z.object({
  barbershopName: z.string().min(3),
  barbershopPhone: z.string().min(10),
  barbershopAddress: z.string().min(5),
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    const db = getDb()
    const existingUser = db.users.find(u => u.email === data.email)
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email já cadastrado" },
        { status: 400 }
      )
    }

    const barbershopId = generateId()
    const userId = generateId()

    db.barbershops.push({
      id: barbershopId,
      name: data.barbershopName,
      phone: data.barbershopPhone,
      address: data.barbershopAddress,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    db.users.push({
      id: userId,
      email: data.email,
      password: data.password,
      name: data.name,
      role: "ADMIN",
      barbershopId,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      data: {
        userId,
        barbershopId
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message ?? "Dados inválidos" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: "Erro inesperado" },
      { status: 500 }
    )
  }
}

