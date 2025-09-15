// /api/users/[userId]/roles.ts
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { assignRolesToUser } from "@/db/utils/users";
import { z } from "zod";

const assignRolesSchema = z.object({
  roleIds: z.array(z.number()),
});

export const ServerRoute = createServerFileRoute("/api/users/$id/").methods({
  POST: async ({ request, params }) => {
    try {
      const { id } = params;

      const body = await request.json();
      const validatedData = assignRolesSchema.parse(body);

      await assignRolesToUser(id, validatedData.roleIds);

      return json({
        message: "Roles assigned to user successfully"
      });

    } catch (error) {
      console.error("Error assigning roles to user:", error);
      
      if (error instanceof z.ZodError) {
        return json({ 
          error: "Validation error", 
          details: error 
        }, { status: 400 });
      }

      return json({ error: "Failed to assign roles to user" }, { status: 500 });
    }
  },
});

