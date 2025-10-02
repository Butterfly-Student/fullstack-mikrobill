'use client'

import { useState } from 'react'
import type { Table } from '@tanstack/react-table'
import { Download, Trash2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
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
import type { Tagihan } from '../data/schema'
import { TagihanMultiDeleteDialog } from './tagihan-multi-delete-dialog'
import { TagihanMultiUpdateStatusDialog } from './tagihan-multi-update-status-dialog'

type Props<TData> = { table: Table<TData> }

export function DataTableBulkActions<TData>({ table }: Props<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<
    'belum_lunas' | 'lunas' | 'sebagian' | 'jatuh_tempo'
  >('lunas')

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkExport = () => {
    const selected = selectedRows.map((r) => r.original as Tagihan)
    toast.promise(sleep(1500), {
      loading: 'Mengekspor tagihan...',
      success: () => {
        table.resetRowSelection()
        return `Diekspor ${selected.length} tagihan ke CSV.`
      },
      error: 'Error',
    })
    table.resetRowSelection()
  }

  const handleUpdateStatusClick = () => {
    setShowUpdateStatusDialog(true)
  }

  return (
    <TooltipProvider>
      <>
        <BulkActionsToolbar table={table} entityName='tagihan'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                onClick={() => handleBulkExport()}
                className='size-8'
                aria-label='Export tagihan'
                title='Export tagihan'
              >
                <Download />
                <span className='sr-only'>Export tagihan</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export tagihan</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  onClick={() => handleUpdateStatusClick()}
                  aria-label='Update status tagihan'
                  title='Update status tagihan'
                >
                  <CheckCircle2 />
                  <span className='sr-only'>Update status</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update status tagihan</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='destructive'
                size='icon'
                onClick={() => setShowDeleteConfirm(true)}
                className='size-8'
                aria-label='Hapus tagihan terpilih'
                title='Hapus tagihan terpilih'
              >
                <Trash2 />
                <span className='sr-only'>Hapus tagihan</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hapus tagihan terpilih</p>
            </TooltipContent>
          </Tooltip>
        </BulkActionsToolbar>

        <TagihanMultiDeleteDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          table={table}
        />

        <TagihanMultiUpdateStatusDialog
          open={showUpdateStatusDialog}
          onOpenChange={setShowUpdateStatusDialog}
          table={table}
        />
      </>
    </TooltipProvider>
  )
}
