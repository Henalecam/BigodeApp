import { z } from "zod"

const phoneRegex = /^\+?\d{10,15}$/

export const clientCreateSchema = z.object({
  name: z.string().min(3),
  phone: z.string().regex(phoneRegex),
  email: z.string().email().optional(),
  notes: z.string().max(500).optional()
})

export const clientUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  phone: z.string().regex(phoneRegex).optional(),
  email: z.string().email().optional(),
  notes: z.string().max(500).optional()
})

