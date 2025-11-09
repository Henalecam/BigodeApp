import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { getDb } from "@/lib/mock-db"
import { ServicesScreen } from "@/components/services/ServicesScreen"

export default async function ServicesPage() {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/login")
  }

  const db = getDb()
  const services = db.services
    .filter(s => s.barbershopId === session.user.barbershopId)
    .sort((a, b) => a.name.localeCompare(b.name))

  const formatted = services.map(service => ({
    id: service.id,
    name: service.name,
    duration: service.duration,
    price: service.price,
    isActive: service.isActive
  }))

  return <ServicesScreen services={formatted} canManage={session.user.role === "ADMIN"} />
}

