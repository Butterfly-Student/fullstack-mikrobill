'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type RoleRelation } from '../data/schema'

type RoleRelationDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: RoleRelation
  roleName?: string
}

export function RolesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  roleName = 'Unknown Role',
}: RoleRelationDeleteDialogProps) {
  const [value, setValue] = useState('')

  // Create a confirmation string based on role relation ID
  const confirmationString = `role-${currentRow.id}`

  const handleDelete = () => {
    if (value.trim() !== confirmationString) return

    onOpenChange(false)
    showSubmittedData(currentRow, 'The following role relation has been deleted:')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== confirmationString}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Delete Role Relation
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete this role relation?
            <br />
            <span className='font-bold'>Role:</span> {roleName}
            <br />
            {currentRow.userId && (
              <>
                <span className='font-bold'>User ID:</span> {currentRow.userId}
                <br />
              </>
            )}
            {currentRow.assigned_by && (
              <>
                <span className='font-bold'>Assigned by:</span> {currentRow.assigned_by}
                <br />
              </>
            )}
            This action will permanently remove this role relation and all associated permissions from the system. This cannot be undone.
          </p>

          <Label className='my-2'>
            Type "{confirmationString}" to confirm deletion:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter ${confirmationString} to confirm deletion.`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation can not be rolled back.
              {currentRow.permission && currentRow.permission.length > 0 &&
                ` This will also remove ${currentRow.permission.length} associated permission(s).`
              }
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Delete'
      destructive
    />
  )
}