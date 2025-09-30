"use client"

import { useState } from "react"
import type { Table } from "@tanstack/react-table"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { sleep } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmDialog } from "@/components/confirm-dialog"

type PelangganMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = "DELETE"

export function PelangganMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: PelangganMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState("")

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Ketik "${CONFIRM_WORD}" untuk konfirmasi.`)
      return
    }

    onOpenChange(false)

    toast.promise(sleep(2000), {
      loading: "Menghapus pelanggan...",
      success: () => {
        table.resetRowSelection()
        return `Terhapus ${selectedRows.length} ${selectedRows.length > 1 ? "pelanggan" : "pelanggan"}`
      },
      error: "Error",
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className="text-destructive">
          <AlertTriangle className="stroke-destructive me-1 inline-block" size={18} /> Hapus {selectedRows.length}{" "}
          pelanggan
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Apakah Anda yakin ingin menghapus pelanggan terpilih? <br />
            Tindakan ini tidak dapat dibatalkan.
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span>Konfirmasi dengan mengetik "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Ketik "${CONFIRM_WORD}" untuk konfirmasi.`}
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Peringatan!</AlertTitle>
            <AlertDescription>Operasi ini tidak bisa di-rollback.</AlertDescription>
          </Alert>
        </div>
      }
      confirmText="Delete"
      destructive
    />
  )
}
