import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { getDb } from "@/lib/mock-db"
import { AppointmentsScreen } from "@/components/appointments/AppointmentsScreen"

export default async function AppointmentsPage() {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/login")
  }

  const db = getDb()
  const barbers = db.barbers
    .filter(b => b.barbershopId === session.user.barbershopId && b.isActive)
    .map(b => ({
      id: b.id,
      name: b.name
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return <AppointmentsScreen barbers={barbers} />
}

