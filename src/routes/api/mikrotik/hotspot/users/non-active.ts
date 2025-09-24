// api/mikrotik/hotspot/users/non-active/index.ts
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { createMikrotikHotspot } from "@/lib/mikrotik/hotspot";

export const ServerRoute = createServerFileRoute("/api/mikrotik/hotspot/users/non-active").methods({
  // Get all non-active users (users that are not currently logged in)
  GET: async ({ request }) => {
    console.info("Fetching non-active MikroTik users... @", request.url);

    try {
      const url = new URL(request.url);
      const routerId = url.searchParams.get("routerId");
      const profile = url.searchParams.get("profile");
      const comment = url.searchParams.get("comment");

      if (!routerId) {
        return json({ error: "Router ID is required" }, { status: 400 });
      }

      const hotspot = await createMikrotikHotspot(parseInt(routerId));
      
      // Get all users and active users
      const [allUsersResult, activeUsersResult] = await Promise.all([
        hotspot.listUsers(comment || undefined),
        hotspot.getActiveUsers()
      ]);

      if (allUsersResult.message === "error") {
        return json({ error: allUsersResult.data.error }, { status: 500 });
      }

      if (activeUsersResult.message === "error") {
        return json({ error: activeUsersResult.data.error }, { status: 500 });
      }

      // Get list of active usernames
      const activeUsernames = activeUsersResult.data.map((user: any) => user.user);

      // Filter out active users and optionally filter by profile
      let nonActiveUsers = allUsersResult.data.filter((user: any) => 
        !activeUsernames.includes(user.name)
      );

      if (profile) {
        nonActiveUsers = nonActiveUsers.filter((user: any) => user.profile === profile);
      }

      // Format the response
      const formattedUsers = nonActiveUsers.map((user: any) => ({
        id: user['.id'],
        name: user.name,
        password: user.password,
        profile: user.profile,
        server: user.server,
        macAddress: user['mac-address'],
        disabled: user.disabled === 'true',
        comment: user.comment,
        limitUptime: user['limit-uptime'],
        limitBytesTotal: user['limit-bytes-total'],
        limitBytesIn: user['limit-bytes-in'],
        limitBytesOut: user['limit-bytes-out'],
        bytesIn: user['bytes-in'],
        bytesOut: user['bytes-out'],
        packetsIn: user['packets-in'],
        packetsOut: user['packets-out'],
        uptime: user.uptime
      }));

      return json({
        success: true,
        data: formattedUsers,
        total: formattedUsers.length
      });

    } catch (error) {
      console.error("Error fetching non-active users:", error);
      return json({ 
        error: error instanceof Error ? error.message : "Failed to fetch non-active users" 
      }, { status: 500 });
    }
  }
});
