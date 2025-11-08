import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/auth"
import { clientCreateSchema } from "@/lib/validations/client"

export async function GET(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query") ?? ""

  const clients = await prisma.client.findMany({
    where: {
      barbershopId: session.user.barbershopId,
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive"
          }
        },
        {
          phone: {
            contains: query,
            mode: "insensitive"
          }
        }
      ]
    },
    include: {
      _count: {
        select: {
          appointments: true
        }
      },
      appointments: {
        orderBy: {
          date: "desc"
        },
        include: {
          barber: true,
          services: {
            include: {
              service: true
            }
          }
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  })

  return NextResponse.json({ success: true, data: clients })
}

export async function POST(request: Request) {
  const session = await getCurrentSession()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = clientCreateSchema.parse(body)

    const client = await prisma.client.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        notes: data.notes,
        barbershopId: session.user.barbershopId
      }
    })

    return NextResponse.json({ success: true, data: client })
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

