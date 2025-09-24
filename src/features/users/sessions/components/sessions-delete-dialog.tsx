'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Session } from '../data/schema'

type SessionDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Session
}

export function SessionsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: SessionDeleteDialogProps) {
  const [value, setValue] = useState('')
  const sessionIdShort = currentRow.id.substring(0, 8) + '...'

  const handleDelete = () => {
    if (value.trim() !== sessionIdShort) return

    onOpenChange(false)
    showSubmittedData(currentRow, 'The following session has been deleted:')
  }

  const isExpired = currentRow.expiresAt < new Date()
  const statusText = isExpired ? 'expired' : 'active'

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== sessionIdShort}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete Session
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete session{' '}
            <span className='font-mono font-bold'>{sessionIdShort}</span>?
            <br />
            This action will permanently remove the{' '}
            <span className='font-bold'>{statusText.toUpperCase()}</span>{' '}
            session for user{' '}
            <span className='font-mono font-bold'>{currentRow.userId}</span>{' '}
            from the system. This cannot be undone.
          </p>

          <Label className='my-2'>
            Session ID (first 8 characters + ...):
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter "${sessionIdShort}" to confirm deletion.`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation cannot be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}