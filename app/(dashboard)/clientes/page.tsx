import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { getDb } from "@/lib/mock-db"
import { ClientsScreen } from "@/components/clients/ClientsScreen"

export default async function ClientsPage() {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/login")
  }

  const db = getDb()
  const clients = db.clients
    .filter(c => c.barbershopId === session.user.barbershopId)
    .map(client => {
      const appointments = db.appointments
        .filter(a => a.clientId === client.id)
        .sort((a, b) => b.date.getTime() - a.date.getTime())

      return {
        ...client,
        _count: {
          appointments: appointments.length
        },
        appointments: appointments.map(a => ({
          date: a.date.toISOString()
        }))
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  return <ClientsScreen initialClients={clients} canManage={session.user.role === "ADMIN"} />
}

