import { PrismaClient, Role, AppointmentStatus, PaymentMethod } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  await prisma.appointmentProduct.deleteMany()
  await prisma.appointmentService.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.workingHours.deleteMany()
  await prisma.barberService.deleteMany()
  await prisma.product.deleteMany()
  await prisma.service.deleteMany()
  await prisma.client.deleteMany()
  await prisma.barber.deleteMany()
  await prisma.user.deleteMany()
  await prisma.barbershop.deleteMany()

  const password = await hash("Admin123!", 10)
  const barberPassword = await hash("Barber123!", 10)

  const barbershop = await prisma.barbershop.create({
    data: {
      name: "BarberPro Central",
      phone: "+55 11 99999-9999",
      address: "Rua Principal 123"
    }
  })

  const services = await prisma.$transaction([
    prisma.service.create({
      data: {
        name: "Corte Premium",
        duration: 45,
        price: 80,
        barbershopId: barbershop.id
      }
    }),
    prisma.service.create({
      data: {
        name: "Barba Completa",
        duration: 30,
        price: 50,
        barbershopId: barbershop.id
      }
    }),
    prisma.service.create({
      data: {
        name: "Combo Corte e Barba",
        duration: 75,
        price: 120,
        barbershopId: barbershop.id
      }
    })
  ])

  const products = await prisma.$transaction([
    prisma.product.create({
      data: {
        name: "Pomada Modeladora",
        stock: 50,
        minStock: 10,
        salePrice: 35,
        barbershopId: barbershop.id
      }
    }),
    prisma.product.create({
      data: {
        name: "Óleo para Barba",
        stock: 20,
        minStock: 5,
        salePrice: 45,
        barbershopId: barbershop.id
      }
    })
  ])

  const barber = await prisma.barber.create({
    data: {
      name: "João Silva",
      phone: "+55 11 98888-8888",
      commissionRate: 50,
      barbershopId: barbershop.id,
      workingHours: {
        create: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "18:00" },
          { dayOfWeek: 2, startTime: "09:00", endTime: "18:00" },
          { dayOfWeek: 3, startTime: "09:00", endTime: "18:00" },
          { dayOfWeek: 4, startTime: "09:00", endTime: "18:00" },
          { dayOfWeek: 5, startTime: "09:00", endTime: "18:00" }
        ]
      },
      barberServices: {
        create: services.map(service => ({
          service: {
            connect: { id: service.id }
          }
        }))
      }
    }
  })

  const barberTwo = await prisma.barber.create({
    data: {
      name: "Carlos Andrade",
      phone: "+55 11 97777-7777",
      commissionRate: 55,
      barbershopId: barbershop.id,
      workingHours: {
        create: [
          { dayOfWeek: 2, startTime: "10:00", endTime: "19:00" },
          { dayOfWeek: 3, startTime: "10:00", endTime: "19:00" },
          { dayOfWeek: 4, startTime: "10:00", endTime: "19:00" },
          { dayOfWeek: 5, startTime: "10:00", endTime: "19:00" },
          { dayOfWeek: 6, startTime: "09:00", endTime: "16:00" }
        ]
      },
      barberServices: {
        create: services.slice(0, 2).map(service => ({
          service: {
            connect: { id: service.id }
          }
        }))
      }
    }
  })

  const clients = await prisma.$transaction([
    prisma.client.create({
      data: {
        name: "Pedro Martins",
        phone: "+55 11 96666-6666",
        email: "pedro@example.com",
        barbershopId: barbershop.id
      }
    }),
    prisma.client.create({
      data: {
        name: "Lucas Rocha",
        phone: "+55 11 95555-5555",
        email: "lucas@example.com",
        barbershopId: barbershop.id
      }
    })
  ])

  await prisma.user.create({
    data: {
      email: "admin@barberpro.com",
      password: password,
      name: "Administrador",
      role: Role.ADMIN,
      barbershopId: barbershop.id
    }
  })

  await prisma.user.create({
    data: {
      email: "joao@barberpro.com",
      password: barberPassword,
      name: "João Silva",
      role: Role.BARBER,
      barbershopId: barbershop.id
    }
  })

  await prisma.appointment.create({
    data: {
      date: new Date(),
      startTime: "10:00",
      endTime: "11:15",
      status: AppointmentStatus.CONFIRMED,
      barbershopId: barbershop.id,
      barberId: barber.id,
      clientId: clients[0].id,
      services: {
        create: [
          {
            service: { connect: { id: services[0].id } },
            price: services[0].price
          },
          {
            service: { connect: { id: services[1].id } },
            price: services[1].price
          }
        ]
      }
    }
  })

  await prisma.appointment.create({
    data: {
      date: new Date(),
      startTime: "14:00",
      endTime: "14:45",
      status: AppointmentStatus.COMPLETED,
      notes: "Cliente pediu acabamento moderno",
      totalValue: 115,
      paymentMethod: PaymentMethod.CREDIT,
      barbershopId: barbershop.id,
      barberId: barberTwo.id,
      clientId: clients[1].id,
      services: {
        create: [
          {
            service: { connect: { id: services[0].id } },
            price: services[0].price
          }
        ]
      },
      products: {
        create: [
          {
            product: { connect: { id: products[0].id } },
            quantity: 1,
            unitPrice: products[0].salePrice
          }
        ]
      }
    }
  })
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

