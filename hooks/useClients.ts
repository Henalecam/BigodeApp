import { create } from "zustand"
import { ClientWithMetrics } from "@/types"

type ClientsState = {
  clients: ClientWithMetrics[]
  loading: boolean
  fetchClients: (query?: string) => Promise<void>
  upsert: (client: ClientWithMetrics) => void
}

export const useClients = create<ClientsState>((set) => ({
  clients: [],
  loading: false,
  fetchClients: async (query?: string) => {
    const params = new URLSearchParams()
    if (query) params.set("query", query)
    set({ loading: true })
    try {
      const response = await fetch(`/api/clients?${params.toString()}`)
      const json = await response.json()
      if (json.success) {
        set({ clients: json.data, loading: false })
      } else {
        set({ loading: false })
      }
    } catch {
      set({ loading: false })
    }
  },
  upsert: client => {
    set(state => {
      const exists = state.clients.some(item => item.id === client.id)
      if (exists) {
        return {
          clients: state.clients.map(item => (item.id === client.id ? client : item))
        }
      }
      return {
        clients: [...state.clients, client]
      }
    })
  }
}))

