import { z } from 'zod'
import { hasPermission } from '@/db/utils/users'
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'

const checkPermissionSchema = z.object({
  permission: z.string(),
})

export const ServerRoute = createServerFileRoute(
  '/api/users/$id/permissions/check'
).methods({
  POST: async ({ request, params }) => {
    try {
      const { id } = params

      const body = await request.json()
      const validatedData = checkPermissionSchema.parse(body)

      const hasPermissionResult = await hasPermission(
        id,
        validatedData.permission
      )

      return json({
        id,
        permission: validatedData.permission,
        hasPermission: hasPermissionResult,
      })
    } catch (error) {
      console.error('Error checking permission:', error)

      if (error instanceof z.ZodError) {
        return json(
          {
            error: 'Validation error',
            details: error,
          },
          { status: 400 }
        )
      }

      return json({ error: 'Failed to check permission' }, { status: 500 })
    }
  },
})
