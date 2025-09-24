import z from 'zod';
import { createServerFn } from '@tanstack/react-start';
import { createMikrotikHotspot } from '@/lib/mikrotik/hotspot';
import { type HotspotUser } from '../data/schema';


interface MikrotikApiResult<T = unknown> {
  message: 'success' | 'error'
  data: T extends 'error' ? { error: string } : T
}

// Type definitions for MikroTik API responses
interface RawMikrotikUser {
  '.id': string
  name: string
  password?: string
  profile?: string
  server?: string
  'mac-address'?: string
  comment?: string
  'limit-uptime'?: string
  'limit-bytes-total'?: string
  'limit-bytes-in'?: string
  'limit-bytes-out'?: string
  address?: string
  email?: string
  routes?: string
  disabled?: string | boolean
  'bytes-in'?: string
  'bytes-out'?: string
  'packets-in'?: string
  'packets-out'?: string
  uptime?: string
}

// Updated to match ActiveUser schema
interface RawActiveMikrotikUser {
  '.id'?: string
  server: string
  user: string
  address: string
  'mac-address'?: string
  uptime?: string
  'idle-time'?: string
  'session-time-left'?: string
  'idle-timeout'?: string
  'keepalive-timeout'?: string
  'bytes-in'?: string
  'packets-in'?: string
  'bytes-out'?: string
  'packets-out'?: string
  'login-by'?: string
}

// Validators
const getNonActiveUsersValidator = z.object({
  routerId: z.number(),
  profile: z.string().optional(),
  comment: z.string().optional(),
})

const getNonActiveUserValidator = z.object({
  routerId: z.number(),
  userId: z.string(),
})


// Helper function to format user data to HotspotUser type
function formatUserToHotspotUser(user: RawMikrotikUser): HotspotUser {
  return {
    id: user['.id'] || null,
    name: user.name,
    password: user.password || null,
    profile: user.profile || null,
    server: user.server || null,
    macAddress: user['mac-address'] || null,
    comment: user.comment || null,
    limitUptime: user['limit-uptime'] || null,
    limitBytesTotal: user['limit-bytes-total']
      ? parseInt(user['limit-bytes-total'])
      : null,
    limitBytesIn: user['limit-bytes-in']
      ? parseInt(user['limit-bytes-in'])
      : null,
    limitBytesOut: user['limit-bytes-out']
      ? parseInt(user['limit-bytes-out'])
      : null,
    address: user.address || null,
    email: user.email || null,
    routes: user.routes || null,
  }
}

// Get all non-active users
export const getNonActiveUsers = createServerFn()
  .validator((data) => getNonActiveUsersValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Fetching non-active MikroTik users...')

    try {
      const { routerId, profile, comment } = data

      const hotspot = await createMikrotikHotspot(routerId)

      // Get all users and active users
      const [allUsersResult, activeUsersResult] = await Promise.all([
        hotspot.listUsers(comment) as Promise<
          MikrotikApiResult<RawMikrotikUser[]>
        >,
        hotspot.getActiveUsers() as Promise<
          MikrotikApiResult<RawActiveMikrotikUser[]>
        >,
      ])

      if (allUsersResult.message === 'error') {
        throw new Error((allUsersResult.message))
      }

      if (activeUsersResult.message === 'error') {
        throw new Error((activeUsersResult.message))
      }

      // Get list of active usernames
      const activeUsernames = (
        activeUsersResult.data as RawActiveMikrotikUser[]
      ).map((user) => user.user)

      // Filter out active users and optionally filter by profile
      let nonActiveUsers = (allUsersResult.data as RawMikrotikUser[]).filter(
        (user) => !activeUsernames.includes(user.name)
      )

      if (profile) {
        nonActiveUsers = nonActiveUsers.filter(
          (user) => user.profile === profile
        )
      }

      // Format users to HotspotUser type
      const formattedUsers: HotspotUser[] = nonActiveUsers.map(
        formatUserToHotspotUser
      )

      return {
        success: true,
        data: formattedUsers,
        total: formattedUsers.length,
      }
    } catch (error) {
      console.error('Error fetching non-active users:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to fetch non-active users'
      )
    }
  })

// Get specific non-active user
export const getNonActiveUser = createServerFn()
  .validator((data) => getNonActiveUserValidator.parse(data))
  .handler(async ({ data }) => {
    console.info(`Fetching non-active user ${data.userId}...`)

    try {
      const { routerId, userId } = data

      const hotspot = await createMikrotikHotspot(routerId)

      // Get all users and active users
      const [allUsersResult, activeUsersResult] = await Promise.all([
        hotspot.getAllUsers() as Promise<MikrotikApiResult<RawMikrotikUser[]>>,
        hotspot.getActiveUsers() as Promise<
          MikrotikApiResult<RawActiveMikrotikUser[]>
        >,
      ])

      if (allUsersResult.message === 'error') {
        throw new Error((allUsersResult.message))
      }

      if (activeUsersResult.message === 'error') {
        throw new Error((activeUsersResult.message))
      }

      // Find the specific user by ID
      const user = (allUsersResult.data as RawMikrotikUser[]).find(
        (u) => u['.id'] === userId
      )

      if (!user) {
        throw new Error('User not found')
      }

      // Check if user is currently active
      const activeUsernames = (
        activeUsersResult.data as RawActiveMikrotikUser[]
      ).map((u) => u.user)
      const isActive = activeUsernames.includes(user.name)

      if (isActive) {
        throw new Error('User is currently active/logged in')
      }

      // Format user to HotspotUser type
      const formattedUser = formatUserToHotspotUser(user)

      return {
        success: true,
        data: formattedUser,
      }
    } catch (error) {
      console.error('Error fetching non-active user:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to fetch non-active user'
      )
    }
  })
