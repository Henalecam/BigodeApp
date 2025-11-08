import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CommissionsReport } from "@/components/reports/CommissionsReport"

export default async function CommissionsReportPage() {
  const session = await getCurrentSession()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const barbers = await prisma.barber.findMany({
    where: {
      barbershopId: session.user.barbershopId,
      isActive: true
    },
    orderBy: {
      name: "asc"
    },
    select: {
      id: true,
      name: true
    }
  })

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primary">Relatório de comissões</h1>
        <p className="text-sm text-neutral-500">Analise o desempenho dos barbeiros em períodos específicos.</p>
      </div>
      <CommissionsReport barbers={barbers} />
    </div>
  )
}




