import { Clock, Shield, Activity, AlertTriangle } from 'lucide-react'

// Session status types based on expiration
export type SessionStatus = 'active' | 'expired' | 'expiring-soon'

export const sessionStatusTypes = new Map<SessionStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  [
    'expired',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
  [
    'expiring-soon',
    'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-300',
  ],
])

export const sessionTypes = [
  {
    label: 'Active',
    value: 'active',
    icon: Activity,
  },
  {
    label: 'Expired',
    value: 'expired',
    icon: AlertTriangle,
  },
  {
    label: 'Expiring Soon',
    value: 'expiring-soon',
    icon: Clock,
  },
] as const

// Device types based on user agent patterns
export const deviceTypes = [
  {
    label: 'Desktop',
    value: 'desktop',
    icon: Shield,
  },
  {
    label: 'Mobile',
    value: 'mobile',
    icon: Activity,
  },
  {
    label: 'Tablet',
    value: 'tablet',
    icon: Clock,
  },
] as const
