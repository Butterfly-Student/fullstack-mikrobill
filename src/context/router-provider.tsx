'use client'

import  { createContext, useContext, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllRouters, getActiveRouter, setActiveRouter, type Router } from '@/lib/mikrotik/api'
import { toast } from 'sonner'

interface RouterContextType {
  // Data
  routers: Router[]
  activeRouter: Router | null
  
  // Loading states
  isLoading: boolean
  isSwitching: boolean
  
  // Error states
  error: Error | null
  
  // Actions
  handleRouterSwitch: (routerId: number) => Promise<void>
  refetchRouters: () => Promise<any>
  refetchActiveRouter: () => Promise<any>
}

const RouterContext = createContext<RouterContextType | undefined>(undefined)

interface RouterProviderProps {
  children: ReactNode
  staleTime?: number
  refetchInterval?: number
  enableToast?: boolean
}

export function RouterProvider({ 
  children, 
  staleTime = 30 * 1000,
  refetchInterval,
  enableToast = true 
}: RouterProviderProps) {
  const queryClient = useQueryClient()

  // Query for all routers
  const {
    data: routers = [],
    isLoading: isLoadingRouters,
    error: routersError,
    refetch: refetchRouters,
  } = useQuery({
    queryKey: ['routers'],
    queryFn: getAllRouters,
    staleTime,
    refetchInterval,
  })

  // Query for active router
  const {
    data: activeRouter = null,
    isLoading: isLoadingActive,
    error: activeError,
    refetch: refetchActiveRouter,
  } = useQuery({
    queryKey: ['active-router'],
    queryFn: getActiveRouter,
    staleTime,
    refetchInterval,
    retry: (failureCount, error) => {
      // Don't retry if no active router found
      if (error.message.includes('No active router found')) {
        return false
      }
      return failureCount < 3
    },
  })

  // Mutation for setting active router
  const setActiveMutation = useMutation({
    mutationFn: setActiveRouter,
    onSuccess: (routerId) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['active-router'] })
      queryClient.invalidateQueries({ queryKey: ['routers'] })
      queryClient.invalidateQueries({ queryKey: ['hotspot-profiles'] })
      
      // Show success toast
      if (enableToast) {
        const router = routers.find(r => r.id === routerId)
        toast('Router switched successfully',{
          description: `Now using ${router?.name || 'router'} as active router`,
        })
      }
    },
    onError: (error) => {
      // Show error toast
      if (enableToast) {
        toast('Failed to switch router', {
          description: error.message,
        })
      }
    },
  })

  const handleRouterSwitch = async (routerId: number) => {
    return setActiveMutation.mutateAsync(routerId)
  }

  const contextValue: RouterContextType = {
    // Data
    routers,
    activeRouter,
    
    // Loading states
    isLoading: isLoadingRouters || isLoadingActive,
    isSwitching: setActiveMutation.isPending,
    
    // Error states
    error: routersError || activeError,
    
    // Actions
    handleRouterSwitch,
    refetchRouters,
    refetchActiveRouter,
  }

  return (
    <RouterContext.Provider value={contextValue}>
      {children}
    </RouterContext.Provider>
  )
}

// Custom hook to use router context
export function useRouter() {
  const context = useContext(RouterContext)
  
  if (context === undefined) {
    throw new Error('useRouter must be used within a RouterProvider')
  }
  
  return context
}

// Specific hooks for common use cases
export function useActiveRouter() {
  const { activeRouter, isLoading, error } = useRouter()
  return { activeRouter, isLoading, error }
}

export function useRouterSwitcher() {
  const { handleRouterSwitch, isSwitching } = useRouter()
  return { handleRouterSwitch, isSwitching }
}

export function useRouterList() {
  const { routers, isLoading, error, refetchRouters } = useRouter()
  return { routers, isLoading, error, refetchRouters }
}