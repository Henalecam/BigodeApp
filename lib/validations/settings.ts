import { z } from "zod"

export const barbershopSettingsSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10),
  address: z.string().min(5)
})

export const profileSettingsSchema = z.object({
  name: z.string().min(3)
})




