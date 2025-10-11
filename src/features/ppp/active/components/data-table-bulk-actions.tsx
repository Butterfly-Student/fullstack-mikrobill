import { useState } from 'react';
import { type Table } from '@tanstack/react-table';
import { Trash2, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table';
import { type PppoeActive } from '../../data/schema';
import { usePppoeSecret } from '../../hooks/use-ppp';
import { PppActiveMultiDisconnectDialog } from './ppp-multi-disconnect-dialog';


type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { enableSecret, disableSecret } = usePppoeSecret()

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedSessions = selectedRows.map((row) => row.original as PppoeActive)
  const selectedIds = selectedSessions.map((row) => row['.id'])

  const handleEnable = () => {
    if (selectedIds.length === 0) return
    enableSecret.mutate({ userId: selectedIds })
    table.resetRowSelection()
  }

  const handleDisable = () => {
    if (selectedIds.length === 0) return
    disableSecret.mutate({ userId: selectedIds })
    table.resetRowSelection()
  }

  const handleDisconnect = () => {
    setShowDeleteConfirm(true)
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='session'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              className='size-8'
              onClick={handleEnable}
              disabled={selectedIds.length === 0 || enableSecret.isPending}
              aria-label='Enable selected secrets'
              title='Enable selected secrets'
            >
              <Power />
              <span className='sr-only'>Enable</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Enable selected secrets</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              className='size-8'
              onClick={handleDisable}
              disabled={selectedIds.length === 0 || disableSecret.isPending}
              aria-label='Disable selected secrets'
              title='Disable selected secrets'
            >
              <PowerOff />
              <span className='sr-only'>Disable</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Disable selected secrets</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={handleDisconnect}
              disabled={selectedIds.length === 0}
              className='size-8'
              aria-label='Disconnect selected sessions'
              title='Disconnect selected sessions'
            >
              <Trash2 />
              <span className='sr-only'>Disconnect selected sessions</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Disconnect selected sessions</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <PppActiveMultiDisconnectDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  )
}