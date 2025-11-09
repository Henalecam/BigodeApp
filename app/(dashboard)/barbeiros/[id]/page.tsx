import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { getDb } from "@/lib/mock-db"
import { BarberDetail } from "@/components/barbers/BarberDetail"

type PageProps = {
  params: {
    id: string
  }
}

export default async function BarberDetailPage({ params }: PageProps) {
  const session = await getCurrentSession()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/barbeiros")
  }

  const db = getDb()
  const barber = db.barbers.find(
    b => b.id === params.id && b.barbershopId === session.user.barbershopId
  )

  if (!barber) {
    redirect("/barbeiros")
  }

  const barberWithRelations = {
    ...barber,
    workingHours: db.workingHours.filter(wh => wh.barberId === barber.id),
    barberServices: db.barberServices
      .filter(bs => bs.barberId === barber.id)
      .map(bs => ({
        barberId: bs.barberId,
        serviceId: bs.serviceId,
        service: db.services.find(s => s.id === bs.serviceId)!
      }))
  }

  const services = db.services
    .filter(s => s.barbershopId === session.user.barbershopId && s.isActive)
    .sort((a, b) => a.name.localeCompare(b.name))

  const formattedServices = services.map(service => ({
    id: service.id,
    name: service.name
  }))

  return <BarberDetail barber={barberWithRelations} services={formattedServices} />
}

