import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SettingsScreen } from "@/components/settings/SettingsScreen"

export default async function SettingsPage() {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/login")
  }

  const [barbershop, user] = await Promise.all([
    prisma.barbershop.findUnique({
      where: {
        id: session.user.barbershopId
      }
    }),
    prisma.user.findUnique({
      where: {
        id: session.user.id
      }
    })
  ])

  if (!barbershop || !user) {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primary">Configurações</h1>
        <p className="text-sm text-neutral-500">Gerencie os dados da sua barbearia e suas informações pessoais.</p>
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




