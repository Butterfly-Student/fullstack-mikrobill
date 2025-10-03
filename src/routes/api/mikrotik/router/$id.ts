import { db } from '@/db/index'
import { routers } from '@/db/schema/user'
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'

interface UpdateRouterRequest {
  name?: string
  hostname?: string
  username?: string
  password?: string
  location?: string
  description?: string
  is_active?: boolean
  port?: number
  timeout?: number
  keepalive?: boolean
}

// Helper function to parse and validate router ID
const parseRouterId = (id: string): number => {
  const routerId = parseInt(id, 10)
  if (isNaN(routerId) || routerId <= 0) {
    throw new Error('Invalid router ID format')
  }
  return routerId
}

export const ServerRoute = createServerFileRoute(
  '/api/mikrotik/router/$id'
).methods({
  // GET /api/mikrotik/router/:id - Get router by ID
  GET: async ({ params, request }) => {
    console.info(`Fetching router ${params.id}... @`, request.url)

    try {
      const routerId = parseRouterId(params.id)

      const [router] = await db
        .select()
        .from(routers)
        .where(eq(routers.id, routerId))
        .limit(1)

      if (!router) {
        return json(
          {
            error: 'Router not found',
            message: `Router with ID ${routerId} does not exist`,
          },
          { status: 404 }
        )
      }

      return json({
        data: {
          id: router.id,
          uuid: router.uuid,
          name: router.name,
          hostname: router.hostname,
          location: router.location,
          description: router.description,
          is_active: router.is_active,
          status: router.status,
          last_seen: router.last_seen,
          version: router.version,
          uptime: router.uptime,
          port: router.port,
          timeout: router.timeout,
          keepalive: router.keepalive,
          created_at: router.created_at,
          updated_at: router.updated_at,
        },
        message: 'Router retrieved successfully',
      })
    } catch (error: any) {
      console.error(`Error fetching router ${params.id}:`, error)

      if (error.message === 'Invalid router ID format') {
        return json(
          { error: 'Validation error', message: error.message },
          { status: 400 }
        )
      }

      return json(
        {
          error: 'Failed to retrieve router',
          message: error.message || 'Unknown error occurred',
        },
        { status: 500 }
      )
    }
  },

  // PUT /api/mikrotik/router/:id - Update router
  PUT: async ({ params, request }) => {
    console.info(`Updating router ${params.id}... @`, request.url)

    try {
      const routerId = parseRouterId(params.id)
      const body: UpdateRouterRequest = await request.json()

      // Check if router exists
      const [existingRouter] = await db
        .select()
        .from(routers)
        .where(eq(routers.id, routerId))
        .limit(1)

      if (!existingRouter) {
        return json(
          {
            error: 'Router not found',
            message: `Router with ID ${routerId} does not exist`,
          },
          { status: 404 }
        )
      }

      // If hostname is being updated, check for conflicts
      // if (body.hostname && body.hostname !== existingRouter.hostname) {
      //   const [conflictingRouter] = await db
      //     .select()
      //     .from(routers)
      //     .where(eq(routers.hostname, body.hostname))
      //     .limit(1)

      //   if (conflictingRouter) {
      //     return json(
      //       {
      //         error: 'Hostname conflict',
      //         message: 'A router with this hostname already exists',
      //       },
      //       { status: 409 }
      //     )
      //   }
      // }

      // Build update object with only provided fields
      const updateData: Partial<typeof routers.$inferInsert> = {
        updated_at: new Date(),
      }

      if (body.name !== undefined) updateData.name = body.name
      if (body.hostname !== undefined) updateData.hostname = body.hostname
      if (body.username !== undefined) updateData.username = body.username
      if (body.password !== undefined) updateData.password = body.password
      if (body.location !== undefined) updateData.location = body.location
      if (body.description !== undefined)
        updateData.description = body.description
      if (body.is_active !== undefined) updateData.is_active = body.is_active
      if (body.port !== undefined) updateData.port = body.port
      if (body.timeout !== undefined) updateData.timeout = body.timeout
      if (body.keepalive !== undefined) updateData.keepalive = body.keepalive

      const [updatedRouter] = await db
        .update(routers)
        .set(updateData)
        .where(eq(routers.id, routerId))
        .returning()

      return json({
        data: {
          id: updatedRouter.id,
          uuid: updatedRouter.uuid,
          name: updatedRouter.name,
          hostname: updatedRouter.hostname,
          location: updatedRouter.location,
          description: updatedRouter.description,
          is_active: updatedRouter.is_active,
          status: updatedRouter.status,
          last_seen: updatedRouter.last_seen,
          version: updatedRouter.version,
          uptime: updatedRouter.uptime,
          port: updatedRouter.port,
          timeout: updatedRouter.timeout,
          keepalive: updatedRouter.keepalive,
          created_at: updatedRouter.created_at,
          updated_at: updatedRouter.updated_at,
        },
        message: 'Router updated successfully',
      })
    } catch (error: any) {
      console.error(`Error updating router ${params.id}:`, error)

      if (error.message === 'Invalid router ID format') {
        return json(
          { error: 'Validation error', message: error.message },
          { status: 400 }
        )
      }

      return json(
        {
          error: 'Failed to update router',
          message: error.message || 'Unknown error occurred',
        },
        { status: 500 }
      )
    }
  },

  // DELETE /api/mikrotik/router/:id - Delete router
  DELETE: async ({ params, request }) => {
    console.info(`Deleting router ${params.id}... @`, request.url)

    try {
      const routerId = parseRouterId(params.id)

      // Check if router exists
      const [existingRouter] = await db
        .select({ id: routers.id })
        .from(routers)
        .where(eq(routers.id, routerId))
        .limit(1)

      if (!existingRouter) {
        return json(
          {
            error: 'Router not found',
            message: `Router with ID ${routerId} does not exist`,
          },
          { status: 404 }
        )
      }

      // Delete the router
      await db.delete(routers).where(eq(routers.id, routerId))

      return json({
        data: null,
        message: 'Router deleted successfully',
      })
    } catch (error: any) {
      console.error(`Error deleting router ${params.id}:`, error)

      if (error.message === 'Invalid router ID format') {
        return json(
          { error: 'Validation error', message: error.message },
          { status: 400 }
        )
      }

      return json(
        {
          error: 'Failed to delete router',
          message: error.message || 'Unknown error occurred',
        },
        { status: 500 }
      )
    }
  },
})
