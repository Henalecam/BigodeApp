import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AppointmentsScreen } from "@/components/appointments/AppointmentsScreen"

export default async function AppointmentsPage() {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/login")
  }

  const barbers = await prisma.barber.findMany({
    where: {
      barbershopId: session.user.barbershopId,
      isActive: true
    },
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: "asc"
    }
  })

  return <AppointmentsScreen barbers={barbers} />
}

