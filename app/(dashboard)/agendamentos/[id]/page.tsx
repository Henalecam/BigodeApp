import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AppointmentDetails } from "@/components/appointments/AppointmentDetails"

type PageProps = {
  params: {
    id: string
  }
}

export default async function AppointmentDetailsPage({ params }: PageProps) {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/login")
  }

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: params.id,
      barbershopId: session.user.barbershopId
    },
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

  if (!appointment) {
    redirect("/agendamentos")
  }

  const [services, products] = await Promise.all([
    prisma.service.findMany({
      where: {
        barbershopId: session.user.barbershopId,
        isActive: true
      },
      orderBy: {
        name: "asc"
      }
    }),
    prisma.product.findMany({
      where: {
        barbershopId: session.user.barbershopId,
        isActive: true
      },
      orderBy: {
        name: "asc"
      }
    })
  ])

  const appointmentData = {
    ...appointment,
    date: appointment.date.toISOString()
  }

  const formattedServices = services.map(service => ({
    id: service.id,
    name: service.name,
    price: service.price,
    duration: service.duration
  }))

  const formattedProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    salePrice: product.salePrice,
    stock: product.stock
  }))

  return (
    <AppointmentDetails
      appointment={appointmentData}
      services={formattedServices}
      products={formattedProducts}
      canManage={session.user.role === "ADMIN" || session.user.role === "BARBER"}
    />
  )
}

