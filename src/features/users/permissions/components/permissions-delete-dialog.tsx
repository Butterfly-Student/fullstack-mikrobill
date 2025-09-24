'use client'
import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Permission } from '../data/schema'

type PermissionDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Permission
}

export function PermissionsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: PermissionDeleteDialogProps) {
  const [value, setValue] = useState('')

  const handleDelete = () => {
    if (value.trim() !== currentRow.name) return
    onOpenChange(false)
    showSubmittedData(currentRow, 'The following permission has been deleted:')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.name}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete Permission
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.name}</span>?
            <br />
            This action will permanently remove this permission and may affect user access rights.
            This cannot be undone.
          </p>
          <Label className='my-2'>
            Permission Name:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter permission name to confirm deletion.'
            />
          </Label>
          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back and may impact system security.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}