import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type HotspotUser } from '../../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const hotspotUsersColumns: ColumnDef<HotspotUser>[] = [
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
      <DataTableColumnHeader column={column} title='Name' />
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
  {
    accessorKey: 'password',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Password' />
    ),
    cell: ({ row }) => {
      const password = row.getValue('password') as string
      return password ? (
        <div className='font-mono text-sm'>{password}</div>
      ) : (
        <span className='text-muted-foreground'>-</span>
      )
    },
    enableHiding: false,
    enableSorting: false
  },
  {
    accessorKey: 'server',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Server' />
    ),
    cell: ({ row }) => (
      <div className='text-sm'>{row.getValue('server')}</div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    accessorKey: 'profile',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Profile' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline' className='text-xs'>
        {row.getValue('profile')}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    accessorKey: 'macAddress',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='MAC Address' />
    ),
    cell: ({ row }) => {
      const macAddress = row.getValue('macAddress') as string
      return macAddress ? (
        <div className='font-mono text-sm'>{macAddress}</div>
      ) : (
        <span className='text-muted-foreground'>-</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'timeLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Time Limit' />
    ),
    cell: ({ row }) => {
      const timeLimit = row.getValue('timeLimit') as string
      return timeLimit ? (
        <div className='text-sm'>{timeLimit}</div>
      ) : (
        <span className='text-muted-foreground'>Unlimited</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'dataLimit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Data Limit' />
    ),
    cell: ({ row }) => {
      const dataLimit = row.getValue('dataLimit') as string
      return dataLimit ? (
        <div className='text-sm'>{dataLimit}</div>
      ) : (
        <span className='text-muted-foreground'>Unlimited</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'comment',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Comment' />
    ),
    cell: ({ row }) => {
      const comment = row.getValue('comment') as string
      return comment ? (
        <LongText className='max-w-32'>{comment}</LongText>
      ) : (
        <span className='text-muted-foreground'>-</span>
      )
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]