import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, Clock, ClockFading, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Session } from '../data/schema'
import { SessionsMultiDeleteDialog } from './sessions-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkRevoke = () => {
    const selectedSessions = selectedRows.map((row) => row.original as Session)
    toast.promise(sleep(2000), {
      loading: 'Revoking sessions...',
      success: () => {
        table.resetRowSelection()
        return `Revoked ${selectedSessions.length} session${selectedSessions.length > 1 ? 's' : ''}`
      },
      error: 'Error revoking sessions',
    })
  }

  const handleBulkExtend = () => {
    const selectedSessions = selectedRows.map((row) => row.original as Session)
    const activeSessions = selectedSessions.filter(session => {
      const now = new Date()
      return session.expiresAt > now
    })

    if (activeSessions.length === 0) {
      toast.error('No active sessions selected')
      return
    }

    toast.promise(sleep(2000), {
      loading: 'Extending sessions...',
      success: () => {
        table.resetRowSelection()
        return `Extended ${activeSessions.length} active session${activeSessions.length > 1 ? 's' : ''}`
      },
      error: 'Error extending sessions',
    })
  }

  const handleBulkView = () => {
    const selectedSessions = selectedRows.map((row) => row.original as Session)
    toast.info(`Viewing details for ${selectedSessions.length} session${selectedSessions.length > 1 ? 's' : ''}`)
    // This would typically open a modal or navigate to a details view
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='session'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkView}
              className='size-8'
              aria-label='View selected sessions'
              title='View selected sessions'
            >
              <Eye />
              <span className='sr-only'>View selected sessions</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View selected sessions</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkExtend}
              className='size-8'
              aria-label='Extend selected sessions'
              title='Extend selected sessions'
            >
              <Clock />
              <span className='sr-only'>Extend selected sessions</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Extend selected sessions</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkRevoke}
              className='size-8'
              aria-label='Revoke selected sessions'
              title='Revoke selected sessions'
            >
              <ClockFading />
              <span className='sr-only'>Revoke selected sessions</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Revoke selected sessions</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected sessions'
              title='Delete selected sessions'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected sessions</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected sessions</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <SessionsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}