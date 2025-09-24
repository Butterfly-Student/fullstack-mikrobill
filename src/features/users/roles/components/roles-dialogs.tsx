import { RolesActionDialog } from './roles-action-dialog'
import { RolesDeleteDialog } from './roles-delete-dialog'
import { useRoles } from './roles-provider'

export function RolesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useRoles()
  return (
    <>
      <RolesActionDialog
        key='role-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <RolesActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <RolesDeleteDialog
            key={`user-delete-${currentRow.id}`}
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
