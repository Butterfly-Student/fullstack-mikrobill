import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Profile } from '../../data/schema'

import { Lock, Unlock, Clock, Download, Upload, Users, Wifi, Calendar, DollarSign, RefreshCw, Play, Network } from 'lucide-react'
import { DataTableRowActions } from './data-table-row-actions'

export const hotspotProfileColumns: ColumnDef<Profile>[] = [
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
    meta: {
      className: cn('sticky md:table-cell start-0 z-10 rounded-tl-[inherit]'),
    },
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
      <DataTableColumnHeader column={column} title='Profile Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36 ps-3 font-medium'>{row.getValue('name')}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  // NEW: Shared Users Column
  {
    accessorKey: 'sharedUsers',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Shared Users' />
    ),
    cell: ({ row }) => {
      const sharedUsers = row.getValue('sharedUsers') as number
      return (
        <div className='flex items-center space-x-1'>
          <Users size={14} className='text-blue-600' />
          <span className='text-sm font-medium'>{sharedUsers}</span>
        </div>
      )
    },
  },
  // NEW: Rate Limit Column
  {
    accessorKey: 'rateLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Rate Limit' />
    ),
    cell: ({ row }) => {
      const rateLimit = row.getValue('rateLimit') as string
      return rateLimit ? (
        <div className='flex items-center space-x-1'>
          <Wifi size={14} className='text-orange-600' />
          <span className='font-mono text-xs'>{rateLimit}</span>
        </div>
      ) : (
        <span className='text-muted-foreground'>Unlimited</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'expiredMode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Expired Mode' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline' className='text-xs'>
        {row.getValue('expiredMode')}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  // NEW: Validity Column
  {
    accessorKey: 'validity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Validity' />
    ),
    cell: ({ row }) => {
      const validity = row.getValue('validity') as string
      return validity ? (
        <div className='flex items-center space-x-1'>
          <Calendar size={14} className='text-purple-600' />
          <span className='text-sm'>{validity}</span>
        </div>
      ) : (
        <span className='text-muted-foreground'>No limit</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) => {
      const price = row.getValue('price') as number
      return price > 0 ? (
        <div className='flex items-center space-x-1'>
          <DollarSign size={14} className='text-green-600' />
          <span className='text-sm font-medium text-green-600'>{price}</span>
        </div>
      ) : (
        <span className='text-muted-foreground'>Free</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'sellingPrice',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Selling Price' />
    ),
    cell: ({ row }) => {
      const sellingPrice = row.getValue('sellingPrice') as number
      return sellingPrice > 0 ? (
        <div className='flex items-center space-x-1'>
          <DollarSign size={14} className='text-blue-600' />
          <span className='text-sm font-medium text-blue-600'>{sellingPrice}</span>
        </div>
      ) : (
        <span className='text-muted-foreground'>-</span>
      )
    },
    enableSorting: false,
  },
  // NEW: Address Pool Column
  {
    accessorKey: 'addressPool',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Address Pool' />
    ),
    cell: ({ row }) => {
      const addressPool = row.getValue('addressPool') as string
      return addressPool ? (
        <div className='flex items-center space-x-1'>
          <Network size={14} className='text-indigo-600' />
          <span className='font-mono text-sm'>{addressPool}</span>
        </div>
      ) : (
        <span className='text-muted-foreground'>Default</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'lockUser',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Lock User' />
    ),
    cell: ({ row }) => {
      const lockUser = row.getValue('lockUser') as string
      const isLocked = lockUser === 'locked' || lockUser === 'enabled'

      return (
        <div className='flex items-center space-x-2'>
          {isLocked ? (
            <Lock size={16} className='text-red-600' />
          ) : (
            <Unlock size={16} className='text-green-600' />
          )}
          <span className='text-sm'>{lockUser || 'Unlocked'}</span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'lockServer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Lock Server' />
    ),
    cell: ({ row }) => {
      const lockServer = row.getValue('lockServer') as string
      const isLocked = lockServer === 'locked' || lockServer === 'enabled'

      return (
        <div className='flex items-center space-x-2'>
          {isLocked ? (
            <Lock size={16} className='text-red-600' />
          ) : (
            <Unlock size={16} className='text-green-600' />
          )}
          <span className='text-sm'>{lockServer || 'Unlocked'}</span>
        </div>
      )
    },
    enableSorting: false,
  },
  // NEW: Parent Queue Column
  {
    accessorKey: 'parentQueue',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Parent Queue' />
    ),
    cell: ({ row }) => {
      const parentQueue = row.getValue('parentQueue') as string
      return parentQueue ? (
        <Badge variant='secondary' className='text-xs'>
          {parentQueue}
        </Badge>
      ) : (
        <span className='text-muted-foreground'>None</span>
      )
    },
    enableSorting: false,
  },
  // NEW: Status Auto Refresh Column
  {
    accessorKey: 'statusAutorefresh',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Auto Refresh' />
    ),
    cell: ({ row }) => {
      const statusAutoRefresh = row.getValue('statusAutorefresh') as string
      return (
        <div className='flex items-center space-x-1'>
          <RefreshCw size={14} className='text-cyan-600' />
          <span className='text-sm'>{statusAutoRefresh}</span>
        </div>
      )
    },
    enableSorting: false,
  },
  // NEW: On Login Column
  {
    accessorKey: 'onLogin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='On Login' />
    ),
    cell: ({ row }) => {
      const onLogin = row.getValue('onLogin') as string
      return onLogin ? (
        <div className='flex items-center space-x-1'>
          <Play size={14} className='text-emerald-600' />
          <LongText className='max-w-28 text-sm'>{onLogin}</LongText>
        </div>
      ) : (
        <span className='text-muted-foreground'>None</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'bandwidth',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bandwidth' />
    ),
    cell: ({ row }) => {
      const bandwidth = row.getValue('bandwidth') as string
      return bandwidth ? (
        <div className='font-mono text-sm'>{bandwidth}</div>
      ) : (
        <span className='text-muted-foreground'>Unlimited</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'sessionTimeout',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Session Timeout' />
    ),
    cell: ({ row }) => {
      const sessionTimeout = row.getValue('sessionTimeout') as string
      return sessionTimeout ? (
        <div className='flex items-center space-x-1'>
          <Clock size={14} className='text-muted-foreground' />
          <span className='text-sm'>{sessionTimeout}</span>
        </div>
      ) : (
        <span className='text-muted-foreground'>No limit</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'idleTimeout',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Idle Timeout' />
    ),
    cell: ({ row }) => {
      const idleTimeout = row.getValue('idleTimeout') as string
      return idleTimeout ? (
        <div className='flex items-center space-x-1'>
          <Clock size={14} className='text-muted-foreground' />
          <span className='text-sm'>{idleTimeout}</span>
        </div>
      ) : (
        <span className='text-muted-foreground'>No limit</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'downloadLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Download Limit' />
    ),
    cell: ({ row }) => {
      const downloadLimit = row.getValue('downloadLimit') as string
      return downloadLimit ? (
        <div className='flex items-center space-x-1'>
          <Download size={14} className='text-green-600' />
          <span className='font-mono text-sm text-green-600'>{downloadLimit}</span>
        </div>
      ) : (
        <span className='text-muted-foreground'>Unlimited</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'uploadLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Upload Limit' />
    ),
    cell: ({ row }) => {
      const uploadLimit = row.getValue('uploadLimit') as string
      return uploadLimit ? (
        <div className='flex items-center space-x-1'>
          <Upload size={14} className='text-blue-600' />
          <span className='font-mono text-sm text-blue-600'>{uploadLimit}</span>
        </div>
      ) : (
        <span className='text-muted-foreground'>Unlimited</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'maxSessions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Max Sessions' />
    ),
    cell: ({ row }) => {
      const maxSessions = row.getValue('maxSessions') as number
      return maxSessions ? (
        <div className='flex items-center space-x-1'>
          <Users size={14} className='text-muted-foreground' />
          <span className='text-sm'>{maxSessions}</span>
        </div>
      ) : (
        <span className='text-muted-foreground'>Unlimited</span>
      )
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]