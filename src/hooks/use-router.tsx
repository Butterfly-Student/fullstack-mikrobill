'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllRouters,
  getActiveRouter,
  setActiveRouter,
  addRouter,
  updateRouter,
  deleteRouter,
  deleteRouters,
  testRouterConnection,
  type Router,
  type RouterForm
} from '@/lib/mikrotik/api'
import { toast } from 'sonner'

// Configuration options
interface RouterHookOptions {
  staleTime?: number
  refetchInterval?: number | false | undefined
  enableToast?: boolean
  onRouterSwitch?: (router: Router) => void
  onSuccess?: () => void
  onError?: (error: Error) => void
}

// Default configuration
const DEFAULT_OPTIONS: RouterHookOptions = {
  staleTime: 30 * 1000, // 30 seconds
  refetchInterval: false,
  enableToast: true,
}

// ============================================
// READ OPERATIONS (existing hooks)
// ============================================

/**
 * Main router hook - provides all router functionality
 */
export function useRouter(options: RouterHookOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
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
    staleTime: opts.staleTime,
    refetchInterval: opts.refetchInterval,
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
    staleTime: opts.staleTime,
    refetchInterval: opts.refetchInterval,
    retry: (failureCount, error) => {
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
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['active-router'] })
      queryClient.invalidateQueries({ queryKey: ['routers'] })
      queryClient.invalidateQueries({ queryKey: ['hotspot-profiles'] })

      const router = routers.find(r => r.id === routerId)

      // Custom callback
      if (router && opts.onRouterSwitch) {
        opts.onRouterSwitch(router)
      }

      // Toast notification
      if (opts.enableToast && router) {
        toast('Router switched successfully', {
          description: `Now using ${router.name} as active router`,
        })
      }
    },
    onError: (error) => {
      // Custom error callback
      if (opts.onError) {
        opts.onError(error)
      }

      // Toast notification
      if (opts.enableToast) {
        toast('Failed to switch router', {
          description: error.message,
        })
      }
    },
  })

  const handleRouterSwitch = async (routerId: number) => {
    return setActiveMutation.mutateAsync(routerId)
  }

  return {
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

    // Raw mutation for advanced usage
    setActiveMutation,
  }
}

/**
 * Hook for getting all routers
 */
export function useRouters(options: RouterHookOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return useQuery({
    queryKey: ['routers'],
    queryFn: getAllRouters,
    staleTime: opts.staleTime,
    refetchInterval: opts.refetchInterval,
  })
}

/**
 * Hook for getting active router only
 */
export function useActiveRouter(options: RouterHookOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return useQuery({
    queryKey: ['active-router'],
    queryFn: getActiveRouter,
    staleTime: opts.staleTime,
    refetchInterval: opts.refetchInterval,
    retry: (failureCount, error) => {
      if (error.message.includes('No active router found')) {
        return false
      }
      return failureCount < 3
    },
  })
}

/**
 * Hook for router switching functionality
 */
export function useRouterSwitcher(options: RouterHookOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const queryClient = useQueryClient()
  const { data: routers = [] } = useRouters({ enableToast: false })

  const mutation = useMutation({
    mutationFn: setActiveRouter,
    onSuccess: (routerId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['active-router'] })
      queryClient.invalidateQueries({ queryKey: ['routers'] })
      queryClient.invalidateQueries({ queryKey: ['hotspot-profiles'] })

      const router = routers.find(r => r.id === routerId)

      // Custom callback
      if (router && opts.onRouterSwitch) {
        opts.onRouterSwitch(router)
      }

      // Toast notification
      if (opts.enableToast && router) {
        toast('Router switched successfully', {
          description: `Now using ${router.name} as active router`,
        })
      }
    },
    onError: (error) => {
      // Custom error callback
      if (opts.onError) {
        opts.onError(error)
      }

      // Toast notification
      if (opts.enableToast) {
        toast('Failed to switch router', {
          description: error.message,
        })
      }
    },
  })

  const switchRouter = async (routerId: number) => {
    return mutation.mutateAsync(routerId)
  }

  return {
    switchRouter,
    isSwitching: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  }
}

/**
 * Hook for getting router by ID
 */
export function useRouterById(id: number, options: RouterHookOptions = {}) {
  const routersQuery = useRouters(options)

  const router = routersQuery.data?.find(r => r.id === id)

  return {
    router: router || null,
    isLoading: routersQuery.isLoading,
    error: routersQuery.error,
    exists: !!router,
  }
}

/**
 * Composite hook for RouterSwitcher component
 */
export function useRouterSwitcherData(options: RouterHookOptions = {}) {
  const opts = {
    ...DEFAULT_OPTIONS,
    refetchInterval: 0, // Auto-refresh for UI seconds or false
    ...options
  }

  const routersQuery = useRouters(opts)
  const activeRouterQuery = useActiveRouter(opts)
  const switcher = useRouterSwitcher(opts)

  return {
    // Data
    routers: routersQuery.data || [],
    activeRouter: activeRouterQuery.data || null,

    // States
    isLoading: routersQuery.isLoading || activeRouterQuery.isLoading,
    isSwitching: switcher.isSwitching,
    error: routersQuery.error || activeRouterQuery.error,

    // Actions
    handleRouterSwitch: switcher.switchRouter,
    refetchRouters: routersQuery.refetch,
    refetchActiveRouter: activeRouterQuery.refetch,
  }
}

// ============================================
// CRUD OPERATIONS (new hooks)
// ============================================

/**
 * Hook for adding new router
 */
export function useAddRouter(options: RouterHookOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addRouter,
    onSuccess: (data) => {
      // Invalidate and refetch routers
      queryClient.invalidateQueries({ queryKey: ['routers'] })

      // Custom callback
      if (opts.onSuccess) {
        opts.onSuccess()
      }

      // Toast notification
      if (opts.enableToast) {
        toast.success('Router added successfully', {
          description: `${data.name} has been added to your network`,
        })
      }
    },
    onError: (error) => {
      // Custom error callback
      if (opts.onError) {
        opts.onError(error)
      }

      // Toast notification
      if (opts.enableToast) {
        toast.error('Failed to add router', {
          description: error.message,
        })
      }
    },
  })
}

/**
 * Hook for updating router
 */
export function useUpdateRouter(options: RouterHookOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RouterForm }) =>
      updateRouter(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch routers
      queryClient.invalidateQueries({ queryKey: ['routers'] })

      // If this was the active router, refetch active router too
      queryClient.invalidateQueries({ queryKey: ['active-router'] })

      // Custom callback
      if (opts.onSuccess) {
        opts.onSuccess()
      }

      // Toast notification
      if (opts.enableToast) {
        toast.success('Router updated successfully', {
          description: `${data.name} configuration has been updated`,
        })
      }
    },
    onError: (error) => {
      // Custom error callback
      if (opts.onError) {
        opts.onError(error)
      }

      // Toast notification
      if (opts.enableToast) {
        toast.error('Failed to update router', {
          description: error.message,
        })
      }
    },
  })
}

/**
 * Hook for deleting single router
 */
export function useDeleteRouter(options: RouterHookOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteRouter,
    onSuccess: () => {
      // Invalidate and refetch routers
      queryClient.invalidateQueries({ queryKey: ['routers'] })

      // Check if we need to refetch active router
      queryClient.invalidateQueries({ queryKey: ['active-router'] })

      // Custom callback
      if (opts.onSuccess) {
        opts.onSuccess()
      }

      // Toast notification
      if (opts.enableToast) {
        toast.success('Router deleted successfully', {
          description: 'Router has been removed from your network',
        })
      }
    },
    onError: (error) => {
      // Custom error callback
      if (opts.onError) {
        opts.onError(error)
      }

      // Toast notification
      if (opts.enableToast) {
        toast.error('Failed to delete router', {
          description: error.message,
        })
      }
    },
  })
}

/**
 * Hook for bulk deleting routers
 */
export function useBulkDeleteRouters(options: RouterHookOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteRouters,
    onSuccess: (_, ids) => {
      // Invalidate and refetch routers
      queryClient.invalidateQueries({ queryKey: ['routers'] })

      // Check if we need to refetch active router
      queryClient.invalidateQueries({ queryKey: ['active-router'] })

      // Custom callback
      if (opts.onSuccess) {
        opts.onSuccess()
      }

      // Toast notification
      if (opts.enableToast) {
        toast.success('Routers deleted successfully', {
          description: `${ids.length} router(s) have been removed from your network`,
        })
      }
    },
    onError: (error) => {
      // Custom error callback
      if (opts.onError) {
        opts.onError(error)
      }

      // Toast notification
      if (opts.enableToast) {
        toast.error('Failed to delete routers', {
          description: error.message,
        })
      }
    },
  })
}

/**
 * Hook for testing router connection
 */
export function useTestConnection(options: RouterHookOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return useMutation({
    mutationFn: testRouterConnection,
    onSuccess: (result) => {
      // Custom callback
      if (opts.onSuccess) {
        opts.onSuccess()
      }

      // Toast notification
      if (opts.enableToast) {
        if (result.success) {
          toast.success('Connection test successful', {
            description: result.message,
          })
        } else {
          toast.warning('Connection test failed', {
            description: result.message,
          })
        }
      }
    },
    onError: (error) => {
      // Custom error callback
      if (opts.onError) {
        opts.onError(error)
      }

      // Toast notification
      if (opts.enableToast) {
        toast.error('Connection test failed', {
          description: error.message,
        })
      }
    },
  })
}

/**
 * Composite hook for router CRUD operations
 */
export function useRouterCrud(options: RouterHookOptions = {}) {
  const addMutation = useAddRouter(options)
  const updateMutation = useUpdateRouter(options)
  const deleteMutation = useDeleteRouter(options)
  const bulkDeleteMutation = useBulkDeleteRouters(options)
  const testConnectionMutation = useTestConnection(options)

  const addRouterAction = async (data: RouterForm) => {
    return addMutation.mutateAsync(data)
  }

  const updateRouterAction = async (id: number, data: RouterForm) => {
    return updateMutation.mutateAsync({ id, data })
  }

  const deleteRouterAction = async (id: number) => {
    return deleteMutation.mutateAsync(id)
  }

  const deleteRoutersAction = async (ids: number[]) => {
    return bulkDeleteMutation.mutateAsync(ids)
  }

  const testConnectionAction = async (data: RouterForm) => {
    return testConnectionMutation.mutateAsync(data)
  }

  return {
    // Actions
    addRouter: addRouterAction,
    updateRouter: updateRouterAction,
    deleteRouter: deleteRouterAction,
    deleteRouters: deleteRoutersAction,
    testConnection: testConnectionAction,

    // States
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isTesting: testConnectionMutation.isPending,
    isLoading: addMutation.isPending || updateMutation.isPending || deleteMutation.isPending || bulkDeleteMutation.isPending,

    // Errors
    addError: addMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    bulkDeleteError: bulkDeleteMutation.error,
    testError: testConnectionMutation.error,

    // Reset functions
    resetAdd: addMutation.reset,
    resetUpdate: updateMutation.reset,
    resetDelete: deleteMutation.reset,
    resetBulkDelete: bulkDeleteMutation.reset,
    resetTest: testConnectionMutation.reset,
  }
}