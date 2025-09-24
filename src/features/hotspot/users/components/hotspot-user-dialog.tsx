import { AddUserHotspotDialog } from './add-user-action-dialog'
import { EditUserHotspotDialog } from './edit-user-action-dialog'
import { useHotspotUser } from './hotspot-user-provider'

export function HotspotUsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useHotspotUser()
  return (
    <>
      <AddUserHotspotDialog
        key='hotspot-user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <EditUserHotspotDialog
            key={`hotspot-user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
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
