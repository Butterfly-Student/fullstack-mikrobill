import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { createMikrotikHotspot } from '@/lib/mikrotik/hotspot'

export const ServerRoute = createServerFileRoute(
  '/api/mikrotik/hotspot/users/active/disconnect'
).methods({
  // Disconnect multiple active users
  POST: async ({ request }) => {
    console.info('Disconnecting multiple active users... @', request.url)

    try {
      const body = await request.json()
      const { routerId, userIds } = body as {
        routerId: number
        userIds: string[]
      }

      if (!routerId) {
        return json({ error: 'Router ID is required' }, { status: 400 })
      }

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return json({ error: 'User IDs array is required' }, { status: 400 })
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const results = []
      const errors = []

      for (const userId of userIds) {
        try {
          const result = await hotspot.removeActiveUser(userId)
          if (result.message === 'success') {
            results.push({ userId, status: 'disconnected' })
          } else {
            errors.push({ userId, error: result.data.error })
          }
        } catch (error) {
          errors.push({
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      return json({
        success: errors.length === 0,
        message: `${results.length} users disconnected${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
        data: {
          disconnected: results,
          failed: errors,
          total: userIds.length,
          successCount: results.length,
          failureCount: errors.length,
        },
      })
    } catch (error) {
      console.error('Error disconnecting multiple users:', error)
      return json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to disconnect users',
        },
        { status: 500 }
      )
    }
  },
})
