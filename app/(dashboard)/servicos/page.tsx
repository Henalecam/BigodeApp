import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ServicesScreen } from "@/components/services/ServicesScreen"

export default async function ServicesPage() {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/login")
  }

  const services = await prisma.service.findMany({
    where: {
      barbershopId: session.user.barbershopId
    },
    orderBy: {
      name: "asc"
    }
  })

  const formatted = services.map(service => ({
    id: service.id,
    name: service.name,
    duration: service.duration,
    price: service.price,
    isActive: service.isActive
  }))

  return <ServicesScreen services={formatted} canManage={session.user.role === "ADMIN"} />
}

