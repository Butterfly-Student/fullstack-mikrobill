import z from 'zod';
import { createServerFn } from '@tanstack/react-start';
import { createMikrotikHotspot, type UserConfig, type VoucherConfig } from '@/lib/mikrotik/hotspot';
import { type HotspotUserForm, type HotspotUser } from '../data/schema';


interface MikrotikApiResult<T = unknown> {
  message: 'success' | 'error'
  data: T extends 'error' ? { error: string } : T
}

const hotspotUserValidator = z.object({
  routerId: z.number().optional().nullable().default(null),
  commentFilter: z.string().optional(),
})

// Get all hotspot users
export const getHotspotUsers = createServerFn()
  .validator((data) => hotspotUserValidator.parse(data))
  .handler(async ({ data }) => {
    console.info('Fetching MikroTik hotspot users...')

    try {
      const { routerId, commentFilter } = data

      if (!routerId) {
        throw new Error('Router ID is required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = (await hotspot.listUsers(
        commentFilter
      )) as MikrotikApiResult<HotspotUser[]>

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }

      // Use data directly without conversion
      const users: HotspotUser[] = result.data as HotspotUser[]

      return {
        success: true,
        data: users,
        total: users.length,
      }
    } catch (error) {
      console.error('Error fetching MikroTik users:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch users'
      )
    }
  })

// Create new hotspot user
export const createHotspotUser = createServerFn()
  .validator((data: { routerId: number | undefined } & HotspotUserForm) => data)
  .handler(async ({ data }) => {
    console.info('Creating MikroTik hotspot user...')

    try {
      const { routerId, ...userData } = data

      if (!routerId) {
        throw new Error('Router ID is required')
      }

      // Validate required fields based on HotspotUser schema
      if (!userData.name) {
        throw new Error('Name is required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = (await hotspot.addUser(
        userData
      )) as MikrotikApiResult<string>

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }

      return {
        success: true,
        message: 'User created successfully',
        data: result.data,
      }
    } catch (error) {
      console.error('Error creating MikroTik user:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to create user'
      )
    }
  })

// Update hotspot user
export const updateHotspotUser = createServerFn()
  .validator(
    (
      data: {
        routerId: number | undefined
        userId: string
      } & Partial<UserConfig>
    ) => data
  )
  .handler(async ({ data }) => {
    console.info('Updating MikroTik hotspot user...')

    try {
      const { routerId, userId, ...userData } = data

      if (!routerId || !userId) {
        throw new Error('Router ID and User ID are required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = (await hotspot.updateUser(
        userId,
        userData
      )) as MikrotikApiResult<string>

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }

      return {
        success: true,
        message: 'User updated successfully',
        data: result.data,
      }
    } catch (error) {
      console.error('Error updating MikroTik user:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to update user'
      )
    }
  })

// Delete hotspot user
export const deleteHotspotUser = createServerFn()
  .validator((data: { routerId: number | undefined; userId: string }) => data)
  .handler(async ({ data }) => {
    console.info('Deleting MikroTik hotspot user...')

    try {
      const { routerId, userId } = data

      if (!routerId || !userId) {
        throw new Error('Router ID and User ID are required')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = (await hotspot.deleteUser(
        userId
      )) as MikrotikApiResult<string>

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }

      return {
        success: true,
        message: 'User deleted successfully',
      }
    } catch (error) {
      console.error('Error deleting MikroTik user:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete user'
      )
    }
  })


export const generateBatchUsers = createServerFn()
  .validator((data: { routerId: number } & VoucherConfig) => data)
  .handler(async ({ data }) => {
    console.info('Generating batch MikroTik users...')

    try {
      const { routerId, ...voucherConfig } = data

      if (!routerId) {
        throw new Error('Router ID is required')
      }

      // Validate required fields
      const requiredFields = [
        'qty',
        'userType',
        'userLength',
        'charType',
        'profile',
      ]
      const missingFields = requiredFields.filter(
        (field) => !voucherConfig[field as keyof VoucherConfig]
      )

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      // Validate qty range
      if (voucherConfig.qty < 1 || voucherConfig.qty > 1000) {
        throw new Error('Quantity must be between 1 and 1000')
      }

      // Validate userType
      if (!['up', 'vc'].includes(voucherConfig.userType)) {
        throw new Error(
          "userType must be either 'up' (user+password) or 'vc' (voucher code)"
        )
      }

      // Validate charType
      const validCharTypes = [
        'lower',
        'upper',
        'upplow',
        'mix',
        'mix1',
        'mix2',
        'num',
        'lower1',
        'upper1',
        'upplow1',
      ]
      if (!validCharTypes.includes(voucherConfig.charType)) {
        throw new Error(
          `charType must be one of: ${validCharTypes.join(', ')}`
        )
      }

      // Validate userLength
      if (voucherConfig.userLength < 3 || voucherConfig.userLength > 20) {
        throw new Error('userLength must be between 3 and 20 characters')
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = await hotspot.generateVouchers(voucherConfig)

      if (result.message === 'error') {
        throw new Error((result.data as unknown as { error: string }).error)
      }

      // Format the response
      const formattedUsers =
        result.data.users?.map((user: any) => {
          if (typeof user === 'object' && user['.id']) {
            // MikroTik API response format
            return {
              id: user['.id'],
              name: user.name,
              password: user.password,
              profile: user.profile,
              server: user.server,
              comment: user.comment,
              disabled: user.disabled === 'true',
              limitUptime: user['limit-uptime'],
              limitBytesTotal: user['limit-bytes-total'],
              created: true,
            }
          } else if (typeof user === 'object' && user.username) {
            // Generated user format
            return {
              username: user.username,
              password: user.password,
              profile: voucherConfig.profile,
              comment: result.data.comment,
              created: true,
            }
          }
          
          return user
        }) || []

      return {
        success: true,
        message: `Successfully generated ${result.data.count} users`,
        data: {
          count: result.data.count,
          comment: result.data.comment,
          profile: result.data.profile,
          users: formattedUsers,
          config: {
            qty: voucherConfig.qty,
            userType: voucherConfig.userType,
            userLength: voucherConfig.userLength,
            charType: voucherConfig.charType,
            prefix: voucherConfig.prefix || '',
            timeLimit: voucherConfig.timeLimit,
            dataLimit: voucherConfig.dataLimit,
            genCode: voucherConfig.genCode || '',
          },
        },
      }
    } catch (error) {
      console.error('Error generating MikroTik user batch:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to generate user batch'
      )
    }
  })

// Type definitions for request validation
export interface BatchGenerationRequest {
  routerId: number
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

export interface BatchGenerationResponse {
  success: boolean
  message: string
  data: {
    count: number
    comment: string
    profile: string
    users: Array<{
      id?: string
      username?: string
      name?: string
      password: string
      profile: string
      server?: string
      comment: string
      disabled?: boolean
      limitUptime?: string
      limitBytesTotal?: string
      created: boolean
    }>
    config: {
      qty: number
      userType: string
      userLength: number
      charType: string
      prefix: string
      timeLimit?: string
      dataLimit?: string
      genCode: string
    }
  }
}