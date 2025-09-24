import { Eye, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { type Session } from '../data/schema'

type SessionDetailsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Session
}

export function SessionsDetailsDialog({
  open,
  onOpenChange,
  currentRow,
}: SessionDetailsDialogProps) {
  if (!currentRow) return null

  const isExpired = currentRow.expiresAt < new Date()
  const now = new Date()
  const hoursDiff = Math.round((currentRow.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60))
  const isExpiringSoon = hoursDiff <= 24 && hoursDiff > 0

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const getStatusBadge = () => {
    if (isExpired) {
      return <Badge variant='destructive'>Expired</Badge>
    }
    if (isExpiringSoon) {
      return <Badge variant='secondary'>Expiring Soon</Badge>
    }
    return <Badge variant='default'>Active</Badge>
  }

  const formatDuration = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h`
    }
    return `${diffHours}h`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <Eye /> Session Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this session
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>Status</span>
            {getStatusBadge()}
          </div>

          <Separator />

          <div className='grid grid-cols-1 gap-4'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Session ID</span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleCopy(currentRow.id, 'Session ID')}
                  className='h-auto p-1'
                >
                  <Copy size={14} />
                </Button>
              </div>
              <div className='bg-muted p-2 rounded text-xs font-mono break-all'>
                {currentRow.id}
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Token</span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleCopy(currentRow.token, 'Token')}
                  className='h-auto p-1'
                >
                  <Copy size={14} />
                </Button>
              </div>
              <div className='bg-muted p-2 rounded text-xs font-mono break-all'>
                {currentRow.token.substring(0, 20)}...{currentRow.token.slice(-8)}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <span className='text-sm font-medium'>User ID</span>
                <div className='text-sm text-muted-foreground font-mono'>
                  {currentRow.userId}
                </div>
              </div>
              <div className='space-y-1'>
                <span className='text-sm font-medium'>IP Address</span>
                <div className='text-sm text-muted-foreground font-mono'>
                  {currentRow.ipAddress || 'Unknown'}
                </div>
              </div>
            </div>

            {currentRow.userAgent && (
              <div className='space-y-2'>
                <span className='text-sm font-medium'>User Agent</span>
                <div className='bg-muted p-2 rounded text-xs text-muted-foreground break-all'>
                  {currentRow.userAgent}
                </div>
              </div>
            )}

            {currentRow.impersonatedBy && (
              <div className='space-y-1'>
                <span className='text-sm font-medium'>Impersonated By</span>
                <Badge variant='secondary' className='font-mono text-xs'>
                  {currentRow.impersonatedBy}
                </Badge>
              </div>
            )}

            <Separator />

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <span className='text-sm font-medium'>Created</span>
                <div className='text-sm text-muted-foreground'>
                  {currentRow.createdAt.toLocaleString()}
                </div>
              </div>
              <div className='space-y-1'>
                <span className='text-sm font-medium'>Expires</span>
                <div className={`text-sm ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {currentRow.expiresAt.toLocaleString()}
                </div>
              </div>
            </div>

            <div className='space-y-1'>
              <span className='text-sm font-medium'>Session Duration</span>
              <div className='text-sm text-muted-foreground'>
                {formatDuration(currentRow.createdAt, currentRow.expiresAt)}
              </div>
            </div>

            {!isExpired && (
              <div className='space-y-1'>
                <span className='text-sm font-medium'>Time Remaining</span>
                <div className={`text-sm ${isExpiringSoon ? 'text-orange-600' : 'text-muted-foreground'}`}>
                  {hoursDiff > 0 ? `${hoursDiff}h remaining` : 'Expires very soon'}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className='gap-y-2'>
          <DialogClose asChild>
            <Button variant='outline'>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}