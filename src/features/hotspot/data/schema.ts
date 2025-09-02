import { z } from 'zod';


// User status  - untuk hotspot user status
const _userStatus = z.union([
  z.literal('active'),
  z.literal('non-active'),
])
export type UserStatus = z.infer<typeof _userStatus>

// User mode  - untuk generate voucher
const userMode = z.union([
  z.literal('single'),
  z.literal('batch'),
  z.literal('bulk'),
])
export type UserMode = z.infer<typeof userMode>

// Character set  - untuk generate voucher
const characterSet = z.union([
  z.literal('alphanumeric'),
  z.literal('numeric'),
  z.literal('alphabetic'),
  z.literal('custom'),
])
export type CharacterSet = z.infer<typeof characterSet>

// Expired mode  - untuk profile
const expiredMode = z.union([
  z.literal('rem'),
  z.literal('remc'),
  z.literal('ntf'),
  z.literal('ntfc'),
  z.literal('0'),
])
export type ExpiredMode = z.infer<typeof expiredMode>

// Lock setting  - untuk profile
const lockSetting = z.union([z.literal('yes'), z.literal('no')])
export type LockSetting = z.infer<typeof lockSetting>

// Login method 
const loginBy = z.union([
  z.literal('trial'),
  z.literal('mac'),
  z.literal('cookie'),
  z.literal('https'),
  z.literal('http-chap'),
  z.literal('http-pap'),
])
export type LoginBy = z.infer<typeof loginBy>

// Generate voucher 
export const generateVoucher = z.object({
  qty: z
    .string()
    .min(1, {
      message: 'Quantity must be at least 1.',
    })
    .refine(
      (val) => {
        const num = parseInt(val)
        return num >= 1 && num <= 1000
      },
      {
        message: 'Quantity must be between 1 and 1000.',
      }
    ),
  server: z.string().min(1, {
    message: 'Server must be selected.',
  }),
  userMode: userMode,
  nameLength: z
    .string()
    .min(1, {
      message: 'Name length must be specified.',
    })
    .refine(
      (val) => {
        const num = parseInt(val)
        return num >= 1 && num <= 20
      },
      {
        message: 'Name length must be between 1 and 20.',
      }
    ),
  prefix: z.string().optional(),
  characters: characterSet,
  profile: z.string().min(1, {
    message: 'Profile must be selected.',
  }),
  timeLimit: z.string().optional(),
  comment: z.string().optional(),
  dataLimit: z.string().optional(),
})
export type GenerateVoucher = z.infer<typeof generateVoucher>

// User 
export const User = z
  .object({
    server: z.string().min(1, {
      message: 'Server must be selected.',
    }),
    name: z.string().min(2, {
      message: 'Name must be at least 2 characters.',
    }),
    passwordEnabled: z.boolean(),
    password: z.string().optional(),
    macAddress: z.string().optional(),
    profile: z.string().min(1, {
      message: 'Profile must be selected.',
    }),
    timeLimit: z.string().optional(),
    dataLimit: z.string().optional(),
    comment: z.string().optional(),
    uptime: z.string().optional(),
    bytesIn: z.string().optional(),
    bytesOut: z.string().optional(),
    limitUptime: z.string().optional(),
    limitBytesTotal: z.string().optional(),
    userCode: z.string().optional(),
    expireDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        data.passwordEnabled &&
        (!data.password || data.password.length < 1)
      ) {
        return false
      }
      return true
    },
    {
      message: 'Password is required when password is enabled.',
      path: ['password'],
    }
  )
export type User = z.infer<typeof User>

// Profile 
export const Profile = z.object({
  profileName: z.string().min(2, {
    message: 'Profile name must be at least 2 characters.',
  }),
  expiredMode: expiredMode,
  price: z.string().optional(),
  sellingPrice: z.string().optional(),
  lockUser: lockSetting,
  lockServer: lockSetting,
  // Additional profile-specific fields
  bandwidth: z.string().optional(),
  sessionTimeout: z.string().optional(),
  idleTimeout: z.string().optional(),
  downloadLimit: z.string().optional(),
  uploadLimit: z.string().optional(),
  maxSessions: z.string().optional(),
  description: z.string().optional(),
})
export type Profile = z.infer<typeof Profile>

// Active table 
export const ActiveUser = z.object({
  server: z.string().min(1),
  user: z.string().min(1),
  address: z
    .string()
    .regex(
      /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/,
      'Invalid IP address'
    ),
  macAddress: z.string().optional().nullable(),
  uptime: z.string().optional().nullable(),
  bytesIn: z.string().optional().nullable(),
  bytesOut: z.string().optional().nullable(),
  timeLeft: z.string().optional().nullable(),
  loginBy: loginBy.optional().nullable(),
  comment: z.string().optional().nullable(),
})
export type ActiveUser = z.infer<typeof ActiveUser>

// Hosts table 
const Hosts = z.object({
  macAddress: z.string().min(1),
  address: z
    .string()
    .regex(
      /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/,
      'Invalid IP address'
    ),
  toAddress: z
    .string()
    .regex(
      /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/,
      'Invalid IP address'
    ),
  server: z.string().min(1),
  comment: z.string().optional().nullable(),
})
export type Hosts = z.infer<typeof Hosts>

// Non-active table 
export const NonActiveUser = z.object({
  server: z.string().min(1),
  name: z.string().min(1),
  profile: z.string().min(1),
  macAddress: z.string().optional().nullable(),
  uptime: z.string().optional().nullable(),
  bytesIn: z.string().optional().nullable(),
  bytesOut: z.string().optional().nullable(),
  comment: z.string().optional().nullable(),
})
export type NonActiveUser = z.infer<typeof NonActiveUser>

// List s
export const activeTableList = z.array(ActiveUser)
export type ActiveTableList = z.infer<typeof activeTableList>

export const hostsTableList = z.array(Hosts)
export type HostsTableList = z.infer<typeof hostsTableList>

export const nonActiveTableList = z.array(NonActiveUser)
export type NonActiveTableList = z.infer<typeof nonActiveTableList>

export const userList = z.array(User)
export type UserList = z.infer<typeof userList>

export const profileList = z.array(Profile)
export type ProfileList = z.infer<typeof profileList>

export const generateVoucherList = z.array(generateVoucher)
export type GenerateVoucherList = z.infer<typeof generateVoucherList>

// Filter s
export const activeTableFilter = z.object({
  server: z.string().optional(),
  user: z.string().optional(),
  loginBy: loginBy.optional(),
  search: z.string().optional(), // untuk search user/address
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})
export type ActiveTableFilter = z.infer<typeof activeTableFilter>

export const hostsTableFilter = z.object({
  server: z.string().optional(),
  macAddress: z.string().optional(),
  address: z.string().optional(),
  search: z.string().optional(), // untuk search mac/address
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})
export type HostsTableFilter = z.infer<typeof hostsTableFilter>

export const nonActiveTableFilter = z.object({
  server: z.string().optional(),
  profile: z.string().optional(),
  name: z.string().optional(),
  search: z.string().optional(), // untuk search name
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})
export type NonActiveTableFilter = z.infer<typeof nonActiveTableFilter>

export const userFilter = z.object({
  server: z.string().optional(),
  profile: z.string().optional(),
  passwordEnabled: z.boolean().optional(),
  search: z.string().optional(), // untuk search name
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})
export type UserFilter = z.infer<typeof userFilter>

export const profileFilter = z.object({
  expiredMode: expiredMode.optional(),
  lockUser: lockSetting.optional(),
  lockServer: lockSetting.optional(),
  search: z.string().optional(), // untuk search profile name
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})
export type ProfileFilter = z.infer<typeof profileFilter>

export const generateVoucherFilter = z.object({
  server: z.string().optional(),
  profile: z.string().optional(),
  userMode: userMode.optional(),
  characters: characterSet.optional(),
  search: z.string().optional(), // untuk search prefix/comment
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})
export type GenerateVoucherFilter = z.infer<typeof generateVoucherFilter>

export type HotspotType =
  | User
  | Profile
  | GenerateVoucher
  | Hosts
  | NonActiveUser
  | ActiveUser