import z from 'zod';
import { createServerFn } from '@tanstack/react-start';
import { createMikrotikHotspot } from '@/lib/mikrotik/hotspot';
import { type PppoeActive, type PppoeUser } from '../data/schema';


// Validators
const secretsValidator = z.object({
  routerId: z.number(),
})

const createSecretValidator = z.object({
  routerId: z.number(),
  name: z.string(),
  service: z.enum(['pppoe', 'pptp', 'l2tp', 'ovpn', 'sstp']).default('pppoe'),
  'caller-id': z.string().optional(),
  password: z.string().optional(),
  profile: z.string().optional(),
  routes: z.string().optional(),
  'ipv6-routes': z.string().optional(),
  'limit-bytes-in': z.string().optional(),
  'limit-bytes-out': z.string().optional(),
  disabled: z.boolean().optional().default(false),
  'local-address': z.string().optional(),
  'remote-address': z.string().optional(),
  'remote-ipv6-prefix': z.string().optional(),
})

const updateSecretValidator = z.object({
  routerId: z.number(),
  userId: z.string(),
  name: z.string().optional(),
  service: z.enum(['pppoe', 'pptp', 'l2tp', 'ovpn', 'sstp']).optional(),
  'caller-id': z.string().optional(),
  password: z.string().optional(),
  profile: z.string().optional(),
  routes: z.string().optional(),
  'ipv6-routes': z.string().optional(),
  'limit-bytes-in': z.string().optional(),
  'limit-bytes-out': z.string().optional(),
  disabled: z.boolean().optional(),
  'local-address': z.string().optional(),
  'remote-address': z.string().optional(),
  'remote-ipv6-prefix': z.string().optional(),
})

const deleteSecretValidator = z.object({
  routerId: z.number(),
  userId: z.string(),
})

const routerIdValidator = z.object({
  routerId: z.number(),
})


const disconnectValidator = z.object({
  routerId: z.number(),
  sessionId: z.string(),
})

// Get all PPPoE secrets/users
export const getPppSecrets = createServerFn()
  .validator((data) => secretsValidator.parse(data))
  .handler(async ({ data }) => {
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
      const { routerId, ...secretData } = data

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
      const { routerId, userId, ...secretData } = data

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

// Enable PPPoE secret/user
export const enablePppSecret = createServerFn()
  .validator((data) => deleteSecretValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Enabling MikroTik PPPoE secret...')

    try {
      const { routerId, userId } = data

      const hotspot = await createMikrotikHotspot(routerId)
      const result = await hotspot.exec<string>('/ppp/secret/enable', [
        `=.id=${userId}`,
      ])

      return {
        success: true,
        message: 'PPPoE secret enabled successfully',
      }
    } catch (error) {
      console.error('Error enabling MikroTik PPPoE secret:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to enable PPPoE secret'
      )
    }
  })

// Disable PPPoE secret/user
export const disablePppSecret = createServerFn()
  .validator((data) => deleteSecretValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Disabling MikroTik PPPoE secret...')

    try {
      const { routerId, userId } = data

      const hotspot = await createMikrotikHotspot(routerId)
      const result = await hotspot.exec<string>('/ppp/secret/disable', [
        `=.id=${userId}`,
      ])

      return {
        success: true,
        message: 'PPPoE secret disabled successfully',
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

  // Get all active PPPoE sessions
export const getPppActive = createServerFn()
  .validator((data) => routerIdValidator.parse(data))
  .handler(async ({ data }) => {
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

export const getPppNonActive = createServerFn()
  .validator((data) => routerIdValidator.parse(data))
  .handler(async ({ data }) => {
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

// Disconnect active PPPoE session
export const disconnectPppActive = createServerFn()
  .validator((data) => disconnectValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Disconnecting MikroTik PPPoE active session...')

    try {
      const { routerId, sessionId } = data

      const hotspot = await createMikrotikHotspot(routerId)
      const result = await hotspot.exec<string>('/ppp/active/remove', [
        `=.id=${sessionId}`,
      ])

      return {
        success: true,
        message: 'PPPoE session disconnected successfully',
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