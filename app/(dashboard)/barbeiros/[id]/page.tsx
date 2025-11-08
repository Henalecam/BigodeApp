import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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

  const barber = await prisma.barber.findFirst({
    where: {
      id: params.id,
      barbershopId: session.user.barbershopId
    },
    include: {
      workingHours: true,
      barberServices: {
        include: {
          service: true
        }
      }
    }
  })

  if (!barber) {
    redirect("/barbeiros")
  }

  const services = await prisma.service.findMany({
    where: {
      barbershopId: session.user.barbershopId,
      isActive: true
    },
    orderBy: {
      name: "asc"
    }
  })

  const formattedServices = services.map(service => ({
    id: service.id,
    name: service.name
  }))

  return <BarberDetail barber={barber} services={formattedServices} />
}

