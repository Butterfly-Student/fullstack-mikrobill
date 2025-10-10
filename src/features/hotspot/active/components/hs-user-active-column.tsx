'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { type ActiveUser } from '../../data/schema'

function renderMono(value?: string | null) {
  return value ? (
    <code className='font-mono text-xs'>{value}</code>
  ) : (
    <span className='text-muted-foreground'>-</span>
  )
}

export const activeUsersColumns: ColumnDef<ActiveUser>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
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
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'user',
    header: ({ column }) => (
      <div className='ps-3'>
        <button
          className='text-left font-medium'
          onClick={column.getToggleSortingHandler()}
        >
          User
          {column.getIsSorted() === 'asc'
            ? ' ↑'
            : column.getIsSorted() === 'desc'
              ? ' ↓'
              : ''}
        </button>
      </div>
    ),
    cell: ({ row }) => (
      <div className='max-w-40 truncate ps-3 font-medium'>
        {row.getValue('user')}
      </div>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
  },
  {
    accessorKey: 'server',
    header: ({ column }) => (
      <button className='text-left' onClick={column.getToggleSortingHandler()}>
        Server
      </button>
    ),
    cell: ({ row }) => <div className='text-sm'>{row.getValue('server')}</div>,
    enableSorting: false,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'address',
    header: 'IP Address',
    cell: ({ row }) => renderMono(row.getValue('address') as string),
    enableSorting: false,
  },
  {
    accessorKey: 'mac-address',
    header: 'MAC Address',
    cell: ({ row }) => renderMono(row.getValue('mac-address') as string),
    enableSorting: false,
  },
  {
    accessorKey: 'uptime',
    header: 'Uptime',
    cell: ({ row }) => (
      <div className='text-sm'>{(row.getValue('uptime') as string) || '-'}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'idle-time',
    header: 'Idle Time',
    cell: ({ row }) => (
      <div className='text-sm'>
        {(row.getValue('idle-time') as string) || '-'}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'session-time-left',
    header: 'Session Left',
    cell: ({ row }) => (
      <div className='text-sm'>
        {(row.getValue('session-time-left') as string) || '-'}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'idle-timeout',
    header: 'Idle Timeout',
    cell: ({ row }) => (
      <div className='text-sm'>
        {(row.getValue('idle-timeout') as string) || '-'}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'keepalive-timeout',
    header: 'Keepalive Timeout',
    cell: ({ row }) => (
      <div className='text-sm'>
        {(row.getValue('keepalive-timeout') as string) || '-'}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'bytes-in',
    header: 'Bytes In',
    cell: ({ row }) => renderMono(row.getValue('bytes-in') as string),
    enableSorting: false,
  },
  {
    accessorKey: 'bytes-out',
    header: 'Bytes Out',
    cell: ({ row }) => renderMono(row.getValue('bytes-out') as string),
    enableSorting: false,
  },
  {
    accessorKey: 'packets-in',
    header: 'Packets In',
    cell: ({ row }) => renderMono(row.getValue('packets-in') as string),
    enableSorting: false,
  },
  {
    accessorKey: 'packets-out',
    header: 'Packets Out',
    cell: ({ row }) => renderMono(row.getValue('packets-out') as string),
    enableSorting: false,
  },
  {
    accessorKey: 'login-by',
    header: 'Login By',
    cell: ({ row }) => (
      <div className='text-xs'>
        {(row.getValue('login-by') as string) || '-'}
      </div>
    ),
    enableSorting: false,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const data = row.original
      return (
        <div className='flex justify-end'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              // You can dispatch to provider or open a dialog here
              console.log('[v0] ActiveUser row action clicked:', data?.user)
            }}
          >
            Actions
          </Button>
        </div>
      )
    },
  },
]
