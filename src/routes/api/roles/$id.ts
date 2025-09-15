// /api/roles/[roleId].ts
import { z } from "zod";
import { updateRole, deleteRole } from "@/db/utils/users";
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";


const updateRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters").optional(),
  description: z.string().optional(),
});


export const ServerRoute = createServerFileRoute("/api/roles/$id").methods({
  PUT: async ({ request, params }) => {
    try {
      const roleId = parseInt(params.id)
      if (isNaN(roleId)) {
        return json({ error: "Invalid role ID" }, { status: 400 });
      }

      const body = await request.json();
      const validatedData = updateRoleSchema.parse(body);

      const updatedRole = await updateRole(roleId, validatedData);

      return json({
        message: "Role updated successfully",
        role: updatedRole
      });

    } catch (error) {
      console.error("Error updating role:", error);
      
      if (error instanceof z.ZodError) {
        return json({ 
          error: "Validation error", 
          details: error.errors 
        }, { status: 400 });
      }

      return json({ error: "Failed to update role" }, { status: 500 });
    }
  },

  DELETE: async ({ params }) => {
    try {
      const roleId = parseInt(params.roleId);
      if (isNaN(roleId)) {
        return json({ error: "Invalid role ID" }, { status: 400 });
      }

      await deleteRole(roleId);

      return json({
        message: "Role deleted successfully"
      });

    } catch (error) {
      console.error("Error deleting role:", error);
      return json({ error: "Failed to delete role" }, { status: 500 });
    }
  },
});