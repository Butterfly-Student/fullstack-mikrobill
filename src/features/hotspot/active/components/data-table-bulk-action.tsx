'use client'

import type { Table } from '@tanstack/react-table'
import { UserX, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'

interface ActiveUserDataTableBulkActionsProps<TData> {
  table: Table<TData>
}

export function ActiveUserDataTableBulkActions<TData>({
  table,
}: ActiveUserDataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  if (selectedCount === 0) return null

  return (
    <BulkActionsToolbar table={table} entityName='active-user'>
      <TooltipProvider>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8 bg-transparent'
                  aria-label='Disconnect sessions'
                  title='Disconnect sessions'
                >
                  <UserX className='h-4 w-4 text-orange-600' />
                  <span className='sr-only'>Disconnect sessions</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Disconnect sessions</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            <DropdownMenuItem
              onClick={() => {
                // TODO: implement your disconnect logic
                table.resetRowSelection()
              }}
            >
              <UserX className='mr-2 h-4 w-4 text-orange-600' />
              Disconnect Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              className='size-8'
              onClick={() => {
                // TODO: implement your delete logic
                table.resetRowSelection()
              }}
              aria-label='Delete selected sessions'
              title='Delete selected sessions'
            >
              <Trash2 className='h-4 w-4' />
              <span className='sr-only'>Delete selected sessions</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected sessions</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </BulkActionsToolbar>
  )
}
