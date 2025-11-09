"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

type SessionState = {
  userId: string
  name: string
  email: string
  role: "ADMIN" | "BARBER"
  barbershopId: string
  setRole: (role: "ADMIN" | "BARBER") => void
  setUser: (user: { userId: string; name: string; email: string; role: "ADMIN" | "BARBER"; barbershopId: string }) => void
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      userId: "user-admin-1",
      name: "Administrador",
      email: "admin@barberpro.com",
      role: "ADMIN",
      barbershopId: "barbershop-1",
      setRole: (role) => set({ role }),
      setUser: (user) => set(user)
    }),
    {
      name: "barberpro-session"
    }
  )
)

