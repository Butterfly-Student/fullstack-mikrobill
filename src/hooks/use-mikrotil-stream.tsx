// app/hooks/useMikrotikStream.tsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { type IRosOptions } from 'routeros-api';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'sonner';


const SOCKET_URL = typeof window !== 'undefined' ? window.location.origin : ''


interface MikrotikStreamData {
  path: string
  data: any
  timestamp: string
  streamId: string
}

interface MikrotikError {
  path?: string
  message?: string
  error?: string
  streamId?: string
}

interface UseMikrotikStreamOptions {
  autoSubscribe?: boolean
  customStreamId?: string
  maxDataPoints?: number
  onData?: (data: any) => void
  onError?: (error: string) => void
  onStreamEnded?: () => void
}

export function useMikrotikStream(
  path: string | string[],
  config: IRosOptions,
  params?: string | string[],
  options: UseMikrotikStreamOptions = {}
) {
  const {
    autoSubscribe = true,
    customStreamId,
    maxDataPoints = 100,
    onData,
    onError,
    onStreamEnded,
  } = options
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [latestData, setLatestData] = useState<any>(null)
  const [streamId, setStreamId] = useState<string>('')
  const [internalStreamId, setInternalStreamId] = useState<string>('')

  const subscriptionAttempted = useRef(false)
  const pathString = Array.isArray(path) ? path.join(',') : path

  // Initialize socket
  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketInstance.on('connect', () => {
      console.log('✅ Connected to Socket.IO')
      setIsConnected(true)
      subscriptionAttempted.current = false
    })

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO')
      setIsConnected(false)
      setIsSubscribed(false)
      subscriptionAttempted.current = false
    })

    socketInstance.on('connect_error', (err) => {
      console.error('Connection error:', err)
      const errorMsg = err.message
      setError(errorMsg)
      onError?.(errorMsg)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [onError])

  // Handle MikroTik events
  useEffect(() => {
    if (!socket) return

    const handleData = (payload: MikrotikStreamData) => {
      // Check if data is for this subscription
      if (payload.streamId === streamId) {
        setLatestData(payload.data)
        setData((prev) => {
          const newData = [...prev, payload.data]
          // Keep only last N items
          return newData.slice(-maxDataPoints)
        })
        onData?.(payload.data)
      }
    }

    const handleError = (payload: MikrotikError) => {
      // Check if error is for this subscription
      if (payload.streamId === streamId || !payload.streamId) {
        console.error('MikroTik error:', payload)
        toast.error('MikroTik error: ' + payload.message)
        const errorMsg = payload.message || payload.error || 'Unknown error'
        setError(errorMsg)
        setIsSubscribed(false)
        onError?.(errorMsg)
      }
    }

    const handleSubscribed = (payload: {
      path: string | string[]
      streamId: string
      internalStreamId: string
      timestamp: string
    }) => {
      const payloadPath = Array.isArray(payload.path)
        ? payload.path.join(',')
        : payload.path

      if (payloadPath === pathString) {
        console.log(
          `✅ Subscribed to ${pathString} with ID: ${payload.streamId}`
        )
        setStreamId(payload.streamId)
        setInternalStreamId(payload.internalStreamId)
        setIsSubscribed(true)
        setError(null)
      }
    }

    const handleUnsubscribed = (payload: {
      streamId: string
      path?: string
    }) => {
      if (payload.streamId === streamId) {
        console.log(`❌ Unsubscribed from ${pathString}`)
        setIsSubscribed(false)
      }
    }

    const handleStreamEnded = (payload: { path: string; streamId: string }) => {
      if (payload.streamId === streamId) {
        console.log(`🔚 Stream ended for ${pathString}`)
        setIsSubscribed(false)
        onStreamEnded?.()
      }
    }

    const handleBroadcast = (payload: MikrotikStreamData) => {
      const payloadPath = Array.isArray(payload.path)
        ? payload.path
        : [payload.path]
      const currentPath = Array.isArray(path) ? path : [path]

      if (
        payloadPath.some((p) => currentPath.includes(p)) ||
        payload.streamId === streamId
      ) {
        setLatestData(payload.data)
        setData((prev) => {
          const newData = [...prev, payload.data]
          return newData.slice(-maxDataPoints)
        })
        onData?.(payload.data)
      }
    }

    socket.on('mikrotik:data', handleData)
    socket.on('mikrotik:error', handleError)
    socket.on('mikrotik:subscribed', handleSubscribed)
    socket.on('mikrotik:unsubscribed', handleUnsubscribed)
    socket.on('mikrotik:stream:ended', handleStreamEnded)
    socket.on('mikrotik:broadcast', handleBroadcast)

    return () => {
      socket.off('mikrotik:data', handleData)
      socket.off('mikrotik:error', handleError)
      socket.off('mikrotik:subscribed', handleSubscribed)
      socket.off('mikrotik:unsubscribed', handleUnsubscribed)
      socket.off('mikrotik:stream:ended', handleStreamEnded)
      socket.off('mikrotik:broadcast', handleBroadcast)
    }
  }, [
    socket,
    path,
    pathString,
    streamId,
    maxDataPoints,
    onData,
    onError,
    onStreamEnded,
  ])

  // Auto subscribe
  useEffect(() => {
    if (
      socket &&
      isConnected &&
      autoSubscribe &&
      !isSubscribed &&
      !subscriptionAttempted.current
    ) {
      subscriptionAttempted.current = true
      subscribe()
    }
  }, [socket, isConnected, autoSubscribe, isSubscribed])

  const subscribe = useCallback(() => {
    if (socket && isConnected && !isSubscribed) {
      console.log(`📡 Subscribing to ${pathString}`)
      const subscribeData: any = {
        path,
        config,
        streamId: customStreamId,
      }

      // Only include params if they're provided
      if (params !== undefined) {
        subscribeData.params = params
      }

      socket.emit('mikrotik:subscribe', subscribeData)
    }
  }, [
    socket,
    isConnected,
    isSubscribed,
    path,
    pathString,
    params,
    config,
    customStreamId,
  ])

  const unsubscribe = useCallback(() => {
    if (socket && streamId) {
      console.log(`🛑 Unsubscribing from ${pathString}`)
      socket.emit('mikrotik:unsubscribe', { streamId })
      setData([])
      setLatestData(null)
    }
  }, [socket, streamId, pathString])

  const clearData = useCallback(() => {
    setData([])
    setLatestData(null)
    setError(null)
  }, [])

  const resubscribe = useCallback(() => {
    if (isSubscribed) {
      unsubscribe()
    }
    subscriptionAttempted.current = false
    clearData()
    setTimeout(() => {
      subscribe()
    }, 100)
  }, [isSubscribed, unsubscribe, subscribe, clearData])

  return {
    isConnected,
    isSubscribed,
    data,
    latestData,
    error,
    streamId,
    internalStreamId,
    subscribe,
    unsubscribe,
    clearData,
    resubscribe,
  }
}

// Hook for executing one-time commands
export function useMikrotikExec(config: IRosOptions) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketInstance.on('connect', () => {
      console.log('✅ Exec socket connected')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('❌ Exec socket disconnected')
      setIsConnected(false)
    })

    socketInstance.on('mikrotik:exec:result', (data) => {
      console.log('✅ Command executed successfully')
      setResult(data.result)
      setIsExecuting(false)
      setError(null)
    })

    socketInstance.on('mikrotik:exec:error', (data) => {
      console.error('❌ Command execution failed:', data.error)
      setError(data.error)
      setIsExecuting(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const execute = useCallback(
    (command: string | string[], params: string[] = []) => {
      if (!socket || !isConnected) {
        setError('Socket not connected')
        return
      }

      setIsExecuting(true)
      setError(null)
      setResult(null)
      socket.emit('mikrotik:exec', { command, params, config })
    },
    [socket, isConnected, config]
  )

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setIsExecuting(false)
  }, [])

  return {
    isConnected,
    isExecuting,
    result,
    error,
    execute,
    reset,
  }
}

// Hook for getting connection stats
export function useMikrotikStats() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    })

    socketInstance.on('connect', () => {
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
    })

    socketInstance.on('mikrotik:stats:result', (data) => {
      setStats(data)
      setIsLoading(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const getStats = useCallback(() => {
    if (socket && isConnected) {
      setIsLoading(true)
      socket.emit('mikrotik:stats')
    }
  }, [socket, isConnected])

  return {
    isConnected,
    stats,
    isLoading,
    getStats,
  }
}