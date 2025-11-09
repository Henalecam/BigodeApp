"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { useSession } from "@/lib/session-store"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { name, role } = useSession()

  return (
    <div className="relative flex min-h-screen">
      <Sidebar role={role} />
      <div className="relative z-10 flex flex-1 flex-col lg:ml-64">
        <Header user={{ name, role, barbershopId: "barbershop-1" }} />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}

