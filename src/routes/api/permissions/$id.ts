// /api/permissions/[permissionId].ts
import { z } from 'zod';
import { updatePermission, deletePermission } from '@/db/utils/users';
import { json } from '@tanstack/react-start';
import { createServerFileRoute } from '@tanstack/react-start/server';


const updatePermissionSchema = z.object({
  name: z
    .string()
    .min(2, 'Permission name must be at least 2 characters')
    .optional(),
  description: z.string().optional(),
  resourceId: z.number().optional(),
  actionId: z.number().optional(),
})

export const ServerRoute = createServerFileRoute('/api/permissions/$id').methods({
  PUT: async ({ request, params }) => {
    try {
      const permissionId = parseInt(params.id)
      if (isNaN(permissionId)) {
        return json({ error: 'Invalid permission ID' }, { status: 400 })
      }

      const body = await request.json()
      const validatedData = updatePermissionSchema.parse(body)

      const updatedPermission = await updatePermission(
        permissionId,
        validatedData
      )

      return json({
        message: 'Permission updated successfully',
        permission: updatedPermission,
      })
    } catch (error) {
      console.error('Error updating permission:', error)

      if (error instanceof z.ZodError) {
        return json(
          {
            error: 'Validation error',
            details: error.errors,
          },
          { status: 400 }
        )
      }

      return json({ error: 'Failed to update permission' }, { status: 500 })
    }
  },

  DELETE: async ({ params }) => {
    try {
      const permissionId = parseInt(params.permissionId)
      if (isNaN(permissionId)) {
        return json({ error: 'Invalid permission ID' }, { status: 400 })
      }

      await deletePermission(permissionId)

      return json({
        message: 'Permission deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting permission:', error)
      return json({ error: 'Failed to delete permission' }, { status: 500 })
    }
  },
})