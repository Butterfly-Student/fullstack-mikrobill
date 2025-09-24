import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Session } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const sessionsColumns: ColumnDef<Session>[] = [
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
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Session ID' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36 ps-3 font-mono text-sm'>{row.getValue('id')}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'token',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Token' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48 font-mono text-sm'>
        {row.getValue('token')}
      </LongText>
    ),
    meta: { className: 'w-48' },
  },
  {
    accessorKey: 'userId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='User ID' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-sm'>{row.getValue('userId')}</div>
    ),
  },
  {
    accessorKey: 'expiresAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Expires At' />
    ),
    cell: ({ row }) => {
      const expiresAt = row.getValue('expiresAt') as Date
      const now = new Date()
      const isExpired = expiresAt < now

      return (
        <div className={cn('text-sm', isExpired && 'text-destructive')}>
          {expiresAt.toLocaleString()}
        </div>
      )
    },
  },
  {
    id: 'status',
    // In sessions-columns.tsx, update the status accessorFn:
    accessorFn: (row) => {
      const now = new Date()
      const expiresAt = row.expiresAt
      const hoursDiff = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)

      if (expiresAt < now) return 'expired'
      if (hoursDiff <= 24) return 'expiring-soon'
      return 'active'
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const expiresAt = row.getValue('expiresAt') as Date
      const now = new Date()
      const isExpired = expiresAt < now

      return (
        <div className='flex space-x-2'>
          <Badge
            variant={isExpired ? 'destructive' : 'default'}
            className='capitalize'
          >
            {isExpired ? 'expired' : 'active'}
          </Badge>
        </div>
      )
    },
    filterFn: (row, value) => {
      const expiresAt = row.getValue('expiresAt') as Date
      const now = new Date()
      const status = expiresAt < now ? 'expired' : 'active'
      return value.includes(status)
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'ipAddress',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='IP Address' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-sm'>{row.getValue('ipAddress') || '-'}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'userAgent',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='User Agent' />
    ),
    cell: ({ row }) => {
      const userAgent = row.getValue('userAgent') as string
      if (!userAgent) return <div>-</div>

      return (
        <LongText className='max-w-64 text-sm'>
          {userAgent}
        </LongText>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'impersonatedBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Impersonated By' />
    ),
    cell: ({ row }) => {
      const impersonatedBy = row.getValue('impersonatedBy') as string

      return (
        <div className='flex space-x-2'>
          {impersonatedBy ? (
            <Badge variant='secondary' className='font-mono text-xs'>
              {impersonatedBy}
            </Badge>
          ) : (
            <span className='text-muted-foreground'>-</span>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as Date
      return (
        <div className='text-sm'>
          {createdAt.toLocaleString()}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]