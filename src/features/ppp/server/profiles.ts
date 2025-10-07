import z from 'zod';
import { createServerFn } from '@tanstack/react-start';
import { createMikrotikHotspot } from '@/lib/mikrotik/hotspot';
import { type PppoeProfile } from '../data/schema';


const routerIdValidator = z.object({
  routerId: z.number(),
})

const createProfileValidator = z.object({
  routerId: z.number(),
  name: z.string(),
  'local-address': z.string().optional(),
  'remote-address': z.string().optional(),
  'use-compression': z.enum(['default', 'yes', 'no']).optional(),
  'use-vj-compression': z.enum(['default', 'yes', 'no']).optional(),
  'use-encryption': z.enum(['default', 'yes', 'no', 'required']).optional(),
  'only-one': z.enum(['default', 'yes', 'no']).optional(),
  'change-tcp-mss': z.enum(['default', 'yes', 'no']).optional(),
  'use-upnp': z.enum(['default', 'yes', 'no']).optional(),
  'address-list': z.string().optional(),
  'rate-limit': z.string().optional(),
  'session-timeout': z.string().optional(),
  'idle-timeout': z.string().optional(),
  'keepalive-timeout': z.string().optional(),
  comment: z.string().optional(),
})

const updateProfileValidator = z.object({
  routerId: z.number(),
  profileId: z.string(),
  name: z.string().optional(),
  'local-address': z.string().optional(),
  'remote-address': z.string().optional(),
  'use-compression': z.enum(['default', 'yes', 'no']).optional(),
  'use-vj-compression': z.enum(['default', 'yes', 'no']).optional(),
  'use-encryption': z.enum(['default', 'yes', 'no', 'required']).optional(),
  'only-one': z.enum(['default', 'yes', 'no']).optional(),
  'change-tcp-mss': z.enum(['default', 'yes', 'no']).optional(),
  'use-upnp': z.enum(['default', 'yes', 'no']).optional(),
  'address-list': z.string().optional(),
  'rate-limit': z.string().optional(),
  'session-timeout': z.string().optional(),
  'idle-timeout': z.string().optional(),
  'keepalive-timeout': z.string().optional(),
  comment: z.string().optional(),
})

const deleteProfileValidator = z.object({
  routerId: z.number(),
  profileId: z.string(),
})



export const getPppProfiles = createServerFn()
  .validator((data) => routerIdValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Fetching MikroTik PPPoE profiles...')

    try {
      const { routerId } = data

      const hotspot = await createMikrotikHotspot(routerId)
      const result = await hotspot.exec<PppoeProfile[]>('/ppp/profile/print')

      return {
        success: true,
        data: result,
        total: result.length,
      }
    } catch (error) {
      console.error('Error fetching MikroTik PPPoE profiles:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to fetch PPPoE profiles'
      )
    }
  })

// Create new PPPoE profile
export const createPppProfile = createServerFn()
  .validator((data) => createProfileValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Creating MikroTik PPPoE profile...')

    try {
      const { routerId, ...profileData } = data

      const hotspot = await createMikrotikHotspot(routerId)

      // Build command parameters
      const params = Object.entries(profileData)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `=${key}=${value}`)

      const result = await hotspot.exec<string>('/ppp/profile/add', params)

      return {
        success: true,
        message: 'PPPoE profile created successfully',
        data: result,
      }
    } catch (error) {
      console.error('Error creating MikroTik PPPoE profile:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to create PPPoE profile'
      )
    }
  })

// Update PPPoE profile
export const updatePppProfile = createServerFn()
  .validator((data) => updateProfileValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Updating MikroTik PPPoE profile...')

    try {
      const { routerId, profileId, ...profileData } = data

      const hotspot = await createMikrotikHotspot(routerId)

      // Build command parameters
      const params = [
        `=.id=${profileId}`,
        ...Object.entries(profileData)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => `=${key}=${value}`),
      ]

      const result = await hotspot.exec<string>('/ppp/profile/set', params)

      return {
        success: true,
        message: 'PPPoE profile updated successfully',
        data: result,
      }
    } catch (error) {
      console.error('Error updating MikroTik PPPoE profile:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to update PPPoE profile'
      )
    }
  })

// Delete PPPoE profile
export const deletePppProfile = createServerFn()
  .validator((data) => deleteProfileValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Deleting MikroTik PPPoE profile...')

    try {
      const { routerId, profileId } = data

      const hotspot = await createMikrotikHotspot(routerId)
      const result = await hotspot.exec<string>('/ppp/profile/remove', [
        `=.id=${profileId}`,
      ])

      return {
        success: true,
        message: 'PPPoE profile deleted successfully',
      }
    } catch (error) {
      console.error('Error deleting MikroTik PPPoE profile:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to delete PPPoE profile'
      )
    }
  })
