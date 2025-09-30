import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { showSubmittedData } from '@/lib/show-submitted-data';
import { getAllPelanggan, getPelangganById, createPelanggan, updatePelanggan, deletePelanggan } from '@/features/system/server/pelanggan';
import { type PelangganForm } from '../data/schema';


export const usePelanggan = () => {
  const queryClient = useQueryClient()

  // Query untuk get all pelanggan
  const getAllPelangganQuery = useQuery({
    queryKey: ['pelanggan'],
    queryFn: () => getAllPelanggan(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const addPelangganMutation = useMutation({
    mutationFn: (pelangganData: PelangganForm) =>
      createPelanggan({ data: pelangganData }),
    onSuccess: (response) => {
      showSubmittedData(response)
      // Invalidate and refetch pelanggan list
      queryClient.invalidateQueries({ queryKey: ['pelanggan'] })
      toast.success('Pelanggan berhasil ditambahkan!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan pelanggan: ${error.message}`)
    },
  })

  const updatePelangganMutation = useMutation({
    mutationFn: ({
      pelangganId,
      pelangganData,
    }: {
      pelangganId: string
      pelangganData: Partial<PelangganForm>
    }) => updatePelanggan({ data: { id: pelangganId, data: pelangganData } }),
    onSuccess: (response, variables) => {
      showSubmittedData(response)
      // Update cache with new data
      queryClient.invalidateQueries({ queryKey: ['pelanggan'] })
      queryClient.invalidateQueries({
        queryKey: ['pelanggan', variables.pelangganId],
      })
      toast.success('Pelanggan berhasil diupdate!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal mengupdate pelanggan: ${error.message}`)
    },
  })

  const deletePelangganMutation = useMutation({
    mutationFn: ({ pelangganId }: { pelangganId: string }) =>
      deletePelanggan({data: pelangganId}),
    onSuccess: (response, variables) => {
      showSubmittedData(response)
      // Remove from cache
      queryClient.invalidateQueries({ queryKey: ['pelanggan'] })
      queryClient.removeQueries({
        queryKey: ['pelanggan', variables.pelangganId],
      })
      toast.success('Pelanggan berhasil dihapus!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus pelanggan: ${error.message}`)
    },
  })

  return {
    // Query methods
    getAllPelanggan: getAllPelangganQuery,
    pelanggan: getAllPelangganQuery.data?.data || [],
    isLoadingPelanggan: getAllPelangganQuery.isLoading,
    pelangganError: getAllPelangganQuery.error,

    // Mutation methods
    addPelanggan: addPelangganMutation,
    updatePelanggan: updatePelangganMutation,
    deletePelanggan: deletePelangganMutation,

    // Loading states untuk UI
    isAdding: addPelangganMutation.isPending,
    isUpdating: updatePelangganMutation.isPending,
    isDeleting: deletePelangganMutation.isPending,
  }
}

// Hook terpisah untuk get pelanggan by ID
export const usePelangganById = (
  pelangganId: string,
  enabled: boolean = true
) => {
  const getPelangganQuery = useQuery({
    queryKey: ['pelanggan', pelangganId],
    queryFn: () => getPelangganById({data : pelangganId}),
    enabled: enabled && !!pelangganId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    pelanggan: getPelangganQuery.data?.data || null,
    isLoading: getPelangganQuery.isLoading,
    error: getPelangganQuery.error,
    refetch: getPelangganQuery.refetch,
  }
}