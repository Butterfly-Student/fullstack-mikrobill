import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ClockFading, AlertTriangle } from 'lucide-react'
import { showSubmittedData } from '@/lib/show-submitted-data'
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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { SelectDropdown } from '@/components/select-dropdown'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { type Session } from '../data/schema'

const formSchema = z.object({
  reason: z.string().min(1, 'Reason for revocation is required.'),
  notifyUser: z.string().min(1, 'Please select notification preference.'),
})

type SessionRevokeForm = z.infer<typeof formSchema>

type SessionRevokeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Session
}

const revokeReasons = [
  { label: 'Security Concern', value: 'security' },
  { label: 'User Request', value: 'user_request' },
  { label: 'Suspicious Activity', value: 'suspicious' },
  { label: 'Policy Violation', value: 'policy' },
  { label: 'Administrative Action', value: 'admin' },
  { label: 'Other', value: 'other' },
]

const notificationOptions = [
  { label: 'Yes, notify user', value: 'yes' },
  { label: 'No, silent revocation', value: 'no' },
]

export function SessionsRevokeDialog({
  open,
  onOpenChange,
  currentRow,
}: SessionRevokeDialogProps) {
  const form = useForm<SessionRevokeForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { reason: '', notifyUser: '' },
  })

  const onSubmit = (values: SessionRevokeForm) => {
    const submissionData = {
      sessionId: currentRow?.id,
      userId: currentRow?.userId,
      reason: values.reason,
      notifyUser: values.notifyUser === 'yes',
      revokedAt: new Date(),
      ipAddress: currentRow?.ipAddress,
    }

    form.reset()
    showSubmittedData(submissionData, 'Session revocation request:')
    onOpenChange(false)
  }

  const sessionIdShort = currentRow?.id?.substring(0, 12) + '...' || ''

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2 text-orange-600'>
            <ClockFading /> Revoke Session
          </DialogTitle>
          <DialogDescription>
            Revoke access for session {sessionIdShort}
            {currentRow && (
              <span className='block mt-1 text-sm text-muted-foreground'>
                User: {currentRow.userId} | IP: {currentRow.ipAddress || 'Unknown'}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>
            This action will immediately terminate the user's session. They will be logged out and need to authenticate again.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form
            id='session-revoke-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Revocation Reason</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select reason for revocation'
                    items={revokeReasons}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='notifyUser'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Notification</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Choose notification preference'
                    items={notificationOptions}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className='gap-y-2'>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button
            type='submit'
            form='session-revoke-form'
            variant='destructive'
          >
            Revoke Session <ClockFading />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}