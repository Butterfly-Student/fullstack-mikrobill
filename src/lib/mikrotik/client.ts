import EventEmitter from 'events';
import { type IRosOptions, RouterOSAPI, RouterOSClient, type RosApiCommands } from 'routeros-api';


interface CachedClient {
  client: MikrotikClient
  lastUsed: Date
  isConnected: boolean
}

// Simple types for RouterOS API
interface RouterOSError extends Error {
  message: string
}

// Type for RouterOS command parameters
type RouterOSCommand = string | string[]
type RouterOSParameter = string | string[]

export class MikrotikClient {
  private client: RouterOSClient
  protected connectedApi?: Awaited<ReturnType<RouterOSClient['connect']>>
  private isConnected = false
  private activeStreams: Map<string, any> = new Map()

  // RouterOSAPI untuk tugas-tugas tertentu
  protected routerosApi: RouterOSAPI
  private isRouterosApiConnected = false

  // Static properties untuk client management
  private static clientCache = new Map<number, CachedClient>() // Cache by routerId
  private static directClientCache = new Map<string, CachedClient>() // Cache by connection string
  private static cleanupInterval: NodeJS.Timeout
  private static readonly CACHE_TTL = 30 * 60 * 1000 // 30 minutes
  private static readonly CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 minutes
  private static isCleanupInitialized = false

  constructor(private config: IRosOptions) {
    this.client = new RouterOSClient({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port || 8728,
      keepalive: config.keepalive ?? true,
      timeout: 10000,
    })

    // Initialize RouterOSAPI dengan konfigurasi yang sama
    this.routerosApi = new RouterOSAPI({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port || 8728,
      keepalive: config.keepalive ?? true,
      timeout: 10000,
    })

    // Initialize cleanup interval once
    if (!MikrotikClient.isCleanupInitialized) {
      MikrotikClient.setupCleanupInterval()
      MikrotikClient.isCleanupInitialized = true
    }
  }

  /**
   * Generate cache key for direct connections
   */
  private static generateDirectCacheKey(config: IRosOptions): string {
    return `${config.host}:${config.port || 8728}:${config.user}`
  }

  /**
   * Static method to set cached client (helper for subclasses)
   */
  static setCachedClient(routerId: number, client: MikrotikClient): void {
    MikrotikClient.clientCache.set(routerId, {
      client,
      lastUsed: new Date(),
      isConnected: true,
    })
  }

  /**
   * Static method to set cached direct client
   */
  static setCachedDirectClient(
    config: IRosOptions,
    client: MikrotikClient
  ): void {
    const cacheKey = MikrotikClient.generateDirectCacheKey(config)
    MikrotikClient.directClientCache.set(cacheKey, {
      client,
      lastUsed: new Date(),
      isConnected: true,
    })
  }

  /**
   * Static method to create client with custom config (without database lookup)
   * Now with caching support
   */
  static async createDirect<T extends MikrotikClient>(
    this: new (config: IRosOptions) => T,
    config: IRosOptions
  ): Promise<MikrotikClient> {
    // Validate required config
    if (!config.host || !config.user || !config.password) {
      throw new Error('Missing required configuration (host, user, password)')
    }

    const clientConfig: IRosOptions = {
      ...config,
      port: config.port || 8728,
      timeout: config.timeout || 30000,
      keepalive: config.keepalive ?? true,
    }

    const cacheKey = MikrotikClient.generateDirectCacheKey(clientConfig)

    // Check if we have a cached client
    const cachedClient = MikrotikClient.getCachedDirectClient(cacheKey)
    if (cachedClient && cachedClient instanceof this) {
      console.log(`♻️ Using cached direct client for: ${config.host}`)
      return cachedClient as T
    }

    // Disconnect if cached client is different type
    if (cachedClient) {
      await MikrotikClient.disconnectCachedDirectClient(cacheKey)
    }

    console.log(`🔗 Creating new direct MikroTik client for: ${config.host}`)

    try {
      const client = new this(clientConfig)
      await client.connectWithTimeout(clientConfig.timeout || 30000)

      MikrotikClient.setCachedDirectClient(clientConfig, client)

      return client
    } catch (error) {
      console.error(`Failed to create direct client for ${config.host}:`, error)
      MikrotikClient.directClientCache.delete(cacheKey)
      throw error
    }
  }

  /**
   * Static method to get cached client without creating new one (by routerId)
   */
  static getCachedClient(routerId: number): MikrotikClient | null {
    const cachedClient = MikrotikClient.clientCache.get(routerId)
    if (cachedClient && cachedClient.isConnected) {
      cachedClient.lastUsed = new Date()
      return cachedClient.client
    }
    return null
  }

  /**
   * Static method to get cached direct client without creating new one
   */
  static getCachedDirectClient(cacheKey: string): MikrotikClient | null {
    const cachedClient = MikrotikClient.directClientCache.get(cacheKey)
    if (cachedClient && cachedClient.isConnected) {
      cachedClient.lastUsed = new Date()
      return cachedClient.client
    }
    return null
  }

  /**
   * Static method to get cached direct client by config
   */
  static getCachedDirectClientByConfig(
    config: IRosOptions
  ): MikrotikClient | null {
    const cacheKey = MikrotikClient.generateDirectCacheKey(config)
    return MikrotikClient.getCachedDirectClient(cacheKey)
  }

  /**
   * Static method to disconnect and remove client from cache (by routerId)
   */
  static async disconnectCachedClient(routerId: number): Promise<void> {
    const cachedClient = MikrotikClient.clientCache.get(routerId)
    if (cachedClient) {
      try {
        if (cachedClient.isConnected) {
          await cachedClient.client.disconnect()
        }
      } catch (error) {
        console.error(
          `Error disconnecting client for router ${routerId}:`,
          error
        )
      } finally {
        cachedClient.isConnected = false
        MikrotikClient.clientCache.delete(routerId)
      }
    }
  }

  /**
   * Static method to disconnect and remove direct client from cache
   */
  static async disconnectCachedDirectClient(cacheKey: string): Promise<void> {
    const cachedClient = MikrotikClient.directClientCache.get(cacheKey)
    if (cachedClient) {
      try {
        if (cachedClient.isConnected) {
          await cachedClient.client.disconnect()
        }
      } catch (error) {
        console.error(`Error disconnecting direct client ${cacheKey}:`, error)
      } finally {
        cachedClient.isConnected = false
        MikrotikClient.directClientCache.delete(cacheKey)
      }
    }
  }

  /**
   * Static method to disconnect direct client by config
   */
  static async disconnectDirectClientByConfig(
    config: IRosOptions
  ): Promise<void> {
    const cacheKey = MikrotikClient.generateDirectCacheKey(config)
    await MikrotikClient.disconnectCachedDirectClient(cacheKey)
  }

  /**
   * Static method to check if client is connected (by routerId)
   */
  static isClientConnected(routerId: number): boolean {
    const cachedClient = MikrotikClient.clientCache.get(routerId)
    return cachedClient?.isConnected ?? false
  }

  /**
   * Static method to check if direct client is connected
   */
  static isDirectClientConnected(config: IRosOptions): boolean {
    const cacheKey = MikrotikClient.generateDirectCacheKey(config)
    const cachedClient = MikrotikClient.directClientCache.get(cacheKey)
    return cachedClient?.isConnected ?? false
  }

  /**
   * Static method to get connection stats
   */
  static getConnectionStats() {
    const stats = {
      totalConnections:
        MikrotikClient.clientCache.size + MikrotikClient.directClientCache.size,
      activeConnections: 0,
      databaseConnections: 0,
      directConnections: 0,
      connections: [] as Array<{
        type: 'database' | 'direct'
        identifier: string
        lastUsed: Date
        isConnected: boolean
      }>,
    }

    // Database connections
    MikrotikClient.clientCache.forEach((cachedClient, routerId) => {
      if (cachedClient.isConnected) {
        stats.activeConnections++
        stats.databaseConnections++
      }
      stats.connections.push({
        type: 'database',
        identifier: `Router ID: ${routerId}`,
        lastUsed: cachedClient.lastUsed,
        isConnected: cachedClient.isConnected,
      })
    })

    // Direct connections
    MikrotikClient.directClientCache.forEach((cachedClient, cacheKey) => {
      if (cachedClient.isConnected) {
        stats.activeConnections++
        stats.directConnections++
      }
      stats.connections.push({
        type: 'direct',
        identifier: cacheKey,
        lastUsed: cachedClient.lastUsed,
        isConnected: cachedClient.isConnected,
      })
    })

    return stats
  }

  /**
   * Static method to reconnect direct client (useful for connection recovery)
   */
  static async reconnectDirectClient(
    config: IRosOptions
  ): Promise<MikrotikClient> {
    await MikrotikClient.disconnectDirectClientByConfig(config)
    return MikrotikClient.createDirect(config)
  }

  /**
   * Static method to cleanup all connections
   */
  static async cleanup(): Promise<void> {
    if (MikrotikClient.cleanupInterval) {
      clearInterval(MikrotikClient.cleanupInterval)
    }

    const databaseDisconnectPromises = Array.from(
      MikrotikClient.clientCache.keys()
    ).map((routerId) => MikrotikClient.disconnectCachedClient(routerId))

    const directDisconnectPromises = Array.from(
      MikrotikClient.directClientCache.keys()
    ).map((cacheKey) => MikrotikClient.disconnectCachedDirectClient(cacheKey))

    await Promise.allSettled([
      ...databaseDisconnectPromises,
      ...directDisconnectPromises,
    ])

    MikrotikClient.clientCache.clear()
    MikrotikClient.directClientCache.clear()
  }

  /**
   * Setup periodic cleanup
   */
  private static setupCleanupInterval(): void {
    MikrotikClient.cleanupInterval = setInterval(() => {
      MikrotikClient.cleanupStaleConnections()
    }, MikrotikClient.CLEANUP_INTERVAL)
  }

  /**
   * Clean up stale connections
   */
  private static async cleanupStaleConnections(): Promise<void> {
    const now = new Date()
    const staleRouterIds: number[] = []
    const staleDirectCacheKeys: string[] = []

    // Check database connections
    MikrotikClient.clientCache.forEach((cachedClient, routerId) => {
      const timeSinceLastUse = now.getTime() - cachedClient.lastUsed.getTime()
      if (timeSinceLastUse > MikrotikClient.CACHE_TTL) {
        staleRouterIds.push(routerId)
      }
    })

    // Check direct connections
    MikrotikClient.directClientCache.forEach((cachedClient, cacheKey) => {
      const timeSinceLastUse = now.getTime() - cachedClient.lastUsed.getTime()
      if (timeSinceLastUse > MikrotikClient.CACHE_TTL) {
        staleDirectCacheKeys.push(cacheKey)
      }
    })

    if (staleRouterIds.length > 0 || staleDirectCacheKeys.length > 0) {
      console.log(
        `Cleaning up ${staleRouterIds.length} stale database connections and ${staleDirectCacheKeys.length} stale direct connections`
      )

      const databaseCleanupPromises = staleRouterIds.map((routerId) =>
        MikrotikClient.disconnectCachedClient(routerId)
      )

      const directCleanupPromises = staleDirectCacheKeys.map((cacheKey) =>
        MikrotikClient.disconnectCachedDirectClient(cacheKey)
      )

      await Promise.allSettled([
        ...databaseCleanupPromises,
        ...directCleanupPromises,
      ])
    }
  }

  // Instance methods
  async connect(): Promise<void> {
    if (!this.isConnected) {
      this.connectedApi = await this.client.connect()
      this.isConnected = true
    }
  }

  /**
   * Connect client with timeout
   */
  public async connectWithTimeout(timeout: number): Promise<void> {
    const connectPromise = this.connect()
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Connection timeout after ${timeout}ms`)),
        timeout
      )
    })

    await Promise.race([connectPromise, timeoutPromise])
  }

  // Method untuk menghubungkan RouterOSAPI untuk tugas tertentu
  private async connectRouterosApi(): Promise<void> {
    if (!this.isRouterosApiConnected) {
      await this.routerosApi.connect()
      this.isRouterosApiConnected = true
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      // Stop all active streams
      for (const [streamId, stream] of this.activeStreams) {
        try {
          stream.stop()
        } catch (error) {
          console.error(`Error stopping stream ${streamId}:`, error)
        }
      }
      this.activeStreams.clear()

      await this.client.close()
      this.isConnected = false
    }
    // Disconnect RouterOSAPI jika masih terhubung
    if (this.isRouterosApiConnected) {
      await this.routerosApi.close()
      this.isRouterosApiConnected = false
    }
  }

  async getSystemInfo() {
    await this.connect()
    return this.connectedApi!.menu('/system/resource').getOnly()
  }

  async getIdentity() {
    await this.connect()
    return this.connectedApi!.menu('/system/identity').getOnly()
  }

  async getResources() {
    await this.connect()
    return this.connectedApi!.menu('/system/resource').getOnly()
  }

  async getAddressPools() {
    await this.connect()
    return this.connectedApi!.menu('/ip/pool').getAll()
  }

  async getInterfaces() {
    await this.connect()
    return this.connectedApi!.menu('/interface').getAll()
  }

  async getPPPoEProfiles() {
    await this.connect()
    return this.connectedApi!.menu('/ppp/profile').get()
  }

  async getPools() {
    await this.connect()
    return this.connectedApi!.menu('/ip/pool').get()
  }

  async listSimpleQueue(){
    await this.connect()
    return this.connectedApi!.menu('/queue/simple/print').get(['dynamic', 'false'])
  }

  /**
   * Get PPPoE secrets from MikroTik
   */
  async getPPPoESecrets() {
    await this.connect()
    return this.connectedApi!.menu('/ppp/secret').get()
  }

  /**
   * Get Active pppoe connections from MikroTik
   */

  async getActivePPPoEConnections() {
    await this.connectRouterosApi()
    return this.routerosApi.write('/ppp/active/print')
  }

  /**
   * Get Hotspot profiles from MikroTik
   */
  async getHotspotProfiles() {
    await this.connect()
    return this.connectedApi!.menu('/ip/hotspot/user/profile').get()
  }

  async getHotspotServers() {
    await this.connect()
    return this.connectedApi!.menu('/ip/hotspot').get()
  }

  /**
   * Execute RouterOS API command with type safety
   */
  async exec<T = Record<string, unknown>[]>(
    params: RouterOSCommand,
    moreParams: RouterOSParameter[] = []
  ): Promise<T> {
    await this.connectRouterosApi()

    try {
      const result = await this.routerosApi.write(params, ...moreParams)
      const typedResult = result as T

      return typedResult
    } catch (error) {
      const routerError = error as RouterOSError

      throw routerError
    }
  }

  execStream(
    params: RouterOSCommand,
    moreParams: RouterOSParameter[] = []
  ): {
    emitter: EventEmitter
    stop: () => void
    streamId: string
  } {
    const emitter = new EventEmitter()
    const streamId = `execStream-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`
    let streamInstance: any = null

    this.connectRouterosApi()
      .then(() => {
        const stream = this.routerosApi.writeStream(params, ...moreParams)
        streamInstance = stream

        // Store stream untuk cleanup
        this.activeStreams.set(streamId, stream)

        stream.on('data', (data) => {
          // Skip data dengan dead: true jika ada
          if (data && data.dead) {
            return
          }
          emitter.emit('data', data)
        })

        stream.on('error', (err) => {
          emitter.emit('error', err)
          this.activeStreams.delete(streamId)
        })

        stream.on('done', () => {
          emitter.emit('end')
          this.activeStreams.delete(streamId)
        })

        // Emit ready event ketika stream siap
        emitter.emit('ready', stream)
      })
      .catch((err) => {
        emitter.emit('error', err)
        this.activeStreams.delete(streamId)
      })

    // Return object dengan emitter dan stop function
    return {
      emitter,
      stop: () => {
        if (streamInstance) {
          try {
            streamInstance.stop()
            this.activeStreams.delete(streamId)
            emitter.emit('stopped')
          } catch (error) {
            console.error(`Error stopping stream ${streamId}:`, error)
          }
        }
      },
      streamId,
    }
  }

  async execClient(path: string): Promise<RosApiCommands> {
    await this.connect()
    return this.connectedApi!.menu(path)
  }

  // Method untuk menggunakan RouterOSAPI untuk tugas-tugas tertentu dengan streaming
  async execClientStream(path: string, params?: any) {
    await this.connect()

    if (!this.connectedApi) {
      throw new Error('RouterOS API is not connected')
    }

    const emitter = new EventEmitter()
    const menu = this.connectedApi.menu(path)

    // Generate unique stream ID
    const streamId = `${path}-${Date.now()}`

    // Stream dengan command (default: "listen")
    const stream = menu.where(params || {}).stream('listen', (err, data) => {
      if (err) {
        console.error('RouterOSAPI stream error:', err)
        emitter.emit('error', err)
      }

      // Skip data dengan dead: true (cleanup messages)
      if (data.dead) {
        return
      }

      emitter.emit('data', data)
    })

    // Store stream untuk cleanup nanti
    this.activeStreams.set(streamId, stream)

    // Handle stream events
    stream.on('end', () => {
      emitter.emit('end')
      this.activeStreams.delete(streamId)
    })

    stream.on('error', (err) => {
      emitter.emit('error', err)
      this.activeStreams.delete(streamId)
    })

    // Return object with emitter and stop function
    return {
      emitter,
      stream,
      stop: () => {
        stream.stop()
        this.activeStreams.delete(streamId)
        emitter.emit('stopped')
      },
      streamId,
    }
  }
}

// Export convenience functions
export const createDirectClient =
  MikrotikClient.createDirect.bind(MikrotikClient)
export const getCachedClient =
  MikrotikClient.getCachedClient.bind(MikrotikClient)
export const disconnectClient =
  MikrotikClient.disconnectCachedClient.bind(MikrotikClient)
export const isClientConnected =
  MikrotikClient.isClientConnected.bind(MikrotikClient)
export const getConnectionStats =
  MikrotikClient.getConnectionStats.bind(MikrotikClient)

const cleanupHandler = async () => {
  console.log('Cleaning up MikroTik connections...')
  await MikrotikClient.cleanup()
  process.exit(0)
}

// Daftar listener cuma kalau belum ada
if (process.listenerCount('SIGINT') === 0) {
  process.on('SIGINT', cleanupHandler)
}

if (process.listenerCount('SIGTERM') === 0) {
  process.on('SIGTERM', cleanupHandler)
}