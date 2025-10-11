import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { useRouterManagement } from '@/hooks/use-router'
import {
  getPppSecrets,
  createPppSecret,
  updatePppSecret,
  deletePppSecret,
  getPppActive,
  getPppInactive,
  enablePppSecret,
  disablePppSecret,
  disconnectPppActive,
} from '@/features/ppp/server/secrets'

// Types for PPPoE form
export interface PppSecretForm {
  name: string
  password?: string
  service?: 'pppoe' | 'pptp' | 'l2tp' | 'ovpn' | 'sstp'
  'caller-id'?: string
  profile?: string
  routes?: string
  'ipv6-routes'?: string
  'limit-bytes-in'?: string
  'limit-bytes-out'?: string
  disabled?: boolean
  'local-address'?: string
  'remote-address'?: string
  'remote-ipv6-prefix'?: string
}

export const usePppoeSecret = () => {
  const queryClient = useQueryClient()
  const { activeRouter } = useRouterManagement({ refetchInterval: false })
  const routerId = activeRouter?.id

  // Get all PPPoE secrets/users
  const secretsQuery = useQuery({
    queryKey: ['pppoe-secrets', routerId],
    queryFn: () => getPppSecrets({ data: { routerId } }),
    staleTime: 30000, // 30 seconds
    enabled: !!routerId,
  })

  // Get active PPPoE sessions
  const activeQuery = useQuery({
    queryKey: ['pppoe-active', routerId],
    queryFn: () => getPppActive({ data: { routerId } }),
    staleTime: 10000, // 10 seconds (active sessions change more frequently)
    enabled: !!routerId,
  })

  // Get inactive PPPoE users
  const inactiveQuery = useQuery({
    queryKey: ['pppoe-inactive', routerId],
    queryFn: () => getPppInactive({ data: { routerId } }),
    staleTime: 30000, // 30 seconds
    enabled: !!routerId,
  })

  // Create PPPoE secret mutation
  const addSecretMutation = useMutation({
    mutationFn: (secretData: PppSecretForm) =>
      createPppSecret({ data: { routerId, ...secretData } }),
    onSuccess: (data) => {
      showSubmittedData(data)
      queryClient.invalidateQueries({ queryKey: ['pppoe-secrets'] })
      queryClient.invalidateQueries({ queryKey: ['pppoe-inactive'] })
      toast.success('PPPoE secret berhasil ditambahkan!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan PPPoE secret: ${error.message}`)
    },
  })

  // Update PPPoE secret mutation
  const updateSecretMutation = useMutation({
    mutationFn: ({
      userId,
      secretData,
    }: {
      userId: string
      secretData: Partial<PppSecretForm>
    }) => updatePppSecret({ data: { routerId, userId, ...secretData } }),
    onSuccess: (data) => {
      showSubmittedData(data)
      queryClient.invalidateQueries({ queryKey: ['pppoe-secrets'] })
      queryClient.invalidateQueries({ queryKey: ['pppoe-active'] })
      queryClient.invalidateQueries({ queryKey: ['pppoe-inactive'] })
      toast.success('PPPoE secret berhasil diupdate!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal mengupdate PPPoE secret: ${error.message}`)
    },
  })

  // Delete PPPoE secret mutation
  const deleteSecretMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      deletePppSecret({ data: { routerId, userId } }),
    onSuccess: (data) => {
      showSubmittedData(data)
      queryClient.invalidateQueries({ queryKey: ['pppoe-secrets'] })
      queryClient.invalidateQueries({ queryKey: ['pppoe-inactive'] })
      toast.success('PPPoE secret berhasil dihapus!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus PPPoE secret: ${error.message}`)
    },
  })

  // Enable PPPoE secret mutation (single or multiple)
  const enableSecretMutation = useMutation({
    mutationFn: ({ userId }: { userId: string | string[] }) =>
      enablePppSecret({ data: { routerId, userId } }),
    onSuccess: (data) => {
      showSubmittedData(data)
      queryClient.invalidateQueries({ queryKey: ['pppoe-secrets'] })
      queryClient.invalidateQueries({ queryKey: ['pppoe-inactive'] })
      toast.success(data.message || 'PPPoE secret berhasil diaktifkan!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal mengaktifkan PPPoE secret: ${error.message}`)
    },
  })

  // Disable PPPoE secret mutation (single or multiple)
  const disableSecretMutation = useMutation({
    mutationFn: ({ userId }: { userId: string | string[] }) =>
      disablePppSecret({ data: { routerId, userId } }),
    onSuccess: (data) => {
      showSubmittedData(data)
      queryClient.invalidateQueries({ queryKey: ['pppoe-secrets'] })
      queryClient.invalidateQueries({ queryKey: ['pppoe-inactive'] })
      toast.success(data.message || 'PPPoE secret berhasil dinonaktifkan!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal menonaktifkan PPPoE secret: ${error.message}`)
    },
  })

  // Disconnect active session mutation (single or multiple)
  const disconnectSessionMutation = useMutation({
    mutationFn: ({ sessionId }: { sessionId: string | string[] }) =>
      disconnectPppActive({ data: { routerId, sessionId } }),
    onSuccess: (data) => {
      showSubmittedData(data)
      queryClient.invalidateQueries({ queryKey: ['pppoe-active'] })
      toast.success(data.message || 'Sesi PPPoE berhasil diputus!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal memutus sesi PPPoE: ${error.message}`)
    },
  })

  // Bulk delete secrets mutation
  const deleteMultipleSecretsMutation = useMutation({
    mutationFn: async ({ userIds }: { userIds: string[] }) => {
      const results = await Promise.allSettled(
        userIds.map((userId) => deletePppSecret({ data: { routerId, userId } }))
      )

      const failed = results.filter((result) => result.status === 'rejected')
      if (failed.length > 0) {
        throw new Error(
          `${failed.length} dari ${userIds.length} secret gagal dihapus`
        )
      }

      return { success: true, deleted: userIds.length }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pppoe-secrets'] })
      queryClient.invalidateQueries({ queryKey: ['pppoe-inactive'] })
      toast.success(`${data.deleted} PPPoE secret berhasil dihapus!`)
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus PPPoE secret: ${error.message}`)
    },
  })

  return {
    // Query data
    secrets: secretsQuery.data?.data,
    activeSessions: activeQuery.data?.data,
    inactiveUsers: inactiveQuery.data?.data,

    // Total counts
    totalSecrets: secretsQuery.data?.total || 0,
    totalActive: activeQuery.data?.total || 0,
    totalInactive: inactiveQuery.data?.total || 0,

    // Query states
    isLoadingSecrets: secretsQuery.isLoading,
    isLoadingActive: activeQuery.isLoading,
    isLoadingInactive: inactiveQuery.isLoading,
    secretsError: secretsQuery.error,
    activeError: activeQuery.error,
    inactiveError: inactiveQuery.error,

    // Refetch functions
    refetchSecrets: secretsQuery.refetch,
    refetchActive: activeQuery.refetch,
    refetchInactive: inactiveQuery.refetch,

    // Mutations
    addSecret: addSecretMutation,
    updateSecret: updateSecretMutation,
    deleteSecret: deleteSecretMutation,
    enableSecret: enableSecretMutation,
    disableSecret: disableSecretMutation,
    disconnectSession: disconnectSessionMutation,
    deleteMultipleSecrets: deleteMultipleSecretsMutation,

    // Loading states
    isCreating: addSecretMutation.isPending,
    isUpdating: updateSecretMutation.isPending,
    isDeleting: deleteSecretMutation.isPending,
    isEnabling: enableSecretMutation.isPending,
    isDisabling: disableSecretMutation.isPending,
    isDisconnecting: disconnectSessionMutation.isPending,
    isDeletingMultiple: deleteMultipleSecretsMutation.isPending,
  }
}
