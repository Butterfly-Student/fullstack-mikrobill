import { usePppoeSecret } from '../hooks/ppp-active'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { usePppActive } from './ppp-provider'
import { PppPingAddressDialog } from './ppp-ping-address-dialog'

export function PppActiveDialog() {
  const { open, setOpen, currentRow } = usePppActive()
  const { disconnectSession } = usePppoeSecret()

  const handleDisconnect = () => {
    if (!currentRow) return

    disconnectSession.mutate(
      { sessionId: currentRow['.id'] },
      {
        onSuccess: () => {
          setOpen(null)
        },
      }
    )
  }

  return (
    <>
      {currentRow && (
        <>
        <ConfirmDialog
          key='session-disconnect'
          destructive
          open={open === 'disconnect'}
          onOpenChange={() => setOpen(null)}
          handleConfirm={handleDisconnect}
          disabled={disconnectSession.isPending}
          className='max-w-md'
          title={`Disconnect session: ${currentRow.name}?`}
          desc={
            <>
              You are about to disconnect the PPPoE session for user{' '}
              <strong>{currentRow.name}</strong>
              {currentRow.address && (
                <>
                  {' '}
                  with IP <strong>{currentRow.address}</strong>
                </>
              )}
              . <br />
              The user will be disconnected immediately.
            </>
          }
          confirmText='Disconnect'
        />
        <PppPingAddressDialog key='ppp-ping' open={open === 'ping'} onOpenChange={() => setOpen(null)} data={currentRow} />
      </>
      )}
    </>
  )
}
