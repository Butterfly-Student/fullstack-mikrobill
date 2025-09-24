// import HotspotUserProfiles from '@/features/hotspot/user-profiles'
// import { createFileRoute } from '@tanstack/react-router'

// // Function to fetch hotspot profiles from API
// const getHotspotProfiles = async (routerId: number) => {
//   const response = await fetch(`/api/mikrotik/hotspot/profiles/?routerId=${routerId}`)

//   if (!response.ok) {
//     throw new Error(`Failed to fetch profiles: ${response.statusText}`)
//   }

//   const data = await response.json()

//   if (!data.success) {
//     throw new Error(data.error || 'Failed to fetch profiles')
//   }

//   return data.data
// }

// export const Route = createFileRoute('/_authenticated/hotspot/user-profiles')({
//   loader: async ({ context }) => {
//     // Assuming routerId is 1, you can modify this based on your needs
//     // You might want to get this from route params, context, or user settings
//     const routerId = 1

//     return await context.queryClient.ensureQueryData({
//       queryKey: ['hotspot-profiles', routerId],
//       queryFn: () => getHotspotProfiles(routerId),
//       staleTime: 5 * 60 * 1000, // 5 minutes
//     })
//   },

//   component: HotspotUserProfiles,
// })

import HotspotUserProfiles from '@/features/hotspot/user-profiles'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/hotspot/user-profiles')({
  component: HotspotUserProfiles,
})