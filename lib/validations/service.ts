import { z } from "zod"

export const serviceCreateSchema = z.object({
  name: z.string().min(3),
  duration: z.number().int().min(5),
  price: z.number().positive(),
  isActive: z.boolean().optional()
})

export const serviceUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  duration: z.number().int().min(5).optional(),
  price: z.number().positive().optional(),
  isActive: z.boolean().optional()
})

