'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ExternalLink,
  Terminal,
  Globe,
  Wifi,
  Shield,
  Copy,
  CheckCircle
} from 'lucide-react'
import { type Router } from '../data/schema'

type RouterConnectDialogProps = {
  currentRow: Router
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoutersConnectDialog({
  currentRow,
  open,
  onOpenChange,
}: RouterConnectDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const webUrl = `http://${currentRow.hostname}${currentRow.port === 80 ? '' : `:${currentRow.port}`}`
  const httpsUrl = `https://${currentRow.hostname}${currentRow.port === 443 ? '' : `:${currentRow.port}`}`
  const sshCommand = `ssh ${currentRow.username}@${currentRow.hostname}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <Wifi size={20} />
            Connect to Router
          </DialogTitle>
          <DialogDescription>
            Connection options for {currentRow.name}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Router Info */}
          <div className='rounded-lg border p-4 space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='font-medium'>{currentRow.name}</span>
              <Badge variant={currentRow.status === 'online' ? 'default' : 'secondary'}>
                {currentRow.status}
              </Badge>
            </div>
            <div className='text-sm text-muted-foreground space-y-1'>
              <div className='flex items-center gap-2'>
                <span className='font-mono'>{currentRow.hostname}:{currentRow.port}</span>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-6 w-6 p-0'
                  onClick={() => copyToClipboard(`${currentRow.hostname}:${currentRow.port}`, 'address')}
                >
                  {copiedField === 'address' ? (
                    <CheckCircle size={14} className='text-green-500' />
                  ) : (
                    <Copy size={14} />
                  )}
                </Button>
              </div>
              {currentRow.location && <div>📍 {currentRow.location}</div>}
            </div>
          </div>

          <Separator />

          {/* Connection Methods */}
          <div className='space-y-3'>
            <h4 className='font-medium flex items-center gap-2'>
              <Terminal size={16} />
              Connection Methods
            </h4>

            {/* Web Interface */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Globe size={16} className='text-muted-foreground' />
                <span className='text-sm font-medium'>Web Interface</span>
              </div>
              <div className='grid gap-2'>
                <div className='flex items-center gap-2'>
                  <code className='bg-muted px-2 py-1 rounded text-xs flex-1'>
                    {webUrl}
                  </code>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => window.open(webUrl, '_blank')}
                    className='h-8'
                  >
                    <ExternalLink size={14} />
                  </Button>
                </div>
                {currentRow.port !== 80 && (
                  <div className='flex items-center gap-2'>
                    <code className='bg-muted px-2 py-1 rounded text-xs flex-1'>
                      {httpsUrl}
                    </code>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => window.open(httpsUrl, '_blank')}
                      className='h-8'
                    >
                      <ExternalLink size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* SSH Access */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Terminal size={16} className='text-muted-foreground' />
                <span className='text-sm font-medium'>SSH Access</span>
              </div>
              <div className='flex items-center gap-2'>
                <code className='bg-muted px-2 py-1 rounded text-xs flex-1'>
                  {sshCommand}
                </code>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => copyToClipboard(sshCommand, 'ssh')}
                  className='h-8'
                >
                  {copiedField === 'ssh' ? (
                    <CheckCircle size={14} className='text-green-500' />
                  ) : (
                    <Copy size={14} />
                  )}
                </Button>
              </div>
            </div>

            {/* Credentials */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Shield size={16} className='text-muted-foreground' />
                <span className='text-sm font-medium'>Credentials</span>
              </div>
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div>
                  <span className='text-muted-foreground'>Username:</span>
                  <div className='font-mono bg-muted px-2 py-1 rounded mt-1'>
                    {currentRow.username}
                  </div>
                </div>
                <div>
                  <span className='text-muted-foreground'>Password:</span>
                  <div className='font-mono bg-muted px-2 py-1 rounded mt-1'>
                    ••••••••
                  </div>
                </div>
              </div>
            </div>
          </div>

          {currentRow.status !== 'online' && (
            <div className='rounded-lg border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950'>
              <div className='flex items-center gap-2 text-yellow-800 dark:text-yellow-200'>
                <span className='text-sm'>
                  ⚠️ Router appears to be offline. Connection may fail.
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}