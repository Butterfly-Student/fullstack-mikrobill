// components/hotspot/hotspot-data-table-bulk-actions.tsx
"use client"

import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Trash2, Power, PowerOff } from 'lucide-react'

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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg border bg-background p-4 shadow-lg">
      <span className="text-sm font-medium">
        {selectedCount} item{selectedCount === 1 ? '' : 's'}
      </span>

      <div className="flex items-center gap-2 ml-4">
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => {
            console.log('Enable selected items:', selectedRows)
            table.resetRowSelection()
          }}
        >
          <Power className="w-4 h-4 text-green-600" />
          Enable
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => {
            console.log('Disable selected items:', selectedRows)
            table.resetRowSelection()
          }}
        >
          <PowerOff className="w-4 h-4 text-red-600" />
          Disable
        </Button>

        <Button
          size="sm"
          variant="destructive"
          className="gap-2"
          onClick={() => {
            console.log('Delete selected items:', selectedRows)
            table.resetRowSelection()
          }}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => table.resetRowSelection()}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}