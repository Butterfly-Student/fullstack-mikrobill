import { SessionsExtendDialog } from './sessions-extend-dialog'
import { SessionsRevokeDialog } from './sessions-revoke-dialog'
import { SessionsDetailsDialog } from './sessions-details-dialog'
import { SessionsDeleteDialog } from './sessions-delete-dialog'
import { useSessions } from './sessions-provider'

export function SessionsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSessions()

  const handleDialogClose = (dialogType: string) => {
    setOpen(null)
    // Delay clearing currentRow to allow for smooth dialog transitions
    setTimeout(() => {
      setCurrentRow(null)
    }, 300)
  }

  return (
    <>
      {currentRow && (
        <>
          <SessionsDetailsDialog
            key={`session-details-${currentRow.id}`}
            open={open === 'details'}
            onOpenChange={() => handleDialogClose('details')}
            currentRow={currentRow}
          />

          <SessionsExtendDialog
            key={`session-extend-${currentRow.id}`}
            open={open === 'extend'}
            onOpenChange={() => handleDialogClose('extend')}
            currentRow={currentRow}
          />

          <SessionsRevokeDialog
            key={`session-revoke-${currentRow.id}`}
            open={open === 'revoke'}
            onOpenChange={() => handleDialogClose('revoke')}
            currentRow={currentRow}
          />

          <SessionsDeleteDialog
            key={`session-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => handleDialogClose('delete')}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}