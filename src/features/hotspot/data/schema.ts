import { z } from 'zod';


// User status  - untuk hotspot user status
const _userStatus = z.union([
  z.literal('active'),
  z.literal('non-active'),
])
export type UserStatus = z.infer<typeof _userStatus>


// Character set  - untuk generate voucher
const characterSet = z.union([
  z.literal('alphanumeric'),
  z.literal('numeric'),
  z.literal('alphabetic'),
  z.literal('custom'),
])
export type CharacterSet = z.infer<typeof characterSet>


export type ExpiredMode = z.infer<typeof expiredMode>

// Lock setting  - untuk profile
// enum/union biar strict
const expiredMode = z.enum(["rem", "remc", "ntf", "ntfc", "0"])
const lockSetting = z.enum(["Enable", "Disable"])

// Login method 
const loginBy = z.union([
  z.literal('cookie'),
  z.literal('http-pap'),
  z.literal('https'),
  z.literal('mac'),
  z.literal('trial'),
])

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
  genCode: z.string().optional(),
})
export type GenerateVoucher = z.infer<typeof generateVoucher>

// User 
export const HotspotUser = z.object({
  id: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  comment: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  limitBytesIn: z.number().optional().nullable(),
  limitBytesOut: z.number().optional().nullable(),
  limitBytesTotal: z.number().optional().nullable(),
  limitUptime: z.string().optional().nullable(),
  macAddress: z.string().optional().nullable(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  password: z.string().optional().nullable(),
  profile: z.string().optional().nullable(),
  routes: z.string().optional().nullable(),
  server: z.string().optional().nullable(),
})
export type HotspotUser = z.infer<typeof HotspotUser>

export const Profile = z.object({
  name: z.string(),
  sharedUsers: z.number(),
  rateLimit: z.string(),
  expiredMode,
  validity: z.string(),
  price: z.string(),
  sellingPrice: z.string(),
  addressPool: z.string(),
  lockUser: lockSetting,
  lockServer: lockSetting,
  parentQueue: z.string(),

  // field tambahan kalau mau extend
  statusAutoRefresh: z.string(),
  onLogin: z.string(),

  // tambahan dari schema lama (opsional)
  bandwidth: z.string(),
  sessionTimeout: z.string(),
  idleTimeout: z.string(),
  downloadLimit: z.string(),
  uploadLimit: z.string(),
  maxSessions: z.string(),
})

export type Profile = z.infer<typeof Profile>

export type ProfileForm = Omit<Profile, "onLogin">



export const ActiveUserSchema = z.object({
  '.id': z.string().optional().nullable(),
  server: z.string().min(1),
  user: z.string().min(1),
  address: z
    .string()
    .regex(
      /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      'Invalid IP address'
    ),
  'mac-address': z.string().optional().nullable(),
  uptime: z.string().optional().nullable(),
  'idle-time': z.string().optional().nullable(),
  'session-time-left': z.string().optional().nullable(),
  'idle-timeout': z.string().optional().nullable(),
  'keepalive-timeout': z.string().optional().nullable(),
  'bytes-in': z.string().optional().nullable(),
  'packets-in': z.string().optional().nullable(),
  'bytes-out': z.string().optional().nullable(),
  'packets-out': z.string().optional().nullable(),
  'login-by': loginBy.optional().nullable(),
})

export type ActiveUser = z.infer<typeof ActiveUserSchema>

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

export const hostsTableList = z.array(Hosts)
export type HostsTableList = z.infer<typeof hostsTableList>

export const nonActiveTableList = z.array(NonActiveUser)
export type NonActiveTableList = z.infer<typeof nonActiveTableList>

export const userList = z.array(HotspotUser)
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
  | HotspotUser
  | Profile
  | GenerateVoucher
  | Hosts
  | NonActiveUser
  | ActiveUser