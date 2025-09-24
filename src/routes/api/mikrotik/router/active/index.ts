import { db } from '@/db/index'
import { routers } from '@/db/schema/user'
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'

export const ServerRoute = createServerFileRoute(
  '/api/mikrotik/router/active/'
).methods({
  // GET /api/mikrotik/router/active - Get currently active router
  GET: async ({ request }) => {
    console.info('Fetching active router... @', request.url)

    try {
      const [activeRouter] = await db
        .select()
        .from(routers)
        .where(eq(routers.is_active, true))
        .limit(1)

      if (!activeRouter) {
        return json(
          {
            error: 'No active router found',
            message: 'There is currently no active router configured',
          },
          { status: 404 }
        )
      }

      return json({
        data: {
          id: activeRouter.id,
          uuid: activeRouter.uuid,
          name: activeRouter.name,
          hostname: activeRouter.hostname,
          username: activeRouter.username, // Include for connection purposes
          location: activeRouter.location,
          description: activeRouter.description,
          is_active: activeRouter.is_active,
          status: activeRouter.status,
          last_seen: activeRouter.last_seen,
          version: activeRouter.version,
          uptime: activeRouter.uptime,
          port: activeRouter.port,
          timeout: activeRouter.timeout,
          keepalive: activeRouter.keepalive,
          created_at: activeRouter.created_at,
          updated_at: activeRouter.updated_at,
        },
        message: 'Active router retrieved successfully',
      })
    } catch (error: any) {
      console.error('Error fetching active router:', error)

      return json(
        {
          error: 'Failed to retrieve active router',
          message: error.message || 'Unknown error occurred',
        },
        { status: 500 }
      )
    }
  },
})
