import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  type NewTemplateTagihan,
} from '@/db/schema/system'
import { toast } from 'sonner'
import { showSubmittedData } from '@/lib/show-submitted-data'
import {
  getAllTemplateTagihan,
  getTemplateTagihanById,
  createTemplateTagihan,
  updateTemplateTagihan,
  deleteTemplateTagihan,
} from '@/features/system/server/template_tagihan'

export const useTemplateTagihan = () => {
  const queryClient = useQueryClient()

  // Query untuk get all template tagihan
  const getAllTemplateTagihanQuery = useQuery({
    queryKey: ['template-tagihan'],
    queryFn: () => getAllTemplateTagihan(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const addTemplateTagihanMutation = useMutation({
    mutationFn: (templateData: NewTemplateTagihan) =>
      createTemplateTagihan({ data: templateData }),
    onSuccess: (response) => {
      showSubmittedData(response)
      // Invalidate and refetch template tagihan list
      queryClient.invalidateQueries({ queryKey: ['template-tagihan'] })
      
      toast.success('Template tagihan berhasil ditambahkan!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan template tagihan: ${error.message}`)
    },
  })

  const updateTemplateTagihanMutation = useMutation({
    mutationFn: ({
      templateId,
      templateData,
    }: {
      templateId: string
      templateData: Partial<NewTemplateTagihan>
    }) =>
      updateTemplateTagihan({ data: { id: templateId, data: templateData } }),
    onSuccess: (response, variables) => {
      showSubmittedData(response)
      // Update cache with new data
      queryClient.invalidateQueries({ queryKey: ['template-tagihan'] })
      queryClient.invalidateQueries({
        queryKey: ['template-tagihan', variables.templateId],
      })
      toast.success('Template tagihan berhasil diupdate!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal mengupdate template tagihan: ${error.message}`)
    },
  })

  const deleteTemplateTagihanMutation = useMutation({
    mutationFn: ({ templateId }: { templateId: string }) =>
      deleteTemplateTagihan({ data: templateId }),
    onSuccess: (response, variables) => {
      showSubmittedData(response)
      // Remove from cache
      queryClient.invalidateQueries({ queryKey: ['template-tagihan'] })
      queryClient.removeQueries({
        queryKey: ['template-tagihan', variables.templateId],
      })
      // Also invalidate all template by pelanggan queries
      queryClient.invalidateQueries({
        queryKey: ['template-tagihan', 'by-pelanggan'],
      })
      toast.success('Template tagihan berhasil dihapus!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus template tagihan: ${error.message}`)
    },
  })

  return {
    // Query methods
    getAllTemplateTagihan: getAllTemplateTagihanQuery,
    templateTagihan: getAllTemplateTagihanQuery.data?.data || [],
    isLoadingTemplateTagihan: getAllTemplateTagihanQuery.isLoading,
    templateTagihanError: getAllTemplateTagihanQuery.error,

    // Mutation methods
    addTemplateTagihan: addTemplateTagihanMutation,
    updateTemplateTagihan: updateTemplateTagihanMutation,
    deleteTemplateTagihan: deleteTemplateTagihanMutation,

    // Loading states untuk UI
    isAdding: addTemplateTagihanMutation.isPending,
    isUpdating: updateTemplateTagihanMutation.isPending,
    isDeleting: deleteTemplateTagihanMutation.isPending,
  }
}

// Hook terpisah untuk get template tagihan by ID
export const useTemplateTagihanById = (
  templateId: string,
  enabled: boolean = true
) => {
  const getTemplateTagihanQuery = useQuery({
    queryKey: ['template-tagihan', templateId],
    queryFn: () => getTemplateTagihanById({ data: templateId }),
    enabled: enabled && !!templateId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    templateTagihan: getTemplateTagihanQuery.data?.data || null,
    isLoading: getTemplateTagihanQuery.isLoading,
    error: getTemplateTagihanQuery.error,
    refetch: getTemplateTagihanQuery.refetch,
  }
}
