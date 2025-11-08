import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession()

  if (!session?.user) {
    redirect("/login")
  }

  const user = {
    name: session.user.name || "",
    role: session.user.role,
    barbershopId: session.user.barbershopId
  }

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <Sidebar role={session.user.role as "ADMIN" | "BARBER"} />
      <div className="flex flex-1 flex-col">
        <Header user={user} />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}

