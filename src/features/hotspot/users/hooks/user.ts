import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { type UserConfig } from '@/lib/mikrotik/hotspot';
import { showSubmittedData } from '@/lib/show-submitted-data';
import { useRouterSwitcherData } from '@/hooks/use-router';
import { getHotspotProfiles } from '@/features/hotspot/server/hotspot-profiles';
import { getHotspotUsers, createHotspotUser, updateHotspotUser, deleteHotspotUser } from '@/features/hotspot/server/hotspot-users';


// Types for user form
export interface UserForm extends Omit<UserConfig, 'routerId'> {
  name: string
  password: string
  profile: string
  server?: string
  macAddress?: string
  disabled?: boolean
  comment?: string
  limitUptime?: string
  limitBytesTotal?: string
  limitBytesIn?: string
  limitBytesOut?: string
}

export const useHotspotUser = (commentFilter?: string) => {
  const queryClient = useQueryClient()
  const { activeRouter } = useRouterSwitcherData({ refetchInterval: false }) 
  const routerId = activeRouter?.id
  // Get all users
  const usersQuery = useQuery({
    queryKey: ['hotspot-users', routerId, commentFilter],
    queryFn: () => getHotspotUsers({ data: { routerId, commentFilter } }),
    staleTime: 30000, // 30 seconds
    enabled: !!routerId,
  })

  // Get all profiles (untuk dropdown/select options)
  const profilesQuery = useQuery({
    queryKey: ['hotspot-profiles', routerId],
    queryFn: () => getHotspotProfiles({ data: { routerId } }),
    staleTime: 60000, // 1 minute, profiles change less frequently
    enabled: !!routerId,
  })

  // Create user mutation
  const addUserMutation = useMutation({
    mutationFn: (userData: UserForm) =>
      createHotspotUser({ data: { routerId, ...userData } }),
    onSuccess: (data) => {
      showSubmittedData(data)
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['hotspot-users'] })
      toast.success('User berhasil ditambahkan!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan user: ${error.message}`)
    },
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({
      userId,
      userData,
    }: {
      userId: string
      userData: Partial<UserForm>
    }) => updateHotspotUser({ data: { routerId, userId, ...userData } }),
    onSuccess: (data) => {
      showSubmittedData(data)
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['hotspot-users'] })
      toast.success('User berhasil diupdate!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal mengupdate user: ${error.message}`)
    },
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      deleteHotspotUser({ data: { routerId, userId } }),
    onSuccess: (data) => {
      showSubmittedData(data)
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['hotspot-users'] })
      toast.success('User berhasil dihapus!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus user: ${error.message}`)
    },
  })

  // Bulk operations
  const deleteMultipleUsersMutation = useMutation({
    mutationFn: async ({ userIds }: { userIds: string[] }) => {
      const results = await Promise.allSettled(
        userIds.map((userId) =>
          deleteHotspotUser({ data: { routerId, userId } })
        )
      )

      const failed = results.filter((result) => result.status === 'rejected')
      if (failed.length > 0) {
        throw new Error(
          `${failed.length} dari ${userIds.length} user gagal dihapus`
        )
      }

      return { success: true, deleted: userIds.length }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['hotspot-users'] })
      toast.success(`${data.deleted} user berhasil dihapus!`)
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus user: ${error.message}`)
    },
  })

  return {
    // Query data
    users: usersQuery.data?.data,
    profiles: profilesQuery.data,

    // Query states
    isLoadingUsers: usersQuery.isLoading,
    isLoadingProfiles: profilesQuery.isLoading,
    usersError: usersQuery.error,
    profilesError: profilesQuery.error,

    // Refetch functions
    refetchUsers: usersQuery.refetch,
    refetchProfiles: profilesQuery.refetch,

    // Mutations
    addUser: addUserMutation,
    updateUser: updateUserMutation,
    deleteUser: deleteUserMutation,
    deleteMultipleUsers: deleteMultipleUsersMutation,

    // Loading states
    isCreating: addUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    isDeletingMultiple: deleteMultipleUsersMutation.isPending,
  }
}