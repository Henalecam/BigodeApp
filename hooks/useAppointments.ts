import { create } from "zustand"
import { AppointmentWithRelations } from "@/types"

type AppointmentFilters = {
  date?: string
  barberId?: string
  status?: string
}

type AppointmentState = {
  appointments: AppointmentWithRelations[]
  loading: boolean
  filters: AppointmentFilters
  setFilters: (filters: AppointmentFilters) => void
  fetchAppointments: () => Promise<void>
  upsert: (appointment: AppointmentWithRelations) => void
  remove: (id: string) => void
}

export const useAppointments = create<AppointmentState>((set, get) => ({
  appointments: [],
  loading: false,
  filters: {},
  setFilters: filters => {
    set(state => ({
      filters: { ...state.filters, ...filters }
    }))
  },
  fetchAppointments: async () => {
    const { filters } = get()
    const params = new URLSearchParams()
    if (filters.date) params.set("date", filters.date)
    if (filters.barberId) params.set("barberId", filters.barberId)
    if (filters.status) params.set("status", filters.status)
    set({ loading: true })
    try {
      const response = await fetch(`/api/appointments?${params.toString()}`)
      const json = await response.json()
      if (json.success) {
        set({ appointments: json.data, loading: false })
      } else {
        set({ loading: false })
      }
    } catch {
      set({ loading: false })
    }
  },
  upsert: appointment => {
    set(state => {
      const exists = state.appointments.some(item => item.id === appointment.id)
      if (exists) {
        return {
          appointments: state.appointments.map(item => (item.id === appointment.id ? appointment : item))
        }
      }
      return {
        appointments: [...state.appointments, appointment]
      }
    })
  },
  remove: id => {
    set(state => ({
      appointments: state.appointments.filter(item => item.id !== id)
    }))
  }
}))

