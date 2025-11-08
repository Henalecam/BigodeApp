import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AppointmentForm } from "@/components/appointments/AppointmentForm"

export default async function NewAppointmentPage() {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/login")
  }

  const [barbers, services, clients] = await Promise.all([
    prisma.barber.findMany({
      where: {
        barbershopId: session.user.barbershopId,
        isActive: true
      },
      include: {
        workingHours: true,
        barberServices: {
          include: {
            service: true
          }
        }
      },
      orderBy: {
        name: "asc"
      }
    }),
    prisma.service.findMany({
      where: {
        barbershopId: session.user.barbershopId,
        isActive: true
      },
      orderBy: {
        name: "asc"
      }
    }),
    prisma.client.findMany({
      where: {
        barbershopId: session.user.barbershopId
      },
      orderBy: {
        name: "asc"
      },
      take: 30
    })
  ])

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

