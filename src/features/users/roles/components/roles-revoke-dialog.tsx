'use client'

import { useState } from 'react'
import { UserMinus } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type RoleRelation } from '../data/schema'

type RoleRevokeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: RoleRelation
  roleName?: string
}

export function RoleRevokeDialog({
  open,
  onOpenChange,
  currentRow,
  roleName = 'Unknown Role',
}: RoleRevokeDialogProps) {
  const [value, setValue] = useState('')

  // Create a confirmation string
  const confirmationString = 'REVOKE'

  const handleRevoke = () => {
    if (value.trim() !== confirmationString) return

    onOpenChange(false)
    showSubmittedData(currentRow, 'The following role has been revoked:')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleRevoke}
      disabled={value.trim() !== confirmationString}
      title={
        <span className='text-orange-600'>
          <UserMinus
            className='stroke-orange-600 me-1 inline-block'
            size={18}
          />{' '}
          Revoke Role
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to revoke this role assignment?
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
                <span className='font-bold'>Originally assigned by:</span> {currentRow.assigned_by}
                <br />
              </>
            )}
            {currentRow.assignedAt && (
              <>
                <span className='font-bold'>Assigned on:</span> {new Date(currentRow.assignedAt).toLocaleDateString()}
                <br />
              </>
            )}
            This will remove the user's access to this role and its associated permissions.
          </p>

          <Label className='my-2'>
            Type "REVOKE" to confirm:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter REVOKE to confirm'
            />
          </Label>

          <Alert>
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              Revoking this role will immediately remove the user's access to associated permissions.
              {currentRow.permission && currentRow.permission.length > 0 &&
                ` This includes ${currentRow.permission.length} permission(s).`
              }
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Revoke Role'
      destructive={false}
    />
  )
}