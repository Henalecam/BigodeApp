export type Role = "ADMIN" | "BARBER"
export type AppointmentStatus = "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
export type PaymentMethod = "CASH" | "PIX" | "DEBIT" | "CREDIT"

export type Barbershop = {
  id: string
  name: string
  phone: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

export type User = {
  id: string
  email: string
  password: string
  name: string
  role: Role
  barbershopId: string
  createdAt: Date
  updatedAt: Date
}

export type Barber = {
  id: string
  name: string
  phone?: string
  commissionRate: number
  isActive: boolean
  barbershopId: string
  createdAt: Date
  updatedAt: Date
}

export type WorkingHours = {
  id: string
  barberId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

export type Client = {
  id: string
  name: string
  phone: string
  email?: string
  notes?: string
  barbershopId: string
  createdAt: Date
  updatedAt: Date
}

export type Service = {
  id: string
  name: string
  duration: number
  price: number
  isActive: boolean
  barbershopId: string
  createdAt: Date
  updatedAt: Date
}

export type BarberService = {
  barberId: string
  serviceId: string
}

export type Appointment = {
  id: string
  date: Date
  startTime: string
  endTime: string
  status: AppointmentStatus
  notes?: string
  totalValue?: number
  paymentMethod?: PaymentMethod
  clientId: string
  barberId: string
  barbershopId: string
  createdAt: Date
  updatedAt: Date
}

export type AppointmentService = {
  appointmentId: string
  serviceId: string
  price: number
}

export type Product = {
  id: string
  name: string
  stock: number
  minStock: number
  salePrice: number
  isActive: boolean
  barbershopId: string
  createdAt: Date
  updatedAt: Date
}

export type AppointmentProduct = {
  appointmentId: string
  productId: string
  quantity: number
  unitPrice: number
}

type MockDatabase = {
  barbershops: Barbershop[]
  users: User[]
  barbers: Barber[]
  workingHours: WorkingHours[]
  clients: Client[]
  services: Service[]
  barberServices: BarberService[]
  appointments: Appointment[]
  appointmentServices: AppointmentService[]
  products: Product[]
  appointmentProducts: AppointmentProduct[]
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const barbershopId = "barbershop-1"

export const mockDb: MockDatabase = {
  barbershops: [
    {
      id: barbershopId,
      name: "BarberPro Central",
      phone: "+55 11 99999-9999",
      address: "Rua Principal 123",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01")
    }
  ],
  users: [
    {
      id: "user-admin-1",
      email: "admin@barberpro.com",
      password: "$2a$10$Z8qE0Z0Z0Z0Z0Z0Z0Z0Z0uRJ.KqXqXqXqXqXqXqXqXqXqXqXqXqXq",
      name: "Administrador",
      role: "ADMIN",
      barbershopId,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01")
    },
    {
      id: "user-barber-1",
      email: "joao@barberpro.com",
      password: "$2a$10$A1b2C3d4E5f6G7h8I9j0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7",
      name: "João Silva",
      role: "BARBER",
      barbershopId,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01")
    }
  ],
  barbers: [
    {
      id: "barber-1",
      name: "João Silva",
      phone: "+55 11 98888-8888",
      commissionRate: 50,
      isActive: true,
      barbershopId,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01")
    },
    {
      id: "barber-2",
      name: "Carlos Andrade",
      phone: "+55 11 97777-7777",
      commissionRate: 55,
      isActive: true,
      barbershopId,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01")
    },
    {
      id: "barber-3",
      name: "Ricardo Santos",
      phone: "+55 11 96666-6666",
      commissionRate: 45,
      isActive: true,
      barbershopId,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15")
    },
    {
      id: "barber-4",
      name: "Felipe Mendes",
      phone: "+55 11 95555-3333",
      commissionRate: 48,
      isActive: true,
      barbershopId,
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01")
    },
    {
      id: "barber-5",
      name: "Marcelo Costa",
      phone: "+55 11 94444-2222",
      commissionRate: 52,
      isActive: true,
      barbershopId,
      createdAt: new Date("2024-02-15"),
      updatedAt: new Date("2024-02-15")
    },
    {
      id: "barber-6",
      name: "Rafael Oliveira",
      phone: "+55 11 93333-1111",
      commissionRate: 47,
      isActive: false,
      barbershopId,
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-05-01")
    }
  ],
  workingHours: [
    { id: "wh-1", barberId: "barber-1", dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isActive: true },
    { id: "wh-2", barberId: "barber-1", dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isActive: true },
    { id: "wh-3", barberId: "barber-1", dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isActive: true },
    { id: "wh-4", barberId: "barber-1", dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isActive: true },
    { id: "wh-5", barberId: "barber-1", dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isActive: true },
    { id: "wh-6", barberId: "barber-2", dayOfWeek: 2, startTime: "10:00", endTime: "19:00", isActive: true },
    { id: "wh-7", barberId: "barber-2", dayOfWeek: 3, startTime: "10:00", endTime: "19:00", isActive: true },
    { id: "wh-8", barberId: "barber-2", dayOfWeek: 4, startTime: "10:00", endTime: "19:00", isActive: true },
    { id: "wh-9", barberId: "barber-2", dayOfWeek: 5, startTime: "10:00", endTime: "19:00", isActive: true },
    { id: "wh-10", barberId: "barber-2", dayOfWeek: 6, startTime: "09:00", endTime: "16:00", isActive: true },
    { id: "wh-11", barberId: "barber-3", dayOfWeek: 1, startTime: "08:00", endTime: "17:00", isActive: true },
    { id: "wh-12", barberId: "barber-3", dayOfWeek: 2, startTime: "08:00", endTime: "17:00", isActive: true },
    { id: "wh-13", barberId: "barber-3", dayOfWeek: 3, startTime: "08:00", endTime: "17:00", isActive: true },
    { id: "wh-14", barberId: "barber-3", dayOfWeek: 4, startTime: "08:00", endTime: "17:00", isActive: true },
    { id: "wh-15", barberId: "barber-3", dayOfWeek: 5, startTime: "08:00", endTime: "17:00", isActive: true },
    { id: "wh-16", barberId: "barber-3", dayOfWeek: 6, startTime: "08:00", endTime: "14:00", isActive: true },
    { id: "wh-17", barberId: "barber-4", dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isActive: true },
    { id: "wh-18", barberId: "barber-4", dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isActive: true },
    { id: "wh-19", barberId: "barber-4", dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isActive: true },
    { id: "wh-20", barberId: "barber-4", dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isActive: true },
    { id: "wh-21", barberId: "barber-4", dayOfWeek: 6, startTime: "09:00", endTime: "15:00", isActive: true },
    { id: "wh-22", barberId: "barber-5", dayOfWeek: 2, startTime: "10:00", endTime: "19:00", isActive: true },
    { id: "wh-23", barberId: "barber-5", dayOfWeek: 3, startTime: "10:00", endTime: "19:00", isActive: true },
    { id: "wh-24", barberId: "barber-5", dayOfWeek: 4, startTime: "10:00", endTime: "19:00", isActive: true },
    { id: "wh-25", barberId: "barber-5", dayOfWeek: 5, startTime: "10:00", endTime: "19:00", isActive: true },
    { id: "wh-26", barberId: "barber-5", dayOfWeek: 6, startTime: "10:00", endTime: "17:00", isActive: true }
  ],
  clients: [
    {
      id: "client-1",
      name: "Pedro Martins",
      phone: "+55 11 96666-6666",
      email: "pedro@example.com",
      barbershopId,
      createdAt: new Date("2024-01-05"),
      updatedAt: new Date("2024-01-05")
    },
    {
      id: "client-2",
      name: "Lucas Rocha",
      phone: "+55 11 95555-5555",
      email: "lucas@example.com",
      barbershopId,
      createdAt: new Date("2024-01-08"),
      updatedAt: new Date("2024-01-08")
    },
    {
      id: "client-3",
      name: "André Costa",
      phone: "+55 11 94444-4444",
      email: "andre@example.com",
      barbershopId,
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-10")
    },
    {
      id: "client-4",
      name: "Bruno Lima",
      phone: "+55 11 93333-3333",
      barbershopId,
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01")
    },
    {
      id: "client-5",
      name: "Fernando Alves",
      phone: "+55 11 92222-2222",
      email: "fernando@example.com",
      barbershopId,
      createdAt: new Date("2024-02-05"),
      updatedAt: new Date("2024-02-05")
    },
    {
      id: "client-6",
      name: "Rafael Santos",
      phone: "+55 11 91111-1111",
      email: "rafael@example.com",
      barbershopId,
      createdAt: new Date("2024-03-01"),
      updatedAt: new Date("2024-03-01")
    },
    {
      id: "client-7",
      name: "Gustavo Oliveira",
      phone: "+55 11 98888-7777",
      email: "gustavo@example.com",
      notes: "Cliente VIP - prefere João",
      barbershopId,
      createdAt: new Date("2024-03-10"),
      updatedAt: new Date("2024-03-10")
    },
    {
      id: "client-8",
      name: "Thiago Souza",
      phone: "+55 11 97777-8888",
      barbershopId,
      createdAt: new Date("2024-04-01"),
      updatedAt: new Date("2024-04-01")
    },
    {
      id: "client-9",
      name: "Marcelo Ferreira",
      phone: "+55 11 96666-9999",
      email: "marcelo@example.com",
      barbershopId,
      createdAt: new Date("2024-04-15"),
      updatedAt: new Date("2024-04-15")
    },
    {
      id: "client-10",
      name: "Diego Cardoso",
      phone: "+55 11 95555-4444",
      email: "diego@example.com",
      barbershopId,
      createdAt: new Date("2024-05-01"),
      updatedAt: new Date("2024-05-01")
    },
    {
      id: "client-11",
      name: "Rodrigo Mendes",
      phone: "+55 11 94444-5555",
      barbershopId,
      createdAt: new Date("2024-05-10"),
      updatedAt: new Date("2024-05-10")
    },
    {
      id: "client-12",
      name: "Fabio Ribeiro",
      phone: "+55 11 93333-6666",
      email: "fabio@example.com",
      notes: "Alergia a certos produtos",
      barbershopId,
      createdAt: new Date("2024-06-01"),
      updatedAt: new Date("2024-06-01")
    }
  ],
  services: [
    {
      id: "service-1",
      name: "Corte Premium",
      duration: 45,
      price: 80,
      isActive: true,
      barbershopId,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01")
    },
    {
      id: "service-2",
      name: "Barba Completa",
      duration: 30,
      price: 50,
      isActive: true,
      barbershopId,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01")
    },
    {
      id: "service-3",
      name: "Combo Corte e Barba",
      duration: 75,
      price: 120,
      isActive: true,
      barbershopId,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01")
    },
    {
      id: "service-4",
      name: "Acabamento e Sobrancelha",
      duration: 20,
      price: 35,
      isActive: true,
      barbershopId,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15")
    }
  ],
  barberServices: [
    { barberId: "barber-1", serviceId: "service-1" },
    { barberId: "barber-1", serviceId: "service-2" },
    { barberId: "barber-1", serviceId: "service-3" },
    { barberId: "barber-1", serviceId: "service-4" },
    { barberId: "barber-2", serviceId: "service-1" },
    { barberId: "barber-2", serviceId: "service-2" },
    { barberId: "barber-3", serviceId: "service-1" },
    { barberId: "barber-3", serviceId: "service-3" },
    { barberId: "barber-4", serviceId: "service-1" },
    { barberId: "barber-4", serviceId: "service-2" },
    { barberId: "barber-4", serviceId: "service-4" },
    { barberId: "barber-5", serviceId: "service-1" },
    { barberId: "barber-5", serviceId: "service-3" },
    { barberId: "barber-6", serviceId: "service-2" },
    { barberId: "barber-6", serviceId: "service-4" }
  ],
  appointments: [
    { id: "appointment-1", date: new Date(), startTime: "10:00", endTime: "11:15", status: "CONFIRMED", clientId: "client-1", barberId: "barber-1", barbershopId, createdAt: new Date(), updatedAt: new Date() },
    { id: "appointment-2", date: new Date(), startTime: "14:00", endTime: "14:45", status: "COMPLETED", notes: "Cliente pediu acabamento moderno", totalValue: 115, paymentMethod: "CREDIT", clientId: "client-2", barberId: "barber-2", barbershopId, createdAt: new Date(), updatedAt: new Date() },
    { id: "appointment-3", date: new Date(), startTime: "15:30", endTime: "16:45", status: "COMPLETED", totalValue: 120, paymentMethod: "PIX", clientId: "client-3", barberId: "barber-1", barbershopId, createdAt: new Date(), updatedAt: new Date() },
    { id: "appointment-4", date: new Date(new Date().setDate(new Date().getDate() - 1)), startTime: "11:00", endTime: "12:15", status: "COMPLETED", totalValue: 80, paymentMethod: "CASH", clientId: "client-4", barberId: "barber-2", barbershopId, createdAt: new Date(new Date().setDate(new Date().getDate() - 1)), updatedAt: new Date(new Date().setDate(new Date().getDate() - 1)) },
    { id: "appointment-5", date: new Date(new Date().setDate(new Date().getDate() - 2)), startTime: "16:00", endTime: "16:45", status: "COMPLETED", totalValue: 85, paymentMethod: "DEBIT", clientId: "client-5", barberId: "barber-3", barbershopId, createdAt: new Date(new Date().setDate(new Date().getDate() - 2)), updatedAt: new Date(new Date().setDate(new Date().getDate() - 2)) },
    { id: "appointment-6", date: new Date(new Date().setDate(new Date().getDate() - 3)), startTime: "09:00", endTime: "09:45", status: "COMPLETED", totalValue: 80, paymentMethod: "PIX", clientId: "client-6", barberId: "barber-1", barbershopId, createdAt: new Date(new Date().setDate(new Date().getDate() - 3)), updatedAt: new Date(new Date().setDate(new Date().getDate() - 3)) },
    { id: "appointment-7", date: new Date(new Date().setDate(new Date().getDate() - 3)), startTime: "10:30", endTime: "11:45", status: "COMPLETED", totalValue: 170, paymentMethod: "CREDIT", clientId: "client-7", barberId: "barber-1", barbershopId, createdAt: new Date(new Date().setDate(new Date().getDate() - 3)), updatedAt: new Date(new Date().setDate(new Date().getDate() - 3)) },
    { id: "appointment-8", date: new Date(new Date().setDate(new Date().getDate() - 4)), startTime: "14:00", endTime: "14:30", status: "COMPLETED", totalValue: 50, paymentMethod: "PIX", clientId: "client-8", barberId: "barber-2", barbershopId, createdAt: new Date(new Date().setDate(new Date().getDate() - 4)), updatedAt: new Date(new Date().setDate(new Date().getDate() - 4)) },
    { id: "appointment-9", date: new Date(new Date().setDate(new Date().getDate() - 5)), startTime: "11:00", endTime: "12:15", status: "COMPLETED", totalValue: 120, paymentMethod: "CASH", clientId: "client-9", barberId: "barber-3", barbershopId, createdAt: new Date(new Date().setDate(new Date().getDate() - 5)), updatedAt: new Date(new Date().setDate(new Date().getDate() - 5)) },
    { id: "appointment-10", date: new Date(new Date().setDate(new Date().getDate() - 6)), startTime: "15:00", endTime: "16:15", status: "COMPLETED", totalValue: 130, paymentMethod: "DEBIT", clientId: "client-10", barberId: "barber-1", barbershopId, createdAt: new Date(new Date().setDate(new Date().getDate() - 6)), updatedAt: new Date(new Date().setDate(new Date().getDate() - 6)) },
    { id: "appointment-11", date: new Date(), startTime: "16:00", endTime: "16:30", status: "IN_PROGRESS", clientId: "client-11", barberId: "barber-2", barbershopId, createdAt: new Date(), updatedAt: new Date() },
    { id: "appointment-12", date: new Date(), startTime: "17:00", endTime: "18:15", status: "CONFIRMED", clientId: "client-12", barberId: "barber-1", barbershopId, createdAt: new Date(), updatedAt: new Date() }
  ],
  appointmentServices: [
    { appointmentId: "appointment-1", serviceId: "service-1", price: 80 },
    { appointmentId: "appointment-1", serviceId: "service-2", price: 50 },
    { appointmentId: "appointment-2", serviceId: "service-1", price: 80 },
    { appointmentId: "appointment-3", serviceId: "service-3", price: 120 },
    { appointmentId: "appointment-4", serviceId: "service-1", price: 80 },
    { appointmentId: "appointment-5", serviceId: "service-1", price: 80 },
    { appointmentId: "appointment-6", serviceId: "service-1", price: 80 },
    { appointmentId: "appointment-7", serviceId: "service-3", price: 120 },
    { appointmentId: "appointment-7", serviceId: "service-2", price: 50 },
    { appointmentId: "appointment-8", serviceId: "service-2", price: 50 },
    { appointmentId: "appointment-9", serviceId: "service-3", price: 120 },
    { appointmentId: "appointment-10", serviceId: "service-1", price: 80 },
    { appointmentId: "appointment-10", serviceId: "service-2", price: 50 },
    { appointmentId: "appointment-11", serviceId: "service-2", price: 50 },
    { appointmentId: "appointment-12", serviceId: "service-3", price: 120 }
  ],
  products: [
    { id: "product-1", name: "Pomada Modeladora", stock: 50, minStock: 10, salePrice: 35, isActive: true, barbershopId, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
    { id: "product-2", name: "Óleo para Barba", stock: 3, minStock: 5, salePrice: 45, isActive: true, barbershopId, createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
    { id: "product-3", name: "Shampoo Premium", stock: 25, minStock: 8, salePrice: 40, isActive: true, barbershopId, createdAt: new Date("2024-01-10"), updatedAt: new Date("2024-01-10") },
    { id: "product-4", name: "Cera Modeladora", stock: 30, minStock: 10, salePrice: 38, isActive: true, barbershopId, createdAt: new Date("2024-01-15"), updatedAt: new Date("2024-01-15") },
    { id: "product-5", name: "Gel Fixador Forte", stock: 20, minStock: 8, salePrice: 32, isActive: true, barbershopId, createdAt: new Date("2024-02-01"), updatedAt: new Date("2024-02-01") },
    { id: "product-6", name: "Balm Pós-Barba", stock: 15, minStock: 5, salePrice: 42, isActive: true, barbershopId, createdAt: new Date("2024-02-10"), updatedAt: new Date("2024-02-10") },
    { id: "product-7", name: "Shampoo Anticaspa", stock: 2, minStock: 6, salePrice: 45, isActive: true, barbershopId, createdAt: new Date("2024-03-01"), updatedAt: new Date("2024-03-01") },
    { id: "product-8", name: "Condicionador", stock: 18, minStock: 7, salePrice: 38, isActive: true, barbershopId, createdAt: new Date("2024-03-15"), updatedAt: new Date("2024-03-15") },
    { id: "product-9", name: "Spray Texturizador", stock: 35, minStock: 10, salePrice: 48, isActive: true, barbershopId, createdAt: new Date("2024-03-20"), updatedAt: new Date("2024-03-20") },
    { id: "product-10", name: "Pó Matificante", stock: 22, minStock: 8, salePrice: 52, isActive: true, barbershopId, createdAt: new Date("2024-04-01"), updatedAt: new Date("2024-04-01") },
    { id: "product-11", name: "Leave-in Hidratante", stock: 28, minStock: 9, salePrice: 44, isActive: true, barbershopId, createdAt: new Date("2024-04-10"), updatedAt: new Date("2024-04-10") },
    { id: "product-12", name: "Óleo Finalizador", stock: 19, minStock: 6, salePrice: 49, isActive: true, barbershopId, createdAt: new Date("2024-04-15"), updatedAt: new Date("2024-04-15") },
    { id: "product-13", name: "Sabonete para Barba", stock: 45, minStock: 12, salePrice: 28, isActive: true, barbershopId, createdAt: new Date("2024-05-01"), updatedAt: new Date("2024-05-01") },
    { id: "product-14", name: "Máscara Capilar", stock: 12, minStock: 5, salePrice: 55, isActive: true, barbershopId, createdAt: new Date("2024-05-10"), updatedAt: new Date("2024-05-10") },
    { id: "product-15", name: "Creme de Pentear", stock: 38, minStock: 10, salePrice: 36, isActive: true, barbershopId, createdAt: new Date("2024-05-20"), updatedAt: new Date("2024-05-20") }
  ],
  appointmentProducts: [
    { appointmentId: "appointment-2", productId: "product-1", quantity: 1, unitPrice: 35 },
    { appointmentId: "appointment-7", productId: "product-1", quantity: 1, unitPrice: 35 },
    { appointmentId: "appointment-7", productId: "product-6", quantity: 1, unitPrice: 42 }
  ]
}

export function getDb() {
  return mockDb
}

export { generateId }

