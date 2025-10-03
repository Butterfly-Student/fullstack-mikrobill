import { z } from 'zod'

// Router status enum schema
const routerStatusSchema = z.enum(['online', 'offline', 'error'])

// Main router schema berdasarkan database schema
export const routerSchema = z.object({
  id: z.number().int().positive(),
  uuid: z.uuid(),
  name: z.string().min(1).max(100),
  hostname: z.string().min(1).max(45), // Sesuai database length: 45
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(255),
  keepalive: z.boolean().nullable().default(true),
  timeout: z.number().int().nullable().default(300000),
  port: z.number().int().nullable().default(8728),
  location: z.string().max(100).nullable().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().nullable().default(true),
  last_seen: z.date().nullable().optional(),
  status: routerStatusSchema.nullable().default('offline'),
  version: z.string().max(50).nullable().optional(),
  uptime: z.string().max(50).nullable().optional(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
})

export type Router = z.infer<typeof routerSchema>

// Form schema - hanya field yang dibutuhkan untuk form input
// Menggunakan z.number() langsung instead of z.coerce untuk menghindari 'unknown' type
export const formSchema = z.object({
  name: z.string().min(1, 'Router name is required.').max(100),
  hostname: z
    .string()
    .min(1, 'IP address is required.')
    .max(45),
  username: z.string().min(1, 'Username is required.').max(50),
  password: z.string().min(1, 'Password is required.').max(255),
  port: z.number().int().min(1).max(65535, 'Port must be between 1-65535'),
  timeout: z.number().int().positive('Timeout must be positive'),
  keepalive: z.boolean(),
  location: z.string().max(100).optional(),
  description: z.string().optional(),
  is_active: z.boolean(),
})

export type RouterForm = z.infer<typeof formSchema>

// Alternative: Jika Anda tetap ingin menggunakan coerce, gunakan preprocess
export const formSchemaWithCoerce = z.object({
  name: z.string().min(1, 'Router name is required.').max(100),
  hostname: z
    .string()
    .min(1, 'IP address is required.')
    .max(45),
  username: z.string().min(1, 'Username is required.').max(50),
  password: z.string().min(1, 'Password is required.').max(255),
  port: z.preprocess(
    (val) => Number(val),
    z.number().int().min(1).max(65535, 'Port must be between 1-65535')
  ),
  timeout: z.preprocess(
    (val) => Number(val),
    z.number().int().positive('Timeout must be positive')
  ),
  keepalive: z.boolean(),
  location: z.string().max(100).optional(),
  description: z.string().optional(),
  is_active: z.boolean(),
})
