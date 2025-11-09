"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getDb } from "@/lib/mock-db"
import { AppointmentDetails } from "@/components/appointments/AppointmentDetails"
import { Skeleton } from "@/components/ui/skeleton"

export default function AppointmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [appointmentData, setAppointmentData] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const db = getDb()
    const appointment = db.appointments.find(
      a => a.id === params.id && a.barbershopId === "barbershop-1"
    )

    if (!appointment) {
      router.push("/agendamentos")
      return
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

    const servicesData = db.services
      .filter(s => s.barbershopId === "barbershop-1" && s.isActive)
      .map(service => ({
        id: service.id,
        name: service.name,
        price: service.price,
        duration: service.duration
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    const productsData = db.products
      .filter(p => p.barbershopId === "barbershop-1" && p.isActive)
      .map(product => ({
        id: product.id,
        name: product.name,
        salePrice: product.salePrice,
        stock: product.stock
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    setAppointmentData({
      ...appointmentWithRelations,
      date: appointment.date.toISOString()
    })
    setServices(servicesData)
    setProducts(productsData)
    setLoading(false)
  }, [params.id, router])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!appointmentData) return null

  return (
    <AppointmentDetails
      appointment={appointmentData}
      services={services}
      products={products}
      canManage={true}
    />
  )
}
