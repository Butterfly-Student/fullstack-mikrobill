import { db } from '@/db/index'
import { routers } from '@/db/schema/user'
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { eq, ne } from 'drizzle-orm'

// Helper function to parse and validate router ID
const parseRouterId = (id: string): number => {
  const routerId = parseInt(id, 10)
  if (isNaN(routerId) || routerId <= 0) {
    throw new Error('Invalid router ID format')
  }
  return routerId
}

export const ServerRoute = createServerFileRoute(
  '/api/mikrotik/router/$id/set-active'
).methods({
  // POST /api/mikrotik/router/:id/set-active - Set router as active
  POST: async ({ params, request }) => {
    console.info(`Setting router ${params.id} as active... @`, request.url)

    try {
      const routerId = parseRouterId(params.id)

      // Check if router exists
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

      // If router is already active, return the full router object
      if (router.is_active) {
        console.info(`Router ${routerId} is already active`)
        return json({
          success: true,
          data: router,  // ✅ Return full router object
          message: 'Router is already active',
        })
      }

      // Use transaction to ensure atomicity - only one router can be active
      const [updatedRouter] = await db.transaction(async (tx) => {
        // First, deactivate all other routers
        await tx
          .update(routers)
          .set({
            is_active: false,
            updated_at: new Date(),
          })
          .where(ne(routers.id, routerId))

        // Then, activate the target router
        return await tx
          .update(routers)
          .set({
            is_active: true,
            updated_at: new Date(),
          })
          .where(eq(routers.id, routerId))
          .returning()
      })

      console.info(`Router ${routerId} set as active successfully`)

      // ✅ PENTING: Return full router object dengan semua field
      return json({
        success: true,
        data: updatedRouter,  // Return FULL router object, not partial
        message: 'Router set as active successfully',
      })
    } catch (error) {
      console.error(`Error setting router ${params.id} as active:`, error)

      if (error.message === 'Invalid router ID format') {
        return json(
          { 
            success: false,
            error: 'Validation error', 
            message: error.message 
          },
          { status: 400 }
        )
      }

      return json(
        {
          success: false,
          error: 'Failed to set router as active',
          message: error.message || 'Unknown error occurred',
        },
        { status: 500 }
      )
    }
  },
})