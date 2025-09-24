import { Shield, UserCheck, Users, CreditCard } from 'lucide-react'

export const resourceIcons = [
  {
    label: 'Users',
    value: 'users',
    icon: Users,
  },
  {
    label: 'Roles',
    value: 'roles',
    icon: Shield,
  },
  {
    label: 'Permissions',
    value: 'permissions',
    icon: UserCheck,
  },
  {
    label: 'Billing',
    value: 'billing',
    icon: CreditCard,
  },
] as const

export const actionIcons = [
  {
    label: 'Create',
    value: 'create',
    icon: Shield,
  },
  {
    label: 'Read',
    value: 'read',
    icon: UserCheck,
  },
  {
    label: 'Update',
    value: 'update',
    icon: Users,
  },
  {
    label: 'Delete',
    value: 'delete',
    icon: CreditCard,
  },
] as const
