"use client"

import { useState } from "react"
import { formatDuration, formatCurrency } from "@/lib/utils"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { ServiceForm, ServiceFormValues } from "@/components/services/ServiceForm"

type ServiceData = {
  id: string
  name: string
  duration: number
  price: number
  isActive: boolean
}

type ServicesScreenProps = {
  services: ServiceData[]
  canManage: boolean
}

export function ServicesScreen({ services: defaultServices, canManage }: ServicesScreenProps) {
  const { addToast } = useToast()
  const [services, setServices] = useState(defaultServices)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const editingService = services.find(service => service.id === editingId)

  const handleSubmit = async (values: ServiceFormValues) => {
    setLoading(true)
    try {
      if (editingService) {
        const response = await fetch(`/api/services/${editingService.id}`, {
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
            title: "Erro ao atualizar serviço",
            description: json.error ?? "Verifique os dados"
          })
        } else {
          setServices(prev => prev.map(service => (service.id === editingService.id ? json.data : service)))
          addToast({
            variant: "success",
            title: "Serviço atualizado"
          })
          setOpen(false)
        }
      } else {
        const response = await fetch("/api/services", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(values)
        })
        const json = await response.json()
        if (!json.success) {
          addToast({
            variant: "destructive",
            title: "Erro ao criar serviço",
            description: json.error ?? "Revise os dados"
          })
        } else {
          setServices(prev => [...prev, json.data])
          addToast({
            variant: "success",
            title: "Serviço criado"
          })
          setOpen(false)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (service: ServiceData) => {
    const response = await fetch(`/api/services/${service.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ isActive: !service.isActive })
    })
    const json = await response.json()
    if (!json.success) {
      addToast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: json.error ?? "Tente novamente"
      })
      return
    }
    setServices(prev => prev.map(item => (item.id === service.id ? json.data : item)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Serviços</h1>
          <p className="text-sm text-neutral-600">Gerencie os serviços oferecidos • {services.length} {services.length === 1 ? 'serviço' : 'serviços'}</p>
        </div>
        {canManage ? (
          <Button
            onClick={() => {
              setEditingId(null)
              setOpen(true)
            }}
          >
            + Novo serviço
          </Button>
        ) : null}
      </div>

      {services.length === 0 && canManage && (
        <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-white to-neutral-50 p-12 text-center">
          <p className="text-lg font-semibold text-neutral-700 mb-2">Nenhum serviço cadastrado</p>
          <p className="text-sm text-neutral-500">Clique em "+ Novo serviço" para adicionar o primeiro serviço</p>
        </div>
      )}

      {services.length > 0 && (
      <div className="rounded-2xl border border-primary/10 bg-white/95 backdrop-blur-md shadow-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Duração</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Status</TableHead>
            {canManage ? <TableHead className="text-right">Ações</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map(service => (
            <TableRow key={service.id}>
              <TableCell>{service.name}</TableCell>
              <TableCell>{formatDuration(service.duration)}</TableCell>
              <TableCell>{formatCurrency(service.price)}</TableCell>
              <TableCell>
                <Badge variant={service.isActive ? "success" : "outline"}>
                  {service.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              {canManage ? (
                <TableCell className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(service)}
                  >
                    {service.isActive ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingId(service.id)
                      setOpen(true)
                    }}
                  >
                    Editar
                  </Button>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingService ? "Editar serviço" : "Novo serviço"}</DialogTitle>
          </DialogHeader>
          <ServiceForm
            loading={loading}
            initialData={
              editingService
                ? {
                    name: editingService.name,
                    duration: editingService.duration,
                    price: editingService.price,
                    isActive: editingService.isActive
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

