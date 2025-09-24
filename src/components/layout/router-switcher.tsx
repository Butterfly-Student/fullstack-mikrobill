'use client'

import { ChevronsUpDown, Router as RouterIcon, Wifi, WifiOff, Loader2 } from 'lucide-react'
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
import { useRouterSwitcherData } from '@/hooks/use-router'

// Router Status Icon Component
const RouterStatusIcon = ({ status, isActive }: { status?: "error" | "online" | "offline" | null; isActive: boolean | null }) => {
  if (status === 'online') {
    return <Wifi className={`size-4 ${isActive ? 'text-green-500' : 'text-green-400'}`} />
  } else if (status === 'offline') {
    return <WifiOff className={`size-4 ${isActive ? 'text-red-500' : 'text-red-400'}`} />
  }
  return <RouterIcon className={`size-4 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
}

// RouterSwitcher component
export function RouterSwitcher() {
  const { isMobile } = useSidebar()

  // Using the composite hook - super simple!
  const {
    routers,
    activeRouter,
    handleRouterSwitch,
    isLoading,
    isSwitching,
    error
  } = useRouterSwitcherData({
    refetchInterval: false, // Refresh every 30s
    enableToast: true,
  })

  const handleSwitch = async (router: any) => {
    if (router.id === activeRouter?.id || isSwitching) {
      return
    }

    console.log(router)

    try {
      await handleRouterSwitch(router.id)
    } catch (error) {
      console.error('Failed to switch router:', error)
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
            <div className='bg-red-500 text-white flex aspect-square size-8 items-center justify-center rounded-lg'>
              <WifiOff className='size-4' />
            </div>
            <div className='grid flex-1 text-start text-sm leading-tight'>
              <span className='truncate font-semibold text-red-600'>Error</span>
              <span className='truncate text-xs text-red-500'>Failed to load routers</span>
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
            <div className='bg-gray-500 text-white flex aspect-square size-8 items-center justify-center rounded-lg'>
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
                    <RouterStatusIcon status={displayRouter.status} isActive={displayRouter.is_active} />
                )}
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {displayRouter.name}
                  {displayRouter.is_active && (
                    <span className='ml-1 text-green-500'>●</span>
                  )}
                </span>
                <span className='truncate text-xs'>
                  {displayRouter.hostname}
                  {displayRouter.location && ` • ${displayRouter.location}`}
                </span>
              </div>
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              Routers
            </DropdownMenuLabel>
            <div className='flex flex-col flex-wrap gap-2'>
              {routers.map((router) => (
                <DropdownMenuItem
                  key={router.id}
                  onClick={() => handleSwitch(router)}
                  className={`gap-2 p-2 ${router.is_active ? 'bg-accent' : ''
                    } ${isSwitching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  disabled={isSwitching}
                >
                  <div className='flex size-6 items-center justify-center rounded-sm border'>
                    {isSwitching ? (
                      <Loader2 className='size-4 animate-spin' />
                    ) : (
                      <RouterStatusIcon status={router.status} isActive={router.is_active} />
                    )}
                  </div>
                  <div className='flex-1'>
                    <div className='font-medium'>
                      {router.name}
                      {router.is_active && (
                        <span className='ml-1 text-green-500 text-xs'>• Active</span>
                      )}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {router.hostname}
                      {router.status && (
                        <span className={`ml-1 ${router.status === 'online' ? 'text-green-500' :
                            router.status === 'offline' ? 'text-red-500' : 'text-gray-500'
                          }`}>
                          • {router.status}
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}