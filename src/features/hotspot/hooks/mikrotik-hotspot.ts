import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { VoucherConfig } from '@/lib/mikrotik/hotspot'
import {
  getHotspotServers,
  getHotspotProfiles,
  getPools,
} from '../server/mikrotik-hotspot'
import { generateBatchUsers } from '../server/hotspot-users'

interface UseHotspotOptions {
  routerId?: number
  enabled?: boolean
}

/**
 * Hook untuk mengambil data hotspot servers dari MikroTik
 */
export function useHotspotServers({
  routerId,
  enabled = true,
}: UseHotspotOptions) {
  return useQuery({
    queryKey: ['hotspotServers', routerId],
    queryFn: async () => {
      if (!routerId) throw new Error('Router ID is required')
      return await getHotspotServers({ data: { routerId } })
    },
    enabled: enabled && !!routerId,
    staleTime: 1000 * 60, // cache 1 menit
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook untuk mengambil data hotspot profiles dari MikroTik
 */
export function useHotspotProfiles({
  routerId,
  enabled = true,
}: UseHotspotOptions) {
  return useQuery({
    queryKey: ['hotspotProfiles', routerId],
    queryFn: async () => {
      if (!routerId) throw new Error('Router ID is required')
      return await getHotspotProfiles({ data: { routerId } })
    },
    enabled: enabled && !!routerId,
    staleTime: 1000 * 60, // cache 1 menit
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook untuk mengambil data IP pools dari MikroTik
 */
export function useHotspotPools({
  routerId,
  enabled = true,
}: UseHotspotOptions) {
  return useQuery({
    queryKey: ['hotspotPools', routerId],
    queryFn: async () => {
      if (!routerId) throw new Error('Router ID is required')
      return await getPools({ data: { routerId } })
    },
    enabled: enabled && !!routerId,
    staleTime: 1000 * 60, // cache 1 menit
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook untuk generate batch hotspot users
 */
export function useGenerateBatchUsers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { routerId: number } & VoucherConfig) => {
      return await generateBatchUsers({ data })
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries untuk refresh data
      queryClient.invalidateQueries({
        queryKey: ['hotspotUsers', variables.routerId],
      })
      queryClient.invalidateQueries({
        queryKey: ['hotspotProfiles', variables.routerId],
      })
    },
  })
}
