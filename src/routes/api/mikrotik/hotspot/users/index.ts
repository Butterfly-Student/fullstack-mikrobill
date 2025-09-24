// api/mikrotik/hotspot/users/index.ts
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { createMikrotikHotspot, type UserConfig } from '@/lib/mikrotik/hotspot'

export const ServerRoute = createServerFileRoute(
  '/api/mikrotik/hotspot/users/'
).methods({
  // Get all users
  GET: async ({ request }) => {
    console.info('Fetching MikroTik hotspot users... @', request.url)

    try {
      const url = new URL(request.url)
      const routerId = url.searchParams.get('routerId')
      const commentFilter = url.searchParams.get('comment')

      if (!routerId) {
        return json({ error: 'Router ID is required' }, { status: 400 })
      }

      const hotspot = await createMikrotikHotspot(parseInt(routerId))
      const result = await hotspot.listUsers(commentFilter || undefined)

      if (result.message === 'error') {
        return json({ error: result.data.error }, { status: 500 })
      }

      // Format the response
      const formattedUsers = result.data.map((user: any) => ({
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
        uptime: user.uptime,
      }))

      return json({
        success: true,
        data: formattedUsers,
        total: formattedUsers.length,
      })
    } catch (error) {
      console.error('Error fetching MikroTik users:', error)
      return json(
        {
          error:
            error instanceof Error ? error.message : 'Failed to fetch users',
        },
        { status: 500 }
      )
    }
  },

  // Create new user
  POST: async ({ request }) => {
    console.info('Creating MikroTik hotspot user... @', request.url)

    try {
      const body = await request.json()
      const { routerId, ...userConfig } = body as {
        routerId: number
      } & UserConfig

      if (!routerId) {
        return json({ error: 'Router ID is required' }, { status: 400 })
      }

      // Validate required fields
      if (!userConfig.name || !userConfig.password || !userConfig.profile) {
        return json(
          {
            error: 'Name, password, and profile are required',
          },
          { status: 400 }
        )
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = await hotspot.addUser(userConfig)

      if (result.message === 'error') {
        return json({ error: result.data.error }, { status: 400 })
      }

      return json(
        {
          success: true,
          message: 'User created successfully',
          data: result.data,
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('Error creating MikroTik user:', error)
      return json(
        {
          error:
            error instanceof Error ? error.message : 'Failed to create user',
        },
        { status: 500 }
      )
    }
  },
})
