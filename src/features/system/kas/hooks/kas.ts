import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type NewKas } from '@/db/schema/system'
import { toast } from 'sonner'
import { showSubmittedData } from '@/lib/show-submitted-data'
import {
  getAllKas,
  getKasById,
  createKas,
  updateKas,
  deleteKas,
} from '@/features/system/server/kas'

export const useKas = () => {
  const queryClient = useQueryClient()

  // Query untuk get all kas
  const getAllKasQuery = useQuery({
    queryKey: ['kas'],
    queryFn: () => getAllKas(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const addKasMutation = useMutation({
    mutationFn: (kasData: NewKas) => createKas({ data: kasData }),
    onSuccess: (response) => {
      showSubmittedData(response)
      // Invalidate and refetch kas list
      queryClient.invalidateQueries({ queryKey: ['kas'] })
      toast.success('Kas berhasil ditambahkan!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan kas: ${error.message}`)
    },
  })

  const updateKasMutation = useMutation({
    mutationFn: ({
      kasId,
      kasData,
    }: {
      kasId: string
      kasData: Partial<NewKas>
    }) => updateKas({ data: { id: kasId, data: kasData } }),
    onSuccess: (response, variables) => {
      showSubmittedData(response)
      // Update cache with new data
      queryClient.invalidateQueries({ queryKey: ['kas'] })
      queryClient.invalidateQueries({
        queryKey: ['kas', variables.kasId],
      })
      toast.success('Kas berhasil diupdate!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal mengupdate kas: ${error.message}`)
    },
  })

  const deleteKasMutation = useMutation({
    mutationFn: ({ kasId }: { kasId: string }) => deleteKas({ data: kasId }),
    onSuccess: (response, variables) => {
      showSubmittedData(response)
      // Remove from cache
      queryClient.invalidateQueries({ queryKey: ['kas'] })
      queryClient.removeQueries({
        queryKey: ['kas', variables.kasId],
      })
      toast.success('Kas berhasil dihapus!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus kas: ${error.message}`)
    },
  })

  return {
    // Query methods
    getAllKas: getAllKasQuery,
    kas: getAllKasQuery.data?.data || [],
    isLoadingKas: getAllKasQuery.isLoading,
    kasError: getAllKasQuery.error,

    // Mutation methods
    addKas: addKasMutation,
    updateKas: updateKasMutation,
    deleteKas: deleteKasMutation,

    // Loading states untuk UI
    isAdding: addKasMutation.isPending,
    isUpdating: updateKasMutation.isPending,
    isDeleting: deleteKasMutation.isPending,
  }
}

// Hook terpisah untuk get kas by ID
export const useKasById = (kasId: string, enabled: boolean = true) => {
  const getKasQuery = useQuery({
    queryKey: ['kas', kasId],
    queryFn: () => getKasById({ data: kasId }),
    enabled: enabled && !!kasId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    kas: getKasQuery.data?.data || null,
    isLoading: getKasQuery.isLoading,
    error: getKasQuery.error,
    refetch: getKasQuery.refetch,
  }
}
