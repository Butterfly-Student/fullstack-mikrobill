import { z } from 'zod';


// Router status schema - sesuai dengan database schema
const routerStatusSchema = z.union([
  z.literal('online'),
  z.literal('offline'),
  z.literal('error'),
])
export type RouterStatus = z.infer<typeof routerStatusSchema>

// Router type/category schema
const _routerTypeSchema = z.union([
  z.literal('gateway'),
  z.literal('core'),
  z.literal('access_point'),
  z.literal('edge'),
])
export type RouterType = z.infer<typeof _routerTypeSchema>

const _routerBrandSchema = z.union([
  z.literal('mikrotik'),
  z.literal('cisco'),
  z.literal('ubiquiti'),
  z.literal('tplink'),
  z.literal('other'),
])
export type RouterBrand = z.infer<typeof _routerBrandSchema>

// Main router schema - sesuai dengan pgTable schema
const routerSchema = z.object({
  id: z.number().int().positive(),
  uuid: z.string().uuid(),
  name: z.string().min(1).max(100),
  hostname: z
    .string()
    .regex(
      /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/,
      'Invalid IP address'
    ),
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(255),
  keepalive: z.boolean().default(true),
  timeout: z.number().int().positive().default(300000), // dalam milliseconds
  port: z.number().int().min(1).max(65535).default(8728),
  location: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  last_seen: z.coerce.date().optional().nullable(),
  status: routerStatusSchema.default('offline'),
  version: z.string().max(50).optional().nullable(),
  uptime: z.string().max(50).optional().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})
export type Router = z.infer<typeof routerSchema>

// Schema untuk create router (tanpa id, uuid, timestamps yang auto-generate)
export const createRouterSchema = routerSchema.omit({
  id: true,
  uuid: true,
  created_at: true,
  updated_at: true,
  last_seen: true,
})
export type CreateRouter = z.infer<typeof createRouterSchema>

// Schema untuk update router (semua field optional kecuali id)
export const updateRouterSchema = routerSchema.partial().extend({
  id: z.number().int().positive(),
})
export type UpdateRouter = z.infer<typeof updateRouterSchema>

// Schema untuk router list
export const routerListSchema = z.array(routerSchema)
export type RouterList = z.infer<typeof routerListSchema>

// Schema untuk router filters/search
export const routerFilterSchema = z.object({
  status: routerStatusSchema.optional(),
  is_active: z.boolean().optional(),
  location: z.string().optional(),
  search: z.string().optional(), // untuk search name/hostname
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})
export type RouterFilter = z.infer<typeof routerFilterSchema>

// Schema untuk router connection test
export const routerConnectionTestSchema = z.object({
  hostname: z
    .string()
    .regex(
      /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/,
      'Invalid IP address'
    ),
  port: z.number().int().min(1).max(65535),
  username: z.string().min(1),
  password: z.string().min(1),
  timeout: z.number().int().positive().default(5000),
})
export type RouterConnectionTest = z.infer<typeof routerConnectionTestSchema>