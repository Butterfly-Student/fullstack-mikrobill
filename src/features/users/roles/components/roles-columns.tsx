import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type RoleRelation } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const rolesColumns: ColumnDef<RoleRelation>[] = [
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
      <div className='font-mono text-sm'>{row.getValue('id')}</div>
    ),
    meta: { className: 'w-16' },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-32 font-medium text-sm'>
        {row.getValue('name')}
      </LongText>
    ),
    meta: { className: 'w-32' },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => {
      const description = row.getValue('description') as string | null | undefined
      return description ? (
        <LongText className='max-w-48 text-sm'>{description}</LongText>
      ) : (
        <span className='text-muted-foreground text-sm'>-</span>
      )
    },
    meta: { className: 'w-48' },
    enableSorting: false,
  },
  {
    accessorKey: 'userId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='User ID' />
    ),
    cell: ({ row }) => {
      const userId = row.getValue('userId') as string | undefined
      return userId ? (
        <LongText className='max-w-36 font-mono text-sm'>{userId}</LongText>
      ) : (
        <Badge variant='outline' className='text-xs'>Global</Badge>
      )
    },
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'assignedBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Assigned By' />
    ),
    cell: ({ row }) => {
      const assignedBy = row.getValue('assignedBy') as string | null | undefined
      return assignedBy ? (
        <LongText className='max-w-32 font-mono text-sm'>{assignedBy}</LongText>
      ) : (
        <span className='text-muted-foreground text-sm'>-</span>
      )
    },
    meta: { className: 'w-32' },
    enableSorting: false,
  },
  {
    accessorKey: 'assignedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Assigned At' />
    ),
    cell: ({ row }) => {
      const assignedAt = row.getValue('assignedAt') as Date | undefined
      return assignedAt ? (
        <div className='text-sm'>
          {assignedAt.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      ) : (
        <span className='text-muted-foreground text-sm'>-</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'permissions', // disesuaikan dengan skema (plural)
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Permissions' />
    ),
    cell: ({ row }) => {
      const permissions = row.getValue('permissions') as any[]
      const permissionCount = permissions?.length || 0

      return (
        <div className='flex items-center gap-2'>
          <Badge variant='secondary' className='text-xs'>
            {permissionCount} permissions
          </Badge>
          {permissionCount > 0 && (
            <div className='flex gap-1'>
              {permissions.slice(0, 2).map((permission) => (
                <Badge
                  key={permission.id}
                  variant='outline'
                  className='text-xs max-w-20 truncate'
                >
                  {permission.name}
                </Badge>
              ))}
              {permissionCount > 2 && (
                <Badge variant='outline' className='text-xs'>
                  +{permissionCount - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'grantedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Granted At' />
    ),
    cell: ({ row }) => {
      const grantedAt = row.getValue('grantedAt') as Date | undefined
      return grantedAt ? (
        <div className='text-sm'>
          {grantedAt.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      ) : (
        <span className='text-muted-foreground text-sm'>-</span>
      )
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
    meta: { className: 'w-16' },
  },
]