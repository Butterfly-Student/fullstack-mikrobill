import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { usePppoeSecret } from '../../hooks/use-ppp'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type PppoeActive } from '../../data/schema'

type PppActiveMultiDisconnectDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = 'DISCONNECT'

export function PppActiveMultiDisconnectDialog<TData>({
  open,
  onOpenChange,
  table,
}: PppActiveMultiDisconnectDialogProps<TData>) {
  const [value, setValue] = useState('')
  const { disconnectSession } = usePppoeSecret()

  const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedSessions = selectedRows.map((row) => row.original as PppoeActive)
    const selectedIds = selectedSessions.map((row) => row['.id'])

  const handleDisconnect = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }

    disconnectSession.mutate(
      { sessionId: selectedIds },
      {
        onSuccess: () => {
          table.resetRowSelection()
          setValue('')
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen)
        if (!isOpen) setValue('')
      }}
      handleConfirm={handleDisconnect}
      disabled={value.trim() !== CONFIRM_WORD || disconnectSession.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Disconnect {selectedRows.length}{' '}
          {selectedRows.length > 1 ? 'sessions' : 'session'}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to disconnect the selected sessions? <br />
            Users will be disconnected immediately.
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span>Confirm by typing "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              This will immediately disconnect all selected PPPoE sessions.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Disconnect'
      destructive
    />
  )
}
