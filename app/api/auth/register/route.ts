import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

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

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email já cadastrado" },
        { status: 400 }
      )
    }

    const passwordHash = await hash(data.password, 10)

    const barbershop = await prisma.barbershop.create({
      data: {
        name: data.barbershopName,
        phone: data.barbershopPhone,
        address: data.barbershopAddress
      }
    })

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: passwordHash,
        barbershopId: barbershop.id
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        barbershopId: barbershop.id
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

