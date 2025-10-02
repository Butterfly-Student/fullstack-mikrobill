'use client'

import { useCallback } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
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
  type RouterForm,
} from '@/lib/mikrotik/api'

// ============================================
// TYPES
// ============================================

interface RouterHookOptions {
  staleTime?: number
  refetchInterval?: number | false
  enableToast?: boolean
  onRouterSwitch?: (router: Router) => void
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface TestConnectionResult {
  success: boolean
  message: string
}

interface MutationContext {
  previousRouters?: Router[]
  previousActiveRouter?: Router | null
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_OPTIONS: Required<
  Omit<RouterHookOptions, 'onRouterSwitch' | 'onSuccess' | 'onError'>
> = {
  staleTime: 30 * 1000,
  refetchInterval: false,
  enableToast: true,
}

const QUERY_KEYS = {
  routers: ['routers'] as const,
  activeRouter: ['active-router'] as const,
  routerById: (id: number) => ['routers', id] as const,
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function invalidateRouterQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.routers })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeRouter })
  // Also invalidate dependent queries
  queryClient.invalidateQueries({ queryKey: ['hotspot-profiles'] })
}

function showSuccessToast(
  title: string,
  description: string,
  enableToast: boolean
): void {
  if (enableToast) {
    toast.success(title, { description })
  }
}

function showErrorToast(
  title: string,
  error: Error,
  enableToast: boolean
): void {
  if (enableToast) {
    toast.error(title, { description: error.message })
  }
}

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Hook for fetching all routers
 */
export function useRouters(options: RouterHookOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return useQuery({
    queryKey: QUERY_KEYS.routers,
    queryFn: getAllRouters,
    staleTime: opts.staleTime,
    refetchInterval: opts.refetchInterval,
  })
}

/**
 * Hook for fetching active router
 */
export function useActiveRouter(options: RouterHookOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return useQuery({
    queryKey: QUERY_KEYS.activeRouter,
    queryFn: getActiveRouter,
    staleTime: opts.staleTime,
    refetchInterval: opts.refetchInterval,
    retry: (failureCount, error) => {
      // Don't retry if no active router exists
      if (
        error instanceof Error &&
        error.message.includes('No active router found')
      ) {
        return false
      }
      return failureCount < 3
    },
  })
}

/**
 * Hook for fetching router by ID
 */
export function useRouterById(id: number, options: RouterHookOptions = {}) {
  const { data: routers, isLoading, error } = useRouters(options)

  const router = routers?.find((r) => r.id === id) ?? null

  return {
    data: router,
    isLoading,
    error,
    exists: !!router,
  }
}

// ============================================
// MUTATION OPERATIONS
// ============================================

/**
 * Hook for switching active router
 */
export function useSwitchRouter(options: RouterHookOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setActiveRouter,
    onMutate: async (routerId): Promise<MutationContext> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.activeRouter })

      // Snapshot previous value
      const previousActiveRouter = queryClient.getQueryData<Router>(
        QUERY_KEYS.activeRouter
      )

      // Optimistically update
      const routers = queryClient.getQueryData<Router[]>(QUERY_KEYS.routers)
      const newActiveRouter = routers?.find((r) => r.id === routerId)

      if (newActiveRouter) {
        queryClient.setQueryData(QUERY_KEYS.activeRouter, newActiveRouter)
      }

      return { previousActiveRouter }
    },
    onSuccess: (routerId) => {
      const routers = queryClient.getQueryData<Router[]>(QUERY_KEYS.routers)
      const router = routers?.find((r) => r.id === routerId)

      invalidateRouterQueries(queryClient)

      if (router) {
        opts.onRouterSwitch?.(router)
        showSuccessToast(
          'Router switched',
          `Now using ${router.name}`,
          opts.enableToast
        )
      }

      opts.onSuccess?.()
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousActiveRouter) {
        queryClient.setQueryData(
          QUERY_KEYS.activeRouter,
          context.previousActiveRouter
        )
      }

      opts.onError?.(error)
      showErrorToast('Failed to switch router', error, opts.enableToast)
    },
  })
}

/**
 * Hook for adding new router
 */
export function useAddRouter(options: RouterHookOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addRouter,
    onMutate: async (): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.routers })
      const previousRouters = queryClient.getQueryData<Router[]>(
        QUERY_KEYS.routers
      )
      return { previousRouters }
    },
    onSuccess: (newRouter) => {
      invalidateRouterQueries(queryClient)

      showSuccessToast(
        'Router added',
        `${newRouter.name} has been added`,
        opts.enableToast
      )

      opts.onSuccess?.()
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousRouters) {
        queryClient.setQueryData(QUERY_KEYS.routers, context.previousRouters)
      }

      opts.onError?.(error)
      showErrorToast('Failed to add router', error, opts.enableToast)
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
    onMutate: async ({ id, data }): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.routers })

      const previousRouters = queryClient.getQueryData<Router[]>(
        QUERY_KEYS.routers
      )

      // Optimistically update
      if (previousRouters) {
        const updatedRouters = previousRouters.map((router) =>
          router.id === id ? { ...router, ...data } : router
        )
        queryClient.setQueryData(QUERY_KEYS.routers, updatedRouters)
      }

      return { previousRouters }
    },
    onSuccess: (updatedRouter) => {
      invalidateRouterQueries(queryClient)

      showSuccessToast(
        'Router updated',
        `${updatedRouter.name} has been updated`,
        opts.enableToast
      )

      opts.onSuccess?.()
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousRouters) {
        queryClient.setQueryData(QUERY_KEYS.routers, context.previousRouters)
      }

      opts.onError?.(error)
      showErrorToast('Failed to update router', error, opts.enableToast)
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
    onMutate: async (id): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.routers })

      const previousRouters = queryClient.getQueryData<Router[]>(
        QUERY_KEYS.routers
      )

      // Optimistically remove
      if (previousRouters) {
        const updatedRouters = previousRouters.filter(
          (router) => router.id !== id
        )
        queryClient.setQueryData(QUERY_KEYS.routers, updatedRouters)
      }

      return { previousRouters }
    },
    onSuccess: () => {
      invalidateRouterQueries(queryClient)

      showSuccessToast(
        'Router deleted',
        'Router has been removed',
        opts.enableToast
      )

      opts.onSuccess?.()
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousRouters) {
        queryClient.setQueryData(QUERY_KEYS.routers, context.previousRouters)
      }

      opts.onError?.(error)
      showErrorToast('Failed to delete router', error, opts.enableToast)
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
    onMutate: async (ids): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.routers })

      const previousRouters = queryClient.getQueryData<Router[]>(
        QUERY_KEYS.routers
      )

      // Optimistically remove
      if (previousRouters) {
        const updatedRouters = previousRouters.filter(
          (router) => !ids.includes(router.id)
        )
        queryClient.setQueryData(QUERY_KEYS.routers, updatedRouters)
      }

      return { previousRouters }
    },
    onSuccess: (_, ids) => {
      invalidateRouterQueries(queryClient)

      showSuccessToast(
        'Routers deleted',
        `${ids.length} router(s) removed`,
        opts.enableToast
      )

      opts.onSuccess?.()
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousRouters) {
        queryClient.setQueryData(QUERY_KEYS.routers, context.previousRouters)
      }

      opts.onError?.(error)
      showErrorToast('Failed to delete routers', error, opts.enableToast)
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
    onSuccess: (result: TestConnectionResult) => {
      opts.onSuccess?.()

      if (opts.enableToast) {
        if (result.success) {
          toast.success('Connection successful', {
            description: result.message,
          })
        } else {
          toast.warning('Connection failed', { description: result.message })
        }
      }
    },
    onError: (error: Error) => {
      opts.onError?.(error)
      showErrorToast('Connection test failed', error, opts.enableToast)
    },
  })
}

// ============================================
// COMPOSITE HOOKS
// ============================================

/**
 * All-in-one hook for router management
 */
export function useRouterManagement(options: RouterHookOptions = {}) {
  const routers = useRouters(options)
  const activeRouter = useActiveRouter(options)
  const switchRouter = useSwitchRouter(options)
  const addRouter = useAddRouter(options)
  const updateRouter = useUpdateRouter(options)
  const deleteRouter = useDeleteRouter(options)
  const bulkDeleteRouters = useBulkDeleteRouters(options)
  const testConnection = useTestConnection(options)

  const isLoading = routers.isLoading || activeRouter.isLoading
  const isMutating =
    switchRouter.isPending ||
    addRouter.isPending ||
    updateRouter.isPending ||
    deleteRouter.isPending ||
    bulkDeleteRouters.isPending ||
    testConnection.isPending

  return {
    // Data
    routers: routers.data ?? [],
    activeRouter: activeRouter.data ?? null,

    // Loading states
    isLoading,
    isMutating,
    isLoadingRouters: routers.isLoading,
    isLoadingActive: activeRouter.isLoading,

    // Mutation states
    isSwitching: switchRouter.isPending,
    isAdding: addRouter.isPending,
    isUpdating: updateRouter.isPending,
    isDeleting: deleteRouter.isPending,
    isBulkDeleting: bulkDeleteRouters.isPending,
    isTesting: testConnection.isPending,

    // Errors
    routersError: routers.error,
    activeRouterError: activeRouter.error,

    // Actions with stable references
    switchRouter: useCallback(
      (id: number) => switchRouter.mutateAsync(id),
      [switchRouter]
    ),
    addRouter: useCallback(
      (data: RouterForm) => addRouter.mutateAsync(data),
      [addRouter]
    ),
    updateRouter: useCallback(
      (id: number, data: RouterForm) => updateRouter.mutateAsync({ id, data }),
      [updateRouter]
    ),
    deleteRouter: useCallback(
      (id: number) => deleteRouter.mutateAsync(id),
      [deleteRouter]
    ),
    bulkDeleteRouters: useCallback(
      (ids: number[]) => bulkDeleteRouters.mutateAsync(ids),
      [bulkDeleteRouters]
    ),
    testConnection: useCallback(
      (data: RouterForm) => testConnection.mutateAsync(data),
      [testConnection]
    ),

    // Refetch functions
    refetchRouters: routers.refetch,
    refetchActiveRouter: activeRouter.refetch,
  }
}
