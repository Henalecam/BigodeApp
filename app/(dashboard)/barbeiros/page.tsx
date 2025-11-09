"use client"

import { useEffect, useState } from "react"
import { getDb } from "@/lib/mock-db"
import { BarbersScreen } from "@/components/barbers/BarbersScreen"
import { useSession } from "@/lib/session-store"

export default function BarbersPage() {
  const { role } = useSession()
  const [barbers, setBarbers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])

  useEffect(() => {
    const db = getDb()
    
    const barbersData = db.barbers
      .filter(b => b.barbershopId === "barbershop-1")
      .map(barber => ({
        ...barber,
        workingHours: db.workingHours.filter(wh => wh.barberId === barber.id),
        barberServices: db.barberServices
          .filter(bs => bs.barberId === barber.id)
          .map(bs => ({
            barberId: bs.barberId,
            serviceId: bs.serviceId,
            service: db.services.find(s => s.id === bs.serviceId)!
          }))
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    const servicesData = db.services
      .filter(s => s.barbershopId === "barbershop-1" && s.isActive)
      .map(service => ({
        id: service.id,
        name: service.name
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    setBarbers(barbersData)
    setServices(servicesData)
  }, [])

  return <BarbersScreen initialBarbers={barbers} services={services} canManage={role === "ADMIN"} />
}
