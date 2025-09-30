import { z } from 'zod'

export const pelangganSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().nullable().optional(),
  password: z.string().nullable().optional(),
  alamat: z.string().nullable().optional(),
  telepon: z.string().nullable().optional(),
  createdAt: z.date().nullable(),
})

export const pelangganFormSchema = pelangganSchema.omit({ id: true, createdAt: true })

export type PelangganForm = z.infer<typeof pelangganFormSchema>

export type Pelanggan = z.infer<typeof pelangganSchema>
