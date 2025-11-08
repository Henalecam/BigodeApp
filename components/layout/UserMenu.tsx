"use client"

import { signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

type UserMenuProps = {
  user: {
    name: string
    email?: string | null
    role: string
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const initials = user.name
    .split(" ")
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col text-left text-sm sm:flex">
            <span className="font-medium text-primary">{user.name}</span>
            <span className="text-xs text-neutral-500">{user.role === "ADMIN" ? "Administrador" : "Barbeiro"}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col text-sm">
          <span className="font-semibold">{user.name}</span>
          {user.email ? <span className="text-xs text-neutral-500">{user.email}</span> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/login" })}>Sair</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

