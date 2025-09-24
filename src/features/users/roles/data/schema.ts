import z from 'zod'
import { permissionSchema } from '../../permissions/data/schema'

export const roleRelationSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable().optional(), // kalau deskripsi opsional

  // User-role part
  userId: z.string().optional(), // optional kalau memang role bisa global
  assignedBy: z.string().nullable(), // konsisten camelCase
  assignedAt: z.coerce.date().optional(),

  // Role-permission part (nested permission)
  permissions: z.array(permissionSchema).min(1), // pakai plural + minimal 1
  grantedAt: z.coerce.date().optional(),
})

export type RoleRelation = z.infer<typeof roleRelationSchema>
export const roleRelationListSchema = z.array(roleRelationSchema)
