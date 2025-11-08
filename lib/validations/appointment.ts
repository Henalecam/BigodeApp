import { z } from "zod"

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const appointmentCreateSchema = z
  .object({
    barberId: z.string().min(1),
    date: z.string().min(1),
    startTime: z.string().regex(timeRegex),
    serviceIds: z.array(z.string().min(1)).min(1),
    clientId: z.string().optional(),
    newClient: z
      .object({
        name: z.string().min(3),
        phone: z.string().min(10),
        email: z.string().email().optional(),
        notes: z.string().max(500).optional()
      })
      .optional(),
    notes: z.string().max(500).optional()
  })
  .refine(data => data.clientId || data.newClient, {
    path: ["clientId"],
    message: "Selecione ou cadastre um cliente"
  })

export const appointmentUpdateSchema = z.object({
  status: z.enum(["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  notes: z.string().max(500).optional(),
  startTime: z.string().regex(timeRegex).optional(),
  barberId: z.string().optional(),
  serviceIds: z.array(z.string().min(1)).min(1).optional()
})

export const appointmentFinalizeSchema = z.object({
  services: z
    .array(
      z.object({
        id: z.string().min(1),
        price: z.number().positive()
      })
    )
    .min(1),
  products: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.number().int().min(1),
        unitPrice: z.number().positive()
      })
    )
    .optional(),
  totalValue: z.number().positive(),
  paymentMethod: z.enum(["CASH", "PIX", "DEBIT", "CREDIT"])
})

