import { z } from 'zod';


// PPPoE User Schema
export const pppoeUserSchema = z.object({
  '.id': z.string().optional(),
  name: z.string(),
  service: z
    .enum(['async', 'isdn', 'l2tp', 'pppoe', 'pptp', 'ovpn', 'sstp'])
    .default('pppoe'),
  'caller-id': z.string().optional(),
  password: z.string().optional(),
  profile: z.string().optional(),
  routes: z.string().optional(),
  'ipv6-routes': z.string().optional(),
  'limit-bytes-in': z.string().optional(),
  'limit-bytes-out': z.string().optional(),
  'last-logged-out': z.string().optional(),
  disabled: z.preprocess(
  (val) => {
    if (typeof val === "string") {
      return val.toLowerCase() === "true";
    }
    return val;
  },
  z.boolean().optional()),
  'local-address': z.string().optional(),
  'remote-address': z.string().optional(),
  'remote-ipv6-prefix': z.string().optional(),
})

// PPPoE Active Session Schema
export const pppoeActiveSchema = z.object({
  '.id': z.string(),
  name: z.string(),
  service: z.enum(["async","isdn","l2tp","pppoe","pptp","ovpn","sstp"]),
  'caller-id': z.string().optional(),
  address: z.string().optional(),
  uptime: z.string().optional(),
  encoding: z.string().optional(),
  'session-id': z.string().optional(),
  'limit-bytes-in': z.string().optional(),
  'limit-bytes-out': z.string().optional(),
})

// PPPoE Profile Schema
export const pppoeProfileSchema = z.object({
  '.id': z.string().optional(),
  name: z.string(),
  'local-address': z.string().optional(),
  'remote-address': z.string().optional(),
  'use-compression': z.enum(['default', 'yes', 'no']).optional(),
  'use-vj-compression': z.enum(['default', 'yes', 'no']).optional(),
  'use-encryption': z.enum(['default', 'yes', 'no', 'required']).optional(),
  'only-one': z.enum(['default', 'yes', 'no']).optional(),
  'change-tcp-mss': z.enum(['default', 'yes', 'no']).optional(),
  'use-upnp': z.enum(['default', 'yes', 'no']).optional(),
  'address-list': z.string().optional(),
  'rate-limit': z.string().optional(),
  'session-timeout': z.string().optional(),
  'idle-timeout': z.string().optional(),
  'keepalive-timeout': z.string().optional(),
  comment: z.string().optional(),
})

// Exported Types
export type PppoeUser = z.infer<typeof pppoeUserSchema>
export type PppoeActive = z.infer<typeof pppoeActiveSchema>
export type PppoeProfile = z.infer<typeof pppoeProfileSchema>