import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { db } from "@/db/index";
import { routers } from "@/db/schema/user";
import { eq } from "drizzle-orm";

// Helper function to parse and validate router ID
const parseRouterId = (id: string): number => {
  const routerId = parseInt(id, 10);
  if (isNaN(routerId) || routerId <= 0) {
    throw new Error("Invalid router ID format");
  }
  return routerId;
};

export const ServerRoute = createServerFileRoute("/api/mikrotik/router/$id/status").methods({
  // GET /api/mikrotik/router/:id/status - Get router status
  GET: async ({ params, request }) => {
    console.info(`Fetching status for router ${params.id}... @`, request.url);
    
    try {
      const routerId = parseRouterId(params.id);
      
      const [router] = await db
        .select({
          id: routers.id,
          name: routers.name,
          hostname: routers.hostname,
          status: routers.status,
          last_seen: routers.last_seen,
          version: routers.version,
          uptime: routers.uptime,
          is_active: routers.is_active,
        })
        .from(routers)
        .where(eq(routers.id, routerId))
        .limit(1);

      if (!router) {
        return json(
          { 
            error: "Router not found", 
            message: `Router with ID ${routerId} does not exist` 
          },
          { status: 404 }
        );
      }
      
      return json({
        data: router,
        message: "Router status retrieved successfully"
      });
    } catch (error: any) {
      console.error(`Error fetching status for router ${params.id}:`, error);
      
      if (error.message === "Invalid router ID format") {
        return json(
          { error: "Validation error", message: error.message },
          { status: 400 }
        );
      }
      
      return json(
        { 
          error: "Failed to retrieve router status", 
          message: error.message || "Unknown error occurred" 
        },
        { status: 500 }
      );
    }
  },

  // PATCH /api/mikrotik/router/:id/status - Update router status
  PATCH: async ({ params, request }) => {
    console.info(`Updating status for router ${params.id}... @`, request.url);
    
    try {
      const routerId = parseRouterId(params.id);
      const body: { status: "online" | "offline" | "error"; last_seen?: Date; version?: string; uptime?: string } = await request.json();
      
      // Validate status value
      if (!body.status || !["online", "offline", "error"].includes(body.status)) {
        return json(
          { 
            error: "Invalid status", 
            message: "Status must be one of: online, offline, error" 
          },
          { status: 400 }
        );
      }

      // Check if router exists
      const [existingRouter] = await db
        .select({ id: routers.id })
        .from(routers)
        .where(eq(routers.id, routerId))
        .limit(1);

      if (!existingRouter) {
        return json(
          { 
            error: "Router not found", 
            message: `Router with ID ${routerId} does not exist` 
          },
          { status: 404 }
        );
      }

      // Update router status
      const updateData: Partial<typeof routers.$inferInsert> = {
        status: body.status,
        updated_at: new Date(),
      };

      if (body.last_seen) updateData.last_seen = new Date(body.last_seen);
      if (body.version) updateData.version = body.version;
      if (body.uptime) updateData.uptime = body.uptime;

      const [updatedRouter] = await db
        .update(routers)
        .set(updateData)
        .where(eq(routers.id, routerId))
        .returning({
          id: routers.id,
          name: routers.name,
          hostname: routers.hostname,
          status: routers.status,
          last_seen: routers.last_seen,
          version: routers.version,
          uptime: routers.uptime,
          updated_at: routers.updated_at,
        });
      
      return json({
        data: updatedRouter,
        message: "Router status updated successfully"
      });
    } catch (error: any) {
      console.error(`Error updating status for router ${params.id}:`, error);
      
      if (error.message === "Invalid router ID format") {
        return json(
          { error: "Validation error", message: error.message },
          { status: 400 }
        );
      }
      
      return json(
        { 
          error: "Failed to update router status", 
          message: error.message || "Unknown error occurred" 
        },
        { status: 500 }
      );
    }
  },
});