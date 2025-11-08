import { z } from "zod"

const workingHourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  isActive: z.boolean().optional()
})

export const barberCreateSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10).optional(),
  commissionRate: z.number().min(0).max(100),
  workingHours: z.array(workingHourSchema).min(1),
  serviceIds: z.array(z.string().min(1)).min(1)
})

export const barberUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  phone: z.string().min(10).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  workingHours: z.array(workingHourSchema).optional(),
  serviceIds: z.array(z.string().min(1)).optional()
})

