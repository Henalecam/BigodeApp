"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { productCreateSchema } from "@/lib/validations/product"

const formSchema = productCreateSchema.extend({
  isActive: z.boolean().optional()
})

export type ProductFormValues = z.infer<typeof formSchema>

type ProductFormProps = {
  initialData?: {
    name: string
    stock: number
    minStock: number
    salePrice: number
    isActive: boolean
  }
  onSubmit: (values: ProductFormValues) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function ProductForm({ initialData, onSubmit, onCancel, loading }: ProductFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      stock: initialData?.stock ?? 0,
      minStock: initialData?.minStock ?? 5,
      salePrice: initialData?.salePrice ?? 30,
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
              <FormLabel>Nome do produto</FormLabel>
              <FormControl>
                <Input placeholder="Pomada modeladora" autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estoque atual</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estoque mínimo</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="salePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço de venda</FormLabel>
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
              <FormLabel className="text-sm font-normal">Produto ativo</FormLabel>
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

