import {
  Appointment,
  AppointmentProduct,
  AppointmentService,
  Barber,
  Client,
  Product,
  Service,
  WorkingHours
} from "@/lib/mock-db"

export type BarberWithRelations = Barber & {
  workingHours: WorkingHours[]
  barberServices: {
    barberId: string
    serviceId: string
    service: Service
  }[]
}

export type ClientWithMetrics = Client & {
  _count: {
    appointments: number
  }
  appointments: (Appointment & {
    services: (AppointmentService & {
      service: Service
    })[]
    barber: Barber
  })[]
}

export type AppointmentWithRelations = Appointment & {
  client: Client
  barber: Barber
  services: (AppointmentService & {
    service: Service
  })[]
  products: (AppointmentProduct & {
    product: Product
  })[]
}

export type AppointmentWithRelationsStringDate = Omit<AppointmentWithRelations, 'date'> & {
  date: string
}

