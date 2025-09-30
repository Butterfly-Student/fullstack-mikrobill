"use client"

import { useState } from "react"
import type { Table } from "@tanstack/react-table"
import { Download, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { sleep } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table"
import type { Pelanggan } from "../data/schema"
import { PelangganMultiDeleteDialog } from "./pelanggan-multi-delete-dialog"

type Props<TData> = { table: Table<TData> }

export function DataTableBulkActions<TData>({ table }: Props<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkExport = () => {
    const selected = selectedRows.map((r) => r.original as Pelanggan)
    toast.promise(sleep(1500), {
      loading: "Mengekspor pelanggan...",
      success: () => {
        table.resetRowSelection()
        return `Diekspor ${selected.length} pelanggan ke CSV.`
      },
      error: "Error",
    })
    table.resetRowSelection()
  }

  return (
    <TooltipProvider>
      <>
        {/* catatan: gunakan toolbar bulk actions generik dari components/data-table, entityName 'pelanggan'. */}
        <BulkActionsToolbar table={table} entityName="pelanggan">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleBulkExport()}
                className="size-8"
                aria-label="Export pelanggan"
                title="Export pelanggan"
              >
                <Download />
                <span className="sr-only">Export pelanggan</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export pelanggan</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                className="size-8"
                aria-label="Hapus pelanggan terpilih"
                title="Hapus pelanggan terpilih"
              >
                <Trash2 />
                <span className="sr-only">Hapus pelanggan</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hapus pelanggan terpilih</p>
            </TooltipContent>
          </Tooltip>
        </BulkActionsToolbar>

        <PelangganMultiDeleteDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} table={table} />
      </>
    </TooltipProvider>
  )
}
