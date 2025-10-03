import z from "zod";

const routerStatusSchema = z.enum(['online', 'offline', 'error'])

export const routerSchema = z.object({
  id: z.number().int().positive(),
  uuid: z.uuid(),
  name: z.string().min(1).max(100),
  hostname: z.string().min(1).max(45),
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

export const formSchema = z.object({
  name: z.string().min(1, 'Router name is required.').max(100),
  hostname: z
    .string()
    .min(1, 'IP address is required.')
    .max(45)
    .regex(
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      'Invalid IP address format'
    ),
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

// ============================================
// HOTSPOT PROFILES
// ============================================

export const getHotspotProfiles = async (routerId: number) => {
  const response = await fetch(
    `/api/mikrotik/hotspot/profiles/?routerId=${routerId}`
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch profiles: ${response.statusText}`)
  }

  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch profiles')
  }

  return data
}

// ============================================
// GET ALL ROUTERS
// ============================================

export const getAllRouters = async (): Promise<Router[]> => {
  const response = await fetch('/api/mikrotik/router')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch routers: ${response.statusText}`)
  }
  
  const data = await response.json()
  
  if (data.error) {
    throw new Error(data.message || 'Failed to fetch routers')
  }
  
  console.log('📦 [API] Get all routers:', data.data)
  return data.data
}

// ============================================
// GET ACTIVE ROUTER
// ============================================

export const getActiveRouter = async (): Promise<Router> => {
  const response = await fetch('/api/mikrotik/router/active')
  
  if (!response.ok) {
    throw new Error(`Failed to fetch active router: ${response.statusText}`)
  }
  
  const data = await response.json()
  
  if (data.error) {
    throw new Error(data.message || 'Failed to fetch active router')
  }
  
  console.log('📦 [API] Get active router:', data.data)
  return data.data
}

// ============================================
// GET SINGLE ROUTER BY ID
// ============================================

export const getRouterById = async (id: number): Promise<Router> => {
  const response = await fetch(`/api/mikrotik/router/${id}`)
 
  if (!response.ok) {
    throw new Error(`Failed to fetch router: ${response.statusText}`)
  }
 
  const data = await response.json()
 
  if (data.error) {
    throw new Error(data.message || 'Failed to fetch router')
  }
 
  return data.data
}

// ============================================
// SET ACTIVE ROUTER - FIXED VERSION
// ============================================

export const setActiveRouter = async (routerId: number): Promise<Router> => {
  console.log('🚀 [API] Setting active router:', routerId)
  
  const response = await fetch(`/api/mikrotik/router/${routerId}/set-active`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ [API] Response not OK:', response.status, errorText)
    throw new Error(`Failed to set active router: ${response.statusText}`)
  }
  
  const data = await response.json()
  console.log('📦 [API] Raw response from backend:', data)
  
  if (data.error) {
    throw new Error(data.message || 'Failed to set active router')
  }
  
  // ✅ CRITICAL: Pastikan return FULL router object
  if (!data.data) {
    console.error('❌ [API] Invalid response structure:', data)
    throw new Error('Invalid response: missing router data')
  }
  
  // Validate that we got a complete router object
  const router = data.data
  if (!router.id || !router.name || !router.hostname) {
    console.error('❌ [API] Incomplete router object:', router)
    throw new Error('Incomplete router data received from server')
  }
  
  console.log('✅ [API] Returning full router object:', router)
  return router
}

// ============================================
// ADD NEW ROUTER
// ============================================

export const addRouter = async (data: RouterForm): Promise<Router> => {
  const response = await fetch('/api/mikrotik/router', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to add router: ${response.statusText}`)
  }

  const result = await response.json()

  if (result.error) {
    throw new Error(result.message || 'Failed to add router')
  }

  return result.data
}

// ============================================
// UPDATE ROUTER
// ============================================

export const updateRouter = async (id: number, data: RouterForm): Promise<Router> => {
  const response = await fetch(`/api/mikrotik/router/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to update router: ${response.statusText}`)
  }

  const result = await response.json()

  if (result.error) {
    throw new Error(result.message || 'Failed to update router')
  }

  return result.data
}

// ============================================
// DELETE ROUTER
// ============================================

export const deleteRouter = async (id: number): Promise<void> => {
  const response = await fetch(`/api/mikrotik/router/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to delete router: ${response.statusText}`)
  }

  const result = await response.json()

  if (result.error) {
    throw new Error(result.message || 'Failed to delete router')
  }
}

// ============================================
// BULK DELETE ROUTERS
// ============================================

export const deleteRouters = async (ids: number[]): Promise<void> => {
  const response = await fetch('/api/mikrotik/router/bulk-delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  })

  if (!response.ok) {
    throw new Error(`Failed to delete routers: ${response.statusText}`)
  }

  const result = await response.json()

  if (result.error) {
    throw new Error(result.message || 'Failed to delete routers')
  }
}

// ============================================
// TEST ROUTER CONNECTION
// ============================================

export const testRouterConnection = async (data: RouterForm): Promise<{ success: boolean; message: string }> => {
  const response = await fetch('/api/mikrotik/router/test-connection', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Failed to test connection: ${response.statusText}`)
  }

  const result = await response.json()

  return result.data
}