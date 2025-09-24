import { json } from '@tanstack/react-start';
import { createServerFileRoute } from '@tanstack/react-start/server';
import {
  createMikrotikHotspot,
  type ProfileConfig,
} from '@/lib/mikrotik/hotspot'


export const ServerRoute = createServerFileRoute(
  '/api/mikrotik/hotspot/profiles/$id'
).methods({
  // Get specific profile
  GET: async ({ request, params }) => {
    console.info(
      `Fetching MikroTik profile ${params.id}... @`,
      request.url
    )

    try {
      const url = new URL(request.url)
      const routerId = url.searchParams.get('routerId')

      if (!routerId) {
        return json({ error: 'Router ID is required' }, { status: 400 })
      }

      const hotspot = await createMikrotikHotspot(parseInt(routerId))
      const result = await hotspot.getProfile(params.id)

      if (result.message === 'error') {
        return json({ error: result.data.error }, { status: 404 })
      }

      // Format the response
      const profile = result.data
      const formattedProfile = {
        id: profile['.id'],
        name: profile.name,
        sharedUsers: profile['shared-users'],
        rateLimit: profile['rate-limit'],
        addressPool: profile['address-pool'],
        parentQueue: profile['parent-queue'],
        onLogin: profile['on-login'],
        statusAutorefresh: profile['status-autorefresh'],
        sessionTimeout: profile['session-timeout'],
        idleTimeout: profile['idle-timeout'],
        keepaliveTimeout: profile['keepalive-timeout'],
        macCookieTimeout: profile['mac-cookie-timeout'],
        default: profile.default === 'true',
      }

      return json({
        success: true,
        data: formattedProfile,
      })
    } catch (error) {
      console.error('Error fetching MikroTik profile:', error)
      return json(
        {
          error:
            error instanceof Error ? error.message : 'Failed to fetch profile',
        },
        { status: 500 }
      )
    }
  },

  // Update profile
  PUT: async ({ request, params }) => {
    console.info(
      `Updating MikroTik profile ${params.id}... @`,
      request.url
    )

    try {
      const body = await request.json()
      const { routerId, ...updates } = body as {
        routerId: number
      } & Partial<ProfileConfig>

      if (!routerId) {
        return json({ error: 'Router ID is required' }, { status: 400 })
      }

      const hotspot = await createMikrotikHotspot(routerId)

      // Use profileId directly as it should be the MikroTik internal ID
      const result = await hotspot.updateProfile(params.id, updates)

      if (result.message === 'error') {
        return json({ error: result.data.error }, { status: 400 })
      }

      return json({
        success: true,
        message: 'Profile updated successfully',
        data: result.data,
      })
    } catch (error) {
      console.error('Error updating MikroTik profile:', error)
      return json(
        {
          error:
            error instanceof Error ? error.message : 'Failed to update profile',
        },
        { status: 500 }
      )
    }
  },

  // Delete profile
  DELETE: async ({ request, params }) => {
    console.info(
      `Deleting MikroTik profile ${params.id}... @`,
      request.url
    )

    try {
      const url = new URL(request.url)
      const routerId = url.searchParams.get('routerId')

      if (!routerId) {
        return json({ error: 'Router ID is required' }, { status: 400 })
      }

      const hotspot = await createMikrotikHotspot(parseInt(routerId))
      const result = await hotspot.deleteProfile(params.id)

      if (result.message === 'error') {
        return json({ error: result.data.error }, { status: 400 })
      }

      return json({
        success: true,
        message: 'Profile deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting MikroTik profile:', error)
      return json(
        {
          error:
            error instanceof Error ? error.message : 'Failed to delete profile',
        },
        { status: 500 }
      )
    }
  },
})