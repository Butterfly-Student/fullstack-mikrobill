// api/mikrotik/hotspot/users/[userId].ts
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { createMikrotikHotspot, type UserConfig } from '@/lib/mikrotik/hotspot'

export const ServerRoute = createServerFileRoute(
  '/api/mikrotik/hotspot/users/$id'
).methods({
  // Get specific user
  GET: async ({ request, params }) => {
    console.info(`Fetching MikroTik user ${params.id}... @`, request.url)

    try {
      const url = new URL(request.url)
      const routerId = url.searchParams.get('routerId')

      if (!routerId) {
        return json({ error: 'Router ID is required' }, { status: 400 })
      }

      const hotspot = await createMikrotikHotspot(parseInt(routerId))
      const result = await hotspot.getUser(params.id)

      if (result.message === 'error') {
        return json({ error: result.data.error }, { status: 404 })
      }

      // Format the response
      const user = result.data
      const formattedUser = {
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
      }

      return json({
        success: true,
        data: formattedUser,
      })
    } catch (error) {
      console.error('Error fetching MikroTik user:', error)
      return json(
        {
          error:
            error instanceof Error ? error.message : 'Failed to fetch user',
        },
        { status: 500 }
      )
    }
  },

  // Update user
  PUT: async ({ request, params }) => {
    console.info(`Updating MikroTik user ${params.id}... @`, request.url)

    try {
      const body = await request.json()
      const { routerId, ...updates } = body as {
        routerId: number
      } & Partial<UserConfig>

      if (!routerId) {
        return json({ error: 'Router ID is required' }, { status: 400 })
      }

      const hotspot = await createMikrotikHotspot(routerId)

      // First, get the user's current .id from MikroTik (params.userId might be the name)
      const existingUser = await hotspot.getUser(params.id)
      if (existingUser.message === 'error') {
        return json({ error: 'User not found' }, { status: 404 })
      }

      const mikrotikUserId = existingUser.data['.id']
      const result = await hotspot.updateUser(mikrotikUserId, updates)

      if (result.message === 'error') {
        return json({ error: result.data.error }, { status: 400 })
      }

      return json({
        success: true,
        message: 'User updated successfully',
        data: result.data,
      })
    } catch (error) {
      console.error('Error updating MikroTik user:', error)
      return json(
        {
          error:
            error instanceof Error ? error.message : 'Failed to update user',
        },
        { status: 500 }
      )
    }
  },

  // Delete user
  DELETE: async ({ request, params }) => {
    console.info(`Deleting MikroTik user ${params.id}... @`, request.url)

    try {
      const url = new URL(request.url)
      const routerId = url.searchParams.get('routerId')

      if (!routerId) {
        return json({ error: 'Router ID is required' }, { status: 400 })
      }

      const hotspot = await createMikrotikHotspot(parseInt(routerId))

      // First, get the user's current .id from MikroTik
      const existingUser = await hotspot.getUser(params.id)
      if (existingUser.message === 'error') {
        return json({ error: 'User not found' }, { status: 404 })
      }

      const mikrotikUserId = existingUser.data['.id']
      const result = await hotspot.deleteUser(mikrotikUserId)

      if (result.message === 'error') {
        return json({ error: result.data.error }, { status: 400 })
      }

      return json({
        success: true,
        message: 'User deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting MikroTik user:', error)
      return json(
        {
          error:
            error instanceof Error ? error.message : 'Failed to delete user',
        },
        { status: 500 }
      )
    }
  },
})
