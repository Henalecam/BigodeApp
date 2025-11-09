"use client"

import { useEffect, useState } from "react"
import { getDb } from "@/lib/mock-db"
import { ServicesScreen } from "@/components/services/ServicesScreen"
import { useSession } from "@/lib/session-store"

export default function ServicesPage() {
  const { role } = useSession()
  const [services, setServices] = useState<any[]>([])

  useEffect(() => {
    const db = getDb()
    const servicesData = db.services
      .filter(s => s.barbershopId === "barbershop-1")
      .map(service => ({
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: service.price,
        isActive: service.isActive
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    setServices(servicesData)
  }, [])

  return <ServicesScreen services={services} canManage={role === "ADMIN"} />
}
