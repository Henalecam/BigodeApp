import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { getDb } from "@/lib/mock-db"
import { AppointmentDetails } from "@/components/appointments/AppointmentDetails"

type PageProps = {
  params: {
    id: string
  }
}

export default async function AppointmentDetailsPage({ params }: PageProps) {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/login")
  }

  const db = getDb()
  const appointment = db.appointments.find(
    a => a.id === params.id && a.barbershopId === session.user.barbershopId
  )

  if (!appointment) {
    redirect("/agendamentos")
  }

  const appointmentWithRelations = {
    ...appointment,
    client: db.clients.find(c => c.id === appointment.clientId)!,
    barber: db.barbers.find(b => b.id === appointment.barberId)!,
    services: db.appointmentServices
      .filter(as => as.appointmentId === appointment.id)
      .map(as => ({
        appointmentId: as.appointmentId,
        serviceId: as.serviceId,
        price: as.price,
        service: db.services.find(s => s.id === as.serviceId)!
      })),
    products: db.appointmentProducts
      .filter(ap => ap.appointmentId === appointment.id)
      .map(ap => ({
        appointmentId: ap.appointmentId,
        productId: ap.productId,
        quantity: ap.quantity,
        unitPrice: ap.unitPrice,
        product: db.products.find(p => p.id === ap.productId)!
      }))
  }

  const services = db.services
    .filter(s => s.barbershopId === session.user.barbershopId && s.isActive)
    .sort((a, b) => a.name.localeCompare(b.name))

  const products = db.products
    .filter(p => p.barbershopId === session.user.barbershopId && p.isActive)
    .sort((a, b) => a.name.localeCompare(b.name))

  const appointmentData = {
    ...appointmentWithRelations,
    date: appointment.date.toISOString()
  }

  const formattedServices = services.map(service => ({
    id: service.id,
    name: service.name,
    price: service.price,
    duration: service.duration
  }))

  const formattedProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    salePrice: product.salePrice,
    stock: product.stock
  }))

  return (
    <AppointmentDetails
      appointment={appointmentData}
      services={formattedServices}
      products={formattedProducts}
      canManage={session.user.role === "ADMIN" || session.user.role === "BARBER"}
    />
  )
}

