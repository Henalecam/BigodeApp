import { NextResponse } from "next/server"
import { getDashboardData } from "@/lib/dashboard-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const role = searchParams.get("role") as "ADMIN" | "BARBER" || "ADMIN"

  const data = await getDashboardData({
    barbershopId: "barbershop-1",
    role,
    userId: "user-admin-1"
  })

  return NextResponse.json({
    success: true,
    data
  })
}
