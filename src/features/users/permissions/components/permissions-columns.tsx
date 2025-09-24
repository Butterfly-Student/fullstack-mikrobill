import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Permission, type Resource, type Action } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

// Extended Permission type to include resource and action details
type PermissionWithRelations = Permission & {
  resource?: Resource
  action?: Action
}

export const permissionsColumns: ColumnDef<PermissionWithRelations>[] = [
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
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => (
      <div className='w-12 text-center'>{row.getValue('id')}</div>
    ),
    meta: { className: 'w-16' },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Permission Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48 ps-3 font-medium'>
        {row.getValue('name')}
      </LongText>
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
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => {
      const description = row.getValue('description') as string | null
      return (
        <LongText className='max-w-64 text-muted-foreground'>
          {description || 'No description'}
        </LongText>
      )
    },
    meta: { className: 'w-64' },
    enableSorting: false,
  },
  {
    id: 'resource',
    accessorFn: (row) => row.resource?.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Resource' />
    ),
    cell: ({ row }) => {
      const resource = row.original.resource
      return (
        <div className='flex items-center'>
          <Badge variant='secondary' className='capitalize'>
            {resource?.name || `Resource #${row.original.resourceId}`}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.resourceId.toString())
    },
    enableSorting: false,
  },
  {
    id: 'action',
    accessorFn: (row) => row.action?.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Action' />
    ),
    cell: ({ row }) => {
      const action = row.original.action
      return (
        <div className='flex items-center'>
          <Badge variant='outline' className='capitalize'>
            {action?.name || `Action #${row.original.actionId}`}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.actionId.toString())
    },
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      return (
        <div className='text-sm text-muted-foreground'>
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      )
    },
    meta: { className: 'w-32' },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
    meta: { className: 'w-12' },
  },
]