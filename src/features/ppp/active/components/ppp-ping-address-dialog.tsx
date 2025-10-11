import {
  Activity,
  Wifi,
  WifiOff,
  Play,
  Square,
  Trash2,
  Signal,
} from 'lucide-react'
import { type IRosOptions } from 'routeros-api'
import { useMikrotikStream } from '@/hooks/use-mikrotil-stream'
import { useRouterManagement } from '@/hooks/use-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
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

  if (!data) return null

  // Format ping result untuk display
  const formatPingResult = (item: any) => {
    if (!item) return null

    const time = item.time || item['time']
    const ttl = item.ttl || item['ttl']
    const size = item.size || item['size']
    const sent = item.sent || item['sent']
    const received = item.received || item['received']

    return { time, ttl, size, sent, received }
  }

  const latestResult = formatPingResult(latestData)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[550px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Activity className='h-5 w-5' />
            Ping Test
          </DialogTitle>
          <DialogDescription>
            Testing connectivity to{' '}
            <span className='font-mono font-semibold'>{data.address}</span>
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Connection Info Card */}
          <Card>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <p className='text-muted-foreground text-sm'>User</p>
                  <p className='font-medium'>{data.name}</p>
                </div>
                <div className='flex gap-2'>
                  <Badge
                    variant={isConnected ? 'default' : 'destructive'}
                    className='gap-1'
                  >
                    {isConnected ? (
                      <>
                        <Wifi className='h-3 w-3' />
                        Connected
                      </>
                    ) : (
                      <>
                        <WifiOff className='h-3 w-3' />
                        Disconnected
                      </>
                    )}
                  </Badge>
                  {isSubscribed && (
                    <Badge variant='secondary' className='gap-1'>
                      <Signal className='h-3 w-3' />
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className='flex gap-2'>
            <Button
              onClick={subscribe}
              disabled={!isConnected || isSubscribed}
              size='sm'
              className='flex-1'
            >
              <Play className='mr-2 h-4 w-4' />
              Start
            </Button>
            <Button
              onClick={unsubscribe}
              disabled={!isSubscribed}
              variant='outline'
              size='sm'
              className='flex-1'
            >
              <Square className='mr-2 h-4 w-4' />
              Stop
            </Button>
            <Button
              onClick={clearData}
              variant='ghost'
              size='sm'
              disabled={pingData.length === 0}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
              <strong className='font-medium'>Error:</strong> {error}
            </div>
          )}

          {/* Latest Result - Compact */}
          {latestResult && (
            <Card className='border-primary/20 bg-primary/5'>
              <CardContent className='pt-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <Signal className='text-primary h-4 w-4' />
                  <span className='text-sm font-medium'>Latest Result</span>
                </div>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  {latestResult.time && (
                    <div>
                      <span className='text-muted-foreground'>Time:</span>
                      <span className='ml-2 font-mono font-medium'>
                        {latestResult.time}
                      </span>
                    </div>
                  )}
                  {latestResult.ttl && (
                    <div>
                      <span className='text-muted-foreground'>TTL:</span>
                      <span className='ml-2 font-mono font-medium'>
                        {latestResult.ttl}
                      </span>
                    </div>
                  )}
                  {latestResult.sent !== undefined && (
                    <div>
                      <span className='text-muted-foreground'>Sent:</span>
                      <span className='ml-2 font-mono font-medium'>
                        {latestResult.sent}
                      </span>
                    </div>
                  )}
                  {latestResult.received !== undefined && (
                    <div>
                      <span className='text-muted-foreground'>Received:</span>
                      <span className='ml-2 font-mono font-medium'>
                        {latestResult.received}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ping History */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-medium'>History</h3>
              <Badge variant='outline'>{pingData.length} results</Badge>
            </div>

            <ScrollArea className='bg-muted/30 h-[200px] rounded-lg border'>
              {pingData.length === 0 ? (
                <div className='flex h-full items-center justify-center p-8 text-center'>
                  <div className='space-y-2'>
                    <Activity className='text-muted-foreground/50 mx-auto h-8 w-8' />
                    <p className='text-muted-foreground text-sm'>
                      No ping data yet. Click Start to begin.
                    </p>
                  </div>
                </div>
              ) : (
                <div className='space-y-2 p-3'>
                  {pingData.map((item, idx) => {
                    const result = formatPingResult(item)
                    return (
                      <div
                        key={idx}
                        className='bg-background hover:bg-muted/50 rounded-md border p-2.5 text-xs transition-colors'
                      >
                        <div className='flex items-center justify-between'>
                          <span className='text-muted-foreground'>
                            #{idx + 1}
                          </span>
                          <div className='flex gap-3 font-mono'>
                            {result?.time && (
                              <span>
                                <span className='text-muted-foreground'>
                                  time:
                                </span>{' '}
                                <span className='font-medium'>
                                  {result.time}
                                </span>
                              </span>
                            )}
                            {result?.ttl && (
                              <span>
                                <span className='text-muted-foreground'>
                                  ttl:
                                </span>{' '}
                                <span className='font-medium'>
                                  {result.ttl}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
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
