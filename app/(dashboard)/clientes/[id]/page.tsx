"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getDb } from "@/lib/mock-db"
import { ClientDetail } from "@/components/clients/ClientDetail"
import { Skeleton } from "@/components/ui/skeleton"

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const db = getDb()
    const clientData = db.clients.find(
      c => c.id === params.id && c.barbershopId === "barbershop-1"
    )

    if (!clientData) {
      router.push("/clientes")
      return
    }

    const appointments = db.appointments
      .filter(a => a.clientId === clientData.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map(appointment => {
        const barber = db.barbers.find(b => b.id === appointment.barberId)!
        const services = db.appointmentServices
          .filter(as => as.appointmentId === appointment.id)
          .map(as => ({
            appointmentId: as.appointmentId,
            serviceId: as.serviceId,
            price: as.price,
            service: db.services.find(s => s.id === as.serviceId)!
          }))

        return {
          id: appointment.id,
          date: appointment.date.toISOString(),
          barberName: barber.name,
          services: services.map(s => s.service.name),
          total: appointment.totalValue ?? services.reduce((total, s) => total + s.price, 0)
        }
      })

    const formatted = {
      id: clientData.id,
      name: clientData.name,
      phone: clientData.phone,
      email: clientData.email,
      notes: clientData.notes,
      totalSpent: appointments.reduce((total, a) => total + a.total, 0),
      appointments
    }

    setClient(formatted)
    setLoading(false)
  }, [params.id, router])

  if (loading) {
    return <Skeleton className="h-screen w-full" />
  }

  if (!client) return null

  return <ClientDetail client={client} />
}
