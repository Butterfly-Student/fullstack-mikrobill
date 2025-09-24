import z from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { createMikrotikHotspot, type UserConfig } from '@/lib/mikrotik/hotspot'
import { type HotspotUser } from '../data/schema'

interface MikrotikApiResult<T = unknown> {
  message: 'success' | 'error'
  data: T extends 'error' ? { error: string } : T
}

const hotspotUserValidator = z.object({
  routerId: z.number().optional().nullable().default(null),
  commentFilter: z.string().optional(),
})

// Get all hotspot users
export const getHotspotUsers = createServerFn()
  .validator((data) => hotspotUserValidator.parse(data))
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
      )) as MikrotikApiResult<HotspotUser[]>

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }

      // Use data directly without conversion
      const users: HotspotUser[] = result.data as HotspotUser[]

      return {
        success: true,
        data: users,
        total: users.length,
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
  .validator((data: { routerId: number | undefined } & UserConfig) => data)
  .handler(async ({ data }) => {
    console.info('Creating MikroTik hotspot user...')

    try {
      const { routerId, ...userData } = data

      if (!routerId) {
        throw new Error('Router ID is required')
      }

      // Validate required fields based on HotspotUser schema
      if (!userData.name) {
        throw new Error('Name is required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = (await hotspot.addUser(
        userData
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
    (
      data: {
        routerId: number | undefined
        userId: string
      } & Partial<UserConfig>
    ) => data
  )
  .handler(async ({ data }) => {
    console.info('Updating MikroTik hotspot user...')

    try {
      const { routerId, userId, ...userData } = data

      if (!routerId || !userId) {
        throw new Error('Router ID and User ID are required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = (await hotspot.updateUser(
        userId,
        userData
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
  .validator((data: { routerId: number | undefined; userId: string }) => data)
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
