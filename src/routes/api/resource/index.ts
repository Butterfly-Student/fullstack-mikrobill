import { z } from 'zod'
import { getAllResources, createResource } from '@/db/utils/users'
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'

const createResourceSchema = z.object({
  name: z.string().min(2, 'Resource name must be at least 2 characters'),
  description: z.string().optional(),
})

export const ServerRoute = createServerFileRoute('/api/resource/').methods({
  GET: async ({ request }) => {
    console.info('Fetching resources... @', request.url)
    try {
      const resources = await getAllResources()
      return json(resources)
    } catch (error) {
      console.error('Error fetching resources:', error)
      return json({ error: 'Failed to fetch resources' }, { status: 500 })
    }
  },

  POST: async ({ request }) => {
    try {
      const body = await request.json()
      const validatedData = createResourceSchema.parse(body)

      const newResource = await createResource(
        validatedData.name,
        validatedData.description
      )

      return json(
        {
          message: 'Resource created successfully',
          resource: newResource,
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('Error creating resource:', error)

      if (error instanceof z.ZodError) {
        return json(
          {
            error: 'Validation error',
            details: error.errors,
          },
          { status: 400 }
        )
      }

      return json({ error: 'Failed to create resource' }, { status: 500 })
    }
  },
})
