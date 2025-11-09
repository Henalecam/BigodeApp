"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  UserSquare2,
  Settings,
  PackageSearch,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"

type Role = "ADMIN" | "BARBER"

export type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  roles: Role[]
  children?: NavItem[]
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "BARBER"]
  },
  {
    label: "Agendamentos",
    href: "/agendamentos",
    icon: CalendarDays,
    roles: ["ADMIN", "BARBER"]
  },
  {
    label: "Barbeiros",
    href: "/barbeiros",
    icon: Scissors,
    roles: ["ADMIN"]
  },
  {
    label: "Clientes",
    href: "/clientes",
    icon: Users,
    roles: ["ADMIN", "BARBER"]
  },
  {
    label: "Serviços",
    href: "/servicos",
    icon: PackageSearch,
    roles: ["ADMIN"]
  },
  {
    label: "Produtos",
    href: "/produtos",
    icon: PackageSearch,
    roles: ["ADMIN"]
  },
  {
    label: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
    roles: ["ADMIN"],
    children: [
      {
        label: "Comissões",
        href: "/relatorios/comissoes",
        icon: BarChart3,
        roles: ["ADMIN"]
      },
      {
        label: "Faturamento",
        href: "/relatorios/faturamento",
        icon: BarChart3,
        roles: ["ADMIN"]
      }
    ]
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    roles: ["ADMIN"]
  }
]

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-20 hidden h-screen w-64 flex-col border-r border-primary/10 bg-white/95 backdrop-blur-xl px-4 py-6 shadow-xl lg:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 rounded-lg bg-gradient-to-r from-secondary to-accent p-3 text-lg font-bold text-white shadow-lg transition hover:shadow-glow">
        <UserSquare2 className="h-6 w-6" />
        BarberPro
      </Link>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto text-sm">
        {navItems
          .filter(item => item.roles.includes(role))
          .map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-all hover:bg-gradient-to-r hover:from-secondary/10 hover:to-accent/10 hover:shadow-sm",
                    isActive && "bg-gradient-to-r from-secondary/20 to-accent/20 text-primary shadow-md"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive && "text-accent")} />
                  {item.label}
                </Link>
                {item.children && isActive ? (
                  <div className="mt-1 ml-8 flex flex-col gap-1">
                    {item.children
                      .filter(child => child.roles.includes(role))
                      .map(child => {
                        const ChildIcon = child.icon
                        const childActive = pathname.startsWith(child.href)
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-600 transition hover:bg-accent/10 hover:text-accent",
                              childActive && "bg-accent/20 text-accent font-medium"
                            )}
                          >
                            <ChildIcon className="h-3 w-3" />
                            {child.label}
                          </Link>
                        )
                      })}
                  </div>
                ) : null}
              </div>
            )
          })}
      </nav>
    </aside>
  )
}

