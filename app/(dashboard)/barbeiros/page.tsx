import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BarbersScreen } from "@/components/barbers/BarbersScreen"

export default async function BarbersPage() {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/login")
  }

  const [barbers, services] = await Promise.all([
    prisma.barber.findMany({
      where: {
        barbershopId: session.user.barbershopId
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
    })
  ])

  const formattedServices = services.map(service => ({
    id: service.id,
    name: service.name
  }))

  return <BarbersScreen initialBarbers={barbers} services={formattedServices} canManage={session.user.role === "ADMIN"} />
}

