"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { clientCreateSchema } from "@/lib/validations/client"

const formSchema = clientCreateSchema

export type ClientFormValues = z.infer<typeof formSchema>

type ClientFormProps = {
  initialData?: {
    name: string
    phone: string
    email?: string | null
    notes?: string | null
  }
  onSubmit: (values: ClientFormValues) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function ClientForm({ initialData, onSubmit, onCancel, loading }: ClientFormProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      notes: initialData?.notes ?? ""
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@cliente.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea placeholder="Informações adicionais" rows={3} {...field} />
              </FormControl>
              <FormMessage />
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

