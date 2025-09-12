// components/hotspot/hotspot-index.tsx
"use client"

import { getRouteApi } from "@tanstack/react-router"
import { HotspotUsersTable } from "./components/hotspot-user-table"
import { hotspotUsers } from "../data/data"
import HotspotTopNav from "../components/hotspot-top-nav"
import { HotspotUserProvider } from "./components/hotspot-user-provider"
import { HotspotUsersPrimaryButtons } from "./components/hotspot-users-primary-buttons"


const route = getRouteApi('/_authenticated/hotspot/users')


export default function HotspotUser() {

  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <HotspotUserProvider>
      <HotspotTopNav>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
          </div>
          <HotspotUsersPrimaryButtons />
        </div>
        <div className="h-full overflow-y-auto p-2 sm:p-4">
          <HotspotUsersTable
            search={search}
            navigate={navigate}
            data={hotspotUsers}
          />
        </div>

      </HotspotTopNav>
    </HotspotUserProvider>
  )
}