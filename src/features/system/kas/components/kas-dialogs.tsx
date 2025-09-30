import { showSubmittedData } from "@/lib/show-submitted-data"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { KasImportDialog } from "./kas-import-dialog"
import { KasMutateDrawer } from "./kas-mutate-drawer"
import { useKas } from "./kas-provider"

export function KasDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useKas()
  return (
    <>
      <KasMutateDrawer key="kas-create" open={open === "create"} onOpenChange={() => setOpen("create")} />

      <KasImportDialog key="kas-import" open={open === "import"} onOpenChange={() => setOpen("import")} />

      {currentRow && (
        <>
          <KasMutateDrawer
            key={`kas-update-${currentRow.id}`}
            open={open === "update"}
            onOpenChange={() => {
              setOpen("update")
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key="kas-delete"
            destructive
            open={open === "delete"}
            onOpenChange={() => {
              setOpen("delete")
              setTimeout(() => setCurrentRow(null), 500)
            }}
            handleConfirm={() => {
              setOpen(null)
              setTimeout(() => setCurrentRow(null), 500)
              showSubmittedData(currentRow, "Transaksi kas berikut telah dihapus:")
            }}
            className="max-w-md"
            title={`Hapus transaksi kas: ${currentRow.id} ?`}
            desc={
              <>
                Anda akan menghapus transaksi kas dengan ID <strong>{currentRow.id}</strong>. <br />
                Tindakan ini tidak dapat dibatalkan.
              </>
            }
            confirmText="Delete"
          />
        </>
      )}
    </>
  )
}
