import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ClientsScreen } from "@/components/clients/ClientsScreen"

export default async function ClientsPage() {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/login")
  }

  const clients = await prisma.client.findMany({
    where: {
      barbershopId: session.user.barbershopId
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
        select: {
          date: true
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  })

  const formattedClients = clients.map(client => ({
    ...client,
    appointments: client.appointments.map(appointment => ({
      date: appointment.date.toISOString()
    }))
  }))

  return <ClientsScreen initialClients={formattedClients} canManage={session.user.role === "ADMIN"} />
}

