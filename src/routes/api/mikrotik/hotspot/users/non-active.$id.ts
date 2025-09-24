import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { createMikrotikHotspot } from '@/lib/mikrotik/hotspot'

export const ServerRoute = createServerFileRoute(
  '/api/mikrotik/hotspot/users/non-active/$id'
).methods({
  // Get specific non-active user
  GET: async ({ request, params }) => {
    console.info(`Fetching non-active user ${params.id}... @`, request.url)

    try {
      const url = new URL(request.url)
      const routerId = url.searchParams.get('routerId')

      if (!routerId) {
        return json({ error: 'Router ID is required' }, { status: 400 })
      }

      const hotspot = await createMikrotikHotspot(parseInt(routerId))

      // Get all users and active users
      const [allUsersResult, activeUsersResult] = await Promise.all([
        hotspot.getAllUsers(),
        hotspot.getActiveUsers(),
      ])

      if (allUsersResult.message === 'error') {
        return json({ error: allUsersResult.data.error }, { status: 500 })
      }

      if (activeUsersResult.message === 'error') {
        return json({ error: activeUsersResult.data.error }, { status: 500 })
      }

      // Find the specific user by ID
      const user = allUsersResult.data.find((u: any) => u['.id'] === params.id)

      if (!user) {
        return json({ error: 'User not found' }, { status: 404 })
      }

      // Check if user is currently active
      const activeUsernames = activeUsersResult.data.map((u: any) => u.user)
      const isActive = activeUsernames.includes(user.name)

      if (isActive) {
        return json(
          {
            error: 'User is currently active/logged in',
          },
          { status: 400 }
        )
      }

      // Format the response
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
      console.error('Error fetching non-active user:', error)
      return json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to fetch non-active user',
        },
        { status: 500 }
      )
    }
  },

  // Update non-active user (only works if user is not active)
  PUT: async ({ request, params }) => {
    console.info(`Updating non-active user ${params.id}... @`, request.url)

    try {
      const body = await request.json()
      const { routerId, ...updates } = body

      if (!routerId) {
        return json({ error: 'Router ID is required' }, { status: 400 })
      }

      const hotspot = await createMikrotikHotspot(parseInt(routerId))

      // First check if user exists and is not active
      const [allUsersResult, activeUsersResult] = await Promise.all([
        hotspot.getAllUsers(),
        hotspot.getActiveUsers(),
      ])

      if (allUsersResult.message === 'error') {
        return json({ error: allUsersResult.data.error }, { status: 500 })
      }

      if (activeUsersResult.message === 'error') {
        return json({ error: activeUsersResult.data.error }, { status: 500 })
      }

      const user = allUsersResult.data.find((u: any) => u['.id'] === params.id)
      if (!user) {
        return json({ error: 'User not found' }, { status: 404 })
      }

      // Check if user is currently active
      const activeUsernames = activeUsersResult.data.map((u: any) => u.user)
      const isActive = activeUsernames.includes(user.name)

      if (isActive) {
        return json(
          {
            error: 'Cannot update user while they are active/logged in',
          },
          { status: 400 }
        )
      }

      // Update the user
      const result = await hotspot.updateUser(params.id, updates)

      if (result.message === 'error') {
        return json({ error: result.data.error }, { status: 400 })
      }

      return json({
        success: true,
        message: 'User updated successfully',
        data: result.data,
      })
    } catch (error) {
      console.error('Error updating non-active user:', error)
      return json(
        {
          error:
            error instanceof Error ? error.message : 'Failed to update user',
        },
        { status: 500 }
      )
    }
  },

  // Delete non-active user (only works if user is not active)
  DELETE: async ({ request, params }) => {
    console.info(`Deleting non-active user ${params.id}... @`, request.url)

    try {
      const url = new URL(request.url)
      const routerId = url.searchParams.get('routerId')

      if (!routerId) {
        return json({ error: 'Router ID is required' }, { status: 400 })
      }

      const hotspot = await createMikrotikHotspot(parseInt(routerId))

      // First check if user exists and is not active
      const [allUsersResult, activeUsersResult] = await Promise.all([
        hotspot.getAllUsers(),
        hotspot.getActiveUsers(),
      ])

      if (allUsersResult.message === 'error') {
        return json({ error: allUsersResult.data.error }, { status: 500 })
      }

      if (activeUsersResult.message === 'error') {
        return json({ error: activeUsersResult.data.error }, { status: 500 })
      }

      const user = allUsersResult.data.find((u: any) => u['.id'] === params.id)
      if (!user) {
        return json({ error: 'User not found' }, { status: 404 })
      }

      // Check if user is currently active
      const activeUsernames = activeUsersResult.data.map((u: any) => u.user)
      const isActive = activeUsernames.includes(user.name)

      if (isActive) {
        return json(
          {
            error:
              'Cannot delete user while they are active/logged in. Please disconnect them first.',
          },
          { status: 400 }
        )
      }

      // Delete the user
      const result = await hotspot.deleteUser(params.id)

      if (result.message === 'error') {
        return json({ error: result.data.error }, { status: 400 })
      }

      return json({
        success: true,
        message: 'User deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting non-active user:', error)
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
