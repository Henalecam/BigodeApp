import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { getDb } from "@/lib/mock-db"
import { CommissionsReport } from "@/components/reports/CommissionsReport"

export default async function CommissionsPage() {
  const session = await getCurrentSession()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const db = getDb()
  const barbers = db.barbers
    .filter(b => b.barbershopId === session.user.barbershopId)
    .map(b => ({
      id: b.id,
      name: b.name
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

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
