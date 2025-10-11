import { z } from 'zod';


// ============================================
// ENUMS & UNIONS
// ============================================

// User status - untuk hotspot user status
const _userStatus = z.union([z.literal('active'), z.literal('non-active')])
export type UserStatus = z.infer<typeof _userStatus>

// Character set - untuk generate voucher
const characterSet = z.union([
  z.literal('alphanumeric'),
  z.literal('numeric'),
  z.literal('alphabetic'),
  z.literal('custom'),
])
export type CharacterSet = z.infer<typeof characterSet>

// Lock setting - untuk profile
const lockSetting = z.enum(['Enable', 'Disable'])

// Expired mode - untuk profile
const expiredMode = z.enum(['rem', 'remc', 'ntf', 'ntfc', '0'])
export type ExpiredMode = z.infer<typeof expiredMode>

// Login method
const loginBy = z.union([
  z.literal('cookie'),
  z.literal('http-pap'),
  z.literal('https'),
  z.literal('mac'),
  z.literal('trial'),
])

// ============================================
// HOTSPOT USER SCHEMAS
// ============================================

// Schema untuk database/API response
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

// Schema untuk Form (react-hook-form)
export const hotspotUserFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' })
    .optional(),
  server: z.string().min(1, { message: 'Server must be selected.' }),
  profile: z
    .string()
    .min(1, { message: 'Profile must be selected.' })
    .optional(),
  address: z
    .string()
    .regex(
      /^(?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(?:\d{1,3}\.){3}\d{1,3})$/,
      'Invalid IP address'
    )
    .optional()
    .or(z.literal('')),
  macAddress: z
    .string()
    .regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, 'Invalid MAC address')
    .optional()
    .or(z.literal('')),
  email: z
    .email({ message: 'Invalid email address' })
    .optional()
    .or(z.literal('')),
  timeLimit: z.string().optional(),
  dataLimit: z.string().optional(),
  disabled: z.boolean().optional(),
  routes: z.string().optional(),
  comment: z.string().optional(),
})
export type HotspotUserForm = z.infer<typeof hotspotUserFormSchema>

// Schema untuk Create dengan validation ketat
export const hotspotUserCreateSchema = hotspotUserFormSchema.extend({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
  server: z.string().min(1, { message: 'Server must be selected.' }),
  profile: z
    .string()
    .min(1, { message: 'Profile must be selected.' })
    .optional(),
})
export type HotspotUserCreate = z.infer<typeof hotspotUserCreateSchema>

// Schema untuk Update (semua field optional kecuali name)
export const hotspotUserUpdateSchema = hotspotUserFormSchema.partial().extend({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .optional(),
})
export type HotspotUserUpdate = z.infer<typeof hotspotUserUpdateSchema>

// ============================================
// GENERATE VOUCHER SCHEMAS
// ============================================

// Schema untuk database/API
export const generateVoucher = z.object({
  qty: z
    .string()
    .min(1, { message: 'Quantity must be at least 1.' })
    .refine(
      (val) => {
        const num = parseInt(val)
        return num >= 1 && num <= 1000
      },
      { message: 'Quantity must be between 1 and 1000.' }
    ),
  server: z.string().min(1, { message: 'Server must be selected.' }),
  nameLength: z
    .string()
    .min(1, { message: 'Name length must be specified.' })
    .refine(
      (val) => {
        const num = parseInt(val)
        return num >= 1 && num <= 20
      },
      { message: 'Name length must be between 1 and 20.' }
    ),
  prefix: z.string().optional(),
  characters: characterSet,
  profile: z.string().min(1, { message: 'Profile must be selected.' }),
  timeLimit: z.string().optional(),
  comment: z.string().optional(),
  dataLimit: z.string().optional(),
  genCode: z.string().optional(),
})
export type GenerateVoucher = z.infer<typeof generateVoucher>

// Schema untuk Form (sama dengan yang asli, sudah bagus)
export const generateVoucherFormSchema = generateVoucher
export type GenerateVoucherForm = z.infer<typeof generateVoucherFormSchema>

// Jika mau yang lebih strict untuk create
export const generateVoucherCreateSchema = generateVoucher.extend({
  qty: z
    .string()
    .min(1, { message: 'Quantity must be at least 1.' })
    .refine(
      (val) => {
        const num = parseInt(val)
        return num >= 1 && num <= 1000
      },
      { message: 'Quantity must be between 1 and 1000.' }
    ),
  server: z.string().min(1, { message: 'Server must be selected.' }),
  profile: z.string().min(1, { message: 'Profile must be selected.' }),
})
export type GenerateVoucherCreate = z.infer<typeof generateVoucherCreateSchema>

// ============================================
// PROFILE SCHEMAS
// ============================================

// Schema untuk database/API response
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
  statusAutoRefresh: z.string(),
  onLogin: z.string(),
  bandwidth: z.string(),
  sessionTimeout: z.string(),
  idleTimeout: z.string(),
  downloadLimit: z.string(),
  uploadLimit: z.string(),
  maxSessions: z.string(),
})
export type Profile = z.infer<typeof Profile>

// Schema untuk Form (tanpa onLogin)
export const profileFormSchema = z.object({
  name: z.string().min(1, { message: 'Profile name is required.' }),
  sharedUsers: z.string().refine(
    (val) => {
      const num = parseInt(val)
      return num >= 1
    },
    { message: 'Shared users must be at least 1.' }
  ),
  rateLimit: z.string().optional(),
  expiredMode: expiredMode.default('rem'),
  validity: z.string().optional(),
  price: z.string().optional(),
  sellingPrice: z.string().optional(),
  addressPool: z.string().optional(),
  lockUser: lockSetting.default('Disable'),
  lockServer: lockSetting.default('Disable'),
  parentQueue: z.string().optional(),
  statusAutoRefresh: z.string().optional(),
  bandwidth: z.string().optional(),
  sessionTimeout: z.string().optional(),
  idleTimeout: z.string().optional(),
  downloadLimit: z.string().optional(),
  uploadLimit: z.string().optional(),
  maxSessions: z.string().optional(),
})
export type ProfileForm = z.infer<typeof profileFormSchema>

// Schema untuk Create dengan validation ketat
export const profileCreateSchema = profileFormSchema.extend({
  name: z.string().min(1, { message: 'Profile name is required.' }),
  sharedUsers: z.string().refine(
    (val) => {
      const num = parseInt(val)
      return num >= 1 && num <= 100
    },
    { message: 'Shared users must be between 1 and 100.' }
  ),
})
export type ProfileCreate = z.infer<typeof profileCreateSchema>

// Schema untuk Update (semua field optional)
export const profileUpdateSchema = profileFormSchema.partial()
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>

// ============================================
// ACTIVE USER SCHEMA
// ============================================

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

// ============================================
// HOSTS SCHEMA
// ============================================

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

// ============================================
// NON-ACTIVE USER SCHEMA
// ============================================

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

// ============================================
// ARRAY SCHEMAS
// ============================================

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