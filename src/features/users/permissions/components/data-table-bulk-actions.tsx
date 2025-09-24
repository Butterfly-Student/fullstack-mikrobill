import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, Copy, Edit } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Permission } from '../data/schema'
import { PermissionsMultiDeleteDialog } from './permissions-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkDuplicate = () => {
    const selectedPermissions = selectedRows.map((row) => row.original as Permission)
    toast.promise(sleep(2000), {
      loading: 'Duplicating permissions...',
      success: () => {
        table.resetRowSelection()
        return `Duplicated ${selectedPermissions.length} permission${selectedPermissions.length > 1 ? 's' : ''}`
      },
      error: 'Error duplicating permissions',
    })
    table.resetRowSelection()
  }

  const handleBulkEdit = () => {
    const selectedPermissions = selectedRows.map((row) => row.original as Permission)
    toast.promise(sleep(2000), {
      loading: 'Updating permissions...',
      success: () => {
        table.resetRowSelection()
        return `Updated ${selectedPermissions.length} permission${selectedPermissions.length > 1 ? 's' : ''}`
      },
      error: 'Error updating permissions',
    })
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='permission'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkDuplicate}
              className='size-8'
              aria-label='Duplicate selected permissions'
              title='Duplicate selected permissions'
            >
              <Copy />
              <span className='sr-only'>Duplicate selected permissions</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Duplicate selected permissions</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkEdit}
              className='size-8'
              aria-label='Edit selected permissions'
              title='Edit selected permissions'
            >
              <Edit />
              <span className='sr-only'>Edit selected permissions</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit selected permissions</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected permissions'
              title='Delete selected permissions'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected permissions</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected permissions</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <PermissionsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}