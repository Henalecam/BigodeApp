import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { RevenueReport } from "@/components/reports/RevenueReport"

export default async function RevenueReportPage() {
  const session = await getCurrentSession()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primary">Relatório de faturamento</h1>
        <p className="text-sm text-neutral-500">Avalie o faturamento detalhado por período, forma de pagamento e barbeiro.</p>
      </div>
      <RevenueReport />
    </div>
  )
}




