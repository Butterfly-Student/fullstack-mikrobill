import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { showSubmittedData } from '@/lib/show-submitted-data'
import {
  createHotspotProfile,
  updateHotspotProfile,
  deleteHotspotProfile,
} from '@/features/hotspot/server/hotspot-profiles'
import { type ProfileForm } from '../../data/schema';
import { useRouterManagement } from '@/hooks/use-router';


export const useHotspotProfile = () => {
  const queryClient = useQueryClient()
  const { activeRouter } = useRouterManagement()
  const routerId = activeRouter?.id

  const addProfileMutation = useMutation({
    mutationFn: (profileData: ProfileForm) =>
      createHotspotProfile({data: {routerId, ...profileData}}),
    onSuccess: (data) => {
      showSubmittedData(data)
      // Invalidate and refetch profiles list
      queryClient.invalidateQueries({ queryKey: ['hotspot-profiles'] })
      toast.success('Profile berhasil ditambahkan!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan profile: ${error.message}`)
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: ({
      profileId,
      profileData,
    }: {
      profileId: string
      profileData: ProfileForm
    }) => updateHotspotProfile({data: {routerId, profileId, ...profileData}}),
    onSuccess: (data, variables) => {
      showSubmittedData(data)
      // Update cache with new data
      queryClient.invalidateQueries({ queryKey: ['hotspot-profiles'] })
      queryClient.invalidateQueries({
        queryKey: ['hotspot-profile', variables.profileId],
      })
      toast.success('Profile berhasil diupdate!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal mengupdate profile: ${error.message}`)
    },
  })

  const deleteProfileMutation = useMutation({
    mutationFn: ({profileId}: {routerId: number; profileId: string}) => deleteHotspotProfile({data: {routerId, profileId}}),
    onSuccess: (data, profileId) => {
      showSubmittedData(data)
      // Remove from cache
      queryClient.invalidateQueries({ queryKey: ['hotspot-profiles'] })
      queryClient.removeQueries({ queryKey: ['hotspot-profile', profileId] })
      toast.success('Profile berhasil dihapus!')
    },
    onError: (error: Error) => {
      toast.error(`Gagal menghapus profile: ${error.message}`)
    },
  })

  return {
    addProfile: addProfileMutation,
    updateProfile: updateProfileMutation,
    deleteProfile: deleteProfileMutation,
  }
}