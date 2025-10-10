"use client"

import { getRouteApi } from "@tanstack/react-router"
import { HotspotProfileProvider } from "./components/hotspot-profile-provider"
import HotspotTopNav from "../components/hotspot-top-nav"
import { HotspotProfilePrimaryButtons } from "./components/hotspot-profile-primary-buttons"
import { HotspotProfilesTable } from "./components/hotspot-profile-table"
import { useQuery } from "@tanstack/react-query"
import { getHotspotProfiles, hotspotProfilesKeys } from "@/features/hotspot/server/hotspot-profiles"
import { useRouterManagement } from "@/hooks/use-router"

const route = getRouteApi('/_authenticated/hotspot/user-profiles')

export default function HotspotUserProfiles() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { activeRouter } = useRouterManagement()
  const routerId = activeRouter?.id
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: hotspotProfilesKeys.byRouter(routerId),
    queryFn: () => getHotspotProfiles({ data: { routerId }}),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false, // Auto refresh every 30 seconds
    enabled: !!routerId
  })


  if (error) {
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
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-red-500 mb-2">
                  Error loading profiles: {error.message}
                </div>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </HotspotTopNav>
      </HotspotProfileProvider>
    )
  }

  if (isLoading) {
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
            <div className="flex items-center justify-center p-8">
              <div className="text-gray-500">Loading profiles...</div>
            </div>
          </div>
        </HotspotTopNav>
      </HotspotProfileProvider>
    )
  }

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
            data={data?.data || []}
          />
        </div>
      </HotspotTopNav>
    </HotspotProfileProvider>
  )
}