import { NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth"
import { getDashboardData } from "@/lib/dashboard-data"

export async function GET() {
  const session = await getCurrentSession()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
  }

  const data = await getDashboardData({
    barbershopId: session.user.barbershopId,
    role: session.user.role as "ADMIN" | "BARBER",
    userId: session.user.id
  })

  return NextResponse.json({
    success: true,
    data
  })
}

