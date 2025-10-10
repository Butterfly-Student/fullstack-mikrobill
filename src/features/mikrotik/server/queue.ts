import { createServerFn } from '@tanstack/react-start';
import { createMikrotikHotspot } from '@/lib/mikrotik/hotspot';


export const getSimpleQueue = createServerFn()
  .validator((data: { routerId: number }) => data)
  .handler(async ({ data }) => {
    console.info('Fetching MikroTik hotspot servers...')

    try {
      const { routerId } = data

      if (!routerId) {
        throw new Error('Router ID is required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = await hotspot.listSimpleQueue()

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