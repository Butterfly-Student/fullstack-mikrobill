"use client"

import type { Table } from "@tanstack/react-table"
import { useState } from "react"
import { Download, Trash2 } from "lucide-react"
import { DataTableBulkActions as BulkActionsToolbar } from "@/components/data-table"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { showSubmittedData } from "@/lib/show-submitted-data"
import type { TemplateTagihan } from "../data/schema"
import { TemplateTagihanMultiDeleteDialog } from "./template-tagihan-multi-delete-dialog"
import { TooltipProvider } from "@/components/ui/tooltip"

type Props<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({ table }: Props<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selected = selectedRows.map((r) => r.original as TemplateTagihan)

  const exportToCsv = () => {
    showSubmittedData(selected, {
      loading: "Mengekspor template tagihan...",
      success: () => {
        return `Diekspor ${selected.length} template tagihan ke CSV.`
      },
    })
  }

  return (
    <TooltipProvider>
      <>
        <BulkActionsToolbar table={table} entityName="template tagihan">
          <DropdownMenuItem
            onClick={exportToCsv}
            className="flex cursor-pointer items-center"
            aria-label="Export template tagihan"
            title="Export template tagihan"
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="sr-only">Export template tagihan</span>
            <div>
              <p>Export template tagihan</p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowDeleteConfirm(true)}
            className="flex cursor-pointer items-center text-destructive focus:text-destructive"
            aria-label="Hapus template tagihan terpilih"
            title="Hapus template tagihan terpilih"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span className="sr-only">Hapus template tagihan</span>
            <div>
              <p>Hapus template tagihan terpilih</p>
            </div>
          </DropdownMenuItem>
        </BulkActionsToolbar>

        <TemplateTagihanMultiDeleteDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} table={table} />
      </>
    </TooltipProvider>
  )
}
