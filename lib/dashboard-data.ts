import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  formatISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays
} from "date-fns"
import { AppointmentStatus, Product } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export type DashboardMetrics = {
  dailyRevenue: number
  weeklyRevenue: number
  monthlyRevenue: number
  totalAppointments: number
  personalAppointments?: number
  personalRevenue?: number
}

export type DashboardRevenuePoint = {
  label: string
  value: number
}

export type DashboardTopBarber = {
  id: string
  name: string
  totalAppointments: number
  totalRevenue: number
}

export type DashboardUpcomingAppointment = {
  id: string
  clientName: string
  barberName: string
  startTime: string
  services: string[]
  status: AppointmentStatus
}

export type DashboardLowStockProduct = {
  id: string
  name: string
  stock: number
  minStock: number
}

export type DashboardData = {
  metrics: DashboardMetrics
  revenueTrend: DashboardRevenuePoint[]
  topBarbers: DashboardTopBarber[]
  upcomingAppointments: DashboardUpcomingAppointment[]
  lowStockProducts: DashboardLowStockProduct[]
}

type DashboardParams = {
  barbershopId: string
  role: "ADMIN" | "BARBER"
  userId: string
}

export async function getDashboardData({ barbershopId, role, userId }: DashboardParams): Promise<DashboardData> {
  const today = new Date()
  const startToday = startOfDay(today)
  const endToday = endOfDay(today)
  const startWeek = startOfWeek(today, { weekStartsOn: 1 })
  const endWeek = endOfWeek(today, { weekStartsOn: 1 })
  const startMonthDate = startOfMonth(today)
  const endMonthDate = endOfMonth(today)
  const trendStart = startOfDay(subDays(today, 6))

  const baseAppointmentWhere = {
    barbershopId,
    status: {
      in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] as AppointmentStatus[]
    }
  }

  const completedWhere = {
    ...baseAppointmentWhere,
    status: "COMPLETED" as AppointmentStatus
  }

  const [
    dailyRevenueAgg,
    weeklyRevenueAgg,
    monthlyRevenueAgg,
    totalAppointments,
    personalAppointments,
    personalRevenue,
    trendAppointments,
    topBarbers,
    upcomingAppointments,
    lowStockProducts
  ] = await Promise.all([
    prisma.appointment.aggregate({
      where: {
        ...completedWhere,
        date: {
          gte: startToday,
          lte: endToday
        },
        ...(role === "BARBER" ? { barberId: userId } : {})
      },
      _sum: {
        totalValue: true
      }
    }),
    prisma.appointment.aggregate({
      where: {
        ...completedWhere,
        date: {
          gte: startWeek,
          lte: endWeek
        },
        ...(role === "BARBER" ? { barberId: userId } : {})
      },
      _sum: {
        totalValue: true
      }
    }),
    prisma.appointment.aggregate({
      where: {
        ...completedWhere,
        date: {
          gte: startMonthDate,
          lte: endMonthDate
        },
        ...(role === "BARBER" ? { barberId: userId } : {})
      },
      _sum: {
        totalValue: true
      }
    }),
    prisma.appointment.count({
      where: {
        ...baseAppointmentWhere
      }
    }),
    role === "BARBER"
      ? prisma.appointment.count({
          where: {
            ...baseAppointmentWhere,
            barberId: userId,
            date: {
              gte: startToday,
              lte: endToday
            }
          }
        })
      : Promise.resolve(0),
    role === "BARBER"
      ? prisma.appointment.aggregate({
          where: {
            ...completedWhere,
            barberId: userId,
            date: {
              gte: startMonthDate,
              lte: endMonthDate
            }
          },
          _sum: {
            totalValue: true
          }
        })
      : Promise.resolve({ _sum: { totalValue: 0 } }),
    prisma.appointment.findMany({
      where: {
        ...completedWhere,
        date: {
          gte: trendStart,
          lte: endToday
        },
        ...(role === "BARBER" ? { barberId: userId } : {})
      },
      select: {
        date: true,
        totalValue: true
      }
    }),
    prisma.appointment.groupBy({
      by: ["barberId"],
      where: {
        ...completedWhere,
        date: {
          gte: startMonthDate,
          lte: endMonthDate
        }
      },
      _count: { _all: true },
      _sum: { totalValue: true }
    }),
    prisma.appointment.findMany({
      where: {
        ...baseAppointmentWhere,
        date: {
          gte: startToday,
          lte: endToday
        },
        status: {
          in: ["CONFIRMED", "IN_PROGRESS"] as AppointmentStatus[]
        },
        ...(role === "BARBER" ? { barberId: userId } : {})
      },
      include: {
        client: true,
        barber: true,
        services: {
          include: {
            service: true
          }
        }
      },
      orderBy: {
        startTime: "asc"
      },
      take: role === "BARBER" ? 10 : 20
    }),
    role === "ADMIN"
      ? prisma.product.findMany({
          where: {
            barbershopId,
            isActive: true
          }
        })
      : Promise.resolve([])
  ])

  const revenueTrendMap = new Map<string, number>()
  for (let index = 0; index < 7; index += 1) {
    const dateKey = formatISO(addDays(trendStart, index), { representation: "date" })
    revenueTrendMap.set(dateKey, 0)
  }

  trendAppointments.forEach(appointment => {
    const dateKey = formatISO(appointment.date, { representation: "date" })
    const current = revenueTrendMap.get(dateKey) ?? 0
    revenueTrendMap.set(dateKey, current + (appointment.totalValue ?? 0))
  })

  const revenueTrend: DashboardRevenuePoint[] = Array.from(revenueTrendMap.entries()).map(([date, value]) => ({
    label: date,
    value
  }))

  const barbersData = await prisma.barber.findMany({
    where: {
      barbershopId
    },
    select: {
      id: true,
      name: true
    }
  })

  const barbersById = new Map(barbersData.map(barber => [barber.id, barber.name]))

  const topBarbersList: DashboardTopBarber[] = topBarbers
    .map(item => ({
      id: item.barberId,
      name: barbersById.get(item.barberId) ?? "Barbeiro",
      totalAppointments: item._count._all,
      totalRevenue: Number(item._sum.totalValue ?? 0)
    }))
    .sort((a, b) => b.totalAppointments - a.totalAppointments)
    .slice(0, 3)

  const lowStockList: DashboardLowStockProduct[] =
    role === "ADMIN"
      ? (lowStockProducts as Product[])
          .filter(product => product.stock < product.minStock)
          .map(product => ({
            id: product.id,
            name: product.name,
            stock: product.stock,
            minStock: product.minStock
          }))
      : []

  const upcomingList: DashboardUpcomingAppointment[] = upcomingAppointments.map(appointment => ({
    id: appointment.id,
    clientName: appointment.client.name,
    barberName: appointment.barber.name,
    startTime: appointment.startTime,
    services: appointment.services.map(item => item.service.name),
    status: appointment.status
  }))

  return {
    metrics: {
      dailyRevenue: Number(dailyRevenueAgg._sum.totalValue ?? 0),
      weeklyRevenue: Number(weeklyRevenueAgg._sum.totalValue ?? 0),
      monthlyRevenue: Number(monthlyRevenueAgg._sum.totalValue ?? 0),
      totalAppointments,
      personalAppointments: role === "BARBER" ? personalAppointments : undefined,
      personalRevenue: role === "BARBER" ? Number(personalRevenue._sum.totalValue ?? 0) : undefined
    },
    revenueTrend,
    topBarbers: topBarbersList,
    upcomingAppointments: upcomingList,
    lowStockProducts: lowStockList
  }
}




