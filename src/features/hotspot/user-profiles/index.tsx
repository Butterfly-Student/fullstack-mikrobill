// components/hotspot/hotspot-index.tsx
"use client"

import { getRouteApi } from "@tanstack/react-router"
import { HotspotProfileProvider } from "./components/hotspot-profile-provider"
import HotspotTopNav from "../components/hotspot-top-nav"
import { HotspotProfilePrimaryButtons } from "./components/hotspot-profile-primary-buttons"
import { HotspotProfilesTable } from "./components/hotspot-profile-table"
import { getHotspotProfiless } from "@/lib/mikrotik"
import { useQuery } from "@tanstack/react-query"



const route = getRouteApi('/_authenticated/hotspot/user-profiles')


export default function HotspotUserProfiles() {

  const search = route.useSearch()
  const navigate = route.useNavigate()
  const initialData = route.useLoaderData()
  // const { queryClient } = route.useRouteContext()

  const {
    data
  } = useQuery({
    queryKey: ['hotspot-profiles', 1],
    queryFn: () => getHotspotProfiless(1),
    initialData: initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Auto refresh setiap 30 detik
    refetchOnWindowFocus: true,
  })


  return (
    <HotspotProfileProvider>
      <HotspotTopNav>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Profile List</h2>
          </div>
          <HotspotProfilePrimaryButtons />
        </div>
        <div className="h-full overflow-y-auto p-2 sm:p-4">
          <HotspotProfilesTable
            search={search}
            navigate={navigate}
            data={data.data}
          />
        </div>

      </HotspotTopNav>
    </HotspotProfileProvider>
  )
}