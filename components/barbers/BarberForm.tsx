"use client"

import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const workingHourSchema = z.object({
  dayOfWeek: z.number(),
  isActive: z.boolean(),
  startTime: z.string(),
  endTime: z.string()
})

const formSchema = z.object({
  name: z.string().min(3),
  phone: z.string().optional(),
  commissionRate: z.number().min(0).max(100),
  isActive: z.boolean().optional(),
  serviceIds: z.array(z.string().min(1)).min(1),
  workingHours: z.array(workingHourSchema).min(1)
})

export type BarberFormValues = z.infer<typeof formSchema>

type BarberFormProps = {
  services: { id: string; name: string }[]
  initialData?: {
    name: string
    phone?: string | null
    commissionRate: number
    isActive: boolean
    serviceIds: string[]
    workingHours: {
      dayOfWeek: number
      startTime: string
      endTime: string
      isActive: boolean
    }[]
  }
  onSubmit: (values: BarberFormValues) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const days = [
  { label: "Domingo", value: 0 },
  { label: "Segunda", value: 1 },
  { label: "Terça", value: 2 },
  { label: "Quarta", value: 3 },
  { label: "Quinta", value: 4 },
  { label: "Sexta", value: 5 },
  { label: "Sábado", value: 6 }
]

export function BarberForm({ services, initialData, onSubmit, onCancel, loading }: BarberFormProps) {
  const defaultWorkingHours = useMemo(
    () =>
      days.map(day => ({
        dayOfWeek: day.value,
        isActive: [1, 2, 3, 4, 5].includes(day.value),
        startTime: "09:00",
        endTime: "18:00"
      })),
    []
  )

  const form = useForm<BarberFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      phone: initialData?.phone ?? "",
      commissionRate: initialData?.commissionRate ?? 50,
      isActive: initialData?.isActive ?? true,
      serviceIds: initialData?.serviceIds ?? [],
      workingHours: initialData?.workingHours ?? defaultWorkingHours
    }
  })

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo" autoFocus {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="+55 11 90000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="commissionRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comissão (%)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={100} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0 pt-6">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={checked => field.onChange(Boolean(checked))} />
                </FormControl>
                <FormLabel className="text-sm font-normal">Barbeiro ativo</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary">Serviços</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(service => (
              <label
                key={service.id}
                className="flex cursor-pointer items-center justify-between rounded-md border border-primary/10 px-3 py-2 text-sm transition hover:border-primary/40"
              >
                <span>{service.name}</span>
                <Checkbox
                  checked={form.watch("serviceIds").includes(service.id)}
                  onCheckedChange={checked => {
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
              </label>
            ))}
          </div>
          <FormMessage>{form.formState.errors.serviceIds?.message}</FormMessage>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary">Horários de trabalho</h3>
          <div className="space-y-2">
            {days.map(day => {
              const workingHour = form.watch("workingHours").find(item => item.dayOfWeek === day.value)
              if (!workingHour) return null
              return (
                <div key={day.value} className="grid gap-2 rounded-lg border border-primary/10 p-3 sm:grid-cols-[160px_1fr_1fr]">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={workingHour.isActive}
                      onCheckedChange={checked => {
                        const current = form.getValues("workingHours")
                        const index = current.findIndex(item => item.dayOfWeek === day.value)
                        current[index].isActive = Boolean(checked)
                        form.setValue("workingHours", [...current])
                      }}
                    />
                    <Badge variant={workingHour.isActive ? "success" : "outline"}>{day.label}</Badge>
                  </div>
                  <Input
                    type="time"
                    value={workingHour.startTime}
                    onChange={event => {
                      const current = form.getValues("workingHours")
                      const index = current.findIndex(item => item.dayOfWeek === day.value)
                      current[index].startTime = event.target.value
                      form.setValue("workingHours", [...current])
                    }}
                  />
                  <Input
                    type="time"
                    value={workingHour.endTime}
                    onChange={event => {
                      const current = form.getValues("workingHours")
                      const index = current.findIndex(item => item.dayOfWeek === day.value)
                      current[index].endTime = event.target.value
                      form.setValue("workingHours", [...current])
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            Salvar barbeiro
          </Button>
        </div>
      </form>
    </Form>
  )
}

