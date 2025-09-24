import { createServerFn } from '@tanstack/react-start'
import { createMikrotikHotspot, type UserConfig } from '@/lib/mikrotik/hotspot'

// Define types for MikroTik user response
interface RawMikrotikUser {
  '.id': string
  name: string
  password: string
  profile: string
  server?: string
  'mac-address'?: string
  disabled?: string
  comment?: string
  'limit-uptime'?: string
  'limit-bytes-total'?: string
  'limit-bytes-in'?: string
  'limit-bytes-out'?: string
  'bytes-in'?: string
  'bytes-out'?: string
  'packets-in'?: string
  'packets-out'?: string
  uptime?: string
}

interface FormattedMikrotikUser {
  id: string
  name: string
  password: string
  profile: string
  server?: string
  macAddress?: string
  disabled: boolean
  comment?: string
  limitUptime?: string
  limitBytesTotal?: string
  limitBytesIn?: string
  limitBytesOut?: string
  bytesIn?: string
  bytesOut?: string
  packetsIn?: string
  packetsOut?: string
  uptime?: string
}

interface MikrotikApiResult<T = unknown> {
  message: 'success' | 'error'
  data: T extends 'error' ? { error: string } : T
}

// Get all hotspot users
export const getHotspotUsers = createServerFn()
  .validator((data: { routerId: number; commentFilter?: string }) => data)
  .handler(async ({ data }) => {
    console.info('Fetching MikroTik hotspot users...')

    try {
      const { routerId, commentFilter } = data

      if (!routerId) {
        throw new Error('Router ID is required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = (await hotspot.listUsers(
        commentFilter
      )) as MikrotikApiResult<RawMikrotikUser[]>

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }

      // Format the response
      const formattedUsers: FormattedMikrotikUser[] = (
        result.data as RawMikrotikUser[]
      ).map((user) => ({
        id: user['.id'],
        name: user.name,
        password: user.password,
        profile: user.profile,
        server: user.server,
        macAddress: user['mac-address'],
        disabled: user.disabled === 'true',
        comment: user.comment,
        limitUptime: user['limit-uptime'],
        limitBytesTotal: user['limit-bytes-total'],
        limitBytesIn: user['limit-bytes-in'],
        limitBytesOut: user['limit-bytes-out'],
        bytesIn: user['bytes-in'],
        bytesOut: user['bytes-out'],
        packetsIn: user['packets-in'],
        packetsOut: user['packets-out'],
        uptime: user.uptime,
      }))

      return {
        success: true,
        data: formattedUsers,
        total: formattedUsers.length,
      }
    } catch (error) {
      console.error('Error fetching MikroTik users:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch users'
      )
    }
  })

// Create new hotspot user
export const createHotspotUser = createServerFn()
  .validator((data: { routerId: number } & UserConfig) => data)
  .handler(async ({ data }) => {
    console.info('Creating MikroTik hotspot user...')

    try {
      const { routerId, ...userConfig } = data

      if (!routerId) {
        throw new Error('Router ID is required')
      }

      // Validate required fields
      if (!userConfig.name || !userConfig.password || !userConfig.profile) {
        throw new Error('Name, password, and profile are required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = (await hotspot.addUser(
        userConfig
      )) as MikrotikApiResult<string>

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }

      return {
        success: true,
        message: 'User created successfully',
        data: result.data,
      }
    } catch (error) {
      console.error('Error creating MikroTik user:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to create user'
      )
    }
  })

// Update hotspot user
export const updateHotspotUser = createServerFn()
  .validator(
    (data: { routerId: number; userId: string } & Partial<UserConfig>) => data
  )
  .handler(async ({ data }) => {
    console.info('Updating MikroTik hotspot user...')

    try {
      const { routerId, userId, ...userConfig } = data

      if (!routerId || !userId) {
        throw new Error('Router ID and User ID are required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = (await hotspot.updateUser(
        userId,
        userConfig
      )) as MikrotikApiResult<string>

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }

      return {
        success: true,
        message: 'User updated successfully',
        data: result.data,
      }
    } catch (error) {
      console.error('Error updating MikroTik user:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to update user'
      )
    }
  })

// Delete hotspot user
export const deleteHotspotUser = createServerFn()
  .validator((data: { routerId: number; userId: string }) => data)
  .handler(async ({ data }) => {
    console.info('Deleting MikroTik hotspot user...')

    try {
      const { routerId, userId } = data

      if (!routerId || !userId) {
        throw new Error('Router ID and User ID are required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = (await hotspot.deleteUser(
        userId
      )) as MikrotikApiResult<string>

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }

      return {
        success: true,
        message: 'User deleted successfully',
      }
    } catch (error) {
      console.error('Error deleting MikroTik user:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete user'
      )
    }
  })
