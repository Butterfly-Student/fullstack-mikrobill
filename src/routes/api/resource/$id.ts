// /api/resources/[resourceId].ts
import { z } from 'zod';
import { updateResource, deleteResource } from '@/db/utils/users';
import { json } from '@tanstack/react-start';
import { createServerFileRoute } from '@tanstack/react-start/server';


const updateResourceSchema = z.object({
  name: z
    .string()
    .min(2, 'Resource name must be at least 2 characters')
    .optional(),
  description: z.string().optional(),
})

export const ServerRoute = createServerFileRoute('/api/resource/$id').methods({
  PUT: async ({ request, params }) => {
    try {
      const resourceId = parseInt(params.id)
      if (isNaN(resourceId)) {
        return json({ error: 'Invalid resource ID' }, { status: 400 })
      }

      const body = await request.json()
      const validatedData = updateResourceSchema.parse(body)

      const updatedResource = await updateResource(resourceId, validatedData)

      return json({
        message: 'Resource updated successfully',
        resource: updatedResource,
      })
    } catch (error) {
      console.error('Error updating resource:', error)

      if (error instanceof z.ZodError) {
        return json(
          {
            error: 'Validation error',
            details: error.errors,
          },
          { status: 400 }
        )
      }

      return json({ error: 'Failed to update resource' }, { status: 500 })
    }
  },

  DELETE: async ({ params }) => {
    try {
      const resourceId = parseInt(params.resourceId)
      if (isNaN(resourceId)) {
        return json({ error: 'Invalid resource ID' }, { status: 400 })
      }

      await deleteResource(resourceId)

      return json({
        message: 'Resource deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting resource:', error)
      return json({ error: 'Failed to delete resource' }, { status: 500 })
    }
  },
})