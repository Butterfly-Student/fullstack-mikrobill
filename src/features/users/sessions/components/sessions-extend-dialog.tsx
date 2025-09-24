import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Clock, Save } from 'lucide-react'
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { type Session } from '../data/schema'

const formSchema = z.object({
  hours: z.string().min(1, 'Please select extension duration.'),
  reason: z.string().optional(),
})

type SessionExtendForm = z.infer<typeof formSchema>

type SessionExtendDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Session
}

const extensionOptions = [
  { label: '1 Hour', value: '1' },
  { label: '2 Hours', value: '2' },
  { label: '6 Hours', value: '6' },
  { label: '12 Hours', value: '12' },
  { label: '24 Hours', value: '24' },
  { label: '48 Hours', value: '48' },
  { label: '72 Hours', value: '72' },
  { label: '7 Days (168 Hours)', value: '168' },
]

export function SessionsExtendDialog({
  open,
  onOpenChange,
  currentRow,
}: SessionExtendDialogProps) {
  const form = useForm<SessionExtendForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { hours: '', reason: '' },
  })

  const onSubmit = (values: SessionExtendForm) => {
    const submissionData = {
      sessionId: currentRow?.id,
      currentExpiry: currentRow?.expiresAt,
      extensionHours: parseInt(values.hours),
      reason: values.reason,
      newExpiry: currentRow ? new Date(currentRow.expiresAt.getTime() + (parseInt(values.hours) * 60 * 60 * 1000)) : null,
    }

    form.reset()
    showSubmittedData(submissionData, 'Session extension request:')
    onOpenChange(false)
  }

  const sessionIdShort = currentRow?.id?.substring(0, 12) + '...' || ''
  const isExpired = currentRow ? currentRow.expiresAt < new Date() : false

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
          <DialogTitle className='flex items-center gap-2'>
            <Clock /> Extend Session
          </DialogTitle>
          <DialogDescription>
            Extend the expiration time for session {sessionIdShort}
            {currentRow && (
              <span className='block mt-1 text-sm text-muted-foreground'>
                Current expiry: {currentRow.expiresAt.toLocaleString()}
                {isExpired && <span className='text-destructive'> (Expired)</span>}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {isExpired && (
          <div className='p-3 bg-destructive/10 border border-destructive/20 rounded-md'>
            <p className='text-sm text-destructive'>
              Note: This session has already expired. Extending it will reactivate the session.
            </p>
          </div>
        )}

        <Form {...form}>
          <form
            id='session-extend-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='hours'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extension Duration</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select extension duration'
                    items={extensionOptions}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., User requested extended session for ongoing work'
                      {...field}
                    />
                  </FormControl>
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
          <Button type='submit' form='session-extend-form'>
            Extend Session <Save />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}