"use client"

import { useEffect, useState } from "react"
import { getDb } from "@/lib/mock-db"
import { AppointmentForm } from "@/components/appointments/AppointmentForm"
import { Skeleton } from "@/components/ui/skeleton"

type BarberOption = {
  id: string
  name: string
  commissionRate: number
  workingHours: Array<{ dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }>
  services: Array<{ service: { id: string } }>
}

type ServiceOption = {
  id: string
  name: string
  duration: number
  price: number
}

type ClientOption = {
  id: string
  name: string
  phone: string
}

export default function NewAppointmentPage() {
  const [loading, setLoading] = useState(true)
  const [barbers, setBarbers] = useState<BarberOption[]>([])
  const [services, setServices] = useState<ServiceOption[]>([])
  const [clients, setClients] = useState<ClientOption[]>([])

  useEffect(() => {
    const db = getDb()
    
    const barbersData = db.barbers
      .filter(b => b.barbershopId === "barbershop-1" && b.isActive)
      .map(barber => ({
        id: barber.id,
        name: barber.name,
        commissionRate: barber.commissionRate,
        workingHours: db.workingHours.filter(wh => wh.barberId === barber.id),
        services: db.barberServices
          .filter(bs => bs.barberId === barber.id)
          .map(bs => ({
            service: {
              id: bs.serviceId
            }
          }))
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    const servicesData = db.services
      .filter(s => s.barbershopId === "barbershop-1" && s.isActive)
      .map(service => ({
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: service.price
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    const clientsData = db.clients
      .filter(c => c.barbershopId === "barbershop-1")
      .map(client => ({
        id: client.id,
        name: client.name,
        phone: client.phone
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 30)

    setBarbers(barbersData)
    setServices(servicesData)
    setClients(clientsData)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Novo agendamento</h1>
        <p className="text-sm text-neutral-500">Preencha as etapas para criar um novo atendimento</p>
      </div>
      <AppointmentForm barbers={barbers} services={services} clients={clients} />
    </div>
  )
}
