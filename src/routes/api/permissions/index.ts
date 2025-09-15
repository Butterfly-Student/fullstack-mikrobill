// /api/permissions.ts
import { z } from "zod";
import { getAllPermissions, createPermission } from "@/db/utils/users";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";


const createPermissionSchema = z.object({
  name: z.string().min(2, "Permission name must be at least 2 characters"),
  description: z.string().min(1, "Description is required"),
  resourceId: z.number(),
  actionId: z.number(),
});


export const ServerRoute = createServerFileRoute('/api/permissions/').methods({
  GET: async ({ request }) => {
    console.info('Fetching permissions... @', request.url)
    try {
      const permissions = await getAllPermissions()

      const formattedPermissions = permissions.map((permission) => ({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        createdAt: permission.createdAt,
        resource: {
          id: permission.resource.id,
          name: permission.resource.name,
          description: permission.resource.description,
        },
        action: {
          id: permission.action.id,
          name: permission.action.name,
          description: permission.action.description,
        },
      }))

      return json(formattedPermissions)
    } catch (error) {
      console.error('Error fetching permissions:', error)
      return json({ error: 'Failed to fetch permissions' }, { status: 500 })
    }
  },

  POST: async ({ request }) => {
    try {
      const body = await request.json()
      const validatedData = createPermissionSchema.parse(body)

      const newPermission = await createPermission(
        validatedData.name,
        validatedData.description,
        validatedData.resourceId,
        validatedData.actionId
      )

      return json(
        {
          message: 'Permission created successfully',
          permission: newPermission,
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('Error creating permission:', error)

      if (error instanceof z.ZodError) {
        return json(
          {
            error: 'Validation error',
            details: error,
          },
          { status: 400 }
        )
      }

      return json({ error: 'Failed to create permission' }, { status: 500 })
    }
  },
})