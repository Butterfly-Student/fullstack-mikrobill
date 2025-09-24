import z from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { createMikrotikHotspot } from '@/lib/mikrotik/hotspot'
import { ActiveUserSchema, type ActiveUser } from '../data/schema'

interface MikrotikApiResult<T = unknown> {
  message: 'success' | 'error'
  data: T extends 'error' ? { error: string } : T
}

const activeUsersValidator = z.object({
  routerId: z.number().optional().nullable().default(null),
})

const disconnectUsersValidator = z.object({
  routerId: z.number().optional().nullable().default(null),
  userIds: z.array(z.string()).min(1, 'At least one user ID is required'),
})

// Get all active hotspot users
export const getActiveHotspotUsers = createServerFn()
  .validator((data) => activeUsersValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Fetching active MikroTik users...')

    try {
      const { routerId } = data

      if (!routerId) {
        throw new Error('Router ID is required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = (await hotspot.getActiveUsers()) as MikrotikApiResult<
        ActiveUser[]
      >

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }

      // Validate data with schema
      const activeUsers = (result.data as ActiveUser[]).map((user) =>
        ActiveUserSchema.parse(user)
      )

      return {
        success: true,
        data: activeUsers,
        total: activeUsers.length,
      }
    } catch (error) {
      console.error('Error fetching active users:', error)

      if (error instanceof z.ZodError) {
        throw new Error(
          `Data validation failed: ${error.message}`
        )
      }

      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch active users'
      )
    }
  })

// Disconnect multiple active hotspot users
export const disconnectActiveHotspotUsers = createServerFn()
  .validator((data) => disconnectUsersValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Disconnecting multiple active users...')

    try {
      const { routerId, userIds } = data

      if (!routerId) {
        throw new Error('Router ID is required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const results = []
      const errors = []

      for (const userId of userIds) {
        try {
          const result = (await hotspot.removeActiveUser(
            userId
          )) as MikrotikApiResult<string>

          if (result.message === 'success') {
            results.push({ userId, status: 'disconnected' })
          } else {
            errors.push({
              userId,
              error: (result.data as unknown as { error: string }).error,
            })
          }
        } catch (error) {
          errors.push({
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      return {
        success: errors.length === 0,
        message: `${results.length} users disconnected${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
        data: {
          disconnected: results,
          failed: errors,
          total: userIds.length,
          successCount: results.length,
          failureCount: errors.length,
        },
      }
    } catch (error) {
      console.error('Error disconnecting multiple users:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to disconnect users'
      )
    }
  })
