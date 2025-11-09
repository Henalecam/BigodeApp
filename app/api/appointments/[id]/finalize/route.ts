import { NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/mock-db"
import { appointmentFinalizeSchema } from "@/lib/validations/appointment"
import { getCurrentSession } from "@/lib/auth"

type RouteContext = {
  params: {
    id: string
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const body = await request.json()
    const data = appointmentFinalizeSchema.parse(body)

    const db = getDb()
    const appointmentIndex = db.appointments.findIndex(
      a => a.id === params.id && a.barbershopId === "barbershop-1"
    )

    if (appointmentIndex === -1) {
      return NextResponse.json({ success: false, error: "Agendamento não encontrado" }, { status: 404 })
    }

    const appointment = db.appointments[appointmentIndex]

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
    const services = db.services.filter(
      s => serviceIds.includes(s.id) && s.barbershopId === "barbershop-1"
    )

    if (services.length !== data.services.length) {
      return NextResponse.json(
        { success: false, error: "Serviço inválido" },
        { status: 400 }
      )
    }

    const productIds = data.products?.map(product => product.id) ?? []
    const products = db.products.filter(
      p => productIds.includes(p.id) && p.barbershopId === "barbershop-1" && p.isActive
    )

    if (productIds.length && products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, error: "Produto inválido" },
        { status: 400 }
      )
    }

    if (data.products) {
      for (const product of data.products) {
        const dbProduct = db.products.find(p => p.id === product.id)
        if (!dbProduct || dbProduct.stock < product.quantity) {
          return NextResponse.json(
            { success: false, error: "Estoque insuficiente" },
            { status: 400 }
          )
        }
      }
    }

    const barber = db.barbers.find(b => b.id === appointment.barberId)!
    const commission = (data.totalValue * barber.commissionRate) / 100

    appointment.status = "COMPLETED"
    appointment.totalValue = data.totalValue
    appointment.paymentMethod = data.paymentMethod
    appointment.updatedAt = new Date()

    db.appointmentServices = db.appointmentServices.filter(as => as.appointmentId !== appointment.id)
    data.services.forEach(service => {
      db.appointmentServices.push({
        appointmentId: appointment.id,
        serviceId: service.id,
        price: service.price
      })
    })

    db.appointmentProducts = db.appointmentProducts.filter(ap => ap.appointmentId !== appointment.id)
    if (data.products) {
      data.products.forEach(product => {
        const dbProduct = db.products.find(p => p.id === product.id)!
        dbProduct.stock -= product.quantity
        dbProduct.updatedAt = new Date()

        db.appointmentProducts.push({
          appointmentId: appointment.id,
          productId: product.id,
          quantity: product.quantity,
          unitPrice: product.unitPrice
        })
      })
    }

    const result = {
      ...appointment,
      client: db.clients.find(c => c.id === appointment.clientId)!,
      barber,
      services: db.appointmentServices
        .filter(as => as.appointmentId === appointment.id)
        .map(as => ({
          appointmentId: as.appointmentId,
          serviceId: as.serviceId,
          price: as.price,
          service: db.services.find(s => s.id === as.serviceId)!
        })),
      products: db.appointmentProducts
        .filter(ap => ap.appointmentId === appointment.id)
        .map(ap => ({
          appointmentId: ap.appointmentId,
          productId: ap.productId,
          quantity: ap.quantity,
          unitPrice: ap.unitPrice,
          product: db.products.find(p => p.id === ap.productId)!
        }))
    }

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
