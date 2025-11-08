import { create } from "zustand"

type RevenueMetric = {
  label: string
  value: number
}

type AppointmentSummary = {
  id: string
  clientName: string
  barberName: string
  startTime: string
  services: string[]
  status: string
}

type DashboardState = {
  loading: boolean
  metrics: {
    dailyRevenue: number
    weeklyRevenue: number
    monthlyRevenue: number
    totalAppointments: number
    personalAppointments?: number
    personalRevenue?: number
  }
  revenueTrend: RevenueMetric[]
  topBarbers: {
    id: string
    name: string
    totalAppointments: number
    totalRevenue: number
  }[]
  upcomingAppointments: AppointmentSummary[]
  lowStockProducts: {
    id: string
    name: string
    stock: number
    minStock: number
  }[]
  fetchDashboard: () => Promise<void>
}

export const useDashboard = create<DashboardState>((set) => ({
  loading: false,
  metrics: {
    dailyRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    totalAppointments: 0
  },
  revenueTrend: [],
  topBarbers: [],
  upcomingAppointments: [],
  lowStockProducts: [],
  fetchDashboard: async () => {
    set({ loading: true })
    try {
      const response = await fetch("/api/dashboard")
      const json = await response.json()
      if (json.success) {
        set({
          loading: false,
          metrics: json.data.metrics,
          revenueTrend: json.data.revenueTrend,
          topBarbers: json.data.topBarbers,
          upcomingAppointments: json.data.upcomingAppointments,
          lowStockProducts: json.data.lowStockProducts
        })
      } else {
        set({ loading: false })
      }
    } catch {
      set({ loading: false })
    }
  }
}))

