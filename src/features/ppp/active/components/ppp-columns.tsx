import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type PppoeActive } from '../../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

// Status untuk service types sesuai dengan enum di schema
const services = [
  { value: 'async', label: 'Async' },
  { value: 'isdn', label: 'ISDN' },
  { value: 'l2tp', label: 'L2TP' },
  { value: 'pppoe', label: 'PPPoE' },
  { value: 'pptp', label: 'PPTP' },
  { value: 'ovpn', label: 'OpenVPN' },
  { value: 'sstp', label: 'SSTP' },
]

export const pppColumns: ColumnDef<PppoeActive>[] = [
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
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Address' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-sm max-w-[150px] truncate'>
        {row.getValue('address') || '-'}
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
    accessorKey: 'session-id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Session ID' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[120px] truncate font-mono text-sm'>
        {row.getValue('session-id') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'uptime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Uptime' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[150px] truncate font-mono text-sm'>
        {row.getValue('uptime') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'encoding',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Encoding' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[120px] truncate text-sm'>
        {row.getValue('encoding') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'limit-bytes-in',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Limit In' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-sm max-w-[120px] truncate'>
        {row.getValue('limit-bytes-in') || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'limit-bytes-out',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Limit Out' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-sm max-w-[120px] truncate'>
        {row.getValue('limit-bytes-out') || '-'}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]