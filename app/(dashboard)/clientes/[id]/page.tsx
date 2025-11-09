import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { getDb } from "@/lib/mock-db"
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

  const db = getDb()
  const client = db.clients.find(
    c => c.id === params.id && c.barbershopId === session.user.barbershopId
  )

  if (!client) {
    redirect("/clientes")
  }

  const appointments = db.appointments
    .filter(a => a.clientId === client.id)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map(appointment => {
      const barber = db.barbers.find(b => b.id === appointment.barberId)!
      const services = db.appointmentServices
        .filter(as => as.appointmentId === appointment.id)
        .map(as => ({
          appointmentId: as.appointmentId,
          serviceId: as.serviceId,
          price: as.price,
          service: db.services.find(s => s.id === as.serviceId)!
        }))

      return {
        id: appointment.id,
        date: appointment.date.toISOString(),
        barberName: barber.name,
        services: services.map(s => s.service.name),
        total: appointment.totalValue ?? services.reduce((total, s) => total + s.price, 0)
      }
    })

  const formatted = {
    id: client.id,
    name: client.name,
    phone: client.phone,
    email: client.email,
    notes: client.notes,
    totalSpent: appointments.reduce((total, a) => total + a.total, 0),
    appointments
  }

  return <ClientDetail client={formatted} />
}

