import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { disconnectActiveHotspotUsers, getActiveHotspotUsers } from '../../server/hotspot-active'


interface UseActiveHotspotUsersOptions {
  routerId?: number | null
  enabled?: boolean
  refetchInterval?: number | false
}

/**
 * Hook untuk mengambil data active hotspot users dari MikroTik
 */
export function useActiveHotspotUsers({
  routerId,
  enabled = true,
  refetchInterval = false,
}: UseActiveHotspotUsersOptions = {}) {
  return useQuery({
    queryKey: ['activeHotspotUsers', routerId],
    queryFn: async () => {
      if (!routerId) throw new Error('Router ID is required')
      return await getActiveHotspotUsers({ data: { routerId } })
    },
    enabled: enabled && !!routerId,
    staleTime: 1000 * 30, // cache 30 detik (data real-time)
    refetchInterval, // auto-refresh jika diperlukan
    refetchOnWindowFocus: true, // refresh saat kembali ke tab
  })
}

/**
 * Hook untuk disconnect multiple active hotspot users
 */
export function useDisconnectActiveUsers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { routerId: number; userIds: string[] }) => {
      return await disconnectActiveHotspotUsers({ data })
    },
    onSuccess: (result, variables) => {
      // Invalidate active users query untuk refresh data
      queryClient.invalidateQueries({
        queryKey: ['activeHotspotUsers', variables.routerId],
      })

      // Optional: bisa juga invalidate hotspot users jika ada
      queryClient.invalidateQueries({
        queryKey: ['hotspotUsers', variables.routerId],
      })
    },
    onError: (error) => {
      console.error('Failed to disconnect users:', error)
    },
  })
}

/**
 * Hook untuk disconnect single active user
 */
export function useDisconnectActiveUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { routerId: number; userId: string }) => {
      return await disconnectActiveHotspotUsers({
        data: {
          routerId: data.routerId,
          userIds: [data.userId],
        },
      })
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['activeHotspotUsers', variables.routerId],
      })

      queryClient.invalidateQueries({
        queryKey: ['hotspotUsers', variables.routerId],
      })
    },
    onError: (error) => {
      console.error('Failed to disconnect user:', error)
    },
  })
}
