import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { showSubmittedData } from '@/lib/show-submitted-data'
import {
  getAllTagihan,
  getTagihanById,
  getTagihanByPelangganId,
  createTagihan,
  updateTagihan,
  deleteTagihan,
  updateTagihanStatus,
  deleteMultipleTagihan,
  // NEW
  updateMultipleTagihanStatus, // NEW
} from '@/features/system/server/tagihan'
import { type TagihanForm } from '../data/schema'

export const useTagihan = () => {
  const queryClient = useQueryClient()

  // Query untuk get all tagihan
  const getAllTagihanQuery = useQuery({
    queryKey: ['tagihan'],
    queryFn: () => getAllTagihan(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const addTagihanMutation = useMutation({
    mutationFn: (tagihanData: TagihanForm) =>
      createTagihan({ data: tagihanData }),
    onSuccess: (response) => {
      showSubmittedData(response)
      // Invalidate and refetch tagihan list
      queryClient.invalidateQueries({ queryKey: ['tagihan'] })
      // Also invalidate tagihan by pelanggan if exists
      if (response.data?.pelangganId) {
        queryClient.invalidateQueries({
          queryKey: ['tagihan', 'by-pelanggan', response.data.pelangganId],
        })
      }
      toast.success('Tagihan berhasil ditambahkan!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan tagihan: ${error.message}`)
    },
  })

  const updateTagihanMutation = useMutation({
    mutationFn: ({
      tagihanId,
      tagihanData,
    }: {
      tagihanId: string
      tagihanData: Partial<TagihanForm>
    }) => updateTagihan({ data: { id: tagihanId, data: tagihanData } }),
    onSuccess: (response, variables) => {
      showSubmittedData(response)
      // Update cache with new data
      queryClient.invalidateQueries({ queryKey: ['tagihan'] })
      queryClient.invalidateQueries({
        queryKey: ['tagihan', variables.tagihanId],
      })
      // Also invalidate tagihan by pelanggan if exists
      if (response.data?.pelangganId) {
        queryClient.invalidateQueries({
          queryKey: ['tagihan', 'by-pelanggan', response.data.pelangganId],
        })
      }
      toast.success('Tagihan berhasil diupdate!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal mengupdate tagihan: ${error.message}`)
    },
  })

  const deleteTagihanMutation = useMutation({
    mutationFn: ({ tagihanId }: { tagihanId: string }) =>
      deleteTagihan({ data: tagihanId }),
    onSuccess: (response, variables) => {
      showSubmittedData(response)
      // Remove from cache
      queryClient.invalidateQueries({ queryKey: ['tagihan'] })
      queryClient.removeQueries({
        queryKey: ['tagihan', variables.tagihanId],
      })
      // Also invalidate all tagihan by pelanggan queries
      queryClient.invalidateQueries({
        queryKey: ['tagihan', 'by-pelanggan'],
      })
      toast.success('Tagihan berhasil dihapus!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus tagihan: ${error.message}`)
    },
  })

  // NEW: Multi-delete mutation
  const deleteMultipleTagihanMutation = useMutation({
    mutationFn: ({ tagihanIds }: { tagihanIds: string[] }) =>
      deleteMultipleTagihan({ data: tagihanIds }),
    onSuccess: (response, variables) => {
      const { deletedCount = 0, failedIds } = response.data || {}

      // Show detailed response
      showSubmittedData(response)

      // Invalidate main tagihan list
      queryClient.invalidateQueries({ queryKey: ['tagihan'] })

      // Remove successfully deleted items from cache
      const successfulIds = variables.tagihanIds.filter(
        (id) => !failedIds?.includes(id)
      )
      successfulIds.forEach((id) => {
        queryClient.removeQueries({ queryKey: ['tagihan', id] })
      })

      // Also invalidate all tagihan by pelanggan queries
      queryClient.invalidateQueries({
        queryKey: ['tagihan', 'by-pelanggan'],
      })

      // Show appropriate toast message
      if (deletedCount === variables.tagihanIds.length) {
        toast.success(`${deletedCount} tagihan berhasil dihapus!`)
      } else if (deletedCount > 0) {
        toast.warning(
          `${deletedCount} tagihan berhasil dihapus, ${failedIds?.length || 0} gagal`
        )
      } else {
        toast.error('Tidak ada tagihan yang berhasil dihapus')
      }
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus tagihan: ${error.message}`)
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({
      tagihanId,
      status,
    }: {
      tagihanId: string
      status: 'belum_lunas' | 'lunas' | 'sebagian'
    }) => updateTagihanStatus({ data: { id: tagihanId, status } }),
    onSuccess: (response, variables) => {
      showSubmittedData(response)
      // Update cache with new data
      queryClient.invalidateQueries({ queryKey: ['tagihan'] })
      queryClient.invalidateQueries({
        queryKey: ['tagihan', variables.tagihanId],
      })
      // Also invalidate tagihan by pelanggan if exists
      if (response.data?.pelangganId) {
        queryClient.invalidateQueries({
          queryKey: ['tagihan', 'by-pelanggan', response.data.pelangganId],
        })
      }
      toast.success('Status tagihan berhasil diupdate!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal mengupdate status tagihan: ${error.message}`)
    },
  })

  // NEW: Multi-update status mutation
  const updateMultipleStatusMutation = useMutation({
    mutationFn: ({
      tagihanIds,
      status,
    }: {
      tagihanIds: string[]
      status: 'belum_lunas' | 'lunas' | 'sebagian'
    }) => updateMultipleTagihanStatus({ data: { ids: tagihanIds, status } }),
    onSuccess: (response, variables) => {
      const { updatedCount = 0, failedIds } = response.data || {}

      // Show detailed response
      showSubmittedData(response)

      // Invalidate main tagihan list
      queryClient.invalidateQueries({ queryKey: ['tagihan'] })

      // Invalidate individual tagihan that were successfully updated
      const successfulIds = variables.tagihanIds.filter(
        (id) => !failedIds?.includes(id)
      )
      successfulIds.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: ['tagihan', id] })
      })

      // Also invalidate all tagihan by pelanggan queries
      queryClient.invalidateQueries({
        queryKey: ['tagihan', 'by-pelanggan'],
      })

      // Show appropriate toast message
      if (updatedCount === variables.tagihanIds.length) {
        toast.success(`Status ${updatedCount} tagihan berhasil diupdate!`)
      } else if (updatedCount > 0) {
        toast.warning(
          `Status ${updatedCount} tagihan berhasil diupdate, ${failedIds?.length || 0} gagal`
        )
      } else {
        toast.error('Tidak ada status tagihan yang berhasil diupdate')
      }
    },
    onError: (error: Error) => {
      toast.error(`Gagal mengupdate status tagihan: ${error.message}`)
    },
  })

  return {
    // Query methods
    getAllTagihan: getAllTagihanQuery,
    tagihan: getAllTagihanQuery.data?.data || [],
    isLoadingTagihan: getAllTagihanQuery.isLoading,
    tagihanError: getAllTagihanQuery.error,

    // Mutation methods
    addTagihan: addTagihanMutation,
    updateTagihan: updateTagihanMutation,
    deleteTagihan: deleteTagihanMutation,
    deleteMultipleTagihan: deleteMultipleTagihanMutation, // NEW
    updateStatus: updateStatusMutation,
    updateMultipleStatus: updateMultipleStatusMutation, // NEW

    // Loading states untuk UI
    isAdding: addTagihanMutation.isPending,
    isUpdating: updateTagihanMutation.isPending,
    isDeleting: deleteTagihanMutation.isPending,
    isDeletingMultiple: deleteMultipleTagihanMutation.isPending, // NEW
    isUpdatingStatus: updateStatusMutation.isPending,
    isUpdatingMultipleStatus: updateMultipleStatusMutation.isPending, // NEW
  }
}

// Hook terpisah untuk get tagihan by ID
export const useTagihanById = (tagihanId: string, enabled: boolean = true) => {
  const getTagihanQuery = useQuery({
    queryKey: ['tagihan', tagihanId],
    queryFn: () => getTagihanById({ data: tagihanId }),
    enabled: enabled && !!tagihanId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    tagihan: getTagihanQuery.data?.data || null,
    isLoading: getTagihanQuery.isLoading,
    error: getTagihanQuery.error,
    refetch: getTagihanQuery.refetch,
  }
}

// Hook terpisah untuk get tagihan by pelanggan ID
export const useTagihanByPelangganId = (
  pelangganId: string,
  enabled: boolean = true
) => {
  const getTagihanByPelangganQuery = useQuery({
    queryKey: ['tagihan', 'by-pelanggan', pelangganId],
    queryFn: () => getTagihanByPelangganId({ data: pelangganId }),
    enabled: enabled && !!pelangganId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    tagihan: getTagihanByPelangganQuery.data?.data || [],
    isLoading: getTagihanByPelangganQuery.isLoading,
    error: getTagihanByPelangganQuery.error,
    refetch: getTagihanByPelangganQuery.refetch,
  }
}
