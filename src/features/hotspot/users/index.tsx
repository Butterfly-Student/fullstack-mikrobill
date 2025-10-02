"use client"

import { getRouteApi } from "@tanstack/react-router"
import { HotspotUsersTable } from "./components/hotspot-user-table"
import HotspotTopNav from "../components/hotspot-top-nav"
import { HotspotUserProvider } from "./components/hotspot-user-provider"
import { HotspotUsersPrimaryButtons } from "./components/hotspot-users-primary-buttons"
import { useHotspotUser } from "./hooks/user"
import { HotspotUsersDialogs } from "./components/hotspot-user-dialog"

const route = getRouteApi('/_authenticated/hotspot/users')

export default function HotspotUser() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  // const { activeRouter } = useRouterManagement()
  const { users } = useHotspotUser()


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
            data={users || []}
          />
        </div>
      </HotspotTopNav>

      <HotspotUsersDialogs/>
    </HotspotUserProvider>
  )
}