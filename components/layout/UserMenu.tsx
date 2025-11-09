"use client"

import { useRouter } from "next/navigation"
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
import { Badge } from "@/components/ui/badge"
import { useSession } from "@/lib/session-store"

type UserMenuProps = {
  user: {
    name: string
    email?: string | null
    role: string
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const { role, setRole } = useSession()
  
  const initials = user.name
    .split(" ")
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const handleToggleRole = () => {
    const newRole = role === "ADMIN" ? "BARBER" : "ADMIN"
    setRole(newRole)
    router.refresh()
  }

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
        <DropdownMenuLabel className="flex flex-col gap-2 text-sm">
          <div>
            <span className="font-semibold">{user.name}</span>
            {user.email ? <span className="block text-xs text-neutral-500">{user.email}</span> : null}
          </div>
          <Badge variant={role === "ADMIN" ? "default" : "success"}>
            {role === "ADMIN" ? "Modo: Administrador" : "Modo: Barbeiro"}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleToggleRole}>
          Alternar para {role === "ADMIN" ? "Barbeiro" : "Administrador"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

