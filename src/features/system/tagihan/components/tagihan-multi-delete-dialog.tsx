"use client"

import { useState } from "react"
import type { Table } from "@tanstack/react-table"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useTagihan } from "@/features/system/tagihan/hooks/tagihan"

type TagihanData = {
  id: string
  [key: string]: unknown
}

type TagihanMultiDeleteDialogProps<TData extends TagihanData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = "DELETE"

export function TagihanMultiDeleteDialog<TData extends TagihanData>({
  open,
  onOpenChange,
  table
}: TagihanMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState("")

  // Import hook dan mutation
  const { deleteMultipleTagihan, isDeletingMultiple } = useTagihan()

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Ketik "${CONFIRM_WORD}" untuk konfirmasi.`)
      return
    }

    // Extract IDs dari selected rows
    const tagihanIds = selectedRows.map((row) => row.original.id)

    if (tagihanIds.length === 0) {
      toast.error("Tidak ada tagihan yang dipilih")
      return
    }

    // Jalankan mutation
    deleteMultipleTagihan.mutate(
      { tagihanIds },
      {
        onSuccess: () => {
          // Reset selection dan close dialog
          table.resetRowSelection()
          onOpenChange(false)
          setValue("") // Reset input
        },
        onError: () => {
          // Error handling sudah ada di hook
          // Dialog tetap terbuka agar user bisa retry
        }
      }
    )
  }

  // Reset value saat dialog ditutup
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setValue("")
    }
    onOpenChange(newOpen)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD || isDeletingMultiple}
      title={
        <span className="text-destructive">
          <AlertTriangle className="stroke-destructive me-1 inline-block" size={18} />
          Hapus {selectedRows.length} tagihan
        </span>
      }
      desc={
        <div className="space-y-4">
          <p className="mb-2">
            Apakah Anda yakin ingin menghapus {selectedRows.length} tagihan terpilih? <br />
            Tindakan ini tidak dapat dibatalkan.
          </p>

          <Label className="my-4 flex flex-col items-start gap-1.5">
            <span>Konfirmasi dengan mengetik "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Ketik "${CONFIRM_WORD}" untuk konfirmasi.`}
              disabled={isDeletingMultiple}
            />
          </Label>

          <Alert variant="destructive">
            <AlertTitle>Peringatan!</AlertTitle>
            <AlertDescription>
              Operasi ini tidak bisa di-rollback. {selectedRows.length} tagihan akan dihapus permanen.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isDeletingMultiple ? "Menghapus..." : "Delete"}
      destructive
    />
  )
}