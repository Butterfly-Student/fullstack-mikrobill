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
    mutationFn: ({ tagihanId }: { tagihanId: string | string[] }) =>
      deleteTagihan({ data: tagihanId }),
    onSuccess: (response, variables) => {
      showSubmittedData(response)
      const ids = Array.isArray(variables.tagihanId)
        ? variables.tagihanId
        : [variables.tagihanId]
      const isSingle = !Array.isArray(variables.tagihanId)

      // Remove from cache
      queryClient.invalidateQueries({ queryKey: ['tagihan'] })

      // Remove individual queries for each deleted tagihan
      ids.forEach((id) => {
        queryClient.removeQueries({
          queryKey: ['tagihan', id],
        })
      })

      // Also invalidate all tagihan by pelanggan queries
      queryClient.invalidateQueries({
        queryKey: ['tagihan', 'by-pelanggan'],
      })

      // Show appropriate toast message
      if (isSingle) {
        toast.success('Tagihan berhasil dihapus!')
      } else {
        const data = response.data as {
          deletedCount: number
          failedIds: string[]
        }
        if (data.failedIds.length > 0) {
          toast.success(
            `${data.deletedCount} tagihan berhasil dihapus, ${data.failedIds.length} gagal`
          )
        } else {
          toast.success(`${data.deletedCount} tagihan berhasil dihapus!`)
        }
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
      tagihanId: string | string[]
      status: 'belum_lunas' | 'lunas' | 'sebagian' | 'jatuh_tempo'
    }) => updateTagihanStatus({ data: { id: tagihanId, status } }),
    onSuccess: (response, variables) => {
      showSubmittedData(response)
      const ids = Array.isArray(variables.tagihanId)
        ? variables.tagihanId
        : [variables.tagihanId]
      const isSingle = !Array.isArray(variables.tagihanId)

      // Update cache with new data
      queryClient.invalidateQueries({ queryKey: ['tagihan'] })

      // Invalidate individual queries for each updated tagihan
      ids.forEach((id) => {
        queryClient.invalidateQueries({
          queryKey: ['tagihan', id],
        })
      })

      // Also invalidate tagihan by pelanggan
      queryClient.invalidateQueries({
        queryKey: ['tagihan', 'by-pelanggan'],
      })

      // Show appropriate toast message
      if (isSingle) {
        toast.success('Status tagihan berhasil diupdate!')
      } else {
        const data = response.data as {
          updatedCount: number
          failedIds: string[]
        }
        if (data.failedIds.length > 0) {
          toast.success(
            `${data.updatedCount} status tagihan berhasil diupdate, ${data.failedIds.length} gagal`
          )
        } else {
          toast.success(
            `${data.updatedCount} status tagihan berhasil diupdate!`
          )
        }
      }
    },
    onError: (error: Error) => {
      toast.error(`Gagal mengupdate status tagihan: ${error.message}`)
    },
  })

  return {
    // Query methods
    getAllTagihan: getAllTagihanQuery,
    tagihan: getAllTagihanQuery.data || [],
    isLoadingTagihan: getAllTagihanQuery.isLoading,
    tagihanError: getAllTagihanQuery.error,

    // Mutation methods
    addTagihan: addTagihanMutation,
    updateTagihan: updateTagihanMutation,
    deleteTagihan: deleteTagihanMutation,
    updateStatus: updateStatusMutation,

    // Loading states untuk UI
    isAdding: addTagihanMutation.isPending,
    isUpdating: updateTagihanMutation.isPending,
    isDeleting: deleteTagihanMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
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
    tagihan: getTagihanQuery.data || [],
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
