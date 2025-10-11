import { useQuery } from '@tanstack/react-query'
import { useRouterManagement } from '@/hooks/use-router'
import { getRouterLogs } from '../../server/mikrotik-logs'


type UseRouterLogsOptions = {
  topic?: string
  limit?: number
  enabled?: boolean
  refetchInterval?: number | false
}

export const useRouterLogs = (options: UseRouterLogsOptions = {}) => {
  const { activeRouter } = useRouterManagement({ refetchInterval: false })
  const routerId = activeRouter?.id

  const {
    topic,
    limit = 100,
    enabled = true,
    refetchInterval = false,
  } = options

  const logsQuery = useQuery({
    queryKey: ['router-logs', routerId, topic, limit],
    queryFn: () => getRouterLogs({ data: { routerId, topic, limit } }),
    staleTime: 10000, // 10 seconds
    refetchInterval,
    enabled: !!routerId && enabled,
  })
  console.log(logsQuery.data)

  return {
    // Data
    logs: logsQuery.data?.data || [],
    total: logsQuery.data?.total || 0,

    // States
    isLoading: logsQuery.isLoading,
    isFetching: logsQuery.isFetching,
    error: logsQuery.error,

    // Actions
    refetch: logsQuery.refetch,
  }
}
