// import { RoutersActionDialog } from './routers-action-dialog'
// import { RoutersDeleteDialog } from './routers-delete-dialog'
// import { RoutersConnectDialog } from './routers-connect-dialog'
// import { RoutersTestConnectionDialog } from './routers-test-connection-dialog'
import { RoutersActionDialog } from './routers-action-dialog'
import { RoutersConnectDialog } from './routers-connect-dialog'
import { RoutersDeleteDialog } from './routers-delete-dialog'
import { useRouters } from './routers-provider'
import { RoutersTestConnectionDialog } from './routers-test-connection-dialog'

export function RoutersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useRouters()

  return (
    <>
      <RoutersActionDialog
        key='router-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <RoutersActionDialog
            key={`router-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <RoutersConnectDialog
            key={`router-connect-${currentRow.id}`}
            open={open === 'connect'}
            onOpenChange={() => {
              setOpen('connect')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <RoutersTestConnectionDialog
            key={`router-test-${currentRow.id}`}
            open={open === 'test-connection'}
            onOpenChange={() => {
              setOpen('test-connection')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <RoutersDeleteDialog
            key={`router-delete-${currentRow.id}`}
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