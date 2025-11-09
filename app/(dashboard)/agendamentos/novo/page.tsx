import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { getDb } from "@/lib/mock-db"
import { AppointmentForm } from "@/components/appointments/AppointmentForm"

export default async function NewAppointmentPage() {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/login")
  }

  const db = getDb()
  
  const barbers = db.barbers
    .filter(b => b.barbershopId === session.user.barbershopId && b.isActive)
    .map(barber => ({
      ...barber,
      workingHours: db.workingHours.filter(wh => wh.barberId === barber.id),
      barberServices: db.barberServices
        .filter(bs => bs.barberId === barber.id)
        .map(bs => ({
          barberId: bs.barberId,
          serviceId: bs.serviceId,
          service: db.services.find(s => s.id === bs.serviceId)!
        }))
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const services = db.services
    .filter(s => s.barbershopId === session.user.barbershopId && s.isActive)
    .sort((a, b) => a.name.localeCompare(b.name))

  const clients = db.clients
    .filter(c => c.barbershopId === session.user.barbershopId)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 30)

  const formattedBarbers = barbers.map(barber => ({
    id: barber.id,
    name: barber.name,
    commissionRate: barber.commissionRate,
    workingHours: barber.workingHours,
    services: barber.barberServices.map(item => ({
      service: {
        id: item.serviceId
      }
    }))
  }))

  const formattedServices = services.map(service => ({
    id: service.id,
    name: service.name,
    duration: service.duration,
    price: service.price
  }))

  const formattedClients = clients.map(client => ({
    id: client.id,
    name: client.name,
    phone: client.phone
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Novo agendamento</h1>
        <p className="text-sm text-neutral-500">Preencha as etapas para criar um novo atendimento</p>
      </div>
      <AppointmentForm barbers={formattedBarbers} services={formattedServices} clients={formattedClients} />
    </div>
  )
}

