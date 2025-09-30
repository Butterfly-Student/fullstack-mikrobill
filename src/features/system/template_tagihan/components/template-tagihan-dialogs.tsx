import { ConfirmDialog } from "@/components/confirm-dialog"
import { showSubmittedData } from "@/lib/show-submitted-data"
import { TemplateTagihanImportDialog } from "./template-tagihan-import-dialog"
import { TemplateTagihanMutateDrawer } from "./template-tagihan-mutate-drawer"
import { useTemplateTagihan } from "./template-tagihan-provider"

export function TemplateTagihanDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useTemplateTagihan()

  return (
    <>
      <TemplateTagihanMutateDrawer
        key="template-tagihan-create"
        open={open === "create"}
        onOpenChange={() => setOpen("create")}
      />

      <TemplateTagihanImportDialog
        key="template-tagihan-import"
        open={open === "import"}
        onOpenChange={() => setOpen("import")}
      />

      {currentRow && (
        <>
          <TemplateTagihanMutateDrawer
            key={`template-tagihan-update-${currentRow.id}`}
            open={open === "update"}
            onOpenChange={() => setOpen("update")}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key="template-tagihan-delete"
            open={open === "delete"}
            onOpenChange={() => setOpen("delete")}
            onConfirm={() => {
              setOpen(null)
              setCurrentRow(null)
              showSubmittedData(currentRow, "Template tagihan berikut telah dihapus:")
            }}
            title={`Hapus template tagihan: ${currentRow.nama} ?`}
            description={
              <>
                Anda akan menghapus template tagihan dengan nama <strong>{currentRow.nama}</strong>. <br />
                Tindakan ini tidak dapat dibatalkan.
              </>
            }
          />
        </>
      )}
    </>
  )
}
