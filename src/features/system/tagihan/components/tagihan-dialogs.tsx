import { showSubmittedData } from "@/lib/show-submitted-data"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { TagihanImportDialog } from "./tagihan-import-dialog"
import { TagihanMutateDrawer } from "./tagihan-mutate-drawer"
import { useTagihan } from "./tagihan-provider"

export function TagihanDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useTagihan()
  return (
    <>
      <TagihanMutateDrawer key="tagihan-create" open={open === "create"} onOpenChange={() => setOpen("create")} />

      <TagihanImportDialog key="tagihan-import" open={open === "import"} onOpenChange={() => setOpen("import")} />

      {currentRow && (
        <>
          <TagihanMutateDrawer
            key={`tagihan-update-${currentRow.id}`}
            open={open === "update"}
            onOpenChange={() => {
              setOpen("update")
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key="tagihan-delete"
            destructive
            open={open === "delete"}
            onOpenChange={() => {
              setOpen("delete")
              setTimeout(() => setCurrentRow(null), 500)
            }}
            handleConfirm={() => {
              setOpen(null)
              setTimeout(() => setCurrentRow(null), 500)
              showSubmittedData(currentRow, "Tagihan berikut telah dihapus:")
            }}
            className="max-w-md"
            title={`Hapus tagihan: ${currentRow.noTagihan} ?`}
            desc={
              <>
                Anda akan menghapus tagihan dengan No <strong>{currentRow.noTagihan}</strong>. <br />
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
