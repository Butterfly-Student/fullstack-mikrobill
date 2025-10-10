// components/hotspot/hotspot-index.tsx
'use client'

import { getRouteApi } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useRouterManagement } from '@/hooks/use-router'
import { Main } from '@/components/layout/main'
import HotspotTopNav from '../components/hotspot-top-nav'
import { ActiveUserProvider } from './components/hs-active-provider'
import { ActiveUsersTable } from './components/hs-user-active-table'
import { useActiveHotspotUsers } from './hooks/active-users'

// components/hotspot/hotspot-index.tsx

// components/hotspot/hotspot-index.tsx

const route = getRouteApi('/_authenticated/hotspot/users-active')

export default function HotspotUsersActive() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { activeRouter } = useRouterManagement({ refetchInterval: false })
  const routerId = activeRouter?.id

  // Fetch active users dengan auto-refresh setiap 10 detik
  const { data, isLoading, error, refetch, isFetching } = useActiveHotspotUsers(
    {
      routerId: routerId ?? undefined,
      enabled: !!routerId,
      refetchInterval: 10000, // auto-refresh setiap 10 detik
    }
  )

  return (
    <ActiveUserProvider>
      <HotspotTopNav>
        <Main>
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>
                Active Users
                {isFetching && (
                  <Loader2 className='text-muted-foreground ml-2 inline-block h-5 w-5 animate-spin' />
                )}
              </h2>
              <p className='text-muted-foreground'>
                Here&apos;s a list of hotspot active users
                {data?.total !== undefined && ` (${data.total} users online)`}
              </p>
            </div>
          </div>

          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
            {isLoading ? (
              <div className='flex items-center justify-center py-10'>
                <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
                <span className='text-muted-foreground ml-2'>
                  Loading active users...
                </span>
              </div>
            ) : error ? (
              <div className='flex flex-col items-center justify-center py-10'>
                <p className='text-destructive mb-4'>
                  {error instanceof Error
                    ? error.message
                    : 'Failed to load active users'}
                </p>
                <button
                  onClick={() => refetch()}
                  className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2'
                >
                  Retry
                </button>
              </div>
            ) : (
              <ActiveUsersTable
                data={data?.data || []}
                search={search}
                navigate={navigate}
              />
            )}
          </div>
        </Main>
      </HotspotTopNav>
    </ActiveUserProvider>
  )
}
