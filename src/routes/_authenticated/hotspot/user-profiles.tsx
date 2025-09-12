import HotspotUserProfiles from '@/features/hotspot/user-profiles'
import { getHotspotProfiless } from '@/lib/mikrotik'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/hotspot/user-profiles')({
  loader: async ({ context }) => {
    // Menggunakan QueryClient dari context untuk ensure data
    return await context.queryClient.ensureQueryData({
      queryKey: ['hotspot-profiles', 1],
      queryFn: () => getHotspotProfiless(1),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  },

  component: HotspotUserProfiles,
})

