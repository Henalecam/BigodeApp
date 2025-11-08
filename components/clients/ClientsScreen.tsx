"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ClientCard } from "@/components/clients/ClientCard"
import { ClientForm, ClientFormValues } from "@/components/clients/ClientForm"
import { format } from "date-fns"

type ClientData = {
  id: string
  name: string
  phone: string
  email?: string | null
  notes?: string | null
  _count: {
    appointments: number
  }
  appointments: {
    date: string
  }[]
}

type ClientsScreenProps = {
  initialClients: ClientData[]
  canManage: boolean
}

export function ClientsScreen({ initialClients, canManage }: ClientsScreenProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [query, setQuery] = useState("")
  const [clients, setClients] = useState(initialClients)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const handler = setTimeout(() => {
      const fetchClients = async () => {
        setLoading(true)
        try {
          const response = await fetch(`/api/clients?query=${encodeURIComponent(query)}`, {
            cache: "no-store"
          })
          const json = await response.json()
          if (json.success) {
            setClients(json.data)
          }
        } finally {
          setLoading(false)
        }
      }
      fetchClients()
    }, 300)
    return () => clearTimeout(handler)
  }, [query])

  const handleCreate = async (values: ClientFormValues) => {
    setSaving(true)
    try {
      const response = await fetch("/api/clients", {
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
          title: "Erro ao cadastrar cliente",
          description: json.error ?? "Verifique os dados"
        })
      } else {
        setClients(prev => [json.data, ...prev])
        addToast({
          variant: "success",
          title: "Cliente cadastrado"
        })
        setOpen(false)
      }
    } finally {
      setSaving(false)
    }
  }

  const sortedClients = useMemo(() => {
    return clients.sort((a, b) => a.name.localeCompare(b.name))
  }, [clients])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Clientes</h1>
          <p className="text-sm text-neutral-500">Histórico e dados dos clientes</p>
        </div>
        {canManage ? (
          <Button onClick={() => setOpen(true)}>Novo cliente</Button>
        ) : null}
      </div>
      <Input
        placeholder="Buscar por nome ou telefone"
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedClients.map(client => (
            <ClientCard
              key={client.id}
              id={client.id}
              name={client.name}
              phone={client.phone}
              appointmentsCount={client._count.appointments}
              lastAppointment={
                client.appointments[0]
                  ? format(new Date(client.appointments[0].date), "dd/MM/yyyy")
                  : undefined
              }
              onView={id => router.push(`/clientes/${id}`)}
            />
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo cliente</DialogTitle>
          </DialogHeader>
          <ClientForm
            loading={saving}
            onSubmit={handleCreate}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

