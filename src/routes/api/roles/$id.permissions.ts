// /api/roles/[roleId]/permissions.ts
import { z } from 'zod'
import { assignPermissionsToRole } from '@/db/utils/users'
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'

const assignPermissionsSchema = z.object({
  permissionIds: z.array(z.number()),
})

export const ServerRoute = createServerFileRoute(
  '/api/roles/$id/permissions'
).methods({
  POST: async ({ request, params }) => {
    try {
      const roleId = parseInt(params.id)
      if (isNaN(roleId)) {
        return json({ error: 'Invalid role ID' }, { status: 400 })
      }

      const body = await request.json()
      const validatedData = assignPermissionsSchema.parse(body)

      await assignPermissionsToRole(roleId, validatedData.permissionIds)

      return json({
        message: 'Permissions assigned to role successfully',
      })
    } catch (error) {
      console.error('Error assigning permissions to role:', error)

      if (error instanceof z.ZodError) {
        return json(
          {
            error: 'Validation error',
            details: error.errors,
          },
          { status: 400 }
        )
      }

      return json(
        { error: 'Failed to assign permissions to role' },
        { status: 500 }
      )
    }
  },
})
