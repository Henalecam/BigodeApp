"use client"

import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { BarberCard } from "@/components/barbers/BarberCard"
import { BarberForm, BarberFormValues } from "@/components/barbers/BarberForm"

type WorkingHour = {
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

type BarberData = {
  id: string
  name: string
  phone?: string | null
  commissionRate: number
  isActive: boolean
  workingHours: WorkingHour[]
  barberServices: {
    service: {
      id: string
    }
  }[]
}

type ServiceOption = {
  id: string
  name: string
}

type BarbersScreenProps = {
  initialBarbers: BarberData[]
  services: ServiceOption[]
  canManage: boolean
}

export function BarbersScreen({ initialBarbers, services, canManage }: BarbersScreenProps) {
  const { addToast } = useToast()
  const [barbers, setBarbers] = useState(initialBarbers)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Update barbers when initialBarbers changes
  useState(() => {
    if (initialBarbers.length > 0 && barbers.length === 0) {
      setBarbers(initialBarbers)
    }
  })

  const editingBarber = useMemo(() => barbers.find(barber => barber.id === editingId), [barbers, editingId])

  const handleSubmit = async (data: BarberFormValues) => {
    setLoading(true)
    try {
      if (editingBarber) {
        const response = await fetch(`/api/barbers/${editingBarber.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        })
        const json = await response.json()
        if (!json.success) {
          addToast({
            variant: "destructive",
            title: "Erro ao atualizar barbeiro",
            description: json.error ?? "Tente novamente"
          })
        } else {
          setBarbers(prev =>
            prev.map(barber => (barber.id === editingBarber.id ? json.data : barber))
          )
          addToast({
            variant: "success",
            title: "Barbeiro atualizado"
          })
          setOpen(false)
        }
      } else {
        const response = await fetch("/api/barbers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        })
        const json = await response.json()
        if (!json.success) {
          addToast({
            variant: "destructive",
            title: "Erro ao cadastrar barbeiro",
            description: json.error ?? "Verifique os dados"
          })
        } else {
          setBarbers(prev => [...prev, json.data])
          addToast({
            variant: "success",
            title: "Barbeiro criado"
          })
          setOpen(false)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Barbeiros</h1>
          <p className="text-sm text-neutral-600">Gerencie a equipe e seus horários • {barbers.length} {barbers.length === 1 ? 'profissional' : 'profissionais'}</p>
        </div>
        {canManage ? (
          <Button
            onClick={() => {
              setEditingId(null)
              setOpen(true)
            }}
          >
            + Novo barbeiro
          </Button>
        ) : null}
      </div>

      {barbers.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-white to-neutral-50 p-12 text-center">
          <p className="text-lg font-semibold text-neutral-700 mb-2">Nenhum barbeiro cadastrado</p>
          <p className="text-sm text-neutral-500">Clique em "+ Novo barbeiro" para adicionar o primeiro profissional</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {barbers.map(barber => (
          <BarberCard
            key={barber.id}
            id={barber.id}
            name={barber.name}
            phone={barber.phone}
            commissionRate={barber.commissionRate}
            isActive={barber.isActive}
            onEdit={id => {
              setEditingId(id)
              setOpen(true)
            }}
          />
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBarber ? "Editar barbeiro" : "Novo barbeiro"}</DialogTitle>
          </DialogHeader>
          <BarberForm
            services={services}
            loading={loading}
            initialData={
              editingBarber
                ? {
                    name: editingBarber.name,
                    phone: editingBarber.phone ?? "",
                    commissionRate: editingBarber.commissionRate,
                    isActive: editingBarber.isActive,
                    serviceIds: editingBarber.barberServices.map(item => item.service.id),
                    workingHours: editingBarber.workingHours
                  }
                : undefined
            }
            onSubmit={async values => {
              const payload = {
                name: values.name,
                phone: values.phone,
                commissionRate: values.commissionRate,
                isActive: values.isActive,
                workingHours: values.workingHours,
                serviceIds: values.serviceIds
              }
              await handleSubmit(payload)
            }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

