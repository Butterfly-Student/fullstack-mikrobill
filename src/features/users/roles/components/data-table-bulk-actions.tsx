import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, UserMinus, UserPlus, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type RoleRelation } from '../data/schema'
import { RolesMultiDeleteDialog } from './roles-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkRoleAssign = () => {
    const selectedRoleRelations = selectedRows.map((row) => row.original as RoleRelation)
    toast.promise(sleep(2000), {
      loading: 'Assigning roles...',
      success: () => {
        table.resetRowSelection()
        return `Assigned roles to ${selectedRoleRelations.length} user${selectedRoleRelations.length > 1 ? 's' : ''}`
      },
      error: 'Error assigning roles',
    })
    table.resetRowSelection()
  }

  const handleBulkRoleRevoke = () => {
    const selectedRoleRelations = selectedRows.map((row) => row.original as RoleRelation)
    toast.promise(sleep(2000), {
      loading: 'Revoking roles...',
      success: () => {
        table.resetRowSelection()
        return `Revoked roles from ${selectedRoleRelations.length} user${selectedRoleRelations.length > 1 ? 's' : ''}`
      },
      error: 'Error revoking roles',
    })
    table.resetRowSelection()
  }

  const handleBulkPermissionUpdate = () => {
    const selectedRoleRelations = selectedRows.map((row) => row.original as RoleRelation)
    toast.promise(sleep(2000), {
      loading: 'Updating permissions...',
      success: () => {
        table.resetRowSelection()
        return `Updated permissions for ${selectedRoleRelations.length} role relation${selectedRoleRelations.length > 1 ? 's' : ''}`
      },
      error: 'Error updating permissions',
    })
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='role relation'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkRoleAssign}
              className='size-8'
              aria-label='Assign selected roles'
              title='Assign selected roles'
            >
              <UserPlus />
              <span className='sr-only'>Assign selected roles</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Assign selected roles</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkPermissionUpdate}
              className='size-8'
              aria-label='Update permissions for selected role relations'
              title='Update permissions for selected role relations'
            >
              <Shield />
              <span className='sr-only'>Update permissions for selected role relations</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Update permissions</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkRoleRevoke}
              className='size-8'
              aria-label='Revoke selected roles'
              title='Revoke selected roles'
            >
              <UserMinus />
              <span className='sr-only'>Revoke selected roles</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Revoke selected roles</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected role relations'
              title='Delete selected role relations'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected role relations</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected role relations</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <RolesMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}