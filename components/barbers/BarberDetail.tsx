"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { BarberForm, BarberFormValues } from "@/components/barbers/BarberForm"

type BarberDetailProps = {
  barber: {
    id: string
    name: string
    phone?: string | null
    commissionRate: number
    isActive: boolean
    workingHours: {
      dayOfWeek: number
      startTime: string
      endTime: string
      isActive: boolean
    }[]
    barberServices: {
      service: {
        id: string
      }
    }[]
  }
  services: {
    id: string
    name: string
  }[]
}

export function BarberDetail({ barber, services }: BarberDetailProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: BarberFormValues) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/barbers/${barber.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      })
      const json = await response.json()
      if (!json.success) {
        addToast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: json.error ?? "Verifique os dados"
        })
      } else {
        addToast({
          variant: "success",
          title: "Dados atualizados"
        })
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">{barber.name}</h1>
          <p className="text-sm text-neutral-500">Atualize os dados do barbeiro</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
      <BarberForm
        services={services}
        loading={loading}
        initialData={{
          name: barber.name,
          phone: barber.phone ?? "",
          commissionRate: barber.commissionRate,
          isActive: barber.isActive,
          serviceIds: barber.barberServices.map(item => item.service.id),
          workingHours: barber.workingHours
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  )
}

