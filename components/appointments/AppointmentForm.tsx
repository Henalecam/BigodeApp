"use client"

import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { TimeSlotPicker } from "@/components/calendar/TimeSlotPicker"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { appointmentCreateSchema } from "@/lib/validations/appointment"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDuration } from "@/lib/utils"

type BarberOption = {
  id: string
  name: string
  commissionRate: number
  workingHours: {
    dayOfWeek: number
    startTime: string
    endTime: string
    isActive: boolean
  }[]
  services: {
    service: {
      id: string
    }
  }[]
}

type ServiceOption = {
  id: string
  name: string
  duration: number
  price: number
}

type ClientOption = {
  id: string
  name: string
  phone: string
}

type AppointmentFormProps = {
  barbers: BarberOption[]
  services: ServiceOption[]
  clients: ClientOption[]
}

type AppointmentResponse = {
  success: boolean
  data?: {
    id: string
  }
  error?: string
}

type AppointmentSlot = {
  startTime: string
  endTime: string
  status: string
}

type AppointmentFetch = {
  success: boolean
  data: {
    startTime: string
    endTime: string
    status: "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  }[]
}

const formSchema = appointmentCreateSchema.extend({
  date: z.string().min(1),
  barberId: z.string().min(1),
  serviceIds: z.array(z.string().min(1)).min(1),
  startTime: z.string().min(1)
})

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  return hours * 60 + minutes
}

function fromMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
}

function calculateSlots(
  barber: BarberOption,
  date: Date,
  duration: number,
  appointments: AppointmentSlot[]
) {
  const workingHour = barber.workingHours.find(
    slot => slot.dayOfWeek === date.getDay() && slot.isActive
  )
  if (!workingHour) return []
  const startMinutes = toMinutes(workingHour.startTime)
  const endMinutes = toMinutes(workingHour.endTime)
  const now = new Date()
  const isToday = format(now, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
  const existing = appointments
    .filter(appointment => appointment.status !== "CANCELLED")
    .map(appointment => ({
      start: toMinutes(appointment.startTime),
      end: toMinutes(appointment.endTime)
    }))
  const slots: string[] = []
  const interval = 15
  for (let minute = startMinutes; minute + duration <= endMinutes; minute += interval) {
    if (isToday) {
      const startDate = new Date(date)
      startDate.setHours(0, minute, 0, 0)
      if (startDate <= now) continue
    }
    const end = minute + duration
    const overlaps = existing.some(appointment => {
      return !(appointment.end <= minute || appointment.start >= end)
    })
    if (!overlaps) {
      slots.push(fromMinutes(minute))
    }
  }
  return slots
}

export function AppointmentForm({ barbers, services, clients }: AppointmentFormProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [step, setStep] = useState(1)
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [existingAppointments, setExistingAppointments] = useState<AppointmentSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      barberId: "",
      serviceIds: [],
      date: "",
      startTime: "",
      clientId: "",
      notes: ""
    }
  })

  const selectedBarber = useMemo(
    () => barbers.find(barber => barber.id === form.watch("barberId")) ?? null,
    [barbers, form]
  )

  const selectedServices = useMemo(() => {
    const ids = form.watch("serviceIds")
    return services.filter(service => ids.includes(service.id))
  }, [services, form])

  const totalDuration = selectedServices.reduce((total, service) => total + service.duration, 0)
  const totalValue = selectedServices.reduce((total, service) => total + service.price, 0)

  const availableSlots = useMemo(() => {
    if (!selectedBarber || !selectedDate || !totalDuration) return []
    return calculateSlots(selectedBarber, selectedDate, totalDuration, existingAppointments)
  }, [selectedBarber, selectedDate, totalDuration, existingAppointments])

  useEffect(() => {
    if (!selectedBarber || !selectedDate || !selectedServices.length) return
    const formattedDate = format(selectedDate, "yyyy-MM-dd")
    form.setValue("date", formattedDate)
    setLoadingSlots(true)
    fetch(`/api/appointments?date=${formattedDate}&barberId=${selectedBarber.id}`, {
      cache: "no-store"
    })
      .then(response => response.json() as Promise<AppointmentFetch>)
      .then(data => {
        if (data.success) {
          setExistingAppointments(
            data.data.map(appointment => ({
              startTime: appointment.startTime,
              endTime: appointment.endTime,
              status: appointment.status
            }))
          )
        }
      })
      .finally(() => setLoadingSlots(false))
  }, [selectedBarber, selectedDate, selectedServices.length, form])

  const canProceed = useMemo(() => {
    if (step === 1) {
      return Boolean(form.watch("barberId"))
    }
    if (step === 2) {
      return form.watch("serviceIds").length > 0
    }
    if (step === 3) {
      return Boolean(form.watch("date") && form.watch("startTime"))
    }
    if (step === 4) {
      if (clientMode === "existing") {
        return Boolean(form.watch("clientId"))
      }
      const newClient = form.watch("newClient")
      return Boolean(newClient?.name && newClient.name.length >= 3 && newClient.phone && newClient.phone.length >= 10)
    }
    return true
  }, [form, step, clientMode])

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const payload = {
      barberId: values.barberId,
      serviceIds: values.serviceIds,
      date: values.date,
      startTime: values.startTime,
      notes: values.notes,
      clientId: clientMode === "existing" ? values.clientId : undefined,
      newClient: clientMode === "new" ? values.newClient : undefined
    }

    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
    const json = (await response.json()) as AppointmentResponse
    if (!json.success) {
      addToast({
        variant: "destructive",
        title: "Erro ao criar agendamento",
        description: json.error ?? "Tente novamente"
      })
      return
    }
    addToast({
      variant: "success",
      title: "Agendamento criado",
      description: "O atendimento foi adicionado à agenda"
    })
    router.push(`/agendamentos/${json.data?.id ?? ""}`)
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <span className={step === 1 ? "font-semibold text-primary" : ""}>1. Barbeiro</span>
        <span>/</span>
        <span className={step === 2 ? "font-semibold text-primary" : ""}>2. Serviços</span>
        <span>/</span>
        <span className={step === 3 ? "font-semibold text-primary" : ""}>3. Data e hora</span>
        <span>/</span>
        <span className={step === 4 ? "font-semibold text-primary" : ""}>4. Cliente</span>
        <span>/</span>
        <span className={step === 5 ? "font-semibold text-primary" : ""}>5. Resumo</span>
      </div>

      {step === 1 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {barbers.map(barber => {
            const selected = form.watch("barberId") === barber.id
            return (
              <Card
                key={barber.id}
                className={`cursor-pointer border ${selected ? "border-primary bg-primary/5" : "border-primary/10"} transition`}
                onClick={() => {
                  form.setValue("barberId", barber.id)
                  form.setValue("serviceIds", [])
                  form.setValue("startTime", "")
                  setSelectedDate(undefined)
                }}
              >
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-primary">{barber.name}</h3>
                    <Badge variant="outline">{barber.commissionRate}%</Badge>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {barber.workingHours.length} dias ativos
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : null}

      {step === 2 && selectedBarber ? (
        <div className="space-y-3">
          {services
            .filter(service =>
              selectedBarber.services.some(item => item.service.id === service.id)
            )
            .map(service => (
              <label
                key={service.id}
                className="flex cursor-pointer items-center justify-between rounded-md border border-primary/10 p-3 transition hover:border-primary/40"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={form.watch("serviceIds").includes(service.id)}
                    onCheckedChange={(checked) => {
                      const current = form.getValues("serviceIds")
                      if (checked) {
                        form.setValue("serviceIds", [...current, service.id])
                      } else {
                        form.setValue(
                          "serviceIds",
                          current.filter(id => id !== service.id)
                        )
                      }
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-primary">{service.name}</p>
                    <p className="text-xs text-neutral-500">
                      {formatDuration(service.duration)} • {formatCurrency(service.price)}
                    </p>
                  </div>
                </div>
              </label>
            ))}
        </div>
      ) : null}

      {step === 3 && selectedBarber ? (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="border-primary/10">
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={date => {
                  setSelectedDate(date ?? undefined)
                  form.setValue("startTime", "")
                }}
                fromDate={new Date()}
                ISOWeek
              />
            </CardContent>
          </Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-primary">Horários disponíveis</h3>
              <p className="text-xs text-neutral-500">{selectedServices.length} serviços selecionados</p>
            </div>
            {loadingSlots ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <TimeSlotPicker
                slots={availableSlots}
                selected={form.watch("startTime")}
                loading={false}
                onSelect={time => form.setValue("startTime", time)}
              />
            )}
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <RadioGroup
            value={clientMode}
            onValueChange={value => {
              setClientMode(value as "existing" | "new")
              form.setValue("clientId", "")
              form.setValue("newClient", undefined)
            }}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="existing" id="client-existing" />
              <Label htmlFor="client-existing">Cliente existente</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="new" id="client-new" />
              <Label htmlFor="client-new">Novo cliente</Label>
            </div>
          </RadioGroup>

          {clientMode === "existing" ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {clients.map(client => {
                const selected = form.watch("clientId") === client.id
                return (
                  <Card
                    key={client.id}
                    className={`cursor-pointer border ${selected ? "border-primary bg-primary/5" : "border-primary/10"} transition`}
                    onClick={() => form.setValue("clientId", client.id)}
                  >
                    <CardContent className="space-y-1 p-4">
                      <p className="text-sm font-medium text-primary">{client.name}</p>
                      <p className="text-xs text-neutral-500">{client.phone}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                placeholder="Nome completo"
                autoFocus
                value={form.watch("newClient")?.name ?? ""}
                onChange={event =>
                  form.setValue("newClient", {
                    ...form.getValues("newClient"),
                    name: event.target.value
                  })
                }
              />
              <Input
                placeholder="Telefone"
                value={form.watch("newClient")?.phone ?? ""}
                onChange={event =>
                  form.setValue("newClient", {
                    ...form.getValues("newClient"),
                    phone: event.target.value
                  })
                }
              />
              <Input
                placeholder="Email"
                value={form.watch("newClient")?.email ?? ""}
                onChange={event =>
                  form.setValue("newClient", {
                    ...form.getValues("newClient"),
                    email: event.target.value
                  })
                }
              />
              <Textarea
                placeholder="Observações"
                value={form.watch("newClient")?.notes ?? ""}
                onChange={event =>
                  form.setValue("newClient", {
                    ...form.getValues("newClient"),
                    notes: event.target.value
                  })
                }
              />
            </div>
          )}
        </div>
      ) : null}

      {step === 5 ? (
        <div className="space-y-5 rounded-lg border border-primary/10 p-5">
          <div>
            <h3 className="text-sm font-semibold text-primary">Resumo do agendamento</h3>
            <p className="text-sm text-neutral-600">
              {selectedServices.length} serviço(s) • {formatDuration(totalDuration)} • {formatCurrency(totalValue)}
            </p>
          </div>
          <Textarea
            placeholder="Observações adicionais (opcional)"
            value={form.watch("notes") ?? ""}
            onChange={event => form.setValue("notes", event.target.value)}
          />
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          disabled={step === 1}
          onClick={() => setStep(current => Math.max(1, current - 1))}
        >
          Voltar
        </Button>
        {step < 5 ? (
          <Button
            type="button"
            disabled={!canProceed}
            onClick={() => setStep(current => Math.min(5, current + 1))}
          >
            Avançar
          </Button>
        ) : (
          <Button type="submit" disabled={!canProceed}>
            Confirmar agendamento
          </Button>
        )}
      </div>
    </form>
  )
}

