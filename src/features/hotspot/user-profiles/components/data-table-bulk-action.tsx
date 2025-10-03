// components/hotspot/hotspot-data-table-bulk-actions.tsx
"use client"

import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Trash2, Power, PowerOff } from 'lucide-react'
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
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'

interface HotspotDataTableBulkActionsProps<TData> {
  table: Table<TData>
}

export function HotspotDataTableBulkActions<TData>({
  table,
}: HotspotDataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  if (selectedCount === 0) {
    return null
  }

  return (
    <BulkActionsToolbar table={table} entityName="hotspot-profile">
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                className='size-8'
                aria-label='Enable hotspot'
                title='Enable hotspot'
              >
                <Power className="w-4 h-4 text-green-600" />
                <span className='sr-only'>Enable hotspot</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Enable hotspot</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent sideOffset={14}>
          <DropdownMenuItem
            onClick={() => {
              table.resetRowSelection()
            }}
          >
            <Power className="w-4 h-4 text-green-600 mr-2" />
            Enable Selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                className='size-8'
                aria-label='Disable hotspot'
                title='Disable hotspot'
              >
                <PowerOff className="w-4 h-4 text-red-600" />
                <span className='sr-only'>Disable hotspot</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Disable hotspot</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent sideOffset={14}>
          <DropdownMenuItem
            onClick={() => {
              table.resetRowSelection()
            }}
          >
            <PowerOff className="w-4 h-4 text-red-600 mr-2" />
            Disable Selected
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
              table.resetRowSelection()
            }}
            aria-label='Delete selected hotspots'
            title='Delete selected hotspots'
          >
            <Trash2 className="w-4 h-4" />
            <span className='sr-only'>Delete selected hotspots</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete selected hotspots</p>
        </TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}