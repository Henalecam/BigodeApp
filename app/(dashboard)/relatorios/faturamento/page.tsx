import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { RevenueReport } from "@/components/reports/RevenueReport"

export default async function RevenuePage() {
  const session = await getCurrentSession()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Relatório de Faturamento</h1>
        <p className="text-sm text-neutral-500">Análise completa do faturamento do seu negócio</p>
      </div>
      <RevenueReport />
    </div>
  )
}
