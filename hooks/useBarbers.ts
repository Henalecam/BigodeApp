import { create } from "zustand"
import { BarberWithRelations } from "@/types"

type BarberState = {
  barbers: BarberWithRelations[]
  loading: boolean
  fetchBarbers: () => Promise<void>
  upsert: (barber: BarberWithRelations) => void
  remove: (id: string) => void
}

export const useBarbers = create<BarberState>((set) => ({
  barbers: [],
  loading: false,
  fetchBarbers: async () => {
    set({ loading: true })
    try {
      const response = await fetch("/api/barbers")
      const json = await response.json()
      if (json.success) {
        set({ barbers: json.data, loading: false })
      } else {
        set({ loading: false })
      }
    } catch {
      set({ loading: false })
    }
  },
  upsert: barber => {
    set(state => {
      const exists = state.barbers.some(item => item.id === barber.id)
      if (exists) {
        return {
          barbers: state.barbers.map(item => (item.id === barber.id ? barber : item))
        }
      }
      return {
        barbers: [...state.barbers, barber]
      }
    })
  },
  remove: id => {
    set(state => ({
      barbers: state.barbers.filter(item => item.id !== id)
    }))
  }
}))

