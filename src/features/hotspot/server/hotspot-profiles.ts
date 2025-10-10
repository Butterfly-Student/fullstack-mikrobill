import { createServerFn } from '@tanstack/react-start';
import { createMikrotikHotspot, type ProfileConfig } from '@/lib/mikrotik/hotspot';


// Define types for MikroTik profile response
interface RawMikrotikProfile {
  '.id': string
  name: string
  'shared-users'?: string
  'rate-limit'?: string
  'address-pool'?: string
  'parent-queue'?: string
  'on-login'?: string
  'status-autorefresh'?: string
  'session-timeout'?: string
  'idle-timeout'?: string
  'keepalive-timeout'?: string
  'mac-cookie-timeout'?: string
  default?: string
}

interface FormattedMikrotikProfile {
  id: string
  name: string
  sharedUsers?: string
  rateLimit?: string
  addressPool?: string
  parentQueue?: string
  onLogin?: string
  statusAutorefresh?: string
  sessionTimeout?: string
  idleTimeout?: string
  keepaliveTimeout?: string
  macCookieTimeout?: string
  default: boolean
}

interface MikrotikApiResult<T = unknown> {
  message: 'success' | 'error'
  data: T extends 'error' ? { error: string } : T
}

export const hotspotProfilesKeys = {
  all: ['hotspot-profiles'] as const,
  byRouter: (routerId: number | undefined) =>
    [...hotspotProfilesKeys.all, routerId] as const,
}

// Get all profiles
export const getHotspotProfiles = createServerFn()
  .validator((data: { routerId: number | undefined }) => data)
  .handler(async ({ data }) => {
    console.info('Fetching MikroTik hotspot profiles...')

    try {
      const { routerId } = data

      if (!routerId) {
        throw new Error('Router ID is required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = await hotspot.listProfiles()

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }



      return {
        success: true,
        data: result.data,
        total: result.data.length,
      }
    } catch (error) {
      console.error('Error fetching MikroTik profiles:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch profiles'
      )
    }
  })

// Get specific profile by ID
export const getHotspotProfile = createServerFn()
  .validator((data: { routerId?: number; profileId: string }) => data)
  .handler(async ({ data }) => {
    console.info(`Fetching MikroTik profile ${data.profileId}...`)

    try {
      const { routerId, profileId } = data

      if (!routerId) {
        throw new Error('Router ID is required')
      }

      if (!profileId) {
        throw new Error('Profile ID is required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = (await hotspot.getProfile(
        profileId
      )) as MikrotikApiResult<RawMikrotikProfile>

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }

      // Format the response
      const profile = result.data as RawMikrotikProfile
      const formattedProfile: FormattedMikrotikProfile = {
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

      return {
        success: true,
        data: formattedProfile,
      }
    } catch (error) {
      console.error('Error fetching MikroTik profile:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch profile'
      )
    }
  })

// Create new profile
export const createHotspotProfile = createServerFn()
  .validator((data: { routerId?: number } & ProfileConfig) => data)
  .handler(async ({ data }) => {
    console.info('Creating MikroTik hotspot profile...')

    try {
      const { routerId, ...profileConfig } = data

      if (!routerId) {
        throw new Error('Router ID is required')
      }

      // Validate required fields
      if (!profileConfig.name || profileConfig.name.trim().length === 0) {
        throw new Error('Profile name is required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = (await hotspot.createProfile(
        profileConfig
      )) as MikrotikApiResult<string>

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }

      return {
        success: true,
        message: 'Profile created successfully',
        data: result.data,
      }
    } catch (error) {
      console.error('Error creating MikroTik profile:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to create profile'
      )
    }
  })

// Update profile
export const updateHotspotProfile = createServerFn()
  .validator(
    (data: { routerId?: number; profileId: string } & Partial<ProfileConfig>) =>
      data
  )
  .handler(async ({ data }) => {
    console.info(`Updating MikroTik profile ${data.profileId}...`)

    try {
      const { routerId, profileId, ...updates } = data

      if (!routerId) {
        throw new Error('Router ID is required')
      }

      if (!profileId) {
        throw new Error('Profile ID is required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = (await hotspot.updateProfile(
        profileId,
        updates
      )) as MikrotikApiResult<string>

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }

      return {
        success: true,
        message: 'Profile updated successfully',
        data: result.data,
      }
    } catch (error) {
      console.error('Error updating MikroTik profile:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to update profile'
      )
    }
  })

// Delete profile
export const deleteHotspotProfile = createServerFn()
  .validator((data: { routerId?: number; profileId: string }) => data)
  .handler(async ({ data }) => {
    console.info(`Deleting MikroTik profile ${data.profileId}...`)

    try {
      const { routerId, profileId } = data

      if (!routerId) {
        throw new Error('Router ID is required')
      }

      if (!profileId) {
        throw new Error('Profile ID is required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = (await hotspot.deleteProfile(
        profileId
      )) as MikrotikApiResult<string>

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }

      return {
        success: true,
        message: 'Profile deleted successfully',
      }
    } catch (error) {
      console.error('Error deleting MikroTik profile:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete profile'
      )
    }
  })