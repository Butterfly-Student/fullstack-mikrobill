import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { createMikrotikHotspot } from "@/lib/mikrotik/hotspot";

export const ServerRoute = createServerFileRoute("/api/mikrotik/hotspot/users/active/$id").methods({
  // Get specific active user
  GET: async ({ request, params }) => {
    console.info(`Fetching active user ${params.id}... @`, request.url);

    try {
      const url = new URL(request.url);
      const routerId = url.searchParams.get("routerId");

      if (!routerId) {
        return json({ error: "Router ID is required" }, { status: 400 });
      }

      const hotspot = await createMikrotikHotspot(parseInt(routerId));
      const result = await hotspot.getActiveUsers();

      if (result.message === "error") {
        return json({ error: result.data.error }, { status: 500 });
      }

      // Find the specific active user by ID
      const activeUser = result.data.find((user: any) => user['.id'] === params.id);

      if (!activeUser) {
        return json({ error: "Active user not found" }, { status: 404 });
      }

      // Format the response
      const formattedUser = {
        id: activeUser['.id'],
        user: activeUser.user,
        address: activeUser.address,
        macAddress: activeUser['mac-address'],
        loginTime: activeUser['login-time'],
        uptime: activeUser.uptime,
        idleTime: activeUser['idle-time'],
        sessionTimeLeft: activeUser['session-time-left'],
        idleTimeout: activeUser['idle-timeout'],
        bytesIn: activeUser['bytes-in'],
        bytesOut: activeUser['bytes-out'],
        packetsIn: activeUser['packets-in'],
        packetsOut: activeUser['packets-out'],
        server: activeUser.server,
        radius: activeUser.radius === 'true',
        domain: activeUser.domain
      };

      return json({
        success: true,
        data: formattedUser
      });

    } catch (error) {
      console.error("Error fetching active user:", error);
      return json({ 
        error: error instanceof Error ? error.message : "Failed to fetch active user" 
      }, { status: 500 });
    }
  },

  // Disconnect active user
  DELETE: async ({ request, params }) => {
    console.info(`Disconnecting active user ${params.id}... @`, request.url);

    try {
      const url = new URL(request.url);
      const routerId = url.searchParams.get("routerId");

      if (!routerId) {
        return json({ error: "Router ID is required" }, { status: 400 });
      }

      const hotspot = await createMikrotikHotspot(parseInt(routerId));
      const result = await hotspot.removeActiveUser(params.id);

      if (result.message === "error") {
        return json({ error: result.data.error }, { status: 400 });
      }

      return json({
        success: true,
        message: "User disconnected successfully"
      });

    } catch (error) {
      console.error("Error disconnecting user:", error);
      return json({ 
        error: error instanceof Error ? error.message : "Failed to disconnect user" 
      }, { status: 500 });
    }
  }
});