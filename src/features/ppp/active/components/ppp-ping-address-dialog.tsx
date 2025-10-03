import { type IRosOptions } from 'routeros-api'
import { useMikrotikStream } from '@/hooks/use-mikrotil-stream'
import { useRouterManagement } from '@/hooks/use-router'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type PppoeActive } from '../../data/schema'

type PppPingAddressDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: PppoeActive | null
}

export function PppPingAddressDialog({
  open,
  onOpenChange,
  data,
}: PppPingAddressDialogProps) {
  const { activeRouter } = useRouterManagement()

  // Ping monitor configuration
  const config: IRosOptions = {
    host: activeRouter?.hostname ?? '',
    user: activeRouter?.username,
    password: activeRouter?.password,
    port: activeRouter?.port || 8728,
    timeout: activeRouter?.timeout || 10000,
    keepalive: activeRouter?.keepalive ?? true,
  }

  const {
    isConnected,
    isSubscribed,
    data: pingData,
    latestData,
    error,
    subscribe,
    unsubscribe,
    clearData,
  } = useMikrotikStream(
    '/ping',
    config,
    data?.address
      ? [`=address=${data.address}`, '=count=4', '=interval=1s']
      : [],
    {
      maxDataPoints: 50,
    }
  )
  console.log(pingData)

  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>Ping Address - Test Mode</DialogTitle>
          <DialogDescription>
            Testing connectivity to {data.address}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Connection Info */}
          <div className='bg-muted/50 rounded-lg border p-4'>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <span className='text-muted-foreground text-xs'>Name:</span>
                <p className='font-medium'>{data.name}</p>
              </div>
              <div>
                <span className='text-muted-foreground text-xs'>Address:</span>
                <p className='font-mono font-medium'>{data.address}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className='flex items-center gap-4'>
            <span
              className={`rounded px-3 py-1 ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            {isSubscribed && (
              <span className='rounded bg-blue-100 px-3 py-1 text-blue-800'>
                📡 Monitoring Active
              </span>
            )}
          </div>

          {/* Controls */}
          <div className='flex gap-2'>
            <Button
              onClick={subscribe}
              disabled={!isConnected || isSubscribed}
              size='sm'
            >
              Start Ping
            </Button>
            <Button
              onClick={unsubscribe}
              disabled={!isSubscribed}
              variant='destructive'
              size='sm'
            >
              Stop Ping
            </Button>
            <Button onClick={clearData} variant='outline' size='sm'>
              Clear Data
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className='rounded bg-red-100 p-4 text-red-700'>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Latest Result */}
          <div className='rounded border bg-white p-4 shadow'>
            <h3 className='mb-2 text-sm font-semibold'>Latest Result:</h3>
            <pre className='overflow-auto rounded bg-gray-50 p-3 text-xs'>
              {latestData ? JSON.stringify(latestData, null, 2) : 'No data yet'}
            </pre>
          </div>

          {/* Ping History */}
          <div className='rounded border bg-white p-4 shadow'>
            <h3 className='mb-2 text-sm font-semibold'>
              Ping History ({pingData.length} results)
            </h3>
            <div className='max-h-64 overflow-auto'>
              {pingData.length === 0 ? (
                <p className='text-sm text-gray-500'>No ping data yet</p>
              ) : (
                <div className='space-y-2'>
                  {pingData.map((item, idx) => (
                    <div
                      key={idx}
                      className='rounded border border-gray-200 bg-gray-50 p-2 text-xs'
                    >
                      <pre>{JSON.stringify(item, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
