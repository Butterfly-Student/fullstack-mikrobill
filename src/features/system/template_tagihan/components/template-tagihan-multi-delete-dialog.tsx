import type { Table } from "@tanstack/react-table"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { showSubmittedData } from "@/lib/show-submitted-data"

type TemplateTagihanMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

export function TemplateTagihanMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: TemplateTagihanMultiDeleteDialogProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const onConfirm = () => {
    onOpenChange(false)
    table.resetRowSelection()
    showSubmittedData(
      selectedRows.map((row) => row.original),
      `Terhapus ${selectedRows.length} ${selectedRows.length > 1 ? "template tagihan" : "template tagihan"}`,
    )
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={`Hapus ${selectedRows.length} template tagihan?`}
      description={
        <>
          Apakah Anda yakin ingin menghapus template tagihan terpilih? <br />
          Tindakan ini tidak dapat dibatalkan.
        </>
      }
    />
  )
}
