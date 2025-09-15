// /api/actions.ts
import { z } from "zod";
import { getAllActions, createAction, updateAction, deleteAction } from "@/db/utils/users";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";


const createActionSchema = z.object({
  name: z.string().min(2, "Action name must be at least 2 characters"),
  description: z.string().optional(),
});


export const ServerRoute = createServerFileRoute('/api/actions/').methods({
  GET: async ({ request }) => {
    console.info('Fetching actions... @', request.url)
    try {
      const actions = await getAllActions()
      return json(actions)
    } catch (error) {
      console.error('Error fetching actions:', error)
      return json({ error: 'Failed to fetch actions' }, { status: 500 })
    }
  },

  POST: async ({ request }) => {
    try {
      const body = await request.json()
      const validatedData = createActionSchema.parse(body)

      const newAction = await createAction(
        validatedData.name,
        validatedData.description
      )

      return json(
        {
          message: 'Action created successfully',
          action: newAction,
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('Error creating action:', error)

      if (error instanceof z.ZodError) {
        return json(
          {
            error: 'Validation error',
            details: error.errors,
          },
          { status: 400 }
        )
      }

      return json({ error: 'Failed to create action' }, { status: 500 })
    }
  },
})