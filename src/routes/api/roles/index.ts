// /api/roles.ts
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { 
  getAllRoles, 
  createRole, 
} from "@/db/utils/users";
import { z } from "zod";

const createRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().optional(),
});


export const ServerRoute = createServerFileRoute("/api/roles/").methods({
  GET: async ({ request }) => {
    console.info("Fetching roles... @", request.url);
    try {
      const roles = await getAllRoles();
      
      const formattedRoles = roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        createdAt: role.createdAt,
        permissions: role.rolePermissions.map((rp) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          resource: rp.permission.resource.name,
          action: rp.permission.action.name,
        })),
      }));

      return json(formattedRoles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      return json({ error: "Failed to fetch roles" }, { status: 500 });
    }
  },

  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const validatedData = createRoleSchema.parse(body);

      const newRole = await createRole(validatedData.name, validatedData.description);

      return json({
        message: "Role created successfully",
        role: newRole
      }, { status: 201 });

    } catch (error) {
      console.error("Error creating role:", error);
      
      if (error instanceof z.ZodError) {
        return json({ 
          error: "Validation error", 
          details: error.errors 
        }, { status: 400 });
      }

      return json({ error: "Failed to create role" }, { status: 500 });
    }
  },
});

