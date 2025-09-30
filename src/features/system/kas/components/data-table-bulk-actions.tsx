"use client"

import { useState } from "react"
import type { Table } from "@tanstack/react-table"
import { Download, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { sleep } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table"
import type { Kas } from "../data/schema"
import { KasMultiDeleteDialog } from "./kas-multi-delete-dialog"

type Props<TData> = { table: Table<TData> }

export function DataTableBulkActions<TData>({ table }: Props<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkExport = () => {
    const selected = selectedRows.map((r) => r.original as Kas)
    toast.promise(sleep(1500), {
      loading: "Mengekspor transaksi kas...",
      success: () => {
        table.resetRowSelection()
        return `Diekspor ${selected.length} transaksi ke CSV.`
      },
      error: "Error",
    })
    table.resetRowSelection()
  }

  return (
    <TooltipProvider>
      <>
        <BulkActionsToolbar table={table} entityName="transaksi">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleBulkExport()}
                className="size-8"
                aria-label="Export transaksi"
                title="Export transaksi"
              >
                <Download />
                <span className="sr-only">Export transaksi</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export transaksi</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                className="size-8"
                aria-label="Hapus transaksi terpilih"
                title="Hapus transaksi terpilih"
              >
                <Trash2 />
                <span className="sr-only">Hapus transaksi</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hapus transaksi terpilih</p>
            </TooltipContent>
          </Tooltip>
        </BulkActionsToolbar>

        <KasMultiDeleteDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} table={table} />
      </>
    </TooltipProvider>
  )
}
