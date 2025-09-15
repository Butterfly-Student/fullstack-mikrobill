// /api/actions/[actionId].ts
import { z } from "zod";
import { updateAction, deleteAction } from "@/db/utils/users";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";


const updateActionSchema = z.object({
  name: z.string().min(2, "Action name must be at least 2 characters").optional(),
  description: z.string().optional(),
});

export const ServerRoute = createServerFileRoute('/api/actions/$id').methods({
  PUT: async ({ request, params }) => {
    try {
      const actionId = parseInt(params.actionId)
      if (isNaN(actionId)) {
        return json({ error: 'Invalid action ID' }, { status: 400 })
      }

      const body = await request.json()
      const validatedData = updateActionSchema.parse(body)

      const updatedAction = await updateAction(actionId, validatedData)

      return json({
        message: 'Action updated successfully',
        action: updatedAction,
      })
    } catch (error) {
      console.error('Error updating action:', error)

      if (error instanceof z.ZodError) {
        return json(
          {
            error: 'Validation error',
            details: error.errors,
          },
          { status: 400 }
        )
      }

      return json({ error: 'Failed to update action' }, { status: 500 })
    }
  },

  DELETE: async ({ params }) => {
    try {
      const actionId = parseInt(params.actionId)
      if (isNaN(actionId)) {
        return json({ error: 'Invalid action ID' }, { status: 400 })
      }

      await deleteAction(actionId)

      return json({
        message: 'Action deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting action:', error)
      return json({ error: 'Failed to delete action' }, { status: 500 })
    }
  },
})