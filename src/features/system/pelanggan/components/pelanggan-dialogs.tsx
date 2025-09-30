import { ConfirmDialog } from "@/components/confirm-dialog"
import { PelangganImportDialog } from "./pelanggan-import-dialog"
import { PelangganMutateDrawer } from "./pelanggan-mutate-drawer"
import { usePelanggan } from "./pelanggan-provider"
import { usePelanggan as usePelangganHook } from "../hooks/pelanggan" // Sesuaikan dengan path yang benar

export function PelangganDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePelanggan()
  const { deletePelanggan, isDeleting } = usePelangganHook()

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      await deletePelanggan.mutateAsync({
        pelangganId: currentRow.id
      })

      // Tutup dialog dan reset state
      setOpen(null)
      setTimeout(() => setCurrentRow(null), 500)
    } catch (error) {
      // Error sudah ditangani di mutation hook melalui toast
      console.error("Delete failed:", error)
    }
  }

  return (
    <>
      <PelangganMutateDrawer key="pelanggan-create" open={open === "create"} onOpenChange={() => setOpen("create")} />
      <PelangganImportDialog key="pelanggan-import" open={open === "import"} onOpenChange={() => setOpen("import")} />
      {currentRow && (
        <>
          <PelangganMutateDrawer
            key={`pelanggan-update-${currentRow.id}`}
            open={open === "update"}
            onOpenChange={() => {
              setOpen("update")
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />
          <ConfirmDialog
            key="pelanggan-delete"
            destructive
            open={open === "delete"}
            onOpenChange={() => {
              setOpen("delete")
              setTimeout(() => setCurrentRow(null), 500)
            }}
            handleConfirm={handleDelete}
            className="max-w-md"
            title={`Hapus pelanggan: ${currentRow.id} ?`}
            desc={
              <>
                Anda akan menghapus pelanggan dengan ID <strong>{currentRow.id}</strong>. <br />
                Tindakan ini tidak dapat dibatalkan.
              </>
            }
            confirmText={isDeleting ? "Menghapus..." : "Delete"}
            disabled={isDeleting}
          />
        </>
      )}
    </>
  )
}