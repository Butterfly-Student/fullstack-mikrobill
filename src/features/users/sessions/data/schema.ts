import { z } from 'zod'

const sessionSchema = z.object({
  id: z.string(),
  expiresAt: z.coerce.date(),
  token: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  userId: z.string(),
  impersonatedBy: z.string().nullable(),
})

export type Session = z.infer<typeof sessionSchema>

export const sessionListSchema = z.array(sessionSchema)
