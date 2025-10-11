import z from 'zod';
import { createServerFn } from '@tanstack/react-start';
import { createMikrotikHotspot } from '@/lib/mikrotik/hotspot';
import { pppoeUserSchema, type PppoeActive, type PppoeUser } from '../data/schema';


type ApiResponse<T = string | number | boolean | object> = {
  success: boolean
  total: number
  data?: T
}

// Validators
const secretsValidator = z.object({
  routerId: z.number(),
})

export const createSecretValidator = z.object({
  routerId: z.number(),
  data: pppoeUserSchema.omit({
    '.id': true, // ID akan dibuat oleh router
    'last-logged-out': true, // Field ini tidak diperlukan saat create
  }),
})

export const updateSecretValidator = z.object({
  routerId: z.number(),
  userId: z.string(), // ID dari user yang akan diupdate
  data: pppoeUserSchema
    .omit({ '.id': true, 'last-logged-out': true })
    .partial(), // Semua field jadi optional untuk update
})

const deleteSecretValidator = z.object({
  routerId: z.number(),
  userId: z.union([z.string(), z.array(z.string())]),
})

const disconnectValidator = z.object({
  routerId: z.number(),
  sessionId: z.union([z.string(), z.array(z.string())]),
})

const routerIdValidator = z.object({
  routerId: z.number(),
})




// Get all PPPoE secrets/users
export const getPppSecrets = createServerFn()
  .validator((data) => secretsValidator.parse(data))
  .handler(async ({ data }): Promise<ApiResponse<PppoeUser[]>> => {
    console.info('Fetching MikroTik PPPoE secrets...')

    try {
      const { routerId } = data

      const hotspot = await createMikrotikHotspot(routerId)
      const result = await hotspot.exec<PppoeUser[]>('/ppp/secret/print')

      return {
        success: true,
        data: result,
        total: result.length,
      }
    } catch (error) {
      console.error('Error fetching MikroTik PPPoE secrets:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch PPPoE secrets'
      )
    }
  })

// Create new PPPoE secret/user
export const createPppSecret = createServerFn()
  .validator((data) => createSecretValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Creating MikroTik PPPoE secret...')

    try {
      const { routerId, data: secretData } = data

      const hotspot = await createMikrotikHotspot(routerId)

      // Build command parameters
      const params = Object.entries(secretData)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `=${key}=${value}`)

      const result = await hotspot.exec<string>('/ppp/secret/add', params)

      return {
        success: true,
        message: 'PPPoE secret created successfully',
        data: result,
      }
    } catch (error) {
      console.error('Error creating MikroTik PPPoE secret:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to create PPPoE secret'
      )
    }
  })

// Update PPPoE secret/user
export const updatePppSecret = createServerFn()
  .validator((data) => updateSecretValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Updating MikroTik PPPoE secret...')

    try {
      const { routerId, userId, data:secretData } = data

      const hotspot = await createMikrotikHotspot(routerId)

      // Build command parameters
      const params = [
        `=.id=${userId}`,
        ...Object.entries(secretData)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => `=${key}=${value}`),
      ]

      const result = await hotspot.exec<string>('/ppp/secret/set', params)

      return {
        success: true,
        message: 'PPPoE secret updated successfully',
        data: result,
      }
    } catch (error) {
      console.error('Error updating MikroTik PPPoE secret:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to update PPPoE secret'
      )
    }
  })

// Delete PPPoE secret/user
export const deletePppSecret = createServerFn()
  .validator((data) => deleteSecretValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Deleting MikroTik PPPoE secret...')

    try {
      const { routerId, userId } = data

      const hotspot = await createMikrotikHotspot(routerId)
      const result = await hotspot.exec<string>('/ppp/secret/remove', [
        `=.id=${userId}`,
      ])

      return {
        success: true,
        message: 'PPPoE secret deleted successfully',
      }
    } catch (error) {
      console.error('Error deleting MikroTik PPPoE secret:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete PPPoE secret'
      )
    }
  })

  // Get all active PPPoE sessions
export const getPppActive = createServerFn()
  .validator((data) => routerIdValidator.parse(data))
  .handler(async ({ data }): Promise<ApiResponse<PppoeActive[]>> => {
    console.info('Fetching MikroTik PPPoE active sessions...')

    try {
      const { routerId } = data

      const hotspot = await createMikrotikHotspot(routerId)
      const result = await hotspot.exec<PppoeActive[]>('/ppp/active/print')

      return {
        success: true,
        data: result,
        total: result.length,
      }
    } catch (error) {
      console.error('Error fetching MikroTik PPPoE active sessions:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to fetch PPPoE active sessions'
      )
    }
  })

export const getPppInactive = createServerFn()
  .validator((data) => routerIdValidator.parse(data))
  .handler(async ({ data }): Promise<ApiResponse<PppoeUser[]>> => {
    console.info('Fetching MikroTik PPPoE non-active sessions...')

    try {
      const { routerId } = data

      // Get both active sessions and all secrets/users
      const [activeResult, secretsResult] = await Promise.all([
        (async () => {
          const hotspot = await createMikrotikHotspot(routerId)
          return hotspot.exec<PppoeActive[]>('/ppp/active/print')
        })(),
        (async () => {
          const hotspot = await createMikrotikHotspot(routerId)
          return hotspot.exec<PppoeUser[]>('/ppp/secret/print')
        })()
      ])

      // Extract usernames from active sessions
      const activeUsernames = new Set(
        activeResult.map(session => session.name || session['.id'])
      )

      // Filter out users that are currently active
      const nonActiveUsers = secretsResult.filter(user => 
        !activeUsernames.has(user.name)
      )

      return {
        success: true,
        data: nonActiveUsers,
        total: nonActiveUsers.length,
      }
    } catch (error) {
      console.error('Error fetching MikroTik PPPoE non-active sessions:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to fetch PPPoE non-active sessions'
      )
    }
  })

// Enable PPPoE secret/user (single or multiple)
export const enablePppSecret = createServerFn()
  .validator((data) => deleteSecretValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Enabling MikroTik PPPoE secret...')

    try {
      const { routerId, userId } = data
      const userIds = Array.isArray(userId) ? userId : [userId]

      const hotspot = await createMikrotikHotspot(routerId)
      
      // Process each userId
      await Promise.all(
        userIds.map(id => 
          hotspot.exec<string>('/ppp/secret/enable', [`=.id=${id}`])
        )
      )

      return {
        success: true,
        message: `PPPoE secret${userIds.length > 1 ? 's' : ''} enabled successfully`,
        count: userIds.length,
      }
    } catch (error) {
      console.error('Error enabling MikroTik PPPoE secret:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to enable PPPoE secret'
      )
    }
  })

// Disable PPPoE secret/user (single or multiple)
export const disablePppSecret = createServerFn()
  .validator((data) => deleteSecretValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Disabling MikroTik PPPoE secret...')

    try {
      const { routerId, userId } = data
      const userIds = Array.isArray(userId) ? userId : [userId]

      const hotspot = await createMikrotikHotspot(routerId)
      
      // Process each userId
      await Promise.all(
        userIds.map(id => 
          hotspot.exec<string>('/ppp/secret/disable', [`=.id=${id}`])
        )
      )

      return {
        success: true,
        message: `PPPoE secret${userIds.length > 1 ? 's' : ''} disabled successfully`,
        count: userIds.length,
      }
    } catch (error) {
      console.error('Error disabling MikroTik PPPoE secret:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to disable PPPoE secret'
      )
    }
  })

// Disconnect active PPPoE session (single or multiple)
export const disconnectPppActive = createServerFn()
  .validator((data) => disconnectValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Disconnecting MikroTik PPPoE active session...')

    try {
      const { routerId, sessionId } = data
      const sessionIds = Array.isArray(sessionId) ? sessionId : [sessionId]

      const hotspot = await createMikrotikHotspot(routerId)
      
      // Process each sessionId
      await Promise.all(
        sessionIds.map(id => 
          hotspot.exec<string>('/ppp/active/remove', [`=.id=${id}`])
        )
      )

      return {
        success: true,
        message: `PPPoE session${sessionIds.length > 1 ? 's' : ''} disconnected successfully`,
        count: sessionIds.length,
      }
    } catch (error) {
      console.error('Error disconnecting MikroTik PPPoE session:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to disconnect PPPoE session'
      )
    }
  })