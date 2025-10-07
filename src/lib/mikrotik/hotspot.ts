import { db } from '@/db/index';
import { type IRosOptions } from 'routeros-api';
import { MikrotikClient } from './client';


// Profile Management Interfaces
export interface ProfileConfig {
  name: string
  sharedUsers?: number
  rateLimit?: string
  expMode?: 'ntf' | 'ntfc' | 'rem' | 'remc' | '0'
  validity?: string
  price?: string
  sellingPrice?: string
  addressPool?: string
  lockUser?: 'Disable' | 'Enable'
  lockServer?: 'Disable' | 'Enable'
  parentQueue?: string
  statusAutorefresh?: string
  onLogin?: string
  bandwidth?: string
  sessionTimeout?: string
  idleTimeout?: string
  downloadLimit?: string
  uploadLimit?: string
  maxSessions?: string
}

export interface ExpireMonitorResponse {
  message: string
  action?: 'created' | 'updated' | 'already_exists'
  data?: {
    id?: string
    name?: string
  }
}

export interface ProfileResponse {
  message: 'success' | 'error'
  data: any
}

// User Management Interfaces
export interface UserConfig {
  server?: string
  name: string
  password: string
  profile: string
  macAddress?: string
  timeLimit?: string
  dataLimit?: string
  comment?: string
  disabled?: boolean
}

export interface VoucherConfig {
  qty: number
  server?: string
  userType: 'up' | 'vc'
  userLength: number
  prefix?: string
  charType:
    | 'lower'
    | 'upper'
    | 'upplow'
    | 'mix'
    | 'mix1'
    | 'mix2'
    | 'num'
    | 'lower1'
    | 'upper1'
    | 'upplow1'
  profile: string
  timeLimit?: string
  dataLimit?: string
  comment?: string
  genCode?: string
}

export interface VoucherResponse {
  message: 'success' | 'error'
  data: {
    count?: number
    comment?: string
    profile?: string
    users?: any[]
    error?: string
  }
}

export interface UserResponse {
  message: 'success' | 'error'
  data: any
}

export class MikrotikHotspot extends MikrotikClient {
  static async createFromDatabase(
    routerId: number,
    overrideConfig?: Partial<IRosOptions>
  ): Promise<MikrotikHotspot> {
    try {
      if (!routerId || routerId <= 0) {
        throw new Error('Invalid router ID provided')
      }

      const cachedClient = MikrotikClient.getCachedClient(routerId)
      if (cachedClient && cachedClient instanceof MikrotikHotspot) {
        console.log(
          `♻️ Using cached MikrotikHotspot client for router ${routerId}`
        )
        return cachedClient
      }

      if (cachedClient) {
        await MikrotikClient.disconnectCachedClient(routerId)
      }

      const router = await db.query.routers.findFirst({
        where: (r, { eq }) => eq(r.id, routerId),
      })

      if (!router) {
        throw new Error(`Router with ID ${routerId} not found`)
      }

      if (!router.is_active) {
        throw new Error(`Router ${router.name} is not active`)
      }

      const clientConfig: IRosOptions = {
        host: overrideConfig?.host || router.hostname,
        user: overrideConfig?.user || router.username,
        password: overrideConfig?.password || router.password,
        port: overrideConfig?.port || router.port || 8728,
        timeout: overrideConfig?.timeout || router.timeout || 30000,
        keepalive: overrideConfig?.keepalive ?? true,
      }

      console.log(clientConfig)

      if (!clientConfig.host || !clientConfig.user || !clientConfig.password) {
        throw new Error(
          'Missing required router configuration (host, user, password)'
        )
      }

      console.log(
        `🔌 Creating MikroTik Hotspot client for router: ${router.name} (${router.hostname})`
      )

      const hotspotClient = new MikrotikHotspot(clientConfig)
      await hotspotClient.connectWithTimeout(clientConfig.timeout || 30000)

      const clientCache = (MikrotikClient as any).clientCache
      if (clientCache && clientCache instanceof Map) {
        clientCache.set(routerId, {
          client: hotspotClient,
          lastUsed: new Date(),
          isConnected: true,
        })
      }

      console.log(`✅ MikrotikHotspot client cached for router ${routerId}`)
      return hotspotClient
    } catch (error) {
      console.error(
        `❌ Failed to create MikroTik Hotspot client for router ${routerId}:`,
        error
      )
      await MikrotikClient.disconnectCachedClient(routerId)
      throw error
    }
  }

  /**
   * Create MikrotikHotspot client with direct configuration (without database lookup)
   * Supports connection caching for performance
   */
  static async createDirect(config: IRosOptions): Promise<MikrotikHotspot> {
    try {
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

      // Generate cache key
      const cacheKey = `${clientConfig.host}:${clientConfig.port}:${clientConfig.user}`

      // Check if we have a cached client
      const cachedClient = (MikrotikClient as any).directClientCache?.get(
        cacheKey
      )
      if (
        cachedClient &&
        cachedClient.client instanceof MikrotikHotspot &&
        cachedClient.isConnected
      ) {
        console.log(
          `♻️ Using cached direct MikrotikHotspot client for: ${config.host}`
        )
        // Update last used time
        cachedClient.lastUsed = new Date()
        return cachedClient.client
      }

      // Disconnect existing cached client if it exists but is different type or disconnected
      if (cachedClient) {
        try {
          await cachedClient.client.disconnect()
        } catch (error) {
          console.warn(
            `Warning: Failed to disconnect old cached client: ${error}`
          )
        }
      }

      console.log(
        `🔗 Creating new direct MikrotikHotspot client for: ${config.host}`
      )

      const hotspotClient = new MikrotikHotspot(clientConfig)
      await hotspotClient.connectWithTimeout(clientConfig.timeout || 30000)

      // Cache the client
      const directClientCache = (MikrotikClient as any).directClientCache
      if (directClientCache && directClientCache instanceof Map) {
        directClientCache.set(cacheKey, {
          client: hotspotClient,
          lastUsed: new Date(),
          isConnected: true,
        })
      }

      console.log(`✅ Direct MikrotikHotspot client cached for: ${config.host}`)
      return hotspotClient
    } catch (error) {
      console.error(
        `❌ Failed to create direct MikrotikHotspot client for ${config.host}:`,
        error
      )

      // Clean up cache on failure
      const cacheKey = `${config.host}:${config.port || 8728}:${config.user}`
      const directClientCache = (MikrotikClient as any).directClientCache
      if (directClientCache && directClientCache instanceof Map) {
        directClientCache.delete(cacheKey)
      }

      throw error
    }
  }

  override async connectWithTimeout(timeout: number): Promise<void> {
    const connectPromise = this.connect()
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Connection timeout after ${timeout}ms`)),
        timeout
      )
    })

    await Promise.race([connectPromise, timeoutPromise])
  }

  // Profile Management Methods
  private generateOnLoginScript(config: ProfileConfig): string {
    console.log('Generate On Login Skript', config)
    const {
      expMode,
      price = '0',
      validity = '',
      sellingPrice = '0',
      lockUser,
      lockServer,
      name,
    } = config

    let mode = ''
    if (expMode === 'ntf' || expMode === 'ntfc') {
      mode = 'N'
    } else if (expMode === 'rem' || expMode === 'remc') {
      mode = 'X'
    }

    // Fix: Handle string values properly
    const lockScript =
      lockUser === 'Enable'
        ? '; [:local mac $"mac-address"; /ip hotspot user set mac-address=$mac [find where name=$user]]'
        : ''

    let serverLockScript = ''
    if (lockServer === 'Enable') {
      serverLockScript =
        '; [:local mac $"mac-address"; :local srv [/ip hotspot host get [find where mac-address="$mac"] server]; /ip hotspot user set server=$srv [find where name=$user]]'
    }

    const recordScript = `; :local mac $"mac-address"; :local time [/system clock get time ]; /system script add name="$date-|-$time-|-$user-|-${price}-|-$address-|-$mac-|-${validity}-|-${name}-|-$comment" owner="$month$year" source=$date comment=mikhmon`

    let onLoginScript = ''

    if (expMode === 'rem') {
      onLoginScript = `:put (",${expMode},${price},${validity},${sellingPrice},,${lockUser},${lockServer},"); :local mode "${mode}"; {:local date [ /system clock get date ];:local year [ :pick $date 7 11 ];:local month [ :pick $date 0 3 ];:local comment [ /ip hotspot user get [/ip hotspot user find where name="$user"] comment]; :local ucode [:pic $comment 0 2]; :if ($ucode = "vc" or $ucode = "up" or $comment = "") do={ /sys sch add name="$user" disable=no start-date=$date interval="${validity}"; :delay 2s; :local exp [ /sys sch get [ /sys sch find where name="$user" ] next-run]; :local getxp [len $exp]; :if ($getxp = 15) do={ :local d [:pic $exp 0 6]; :local t [:pic $exp 7 16]; :local s ("/"); :local exp ("$d$s$year $t"); /ip hotspot user set comment="$exp $mode" [find where name="$user"];}; :if ($getxp = 8) do={ /ip hotspot user set comment="$date $exp $mode" [find where name="$user"];}; :if ($getxp > 15) do={ /ip hotspot user set comment="$exp $mode" [find where name="$user"];}; /sys sch remove [find where name="$user"]${lockScript}${serverLockScript}}}`
    } else if (expMode === 'ntf') {
      onLoginScript = `:put (",${expMode},${price},${validity},${sellingPrice},,${lockUser},${lockServer},"); :local mode "${mode}"; {:local date [ /system clock get date ];:local year [ :pick $date 7 11 ];:local month [ :pick $date 0 3 ];:local comment [ /ip hotspot user get [/ip hotspot user find where name="$user"] comment]; :local ucode [:pic $comment 0 2]; :if ($ucode = "vc" or $ucode = "up" or $comment = "") do={ /sys sch add name="$user" disable=no start-date=$date interval="${validity}"; :delay 2s; :local exp [ /sys sch get [ /sys sch find where name="$user" ] next-run]; :local getxp [len $exp]; :if ($getxp = 15) do={ :local d [:pic $exp 0 6]; :local t [:pic $exp 7 16]; :local s ("/"); :local exp ("$d$s$year $t"); /ip hotspot user set comment="$exp $mode" [find where name="$user"];}; :if ($getxp = 8) do={ /ip hotspot user set comment="$date $exp $mode" [find where name="$user"];}; :if ($getxp > 15) do={ /ip hotspot user set comment="$exp $mode" [find where name="$user"];}; /sys sch remove [find where name="$user"]${lockScript}${serverLockScript}}}`
    } else if (expMode === 'remc') {
      onLoginScript = `:put (",${expMode},${price},${validity},${sellingPrice},,${lockUser},${lockServer},"); :local mode "${mode}"; {:local date [ /system clock get date ];:local year [ :pick $date 7 11 ];:local month [ :pick $date 0 3 ];:local comment [ /ip hotspot user get [/ip hotspot user find where name="$user"] comment]; :local ucode [:pic $comment 0 2]; :if ($ucode = "vc" or $ucode = "up" or $comment = "") do={ /sys sch add name="$user" disable=no start-date=$date interval="${validity}"; :delay 2s; :local exp [ /sys sch get [ /sys sch find where name="$user" ] next-run]; :local getxp [len $exp]; :if ($getxp = 15) do={ :local d [:pic $exp 0 6]; :local t [:pic $exp 7 16]; :local s ("/"); :local exp ("$d$s$year $t"); /ip hotspot user set comment="$exp $mode" [find where name="$user"];}; :if ($getxp = 8) do={ /ip hotspot user set comment="$date $exp $mode" [find where name="$user"];}; :if ($getxp > 15) do={ /ip hotspot user set comment="$exp $mode" [find where name="$user"];}; /sys sch remove [find where name="$user"]${recordScript}${lockScript}${serverLockScript}}}`
    } else if (expMode === 'ntfc') {
      onLoginScript = `:put (",${expMode},${price},${validity},${sellingPrice},,${lockUser},${lockServer},"); :local mode "${mode}"; {:local date [ /system clock get date ];:local year [ :pick $date 7 11 ];:local month [ :pick $date 0 3 ];:local comment [ /ip hotspot user get [/ip hotspot user find where name="$user"] comment]; :local ucode [:pic $comment 0 2]; :if ($ucode = "vc" or $ucode = "up" or $comment = "") do={ /sys sch add name="$user" disable=no start-date=$date interval="${validity}"; :delay 2s; :local exp [ /sys sch get [ /sys sch find where name="$user" ] next-run]; :local getxp [len $exp]; :if ($getxp = 15) do={ :local d [:pic $exp 0 6]; :local t [:pic $exp 7 16]; :local s ("/"); :local exp ("$d$s$year $t"); /ip hotspot user set comment="$exp $mode" [find where name="$user"];}; :if ($getxp = 8) do={ /ip hotspot user set comment="$date $exp $mode" [find where name="$user"];}; :if ($getxp > 15) do={ /ip hotspot user set comment="$exp $mode" [find where name="$user"];}; /sys sch remove [find where name="$user"]${recordScript}${lockScript}${serverLockScript}}}`
    } else if (expMode === '0' && price !== '' && price !== '0') {
      // Fix: Check for non-empty, non-zero string
      onLoginScript = `:put (",,${price},,${sellingPrice},noexp,${lockUser},${lockServer},")${lockScript}${serverLockScript}`
    } else {
      // Fix: Return empty string instead of "Test skript"
      onLoginScript = ''
    }

    return onLoginScript
  }

  private sanitizeName(name: string): string {
    return name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_]/g, '')
  }

  private validateProfileConfig(config: ProfileConfig): void {
    if (!config.name || config.name.trim().length === 0) {
      throw new Error('Profile name is required')
    }

    if (
      config.sharedUsers &&
      (config.sharedUsers < 1 || config.sharedUsers > 100)
    ) {
      throw new Error('Shared users must be between 1 and 100')
    }

    if (config.price && Number(config.price) < 0) {
      throw new Error('Price cannot be negative')
    }

    if (config.sellingPrice && Number(config.sellingPrice) < 0) {
      throw new Error('Selling price cannot be negative')
    }
  }

  // Random string generators (ported from PHP functions)
  private generateRandomString(length: number, type: string): string {
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz'
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'

    let chars = ''
    switch (type) {
      case 'lower':
      case 'lower1':
        chars = lowerChars
        break
      case 'upper':
      case 'upper1':
        chars = upperChars
        break
      case 'upplow':
      case 'upplow1':
        chars = lowerChars + upperChars
        break
      case 'mix':
        chars = lowerChars + numbers
        break
      case 'mix1':
        chars = upperChars + numbers
        break
      case 'mix2':
        chars = lowerChars + upperChars + numbers
        break
      case 'num':
        chars = numbers
        break
      default:
        chars = lowerChars + upperChars + numbers
    }

    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private calculateDataLimit(dataLimit: string): number {
    if (!dataLimit) return 0

    const lastChar = dataLimit.slice(-1).toLowerCase()
    const value = dataLimit.slice(0, -1)

    if (!['m', 'g'].includes(lastChar)) {
      return isNaN(Number(dataLimit)) ? 0 : Number(dataLimit)
    }

    const numValue = Number(value)
    if (isNaN(numValue)) return 0

    const multiplier = lastChar === 'g' ? 1073741824 : 1048576 // GB or MB in bytes
    return numValue * multiplier
  }

  async createProfile(config: ProfileConfig): Promise<ProfileResponse> {
    try {
      // Validate and sanitize input
      this.validateProfileConfig(config)

      const sanitizedConfig = {
        ...config,
        name: this.sanitizeName(config.name),
        price: config.price ? config.price.toString() : '0',
        sellingPrice: config.sellingPrice
          ? config.sellingPrice.toString()
          : '0',
        expMode: config.expMode
          ? (config.expMode.toString() as '0' | 'ntf' | 'ntfc' | 'rem' | 'remc')
          : '0',
      }

      // Generate on-login script
      const onLoginScript = this.generateOnLoginScript(sanitizedConfig)

      // Prepare profile data for MikroTik
      const profileData: Record<string, string> = {
        name: sanitizedConfig.name,
        'status-autorefresh': '1m',
      }

      if (sanitizedConfig.addressPool)
        profileData['address-pool'] = sanitizedConfig.addressPool
      if (sanitizedConfig.rateLimit)
        profileData['rate-limit'] = sanitizedConfig.rateLimit
      if (sanitizedConfig.sharedUsers)
        profileData['shared-users'] = sanitizedConfig.sharedUsers.toString()
      if (sanitizedConfig.parentQueue)
        profileData['parent-queue'] = sanitizedConfig.parentQueue
      if (onLoginScript) profileData['on-login'] = onLoginScript
      console.log('On-Login skript', onLoginScript)
      // Add profile to MikroTik
      const result = await this.connectedApi
        ?.menu('/ip/hotspot/user/profile/add')
        .add(profileData)

      if (result?.trap && result.trap.length > 0) {
        const errorMessage = result.trap[0].message || 'Unknown error occurred'
        return {
          message: 'error',
          data: { error: errorMessage },
        }
      }

      // Get the created profile details
      if (result?.ret) {
        const profileId = result.ret
        const createdProfile = await this.connectedApi
          ?.menu('/ip/hotspot/user/profile/print')
          .where({ '.id': profileId })
          .get()

        return {
          message: 'success',
          data: createdProfile?.[0] || {
            id: profileId,
            name: sanitizedConfig.name,
          },
        }
      }

      return {
        message: 'success',
        data: { name: sanitizedConfig.name, created: true },
      }
    } catch (error) {
      console.error('Error creating profile:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  async getProfile(profileName: string): Promise<ProfileResponse> {
    try {
      const result = await this.connectedApi
        ?.menu('/ip/hotspot/user/profile/print')
        .where({ name: profileName })
        .get()

      if (result && result.length > 0) {
        return {
          message: 'success',
          data: result[0],
        }
      }

      return {
        message: 'error',
        data: { error: 'Profile not found' },
      }
    } catch (error) {
      console.error('Error getting profile:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  async listProfiles(): Promise<ProfileResponse> {
    try {
      const result = await this.connectedApi
        ?.menu('/ip/hotspot/user/profile/print')
        .get()

      return {
        message: 'success',
        data: result || [],
      }
    } catch (error) {
      console.error('Error listing profiles:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  async listPools() {
    try {
      const result = await this.connectedApi?.menu('/ip/pool').getAll()

      return {
        message: 'success',
        data: result || [],
      }
    } catch (error) {
      console.error('Error listing profiles:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  async listServers() {
    try {
      const result = await this.connectedApi?.menu('/ip/hotspot').getAll()

      return {
        message: 'success',
        data: result || [],
      }
    } catch (error) {
      console.error('Error listing profiles:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  async updateProfile(
    profileId: string,
    updates: Partial<ProfileConfig>
  ): Promise<ProfileResponse> {
    try {
      const updateData: Record<string, string> = {}

      if (updates.rateLimit) updateData['rate-limit'] = updates.rateLimit
      if (updates.sharedUsers)
        updateData['shared-users'] = updates.sharedUsers.toString()
      if (updates.addressPool) updateData['address-pool'] = updates.addressPool
      if (updates.parentQueue) updateData['parent-queue'] = updates.parentQueue

      // Generate new on-login script if relevant parameters are updated
      if (
        updates.expMode ||
        updates.price !== undefined ||
        updates.lockUser !== undefined
      ) {
        const onLoginScript = this.generateOnLoginScript({
          name: updates.name || '',
          ...updates,
        })
        if (onLoginScript) updateData['on-login'] = onLoginScript
      }

      const result = await this.connectedApi
        ?.menu('/ip/hotspot/user/profile/set')
        .where({ '.id': profileId })
        .set(updateData)

      if (result?.trap && result.trap.length > 0) {
        const errorMessage = result.trap[0].message || 'Unknown error occurred'
        return {
          message: 'error',
          data: { error: errorMessage },
        }
      }

      return {
        message: 'success',
        data: { updated: true },
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  async deleteProfile(profileId: string): Promise<ProfileResponse> {
    try {
      const result = await this.connectedApi
        ?.menu('/ip/hotspot/user/profile/remove')
        .where({ '.id': profileId })
        .remove()

      if (result?.trap && result.trap.length > 0) {
        const errorMessage = result.trap[0].message || 'Unknown error occurred'
        return {
          message: 'error',
          data: { error: errorMessage },
        }
      }

      return {
        message: 'success',
        data: { deleted: true },
      }
    } catch (error) {
      console.error('Error deleting profile:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  // User Management Methods
  async addUser(config: UserConfig): Promise<UserResponse> {
    try {
      // Determine comment prefix
      const commentPrefix = config.name === config.password ? 'vc-' : 'up-'
      const fullComment = commentPrefix + (config.comment || '')

      // Calculate data limit in bytes
      const dataLimitBytes = config.dataLimit
        ? this.calculateDataLimit(config.dataLimit)
        : undefined

      // Prepare user data
      const userData: Record<string, string> = {
        name: config.name,
        password: config.password,
        profile: config.profile,
        disabled: config.disabled ? 'yes' : 'no',
        comment: fullComment,
      }

      if (config.server) userData.server = config.server
      if (config.macAddress) userData['mac-address'] = config.macAddress
      if (config.timeLimit) userData['limit-uptime'] = config.timeLimit
      if (dataLimitBytes)
        userData['limit-bytes-total'] = dataLimitBytes.toString()

      // Add user to MikroTik
      const result = await this.connectedApi
        ?.menu('/ip/hotspot/user/add')
        .add(userData)

      if (result?.trap && result.trap.length > 0) {
        const errorMessage = result.trap[0].message || 'Unknown error occurred'
        return {
          message: 'error',
          data: { error: errorMessage },
        }
      }

      // Get the created user details
      if (result?.ret) {
        const userId = result.ret
        const createdUser = await this.connectedApi
          ?.menu('/ip/hotspot/user/print')
          .where({ '.id': userId })
          .get()

        return {
          message: 'success',
          data: createdUser?.[0] || { id: userId, name: config.name },
        }
      }

      return {
        message: 'success',
        data: { name: config.name, created: true },
      }
    } catch (error) {
      console.error('Error adding user:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  async getUser(username: string): Promise<UserResponse> {
    try {
      const result = await this.connectedApi
        ?.menu('/ip/hotspot/user/print')
        .where({ name: username })
        .get()

      if (result && result.length > 0) {
        return {
          message: 'success',
          data: result[0],
        }
      }

      return {
        message: 'error',
        data: { error: 'User not found' },
      }
    } catch (error) {
      console.error('Error getting user:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  async getAllUsers(): Promise<UserResponse> {
    try {
      const result = await this.connectedApi
        ?.menu('/ip/hotspot/user/print')
        .getAll()

      if (result && result.length > 0) {
        return {
          message: 'success',
          data: result,
        }
      }

      return {
        message: 'error',
        data: { error: 'No users found' },
      }
    } catch (error) {
      console.error('Error getting all users:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  async updateUser(
    userId: string,
    updates: Partial<UserConfig>
  ): Promise<UserResponse> {
    try {
      const updateData: Record<string, string> = {}

      if (updates.name) updateData.name = updates.name
      if (updates.password) updateData.password = updates.password
      if (updates.profile) updateData.profile = updates.profile
      if (updates.macAddress) updateData['mac-address'] = updates.macAddress
      if (updates.timeLimit) updateData['limit-uptime'] = updates.timeLimit
      if (updates.dataLimit) {
        const dataLimitBytes = this.calculateDataLimit(updates.dataLimit)
        updateData['limit-bytes-total'] = dataLimitBytes.toString()
      }
      if (updates.comment) {
        const commentPrefix = updates.name === updates.password ? 'vc-' : 'up-'
        updateData.comment = commentPrefix + updates.comment
      }
      if (updates.disabled !== undefined)
        updateData.disabled = updates.disabled ? 'yes' : 'no'

      const result = await this.connectedApi
        ?.menu('/ip/hotspot/user/set')
        .where({ '.id': userId })
        .set(updateData)

      if (result?.trap && result.trap.length > 0) {
        const errorMessage = result.trap[0].message || 'Unknown error occurred'
        return {
          message: 'error',
          data: { error: errorMessage },
        }
      }

      return {
        message: 'success',
        data: { updated: true },
      }
    } catch (error) {
      console.error('Error updating user:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  async deleteUser(userId: string): Promise<UserResponse> {
    try {
      const result = await this.connectedApi
        ?.menu('/ip/hotspot/user/remove')
        .where({ '.id': userId })
        .remove()

      if (result?.trap && result.trap.length > 0) {
        const errorMessage = result.trap[0].message || 'Unknown error occurred'
        return {
          message: 'error',
          data: { error: errorMessage },
        }
      }

      return {
        message: 'success',
        data: { deleted: true },
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  async listUsers(commentFilter?: string): Promise<UserResponse> {
    try {
      let query = this.connectedApi?.menu('/ip/hotspot/user/print')

      if (commentFilter) {
        query = query?.where({ comment: commentFilter })
      }

      const result = await query?.get()

      return {
        message: 'success',
        data: result || [],
      }
    } catch (error) {
      console.error('Error listing users:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  // Voucher Generation Methods
  async generateVouchers(config: VoucherConfig): Promise<VoucherResponse> {
    try {
      const {
        qty,
        server,
        userType,
        userLength,
        prefix = '',
        charType,
        profile,
        timeLimit,
        dataLimit,
        comment = '',
        genCode = '',
      } = config

      // Create comment
      const currentDate = new Date()
      const dateStr = `${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.${currentDate.getDate().toString().padStart(2, '0')}.${currentDate.getFullYear().toString().slice(-2)}`
      const fullComment = `${userType}-${genCode}-${dateStr}-${comment}`

      // Calculate data limit in bytes
      const dataLimitBytes = dataLimit
        ? this.calculateDataLimit(dataLimit)
        : undefined

      const users: { username: string; password: string }[] = []

      // Calculate actual random string length (subtract prefix length)
      const prefixLength = prefix.length
      const actualRandomLength = Math.max(1, userLength - prefixLength)

      // Generate users based on type
      for (let i = 1; i <= qty; i++) {
        let username = ''
        let password = ''

        if (userType === 'up') {
          // User + Password mode - username dan password berbeda
          // Username dengan prefix, random string disesuaikan agar total = userLength
          username =
            prefix + this.generateRandomString(actualRandomLength, charType)
          // Password tanpa prefix, menggunakan userLength penuh
          password = this.generateRandomString(userLength, charType)
        } else if (userType === 'vc') {
          // Voucher Code mode (username = password)
          if (charType === 'num') {
            const code = this.generateRandomString(actualRandomLength, 'num')
            username = prefix + code
            password = username
          } else {
            let codeLength = actualRandomLength
            let numLength = 2 // default

            // Adjust lengths based on actualRandomLength (bukan userLength)
            if (actualRandomLength >= 6 && actualRandomLength <= 7) {
              codeLength = actualRandomLength - 3
              numLength = 3
            } else if (actualRandomLength >= 8) {
              codeLength = actualRandomLength - 4
              numLength = 4
            } else if (actualRandomLength >= 4 && actualRandomLength <= 5) {
              codeLength = actualRandomLength - 2
              numLength = 2
            } else if (actualRandomLength < 4) {
              // Jika terlalu pendek, gunakan semua untuk chars
              codeLength = actualRandomLength
              numLength = 0
            }

            if (
              ['lower1', 'upper1', 'upplow1'].includes(charType) &&
              numLength > 0
            ) {
              const charPart = this.generateRandomString(
                codeLength,
                charType.replace('1', '')
              )
              const numPart = this.generateRandomString(numLength, 'num')
              username = prefix + charPart + numPart
              password = username // Password sama dengan username untuk voucher
            } else {
              username =
                prefix + this.generateRandomString(actualRandomLength, charType)
              password = username // Password sama dengan username untuk voucher
            }
          }
        }

        users.push({ username, password })

        // Add user to MikroTik
        const userData: Record<string, string> = {
          name: username,
          password: password,
          profile: profile,
          comment: fullComment,
        }

        if (server) userData.server = server
        if (timeLimit) userData['limit-uptime'] = timeLimit
        if (dataLimitBytes)
          userData['limit-bytes-total'] = dataLimitBytes.toString()

        await this.connectedApi?.menu('/ip/hotspot/user/add').add(userData)
      }

      // Get created users by comment
      const createdUsers = await this.connectedApi
        ?.menu('/ip/hotspot/user/print')
        .where({ comment: fullComment })
        .get()

      if (createdUsers && createdUsers.length > 0) {
        return {
          message: 'success',
          data: {
            count: createdUsers.length,
            comment: fullComment,
            profile: profile,
            users: createdUsers,
          },
        }
      } else {
        return {
          message: 'success',
          data: {
            count: qty,
            comment: fullComment,
            profile: profile,
            users: users,
          },
        }
      }
    } catch (error) {
      console.error('Error generating vouchers:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  async getParentQueues() {
    const result = await this.connectedApi
      ?.menu('/queue/simple/print')
      .where('dynamic', 'false')
      .getAll()
    if (result.length > 0) {
      return result
    }
    return []
  }

  async getHotspotServers() {
    const result = await this.connectedApi?.menu('/ip/hotspot/print').getAll()
    if (result.length > 0) {
      return result
    }
    return []
  }

  async getHotspotHosts() {
    const result = await this.connectedApi
      ?.menu('/ip/hotspot/host/print')
      .getAll()
    if (result.length > 0) {
      return result
    }
    return []
  }

  async getFirewallNat() {
    const result = await this.connectedApi
      ?.menu('/ip/firewall/nat/print')
      .getAll()
    if (result.length > 0) {
      return result
    }
    return []
  }

  // Expire Monitor Methods
  async setupExpireMonitor(
    expireMonitorScript: string
  ): Promise<ExpireMonitorResponse> {
    try {
      if (!expireMonitorScript || expireMonitorScript.trim() === '') {
        throw new Error('Expire monitor script is required')
      }

      // Check if expire monitor already exists
      const existingMonitor = await this.connectedApi
        ?.menu('/system/scheduler/print')
        .where({ name: 'Expire-Monitor' })
        .get()
      console.log('exsisten', existingMonitor)

      // Case 1: Monitor doesn't exist - create new one
      if (!existingMonitor) {
        const result = await this.connectedApi
          ?.menu('/system/scheduler/add')
          .add({
            name: 'Expire-Monitor',
            'start-time': '00:00:00',
            interval: '00:01:00',
            'on-event': expireMonitorScript,
            disabled: 'no',
            comment: 'Expire Monitor System - Auto-generated',
          })
        // const tes = await this.exec("/system/scheduler/add", ['name', 'Expire-Monitor', 'start-time', '00:00:00', 'interval', '00:01:00', 'on-event', expireMonitorScript, 'disabled', 'no', 'comment', 'Expire Monitor System - Auto-generated']);
        console.log('result', result)

        return {
          message: 'Expire monitor created successfully',
          action: 'created',
          data: {
            id: result?.ret,
            name: 'Expire-Monitor',
          },
        }
      }

      // Monitor exists - get details
      const monitor = existingMonitor[0]

      // Case 2: Monitor exists but disabled - enable and update
      if (monitor.disabled) {
        await this.connectedApi
          ?.menu('/system/scheduler/set')
          .select(monitor.id)
          .set({
            'start-time': '00:00:00',
            interval: '00:01:00',
            'on-event': expireMonitorScript,
            disabled: 'no',
          })

        return {
          message: 'Expire monitor enabled and updated successfully',
          action: 'updated',
          data: {
            id: monitor.id,
            name: monitor.name,
          },
        }
      }

      // Case 3: Monitor exists and enabled - update script only
      await this.connectedApi
        ?.menu('/system/scheduler/set')
        .select(monitor.id)
        .set({
          'on-event': expireMonitorScript,
        })

      return {
        message: 'Expire monitor already exists and is active',
        action: 'already_exists',
        data: {
          id: monitor.id,
          name: monitor.name,
        },
      }
    } catch (error) {
      console.error('Error setting up expire monitor:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to setup expire monitor'
      )
    }
  }

  /**
   * Get expire monitor status
   */
  async getExpireMonitorStatus(): Promise<{
    exists: boolean
    enabled: boolean
    data?: any
  }> {
    try {
      const monitor = await this.connectedApi
        ?.menu('/system/scheduler/print')
        .where({ name: 'Expire-Monitor' })
        .get()

      if (!monitor || monitor.length === 0) {
        return {
          exists: false,
          enabled: false,
        }
      }

      const monitorData = monitor[0]
      return {
        exists: true,
        enabled: monitorData.disabled !== 'true',
        data: {
          id: monitorData['.id'],
          name: monitorData.name,
          startTime: monitorData['start-time'],
          interval: monitorData.interval,
          nextRun: monitorData['next-run'],
          runCount: monitorData['run-count'],
          disabled: monitorData.disabled === 'true',
        },
      }
    } catch (error) {
      console.error('Error getting expire monitor status:', error)
      throw error
    }
  }

  /**
   * Disable expire monitor
   */
  async disableExpireMonitor(): Promise<{ message: string }> {
    try {
      const monitor = await this.connectedApi
        ?.menu('/system/scheduler/print')
        .where({ name: 'Expire-Monitor' })
        .get()

      if (!monitor || monitor.length === 0) {
        throw new Error('Expire monitor not found')
      }

      await this.connectedApi
        ?.menu('/system/scheduler/set')
        .select(monitor[0]['.id'])
        .set({ disabled: 'yes' })

      return { message: 'Expire monitor disabled successfully' }
    } catch (error) {
      console.error('Error disabling expire monitor:', error)
      throw error
    }
  }

  /**
   * Enable expire monitor
   */
  async enableExpireMonitor(): Promise<{ message: string }> {
    try {
      const monitor = await this.connectedApi
        ?.menu('/system/scheduler/print')
        .where({ name: 'Expire-Monitor' })
        .get()

      if (!monitor || monitor.length === 0) {
        throw new Error('Expire monitor not found')
      }

      await this.connectedApi
        ?.menu('/system/scheduler/set')
        .select(monitor[0]['.id'])
        .set({ disabled: 'no' })

      return { message: 'Expire monitor enabled successfully' }
    } catch (error) {
      console.error('Error enabling expire monitor:', error)
      throw error
    }
  }

  /**
   * Remove expire monitor
   */
  async removeExpireMonitor(): Promise<{ message: string }> {
    try {
      const monitor = await this.connectedApi
        ?.menu('/system/scheduler/print')
        .where({ name: 'Expire-Monitor' })
        .get()

      if (!monitor || monitor.length === 0) {
        throw new Error('Expire monitor not found')
      }

      await this.connectedApi
        ?.menu('/system/scheduler/remove')
        .select(monitor[0]['.id'])
        .remove()

      return { message: 'Expire monitor removed successfully' }
    } catch (error) {
      console.error('Error removing expire monitor:', error)
      throw error
    }
  }

  // Report Methods
  async getReportByDate(date: string, useCache: boolean = true) {
    try {
      const today = new Date()
        .toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        })
        .toLowerCase()

      // For current day, always get fresh data
      if (today === date.toLowerCase()) {
        const result = await this.connectedApi
          ?.menu('/system/script/print')
          .where({ source: date })
          .get()

        return result || []
      }

      // For other dates, implement caching logic based on force parameter
      if (!useCache) {
        // Get total count first to check if data changed
        const totalCount = await this.connectedApi
          ?.menu('/system/script/print')
          .where({ source: date })
          .getAll()

        const result = await this.connectedApi
          ?.menu('/system/script/print')
          .where({ source: date })
          .get()

        return result || []
      }

      // Default behavior - get cached or fresh data
      const result = await this.connectedApi
        ?.menu('/system/script/print')
        .where({ source: date })
        .get()

      return result || []
    } catch (error) {
      console.error('Error getting report by date:', error)
      throw error
    }
  }

  async getReportCount(date: string): Promise<number> {
    try {
      const result = await this.connectedApi
        ?.menu('/system/script/print')
        .where({ source: date })
        .getAll()

      return result.length || 0
    } catch (error) {
      console.error('Error getting report count:', error)
      return 0
    }
  }

  // System Scripts Management
  async getSystemScripts(filter?: { source?: string; name?: string }) {
    try {
      let query = this.connectedApi?.menu('/system/script/print')

      if (filter?.source) {
        query = query?.where({ source: filter.source })
      }

      if (filter?.name) {
        query = query?.where({ name: filter.name })
      }

      const result = await query?.get()
      return result || []
    } catch (error) {
      console.error('Error getting system scripts:', error)
      throw error
    }
  }

  async addSystemScript(config: {
    name: string
    source: string
    comment?: string
    disabled?: boolean
  }): Promise<UserResponse> {
    try {
      const scriptData: Record<string, string> = {
        name: config.name,
        source: config.source,
        disabled: config.disabled ? 'yes' : 'no',
      }

      if (config.comment) {
        scriptData.comment = config.comment
      }

      const result = await this.connectedApi
        ?.menu('/system/script/add')
        .add(scriptData)

      if (result?.trap && result.trap.length > 0) {
        const errorMessage = result.trap[0].message || 'Unknown error occurred'
        return {
          message: 'error',
          data: { error: errorMessage },
        }
      }

      return {
        message: 'success',
        data: { name: config.name, created: true },
      }
    } catch (error) {
      console.error('Error adding system script:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  // Scheduler Management
  async getSchedulers(name?: string) {
    try {
      let query = this.connectedApi?.menu('/system/scheduler/print')

      if (name) {
        query = query?.where({ name: name })
      }

      const result = await query?.get()
      return result || []
    } catch (error) {
      console.error('Error getting schedulers:', error)
      throw error
    }
  }

  async addScheduler(config: {
    name: string
    startTime: string
    interval: string
    onEvent: string
    disabled?: boolean
    comment?: string
  }): Promise<UserResponse> {
    try {
      const schedulerData: Record<string, string> = {
        name: config.name,
        'start-time': config.startTime,
        interval: config.interval,
        'on-event': config.onEvent,
        disabled: config.disabled ? 'yes' : 'no',
      }

      if (config.comment) {
        schedulerData.comment = config.comment
      }

      const result = await this.connectedApi
        ?.menu('/system/scheduler/add')
        .add(schedulerData)

      if (result?.trap && result.trap.length > 0) {
        const errorMessage = result.trap[0].message || 'Unknown error occurred'
        return {
          message: 'error',
          data: { error: errorMessage },
        }
      }

      return {
        message: 'success',
        data: { name: config.name, created: true },
      }
    } catch (error) {
      console.error('Error adding scheduler:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  async updateScheduler(
    schedulerId: string,
    updates: {
      startTime?: string
      interval?: string
      onEvent?: string
      disabled?: boolean
      comment?: string
    }
  ): Promise<UserResponse> {
    try {
      const updateData: Record<string, string> = {}

      if (updates.startTime) updateData['start-time'] = updates.startTime
      if (updates.interval) updateData.interval = updates.interval
      if (updates.onEvent) updateData['on-event'] = updates.onEvent
      if (updates.disabled !== undefined)
        updateData.disabled = updates.disabled ? 'yes' : 'no'
      if (updates.comment) updateData.comment = updates.comment

      const result = await this.connectedApi
        ?.menu('/system/scheduler/set')
        .where({ '.id': schedulerId })
        .set(updateData)

      if (result?.trap && result.trap.length > 0) {
        const errorMessage = result.trap[0].message || 'Unknown error occurred'
        return {
          message: 'error',
          data: { error: errorMessage },
        }
      }

      return {
        message: 'success',
        data: { updated: true },
      }
    } catch (error) {
      console.error('Error updating scheduler:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  async removeScheduler(schedulerId: string): Promise<UserResponse> {
    try {
      const result = await this.connectedApi
        ?.menu('/system/scheduler/remove')
        .where({ '.id': schedulerId })
        .remove()

      if (result?.trap && result.trap.length > 0) {
        const errorMessage = result.trap[0].message || 'Unknown error occurred'
        return {
          message: 'error',
          data: { error: errorMessage },
        }
      }

      return {
        message: 'success',
        data: { deleted: true },
      }
    } catch (error) {
      console.error('Error removing scheduler:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  // Generic Remove Methods
  async removeById(where: string, id: string): Promise<{ message: string }> {
    try {
      let menuPath = ''

      switch (where) {
        case 'user_':
          menuPath = '/ip/hotspot/user/remove'
          break
        case 'profile_':
          menuPath = '/ip/hotspot/user/profile/remove'
          break
        case 'active_':
          menuPath = '/ip/hotspot/active/remove'
          break
        case 'host_':
          menuPath = '/ip/hotspot/host/remove'
          break
        default:
          throw new Error(`Invalid remove target: ${where}`)
      }

      const result = await this.connectedApi
        ?.menu(menuPath)
        .where({ '.id': id })
        .remove()

      if (result?.trap && result.trap.length > 0) {
        const errorMessage = result.trap[0].message || 'Unknown error occurred'
        throw new Error(errorMessage)
      }

      return { message: 'success' }
    } catch (error) {
      console.error(`Error removing ${where} with id ${id}:`, error)
      return { message: 'error' }
    }
  }

  // Active Session Management
  async getActiveUsers(): Promise<UserResponse> {
    try {
      const result = await this.connectedApi
        ?.menu('/ip/hotspot/active/print')
        .get()

      return {
        message: 'success',
        data: result || [],
      }
    } catch (error) {
      console.error('Error getting active users:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  async removeActiveUser(activeId: string): Promise<UserResponse> {
    try {
      const result = await this.connectedApi
        ?.menu('/ip/hotspot/active/remove')
        .where({ '.id': activeId })
        .remove()

      if (result?.trap && result.trap.length > 0) {
        const errorMessage = result.trap[0].message || 'Unknown error occurred'
        return {
          message: 'error',
          data: { error: errorMessage },
        }
      }

      return {
        message: 'success',
        data: { disconnected: true },
      }
    } catch (error) {
      console.error('Error removing active user:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  // Host Management
  async getHosts(): Promise<UserResponse> {
    try {
      const result = await this.connectedApi
        ?.menu('/ip/hotspot/host/print')
        .get()

      return {
        message: 'success',
        data: result || [],
      }
    } catch (error) {
      console.error('Error getting hosts:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }

  async removeHost(hostId: string): Promise<UserResponse> {
    try {
      const result = await this.connectedApi
        ?.menu('/ip/hotspot/host/remove')
        .where({ '.id': hostId })
        .remove()

      if (result?.trap && result.trap.length > 0) {
        const errorMessage = result.trap[0].message || 'Unknown error occurred'
        return {
          message: 'error',
          data: { error: errorMessage },
        }
      }

      return {
        message: 'success',
        data: { removed: true },
      }
    } catch (error) {
      console.error('Error removing host:', error)
      return {
        message: 'error',
        data: {
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      }
    }
  }
}

export const createMikrotikHotspot = MikrotikHotspot.createFromDatabase
export const createMikrotikHotspotDirect = MikrotikHotspot.createDirect

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