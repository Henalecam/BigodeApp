"use client"

import { useEffect, useState } from "react"
import { getDb } from "@/lib/mock-db"
import { ClientsScreen } from "@/components/clients/ClientsScreen"
import { useSession } from "@/lib/session-store"

export default function ClientsPage() {
  const { role } = useSession()
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    const db = getDb()
    const clientsData = db.clients
      .filter(c => c.barbershopId === "barbershop-1")
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

    setClients(clientsData)
  }, [])

  return <ClientsScreen initialClients={clients} canManage={role === "ADMIN"} />
}
