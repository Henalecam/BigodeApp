import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { appointmentFinalizeSchema } from "@/lib/validations/appointment"
import { getCurrentSession } from "@/lib/auth"

type RouteContext = {
  params: {
    id: string
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getCurrentSession()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = appointmentFinalizeSchema.parse(body)

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        barbershopId: session.user.barbershopId
      },
      include: {
        barber: true
      }
    })

    if (!appointment) {
      return NextResponse.json({ success: false, error: "Agendamento não encontrado" }, { status: 404 })
    }

    if (appointment.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "Não é possível finalizar um agendamento cancelado" },
        { status: 400 }
      )
    }

    if (appointment.status === "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Agendamento já finalizado" },
        { status: 400 }
      )
    }

    const serviceIds = data.services.map(service => service.id)
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        barbershopId: session.user.barbershopId
      }
    })

    if (services.length !== data.services.length) {
      return NextResponse.json(
        { success: false, error: "Serviço inválido" },
        { status: 400 }
      )
    }

    const productIds = data.products?.map(product => product.id) ?? []
    const products = productIds.length
      ? await prisma.product.findMany({
          where: {
            id: { in: productIds },
            barbershopId: session.user.barbershopId,
            isActive: true
          }
        })
      : []

    if (productIds.length && products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, error: "Produto inválido" },
        { status: 400 }
      )
    }

    const productStockMap = new Map(products.map(product => [product.id, product.stock]))
    if (data.products) {
      for (const product of data.products) {
        const stock = productStockMap.get(product.id)
        if (stock === undefined || stock < product.quantity) {
          return NextResponse.json(
            { success: false, error: "Estoque insuficiente" },
            { status: 400 }
          )
        }
      }
    }

    const commission = (data.totalValue * appointment.barber.commissionRate) / 100

    await prisma.$transaction(async tx => {
      await tx.appointment.update({
        where: { id: appointment.id },
        data: {
          status: "COMPLETED",
          totalValue: data.totalValue,
          paymentMethod: data.paymentMethod
        }
      })

      await tx.appointmentService.deleteMany({
        where: { appointmentId: appointment.id }
      })

      await tx.appointmentService.createMany({
        data: data.services.map(service => ({
          appointmentId: appointment.id,
          serviceId: service.id,
          price: service.price
        }))
      })

      await tx.appointmentProduct.deleteMany({
        where: { appointmentId: appointment.id }
      })

      if (data.products?.length) {
        for (const product of data.products) {
          await tx.product.update({
            where: { id: product.id },
            data: {
              stock: { decrement: product.quantity }
            }
          })
        }

        await tx.appointmentProduct.createMany({
          data: data.products.map(product => ({
            appointmentId: appointment.id,
            productId: product.id,
            quantity: product.quantity,
            unitPrice: product.unitPrice
          }))
        })
      }
    })

    const result = await prisma.appointment.findUnique({
      where: { id: appointment.id },
      include: {
        client: true,
        barber: true,
        services: {
          include: {
            service: true
          }
        },
        products: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        appointment: result,
        commission
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

