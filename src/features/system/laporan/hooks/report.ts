import { getReportByDate, getReportCount } from "@/features/hotspot/server/report"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"


/**
 * Hook untuk mengambil report by date
 */
export function useReportByDate(
  routerId: number | undefined,
  date: string,
  options?: {
    useCache?: boolean
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: ['reportByDate', routerId, date, options?.useCache],
    queryFn: async () => {
      if (!routerId) throw new Error('Router ID is required')
      return await getReportByDate({
        data: {
          routerId,
          date,
          useCache: options?.useCache ?? true,
        },
      })
    },
    enabled: options?.enabled !== false && !!routerId && !!date,
    staleTime: 1000 * 60 * 5, // cache 5 menit
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook untuk mengambil count report by date
 */
export function useReportCount(
  routerId: number | undefined,
  date: string,
  options?: {
    enabled?: boolean
  }
) {
  return useQuery({
    queryKey: ['reportCount', routerId, date],
    queryFn: async () => {
      if (!routerId) throw new Error('Router ID is required')
      return await getReportCount({
        data: {
          routerId,
          date,
        },
      })
    },
    enabled: options?.enabled !== false && !!routerId && !!date,
    staleTime: 1000 * 60 * 5, // cache 5 menit
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook untuk force refresh report (tanpa cache)
 */
export function useRefreshReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { routerId: number; date: string }) => {
      return await getReportByDate({
        data: {
          ...data,
          useCache: false,
        },
      })
    },
    onSuccess: (data, variables) => {
      // Invalidate cache untuk date tersebut
      queryClient.invalidateQueries({
        queryKey: ['reportByDate', variables.routerId, variables.date],
      })
      queryClient.invalidateQueries({
        queryKey: ['reportCount', variables.routerId, variables.date],
      })
    },
  })
}
