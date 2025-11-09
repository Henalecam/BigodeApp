"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getDb } from "@/lib/mock-db"
import { BarberDetail } from "@/components/barbers/BarberDetail"
import { Skeleton } from "@/components/ui/skeleton"

export default function BarberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [barber, setBarber] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])

  useEffect(() => {
    const db = getDb()
    const barberData = db.barbers.find(
      b => b.id === params.id && b.barbershopId === "barbershop-1"
    )

    if (!barberData) {
      router.push("/barbeiros")
      return
    }

    const barberWithRelations = {
      ...barberData,
      workingHours: db.workingHours.filter(wh => wh.barberId === barberData.id),
      barberServices: db.barberServices
        .filter(bs => bs.barberId === barberData.id)
        .map(bs => ({
          barberId: bs.barberId,
          serviceId: bs.serviceId,
          service: db.services.find(s => s.id === bs.serviceId)!
        }))
    }

    const servicesData = db.services
      .filter(s => s.barbershopId === "barbershop-1" && s.isActive)
      .map(service => ({
        id: service.id,
        name: service.name
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    setBarber(barberWithRelations)
    setServices(servicesData)
    setLoading(false)
  }, [params.id, router])

  if (loading) {
    return <Skeleton className="h-screen w-full" />
  }

  if (!barber) return null

  return <BarberDetail barber={barber} services={services} />
}
