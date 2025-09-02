import {
  Wifi,
  WifiOff,
  AlertTriangle,
  Router,
  Network,
  Shield,
} from 'lucide-react'

// Router status styles - sesuai dengan schema database router
export const routerStatusStyles = new Map([
  [
    'online',
    'bg-emerald-100/30 text-emerald-900 dark:text-emerald-200 border-emerald-200',
  ],
  [
    'offline',
    'bg-neutral-300/40 text-neutral-600 dark:text-neutral-400 border-neutral-300',
  ],
  [
    'error',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

// Router types berdasarkan fungsi
export const routerTypes = [
  {
    label: 'Gateway',
    value: 'gateway',
    icon: Router,
    description: 'Main internet gateway router',
  },
  {
    label: 'Core',
    value: 'core',
    icon: Network,
    description: 'Core network distribution router',
  },
  {
    label: 'Access Point',
    value: 'access_point',
    icon: Wifi,
    description: 'Wireless access point router',
  },
  {
    label: 'Edge',
    value: 'edge',
    icon: Shield,
    description: 'Edge security router',
  },
] as const

// Router brands yang umum digunakan
export const routerBrands = [
  {
    label: 'MikroTik',
    value: 'mikrotik',
    defaultPort: 8728,
    defaultUsername: 'admin',
  },
  {
    label: 'Cisco',
    value: 'cisco',
    defaultPort: 22,
    defaultUsername: 'admin',
  },
  {
    label: 'Ubiquiti',
    value: 'ubiquiti',
    defaultPort: 22,
    defaultUsername: 'ubnt',
  },
  {
    label: 'TP-Link',
    value: 'tplink',
    defaultPort: 80,
    defaultUsername: 'admin',
  },
] as const

// Status icons untuk tampilan
export const statusIcons = {
  online: Wifi,
  offline: WifiOff,
  error: AlertTriangle,
} as const

// Common router ports
export const commonPorts = [
  { label: 'SSH (22)', value: 22 },
  { label: 'Telnet (23)', value: 23 },
  { label: 'HTTP (80)', value: 80 },
  { label: 'HTTPS (443)', value: 443 },
  { label: 'MikroTik API (8728)', value: 8728 },
  { label: 'MikroTik API SSL (8729)', value: 8729 },
] as const

// Timeout options dalam milliseconds
export const timeoutOptions = [
  { label: '30 seconds', value: 30000 },
  { label: '1 minute', value: 60000 },
  { label: '2 minutes', value: 120000 },
  { label: '5 minutes', value: 300000 },
  { label: '10 minutes', value: 600000 },
] as const
