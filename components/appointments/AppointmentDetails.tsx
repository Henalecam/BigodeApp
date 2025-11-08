"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { AppointmentWithRelationsStringDate } from "@/types"
import { formatCurrency, formatDuration } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { appointmentFinalizeSchema } from "@/lib/validations/appointment"

const statusLabel: Record<AppointmentWithRelationsStringDate["status"], string> = {
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado"
}

const statusVariant: Record<AppointmentWithRelationsStringDate["status"], "default" | "success" | "warning" | "danger" | "outline"> = {
  CONFIRMED: "success",
  IN_PROGRESS: "warning",
  COMPLETED: "outline",
  CANCELLED: "danger"
}

type ServiceOption = {
  id: string
  name: string
  price: number
  duration: number
}

type ProductOption = {
  id: string
  name: string
  salePrice: number
  stock: number
}

type AppointmentDetailsProps = {
  appointment: AppointmentWithRelationsStringDate
  services: ServiceOption[]
  products: ProductOption[]
  canManage: boolean
}

type FinalizeFormSchema = z.infer<typeof appointmentFinalizeSchema>

export function AppointmentDetails({ appointment, services, products, canManage }: AppointmentDetailsProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [finalizeOpen, setFinalizeOpen] = useState(false)
  const [commission, setCommission] = useState<number | null>(null)
  const appointmentDate = new Date(appointment.date)

  const finalizeForm = useForm<FinalizeFormSchema>({
    resolver: zodResolver(appointmentFinalizeSchema),
    defaultValues: {
      services: appointment.services.map(item => ({
        id: item.serviceId,
        price: item.price
      })),
      products: appointment.products.map(item => ({
        id: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      totalValue: appointment.totalValue ?? appointment.services.reduce((total, item) => total + item.price, 0),
      paymentMethod: appointment.paymentMethod ?? "CASH"
    }
  })

  const handleStatusUpdate = async (status: "IN_PROGRESS" | "CONFIRMED") => {
    const response = await fetch(`/api/appointments/${appointment.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    })
    const json = await response.json()
    if (!json.success) {
      addToast({
        variant: "destructive",
        title: "Erro",
        description: json.error ?? "Não foi possível atualizar o status"
      })
      return
    }
    addToast({
      variant: "success",
      title: "Status atualizado"
    })
    router.refresh()
  }

  const handleCancel = async () => {
    const response = await fetch(`/api/appointments/${appointment.id}`, {
      method: "DELETE"
    })
    const json = await response.json()
    if (!json.success) {
      addToast({
        variant: "destructive",
        title: "Erro ao cancelar",
        description: json.error ?? "Tente novamente"
      })
      return
    }
    addToast({
      variant: "success",
      title: "Agendamento cancelado"
    })
    router.refresh()
  }

  const handleFinalize = async (values: FinalizeFormSchema) => {
    const response = await fetch(`/api/appointments/${appointment.id}/finalize`, {
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
        title: "Erro ao finalizar",
        description: json.error ?? "Revise os dados e tente novamente"
      })
      return
    }
    setCommission(json.data?.commission ?? null)
    addToast({
      variant: "success",
      title: "Atendimento finalizado"
    })
    setFinalizeOpen(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-primary">Agendamento</h1>
          <p className="text-sm text-neutral-500">
            {format(appointmentDate, "dd/MM/yyyy")} • {appointment.startTime} - {appointment.endTime}
          </p>
        </div>
        <Badge variant={statusVariant[appointment.status]}>{statusLabel[appointment.status]}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-primary/10">
          <CardContent className="space-y-3 p-4">
            <h3 className="text-sm font-semibold text-primary">Detalhes do cliente</h3>
            <div className="space-y-1 text-sm text-neutral-600">
              <p>{appointment.client.name}</p>
              <p>{appointment.client.phone}</p>
              {appointment.client.email ? <p>{appointment.client.email}</p> : null}
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/10">
          <CardContent className="space-y-3 p-4">
            <h3 className="text-sm font-semibold text-primary">Barbeiro</h3>
            <p className="text-sm text-neutral-600">{appointment.barber.name}</p>
            <p className="text-xs text-neutral-500">Comissão: {appointment.barber.commissionRate}%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/10">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead className="text-right">Preço</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointment.services.map(item => (
                <TableRow key={item.serviceId}>
                  <TableCell>{item.service.name}</TableCell>
                  <TableCell>{formatDuration(item.service.duration)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {appointment.products.length ? (
        <Card className="border-primary/10">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead className="text-right">Valor unitário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointment.products.map(item => (
                  <TableRow key={item.productId}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex items-center justify-between rounded-lg border border-primary/10 p-4">
        <div>
          <p className="text-sm text-neutral-500">Valor total</p>
          <h2 className="text-xl font-semibold text-primary">
            {formatCurrency(appointment.totalValue ?? appointment.services.reduce((total, item) => total + item.price, 0))}
          </h2>
        </div>
        {commission !== null ? (
          <div className="text-right">
            <p className="text-xs text-neutral-500">Comissão calculada</p>
            <p className="text-sm font-semibold text-primary">{formatCurrency(commission)}</p>
          </div>
        ) : null}
      </div>

      {canManage ? (
        <div className="flex flex-wrap items-center gap-3">
          {appointment.status === "CONFIRMED" ? (
            <Button onClick={() => handleStatusUpdate("IN_PROGRESS")}>Iniciar atendimento</Button>
          ) : null}
          {appointment.status === "IN_PROGRESS" ? (
            <Button onClick={() => setFinalizeOpen(true)}>Finalizar atendimento</Button>
          ) : null}
          {appointment.status === "CONFIRMED" ? (
            <Button variant="outline" onClick={() => handleCancel()}>
              Cancelar
            </Button>
          ) : null}
        </div>
      ) : null}

      <Dialog open={finalizeOpen} onOpenChange={setFinalizeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Finalizar atendimento</DialogTitle>
          </DialogHeader>
          <Form {...finalizeForm}>
            <form
              className="space-y-4"
              onSubmit={finalizeForm.handleSubmit(handleFinalize)}
            >
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">Serviços</h4>
                {finalizeForm.watch("services").map((service, index) => {
                  const serviceData = services.find(item => item.id === service.id)
                  return (
                    <div key={service.id} className="grid grid-cols-[1fr_120px] items-center gap-3 rounded-md border border-primary/10 p-3">
                      <p className="text-sm font-medium text-primary">{serviceData?.name}</p>
                      <Input
                        type="number"
                        min={0}
                        step="0.5"
                        value={service.price}
                        onChange={event => {
                          const value = Number(event.target.value)
                          const current = finalizeForm.getValues("services")
                          current[index].price = value
                          finalizeForm.setValue("services", [...current])
                        }}
                      />
                    </div>
                  )
                })}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">Produtos</h4>
                {finalizeForm.watch("products")?.map((product, index) => {
                  const productData = products.find(item => item.id === product.id)
                  return (
                    <div key={`${product.id}-${index}`} className="grid grid-cols-[1fr_100px_120px] items-center gap-3 rounded-md border border-primary/10 p-3">
                      <p className="text-sm font-medium text-primary">{productData?.name}</p>
                      <Input
                        type="number"
                        min={1}
                        value={product.quantity}
                        onChange={event => {
                          const value = Number(event.target.value)
                          const current = finalizeForm.getValues("products") ?? []
                          current[index].quantity = value
                          finalizeForm.setValue("products", [...current])
                        }}
                      />
                      <Input
                        type="number"
                        min={0}
                        step="0.5"
                        value={product.unitPrice}
                        onChange={event => {
                          const value = Number(event.target.value)
                          const current = finalizeForm.getValues("products") ?? []
                          current[index].unitPrice = value
                          finalizeForm.setValue("products", [...current])
                        }}
                      />
                    </div>
                  )
                })}
                <Select
                  onValueChange={value => {
                    const product = products.find(item => item.id === value)
                    if (!product) return
                    const current = finalizeForm.getValues("products") ?? []
                    finalizeForm.setValue("products", [
                      ...current,
                      {
                        id: product.id,
                        quantity: 1,
                        unitPrice: product.salePrice
                      }
                    ])
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Adicionar produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} • estoque {product.stock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <FormField
                control={finalizeForm.control}
                name="totalValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor total</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={finalizeForm.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de pagamento</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Dinheiro</SelectItem>
                        <SelectItem value="PIX">Pix</SelectItem>
                        <SelectItem value="DEBIT">Débito</SelectItem>
                        <SelectItem value="CREDIT">Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="ghost" type="button" onClick={() => setFinalizeOpen(false)}>
                  Fechar
                </Button>
                <Button type="submit">Finalizar atendimento</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

