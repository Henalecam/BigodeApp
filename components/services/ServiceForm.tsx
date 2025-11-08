"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { serviceCreateSchema } from "@/lib/validations/service"

const formSchema = serviceCreateSchema.extend({
  isActive: z.boolean().optional()
})

export type ServiceFormValues = z.infer<typeof formSchema>

type ServiceFormProps = {
  initialData?: {
    name: string
    duration: number
    price: number
    isActive: boolean
  }
  onSubmit: (values: ServiceFormValues) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function ServiceForm({ initialData, onSubmit, onCancel, loading }: ServiceFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      duration: initialData?.duration ?? 30,
      price: initialData?.price ?? 50,
      isActive: initialData?.isActive ?? true
    }
  })

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do serviço</FormLabel>
              <FormControl>
                <Input placeholder="Corte masculino" autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duração (minutos)</FormLabel>
              <FormControl>
                <Input type="number" min={5} step={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="0.5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={checked => field.onChange(Boolean(checked))} />
              </FormControl>
              <FormLabel className="text-sm font-normal">Serviço ativo</FormLabel>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  )
}

