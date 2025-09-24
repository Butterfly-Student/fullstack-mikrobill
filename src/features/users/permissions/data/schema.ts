import { z } from 'zod'

// Resources schema
export const resourceSchema = z.object({
  id: z.number().int(),
  name: z.string().max(50),
  description: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
})
export type Resource = z.infer<typeof resourceSchema>
export const resourceListSchema = z.array(resourceSchema)

// Actions schema
export const actionSchema = z.object({
  id: z.number().int(),
  name: z.string().max(50),
  description: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
})
export type Action = z.infer<typeof actionSchema>
export const actionListSchema = z.array(actionSchema)

// Permissions schema
export const permissionSchema = z.object({
  id: z.number().int(),
  name: z.string().max(50),
  description: z.string().nullable().optional(),
  resourceId: z.number().int(),
  actionId: z.number().int(),
  createdAt: z.coerce.date(),
})
export type Permission = z.infer<typeof permissionSchema>
export const permissionListSchema = z.array(permissionSchema)

