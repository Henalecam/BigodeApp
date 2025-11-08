"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ClientForm, ClientFormValues } from "@/components/clients/ClientForm"
import { formatCurrency } from "@/lib/utils"

type AppointmentHistory = {
  id: string
  date: string
  barberName: string
  services: string[]
  total: number
}

type ClientDetailProps = {
  client: {
    id: string
    name: string
    phone: string
    email?: string | null
    notes?: string | null
    totalSpent: number
    appointments: AppointmentHistory[]
  }
}

export function ClientDetail({ client }: ClientDetailProps) {
  const { addToast } = useToast()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async (values: ClientFormValues) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
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
          title: "Erro ao atualizar cliente",
          description: json.error ?? "Tente novamente"
        })
      } else {
        addToast({
          variant: "success",
          title: "Cliente atualizado"
        })
        setEditing(false)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">{client.name}</h1>
          <p className="text-sm text-neutral-500">{client.phone}</p>
          {client.email ? <p className="text-xs text-neutral-500">{client.email}</p> : null}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Voltar
          </Button>
          <Button onClick={() => setEditing(true)}>Editar</Button>
        </div>
      </div>

      <Card className="border-primary/10">
        <CardContent className="space-y-2 p-4">
          <p className="text-sm text-neutral-500">Total gasto</p>
          <p className="text-xl font-semibold text-primary">{formatCurrency(client.totalSpent)}</p>
          {client.notes ? <p className="text-sm text-neutral-500">{client.notes}</p> : null}
        </CardContent>
      </Card>

      <Card className="border-primary/10">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Barbeiro</TableHead>
                <TableHead>Serviços</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {client.appointments.map(appointment => (
                <TableRow key={appointment.id}>
                  <TableCell>{format(new Date(appointment.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{appointment.barberName}</TableCell>
                  <TableCell>{appointment.services.join(", ")}</TableCell>
                  <TableCell className="text-right">{formatCurrency(appointment.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editing ? (
        <Card className="border-primary/10">
          <CardContent className="p-4">
            <ClientForm
              loading={saving}
              initialData={{
                name: client.name,
                phone: client.phone,
                email: client.email ?? "",
                notes: client.notes ?? ""
              }}
              onSubmit={handleSave}
              onCancel={() => setEditing(false)}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

