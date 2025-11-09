import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { getDb } from "@/lib/mock-db"
import { BarbersScreen } from "@/components/barbers/BarbersScreen"

export default async function BarbersPage() {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/login")
  }

  const db = getDb()
  
  const barbers = db.barbers
    .filter(b => b.barbershopId === session.user.barbershopId)
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

  const formattedServices = services.map(service => ({
    id: service.id,
    name: service.name
  }))

  return <BarbersScreen initialBarbers={barbers} services={formattedServices} canManage={session.user.role === "ADMIN"} />
}

