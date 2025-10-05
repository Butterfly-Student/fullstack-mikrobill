import { createServerFn } from '@tanstack/react-start';
import { createMikrotikHotspot } from '@/lib/mikrotik/hotspot';



// Server function untuk mendapatkan hotspot servers menggunakan routerId (dari database)
export const getHotspotServers = createServerFn()
  .validator((data: { routerId: number }) => data)
  .handler(async ({ data }) => {
    console.info('Fetching MikroTik hotspot servers...')

    try {
      const { routerId } = data

      if (!routerId) {
        throw new Error('Router ID is required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = await hotspot.listServers()

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }

      return {
        success: true,
        data: result.data,
        total: Array.isArray(result.data) ? result.data.length : 0,
      }
    } catch (error) {
      console.error('Error fetching MikroTik servers:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch servers'
      )
    }
  })

// Server function untuk mendapatkan hotspot profiles menggunakan direct connection
export const getHotspotProfiles = createServerFn()
  .validator((data: {routerId: number}) => data)
  .handler(async ({ data }) => {
    console.info('Fetching MikroTik hotspot profiles...')

    try {
      const { routerId } = data

      // Create direct client dengan config
      const client = await createMikrotikHotspot(routerId)
      const result = await client.listProfiles()

      return {
        success: true,
        data: result.data,
        total: Array.isArray(result) ? result.length : 0,
      }
    } catch (error) {
      console.error('Error fetching MikroTik profiles:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch profiles'
      )
    }
  })

// Function untuk mendapatkan hotspot profiles dari database
export const getPools = createServerFn()
  .validator((data: { routerId: number }) => data)
  .handler(async ({ data }) => {
    console.info('Fetching MikroTik hotspot profiles from database...')

    try {
      const { routerId } = data

      if (!routerId) {
        throw new Error('Router ID is required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = await hotspot.listPools()

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }

      return {
        success: true,
        data: result.data,
        total: Array.isArray(result.data) ? result.data.length : 0,
      }
    } catch (error) {
      console.error('Error fetching MikroTik profiles:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch profiles'
      )
    }
  })