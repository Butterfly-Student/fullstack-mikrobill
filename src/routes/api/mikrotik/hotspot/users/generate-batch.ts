// api/mikrotik/hotspot/users/generate-batch.ts
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { createMikrotikHotspot, type VoucherConfig } from '@/lib/mikrotik/hotspot'

export const ServerRoute = createServerFileRoute(
  '/api/mikrotik/hotspot/users/generate-batch'
).methods({
  POST: async ({ request }) => {
    console.info('Generating batch MikroTik users... @', request.url)

    try {
      const body = await request.json()
      const { routerId, ...voucherConfig } = body as {
        routerId: number
      } & VoucherConfig

      if (!routerId) {
        return json({ error: 'Router ID is required' }, { status: 400 })
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
        return json(
          {
            error: `Missing required fields: ${missingFields.join(', ')}`,
          },
          { status: 400 }
        )
      }

      // Validate qty range
      if (voucherConfig.qty < 1 || voucherConfig.qty > 1000) {
        return json(
          {
            error: 'Quantity must be between 1 and 1000',
          },
          { status: 400 }
        )
      }

      // Validate userType
      if (!['up', 'vc'].includes(voucherConfig.userType)) {
        return json(
          {
            error:
              "userType must be either 'up' (user+password) or 'vc' (voucher code)",
          },
          { status: 400 }
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
        return json(
          {
            error: `charType must be one of: ${validCharTypes.join(', ')}`,
          },
          { status: 400 }
        )
      }

      // Validate userLength
      if (voucherConfig.userLength < 3 || voucherConfig.userLength > 20) {
        return json(
          {
            error: 'userLength must be between 3 and 20 characters',
          },
          { status: 400 }
        )
      }

      const hotspot = await createMikrotikHotspot(routerId)
      const result = await hotspot.generateVouchers(voucherConfig)

      if (result.message === 'error') {
        return json({ error: result.data.error }, { status: 400 })
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

      return json(
        {
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
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('Error generating MikroTik user batch:', error)
      return json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to generate user batch',
        },
        { status: 500 }
      )
    }
  },
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
