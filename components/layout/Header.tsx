"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileNav } from "./MobileNav"
import { UserMenu } from "./UserMenu"

type HeaderProps = {
  user: {
    name: string
    role: string
    barbershopId: string
  }
}

export function Header({ user }: HeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="flex h-16 items-center border-b border-primary/10 bg-white px-4">
      <div className="flex flex-1 items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm text-neutral-500">Bem-vindo</p>
          <h2 className="text-lg font-semibold text-primary">{user.name}</h2>
        </div>
      </div>
      <UserMenu user={user} />
      <MobileNav open={open} onOpenChange={setOpen} role={user.role as "ADMIN" | "BARBER"} />
    </header>
  )
}

