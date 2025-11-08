import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ClientDetail } from "@/components/clients/ClientDetail"

type PageProps = {
  params: {
    id: string
  }
}

export default async function ClientDetailPage({ params }: PageProps) {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/login")
  }

  const client = await prisma.client.findFirst({
    where: {
      id: params.id,
      barbershopId: session.user.barbershopId
    },
    include: {
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
    }
  })

  if (!client) {
    redirect("/clientes")
  }

  const formatted = {
    id: client.id,
    name: client.name,
    phone: client.phone,
    email: client.email,
    notes: client.notes,
    totalSpent: client.appointments.reduce((total, appointment) => total + (appointment.totalValue ?? 0), 0),
    appointments: client.appointments.map(appointment => ({
      id: appointment.id,
      date: appointment.date.toISOString(),
      barberName: appointment.barber.name,
      services: appointment.services.map(item => item.service.name),
      total: appointment.totalValue ?? appointment.services.reduce((total, item) => total + item.price, 0)
    }))
  }

  return <ClientDetail client={formatted} />
}

