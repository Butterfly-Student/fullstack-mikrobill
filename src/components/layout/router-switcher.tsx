'use client'

import { useEffect, useState } from 'react'
import {
  ChevronsUpDown,
  Router as RouterIcon,
  Wifi,
  WifiOff,
  Loader2,
  Check,
} from 'lucide-react'
import { useRouterManagement } from '@/hooks/use-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

// Router Status Icon Component
const RouterStatusIcon = ({
  status,
  isActive,
  size = 4,
}: {
  status?: 'error' | 'online' | 'offline' | null
  isActive: boolean | null
  size?: number
}) => {
  const sizeClass = `size-${size}`

  if (status === 'online') {
    return (
      <Wifi
        className={`${sizeClass} ${isActive ? 'text-green-600' : 'text-green-500'}`}
      />
    )
  } else if (status === 'offline') {
    return (
      <WifiOff
        className={`${sizeClass} ${isActive ? 'text-red-600' : 'text-red-500'}`}
      />
    )
  }
  return (
    <RouterIcon
      className={`${sizeClass} ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
    />
  )
}

// RouterSwitcher component
export function RouterSwitcher() {
  const { isMobile } = useSidebar()
  const [switchingRouterId, setSwitchingRouterId] = useState<number | null>(
    null
  )

  // Using the improved composite hook
  const {
    routers,
    activeRouter,
    switchRouter,
    isLoading,
    isSwitching,
    routersError: error,
  } = useRouterManagement({
    refetchInterval: 30 * 1000, // Refresh every 30s to update status
    enableToast: true,
  })
  console.log(routers)
  console.log(activeRouter)

  const handleSwitch = async (routerId: number) => {
    // Prevent switching if already active or currently switching
    if (routerId === activeRouter?.id || isSwitching) {
      return
    }

    setSwitchingRouterId(routerId)

    try {
      await switchRouter(routerId)
    } catch (error) {
      console.error('Failed to switch router:', error)
    } finally {
      setSwitchingRouterId(null)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' disabled>
            <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
              <Loader2 className='size-4 animate-spin' />
            </div>
            <div className='grid flex-1 text-start text-sm leading-tight'>
              <span className='truncate font-semibold'>Loading...</span>
              <span className='truncate text-xs'>Fetching routers</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // Error state
  if (error) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' disabled>
            <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-red-500 text-white'>
              <WifiOff className='size-4' />
            </div>
            <div className='grid flex-1 text-start text-sm leading-tight'>
              <span className='truncate font-semibold text-red-600'>Error</span>
              <span className='truncate text-xs text-red-500'>
                Failed to load routers
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // No routers
  if (!routers.length) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' disabled>
            <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-500 text-white'>
              <RouterIcon className='size-4' />
            </div>
            <div className='grid flex-1 text-start text-sm leading-tight'>
              <span className='truncate font-semibold'>No Routers</span>
              <span className='truncate text-xs'>Add a router first</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const displayRouter = activeRouter || routers[0]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              disabled={isSwitching}
            >
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                {isSwitching ? (
                  <Loader2 className='size-4 animate-spin' />
                ) : (
                  <RouterStatusIcon
                    status={displayRouter.status}
                    isActive={displayRouter.is_active}
                  />
                )}
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {displayRouter.name}
                  {displayRouter.is_active && (
                    <span className='ml-1.5 font-bold text-green-600'>●</span>
                  )}
                </span>
                <span className='text-muted-foreground truncate text-xs'>
                  {displayRouter.hostname}
                  {displayRouter.location && ` • ${displayRouter.location}`}
                </span>
              </div>
              <ChevronsUpDown className='ms-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              Available Routers
            </DropdownMenuLabel>
            {routers.map((router) => {
              const isActiveRouter = router.id === activeRouter?.id
              const isSwitchingThis = switchingRouterId === router.id

              return (
                <DropdownMenuItem
                  key={router.id}
                  onClick={() => handleSwitch(router.id)}
                  className={`cursor-pointer gap-2 p-2 transition-colors ${
                    isActiveRouter
                      ? 'bg-accent/50 hover:bg-accent/70'
                      : 'hover:bg-accent/30'
                  } ${isSwitching ? 'cursor-wait opacity-50' : ''}`}
                  disabled={isSwitching || isActiveRouter}
                >
                  <div
                    className={`flex size-6 items-center justify-center rounded-sm border ${
                      isActiveRouter
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSwitchingThis ? (
                      <Loader2 className='size-4 animate-spin text-blue-500' />
                    ) : isActiveRouter ? (
                      <Check className='size-4 font-bold text-green-600' />
                    ) : (
                      <RouterStatusIcon
                        status={router.status}
                        isActive={router.is_active}
                      />
                    )}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div
                      className={`truncate font-medium ${
                        isActiveRouter ? 'text-green-700' : ''
                      }`}
                    >
                      {router.name}
                      {isActiveRouter && (
                        <span className='ml-1.5 text-xs font-semibold text-green-600'>
                          • Active
                        </span>
                      )}
                    </div>
                    <div className='text-muted-foreground truncate text-xs'>
                      {router.hostname}
                      {router.status && (
                        <span
                          className={`ml-1.5 font-medium ${
                            router.status === 'online'
                              ? 'text-green-600'
                              : router.status === 'offline'
                                ? 'text-red-600'
                                : 'text-gray-500'
                          }`}
                        >
                          • {router.status}
                        </span>
                      )}
                      {router.location && (
                        <span className='ml-1.5'>• {router.location}</span>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
