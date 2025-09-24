import { PermissionsActionDialog } from './permissions-action-dialog'
import { PermissionsDeleteDialog } from './permissions-delete-dialog'
import { usePermissions } from './permissions-provider'

export function PermissionsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePermissions()

  return (
    <>
      <PermissionsActionDialog
        key='permission-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <PermissionsActionDialog
            key={`permission-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
          <PermissionsDeleteDialog
            key={`permission-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}