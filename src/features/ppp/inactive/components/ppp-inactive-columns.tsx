import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type PppoeUser } from '../../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

// Status untuk service types
const services = [
  { value: 'pppoe', label: 'PPPoE' },
  { value: 'pptp', label: 'PPTP' },
  { value: 'l2tp', label: 'L2TP' },
  { value: 'ovpn', label: 'OpenVPN' },
  { value: 'sstp', label: 'SSTP' },
]

export const pppColumns: ColumnDef<PppoeUser>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Username' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center space-x-2'>
        <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
          {row.getValue('name')}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'service',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Service' />
    ),
    cell: ({ row }) => {
      const service = services.find(
        (service) => service.value === row.getValue('service')
      )

      if (!service) {
        return null
      }

      return (
        <Badge variant='outline' className='font-mono'>
          {service.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'profile',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Profile' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[150px] truncate'>
        {row.getValue('profile') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'local-address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Local IP' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-sm'>
        {row.getValue('local-address') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'remote-address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Remote IP' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-sm'>
        {row.getValue('remote-address') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'caller-id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Caller ID' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[120px] truncate font-mono text-sm'>
        {row.getValue('caller-id') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'disabled',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const isDisabled = row.getValue('disabled') as boolean

      return (
        <Badge variant={isDisabled ? 'destructive' : 'default'}>
          {isDisabled ? 'Disabled' : 'Active'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const isDisabled = row.getValue(id) as boolean
      return value.includes(isDisabled ? 'disabled' : 'active')
    },
  },
  {
    accessorKey: 'last-logged-out',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Last Logout' />
    ),
    cell: ({ row }) => {
      const lastLogout = row.getValue('last-logged-out') as string

      return (
        <div className='max-w-[150px] truncate text-sm'>
          {lastLogout ? new Date(lastLogout).toLocaleString() : '-'}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]