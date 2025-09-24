import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { createMikrotikHotspot, type ProfileConfig } from '@/lib/mikrotik/hotspot'

export const ServerRoute = createServerFileRoute(
  '/api/mikrotik/hotspot/profiles/'
).methods({
  // Get all profiles
  GET: async ({ request }) => {
    console.info('Fetching MikroTik hotspot profiles... @', request.url)

    try {
      const url = new URL(request.url)
      const routerId = url.searchParams.get('routerId')

      if (!routerId) {
        return json({ error: 'Router ID is required' }, { status: 400 })
      }

      const hotspot = await createMikrotikHotspot(parseInt(routerId))
      const result = await hotspot.listProfiles()

      if (result.message === 'error') {
        return json({ error: result.data.error }, { status: 500 })
      }

      // Format the response
      const formattedProfiles = result.data.map((profile: any) => ({
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
      }))

      return json({
        success: true,
        data: formattedProfiles,
        total: formattedProfiles.length,
      })
    } catch (error) {
      console.error('Error fetching MikroTik profiles:', error)
      return json(
        {
          error:
            error instanceof Error ? error.message : 'Failed to fetch profiles',
        },
        { status: 500 }
      )
    }
  },

  // Create new profile
  POST: async ({ request }) => {
    console.info('Creating MikroTik hotspot profile... @', request.url)

    try {
      const body = await request.json()
      const { routerId, ...profileConfig } = body as {
        routerId: number
      } & ProfileConfig

      if (!routerId) {
        return json({ error: 'Router ID is required' }, { status: 400 })
      }

      // Validate required fields
      if (!profileConfig.name || profileConfig.name.trim().length === 0) {
        return json(
          {
            error: 'Profile name is required',
          },
          { status: 400 }
        )
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = await hotspot.createProfile(profileConfig)

      if (result.message === 'error') {
        return json({ error: result.data.error }, { status: 400 })
      }

      return json(
        {
          success: true,
          message: 'Profile created successfully',
          data: result.data,
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('Error creating MikroTik profile:', error)
      return json(
        {
          error:
            error instanceof Error ? error.message : 'Failed to create profile',
        },
        { status: 500 }
      )
    }
  },
})
