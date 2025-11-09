"use client"

import { useEffect, useState } from "react"
import { getDb } from "@/lib/mock-db"
import { SettingsScreen } from "@/components/settings/SettingsScreen"
import { useSession } from "@/lib/session-store"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsPage() {
  const { role } = useSession()
  const [loading, setLoading] = useState(true)
  const [barbershop, setBarbershop] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const db = getDb()
    const barbershopData = db.barbershops.find(b => b.id === "barbershop-1")
    const userData = db.users.find(u => u.id === "user-admin-1")

    setBarbershop(barbershopData)
    setUser(userData)
    setLoading(false)
  }, [])

  if (loading || !barbershop || !user) {
    return <Skeleton className="h-screen w-full" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Configurações</h1>
        <p className="text-sm text-neutral-500">Gerencie os dados da barbearia e do seu perfil</p>
      </div>
      <SettingsScreen
        barbershop={{
          name: barbershop.name,
          phone: barbershop.phone,
          address: barbershop.address ?? ""
        }}
        profile={{
          name: user.name,
          email: user.email
        }}
        canManageBarbershop={role === "ADMIN"}
      />
    </div>
  )
}
