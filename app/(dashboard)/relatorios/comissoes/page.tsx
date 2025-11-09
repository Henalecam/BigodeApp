"use client"

import { useEffect, useState } from "react"
import { getDb } from "@/lib/mock-db"
import { CommissionsReport } from "@/components/reports/CommissionsReport"

export default function CommissionsPage() {
  const [barbers, setBarbers] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    const db = getDb()
    const barbersData = db.barbers
      .filter(b => b.barbershopId === "barbershop-1")
      .map(b => ({
        id: b.id,
        name: b.name
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    setBarbers(barbersData)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Relatório de Comissões</h1>
        <p className="text-sm text-neutral-500">Acompanhe as comissões calculadas por barbeiro</p>
      </div>
      <CommissionsReport barbers={barbers} />
    </div>
  )
}
