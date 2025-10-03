import { showSubmittedData } from '@/lib/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { TasksImportDialog } from './ppp-import-dialog'
import { PppPingAddressDialog } from './ppp-ping-address-dialog'
import { usePppActive } from './ppp-provider'

export function PppDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePppActive()
  return (
    <>
      <TasksImportDialog
        key='tasks-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <ConfirmDialog
            key='task-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
              showSubmittedData(
                currentRow,
                'The following task has been deleted:'
              )
            }}
            className='max-w-md'
            title={`Delete this task: ${currentRow['.id']} ?`}
            desc={
              <>
                You are about to delete a task with the ID{' '}
                <strong>{currentRow['.id']}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
          <PppPingAddressDialog
            key='ppp-ping'
            open={open === 'ping'}
            onOpenChange={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 300)
            }}
            data={currentRow}
          />
        </>
      )}
    </>
  )
}
