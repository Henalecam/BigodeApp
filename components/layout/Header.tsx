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
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-primary/10 bg-white/80 backdrop-blur-xl px-4 shadow-sm">
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
        <div className="rounded-lg bg-gradient-to-r from-secondary/10 to-accent/10 px-4 py-2">
          <p className="text-xs text-neutral-600">Bem-vindo de volta</p>
          <h2 className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-lg font-bold text-transparent">{user.name}</h2>
        </div>
      </div>
      <UserMenu user={user} />
      <MobileNav open={open} onOpenChange={setOpen} role={user.role as "ADMIN" | "BARBER"} />
    </header>
  )
}

