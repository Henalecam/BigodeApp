"use client"

import { useEffect, useState } from "react"
import { getDb } from "@/lib/mock-db"
import { AppointmentsScreen } from "@/components/appointments/AppointmentsScreen"

export default function AppointmentsPage() {
  const [barbers, setBarbers] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    const db = getDb()
    const barbersData = db.barbers
      .filter(b => b.barbershopId === "barbershop-1" && b.isActive)
      .map(b => ({
        id: b.id,
        name: b.name
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
    setBarbers(barbersData)
  }, [])

  return <AppointmentsScreen barbers={barbers} />
}

