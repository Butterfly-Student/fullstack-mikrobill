import HotspotUserProfiles from '@/features/hotspot/user-profiles'
import { createMikrotikHotspot } from '@/lib/mikrotik/hotspot'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/hotspot/user-profiles')({
  loader: async ({ context }) => {
    return await context.queryClient.ensureQueryData({
      queryKey: ['hotspot-profiles', 1],
      queryFn: () => getHotspotProfiless(1),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  },

  component: HotspotUserProfiles,
})

const getHotspotProfiless = async (id: number) => {

  const client = createMikrotikHotspot(id);
  return (await client).getHotspotProfiles()
}