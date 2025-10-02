// app/server/socket-plugin.ts
import type { ViteDevServer } from 'vite'
import type { EventEmitter } from 'events'
import type { IRosOptions } from 'routeros-api'
import { Server as SocketIOServer } from 'socket.io'
import { MikrotikClient } from './lib/mikrotik/client'

let io: SocketIOServer | null = null

export function getIO() {
  return io
}

interface SubscriptionInfo {
  emitter: EventEmitter
  stop: () => void // Added stop function
  streamId: string // Added streamId from execStream
  path: string
  clientConfig: IRosOptions
}

// Map untuk menyimpan active streams per socket
const activeStreams = new Map<string, SubscriptionInfo>()

// Map untuk tracking multiple subscriptions per socket
const socketSubscriptions = new Map<string, Set<string>>()

export function socketPlugin() {
  return {
    name: 'socket-io-mikrotik-plugin',
    configureServer(server: ViteDevServer) {
      if (!server.httpServer) return

      io = new SocketIOServer(server.httpServer, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
        },
        path: '/socket.io',
        transports: ['websocket', 'polling'],
      })

      io.on('connection', (socket) => {
        console.log('✅ Client connected:', socket.id)
        socketSubscriptions.set(socket.id, new Set())

        // Subscribe to MikroTik stream
        socket.on(
          'mikrotik:subscribe',
          async (data: {
            path: string | string[]
            params?: string | string[]
            config: IRosOptions
            streamId?: string // Optional custom stream ID
          }) => {
            try {
              const { path, params, config, streamId } = data
              const subscriptionId = streamId || `${socket.id}:${path}`

              console.log(`📡 Client ${socket.id} subscribing to: ${path}`)

              // Check if already subscribed to this path
              if (activeStreams.has(subscriptionId)) {
                socket.emit('mikrotik:error', {
                  message: `Already subscribed to ${path}`,
                  path,
                })
                return
              }

              // Create or get cached MikroTik client
              let client: MikrotikClient
              try {
                client = await MikrotikClient.createDirect(config)
              } catch (error: any) {
                socket.emit('mikrotik:error', {
                  message: `Failed to connect: ${error.message}`,
                  path,
                })
                return
              }

              // Create stream - execStream returns { emitter, stop, streamId }
              const stream = client.execStream(
                path,
                params ? (Array.isArray(params) ? params : [params]) : []
              )

              // Listen for data
              const dataHandler = (routerData: any) => {
                socket.emit('mikrotik:data', {
                  path,
                  data: routerData,
                  timestamp: new Date().toISOString(),
                  streamId: subscriptionId,
                })
              }

              // Listen for errors
              const errorHandler = (error: Error) => {
                console.error(`❌ MikroTik stream error for ${path}:`, error)
                socket.emit('mikrotik:error', {
                  path,
                  error: error.message,
                  streamId: subscriptionId,
                })

                // Cleanup on error
                cleanup(subscriptionId)
              }

              // Listen for stream end
              const endHandler = () => {
                console.log(`🏁 Stream ended for ${path}`)
                socket.emit('mikrotik:stream:ended', {
                  path,
                  streamId: subscriptionId,
                })
                cleanup(subscriptionId)
              }

              // Listen for stopped event
              const stoppedHandler = () => {
                console.log(`🛑 Stream stopped for ${path}`)
              }

              stream.emitter.on('data', dataHandler)
              stream.emitter.on('error', errorHandler)
              stream.emitter.on('end', endHandler)
              stream.emitter.on('stopped', stoppedHandler)

              // Store complete stream info
              activeStreams.set(subscriptionId, {
                emitter: stream.emitter,
                stop: stream.stop,
                streamId: stream.streamId,
                path: Array.isArray(path) ? path.join(',') : path,
                clientConfig: config,
              })

              // Track subscription for this socket
              const socketSubs = socketSubscriptions.get(socket.id)
              if (socketSubs) {
                socketSubs.add(subscriptionId)
              }

              // Send confirmation
              socket.emit('mikrotik:subscribed', {
                path,
                streamId: subscriptionId,
                internalStreamId: stream.streamId,
                timestamp: new Date().toISOString(),
              })

              console.log(`✅ Subscribed to ${path} with ID: ${subscriptionId}`)
            } catch (error: any) {
              console.error('❌ Error in mikrotik:subscribe:', error)
              socket.emit('mikrotik:error', {
                message: error.message || 'Failed to subscribe',
                path: data.path,
              })
            }
          }
        )

        // Unsubscribe from specific stream
        socket.on(
          'mikrotik:unsubscribe',
          (data: { streamId?: string; path?: string }) => {
            const { streamId, path } = data
            let subscriptionId: string | undefined

            if (streamId) {
              subscriptionId = streamId
            } else if (path) {
              subscriptionId = `${socket.id}:${path}`
            }

            if (subscriptionId && activeStreams.has(subscriptionId)) {
              const streamInfo = activeStreams.get(subscriptionId)
              cleanup(subscriptionId)
              socket.emit('mikrotik:unsubscribed', {
                streamId: subscriptionId,
                path: streamInfo?.path,
              })
              console.log(`🛑 Unsubscribed from stream: ${subscriptionId}`)
            }
          }
        )

        // Execute one-time command
        socket.on(
          'mikrotik:exec',
          async (data: {
            command: string | string[]
            params?: string[]
            config: IRosOptions
          }) => {
            try {
              const { command, params = [], config } = data
              console.log(`⚡ Executing command: ${command}`)

              const client = await MikrotikClient.createDirect(config)
              const result = await client.exec(command, params)

              socket.emit('mikrotik:exec:result', {
                command,
                result,
                timestamp: new Date().toISOString(),
              })
            } catch (error: any) {
              console.error('❌ Error executing command:', error)
              socket.emit('mikrotik:exec:error', {
                command: data.command,
                error: error.message,
              })
            }
          }
        )

        // Get connection stats
        socket.on('mikrotik:stats', () => {
          const stats = MikrotikClient.getConnectionStats()
          socket.emit('mikrotik:stats:result', stats)
        })

        // Cleanup function
        const cleanup = (subscriptionId: string) => {
          const streamInfo = activeStreams.get(subscriptionId)
          if (streamInfo) {
            // Call stop() to properly stop the stream in MikrotikClient
            try {
              streamInfo.stop()
            } catch (error) {
              console.error(`Error stopping stream ${subscriptionId}:`, error)
            }

            // Remove all listeners
            streamInfo.emitter.removeAllListeners()

            // Delete from active streams
            activeStreams.delete(subscriptionId)

            // Remove from socket subscriptions
            const socketSubs = socketSubscriptions.get(socket.id)
            if (socketSubs) {
              socketSubs.delete(subscriptionId)
            }
          }
        }

        // Cleanup on disconnect
        socket.on('disconnect', () => {
          console.log('❌ Client disconnected:', socket.id)

          // Clean up all subscriptions for this socket
          const socketSubs = socketSubscriptions.get(socket.id)
          if (socketSubs) {
            socketSubs.forEach((subscriptionId) => {
              cleanup(subscriptionId)
            })
            socketSubscriptions.delete(socket.id)
          }
        })
      })

      console.log('✅ Socket.IO server with MikroTik support initialized')
    },
  }
}

// Broadcast function untuk admin/monitoring
export function broadcastMikrotikData(path: string, data: any) {
  if (io) {
    io.emit('mikrotik:broadcast', {
      path,
      data,
      timestamp: new Date().toISOString(),
    })
  }
}

// Get active streams info
export function getActiveStreamsInfo() {
  const streams: any[] = []
  activeStreams.forEach((info, id) => {
    streams.push({
      id,
      internalStreamId: info.streamId,
      path: info.path,
      host: info.clientConfig.host,
    })
  })
  return streams
}
