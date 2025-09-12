import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { addHotspotProfile, updateHotspotProfile, deleteHotspotProfile } from '@/lib/mikrotik';
import { showSubmittedData } from '@/lib/show-submitted-data';
import { type ProfileForm } from '../../data/schema';


export const useHotspotProfile = () => {
  const queryClient = useQueryClient()

  const addProfileMutation = useMutation({
    mutationFn: (profileData: ProfileForm) => addHotspotProfile(profileData, 1),
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
    }) => updateHotspotProfile(profileId, profileData),
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
    mutationFn: deleteHotspotProfile,
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