import { z } from "zod"

export const productCreateSchema = z.object({
  name: z.string().min(3),
  stock: z.number().int().min(0),
  minStock: z.number().int().min(0),
  salePrice: z.number().positive(),
  isActive: z.boolean().optional()
})

export const productUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  salePrice: z.number().positive().optional(),
  isActive: z.boolean().optional()
})

