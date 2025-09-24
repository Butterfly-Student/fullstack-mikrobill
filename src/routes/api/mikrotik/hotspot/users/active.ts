import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { createMikrotikHotspot } from '@/lib/mikrotik/hotspot'

export const ServerRoute = createServerFileRoute(
  '/api/mikrotik/hotspot/users/active'
).methods({
  // Get all active users
  GET: async ({ request }) => {
    console.info('Fetching active MikroTik users... @', request.url)

    try {
      const url = new URL(request.url)
      const routerId = url.searchParams.get('routerId')

      if (!routerId) {
        return json({ error: 'Router ID is required' }, { status: 400 })
      }

      const hotspot = await createMikrotikHotspot(parseInt(routerId))
      const result = await hotspot.getActiveUsers()

      if (result.message === 'error') {
        return json({ error: result.data.error }, { status: 500 })
      }

      // Format the response
      const formattedActiveUsers = result.data.map((user: any) => ({
        id: user['.id'],
        user: user.user,
        address: user.address,
        macAddress: user['mac-address'],
        loginTime: user['login-time'],
        uptime: user.uptime,
        idleTime: user['idle-time'],
        sessionTimeLeft: user['session-time-left'],
        idleTimeout: user['idle-timeout'],
        bytesIn: user['bytes-in'],
        bytesOut: user['bytes-out'],
        packetsIn: user['packets-in'],
        packetsOut: user['packets-out'],
        server: user.server,
        radius: user.radius === 'true',
        domain: user.domain,
      }))

      return json({
        success: true,
        data: formattedActiveUsers,
        total: formattedActiveUsers.length,
      })
    } catch (error) {
      console.error('Error fetching active users:', error)
      return json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to fetch active users',
        },
        { status: 500 }
      )
    }
  },
})
