import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { getDb } from "@/lib/mock-db"
import { SettingsScreen } from "@/components/settings/SettingsScreen"

export default async function SettingsPage() {
  const session = await getCurrentSession()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const db = getDb()
  const barbershop = db.barbershops.find(b => b.id === session.user.barbershopId)
  const user = db.users.find(u => u.id === session.user.id)

  if (!barbershop || !user) {
    redirect("/")
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
        canManageBarbershop={session.user.role === "ADMIN"}
      />
    </div>
  )
}
