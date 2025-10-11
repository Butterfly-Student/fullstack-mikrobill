import { useEffect } from 'react';
import { type z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SelectDropdown } from '@/components/select-dropdown';
import { pppoeUserSchema, type PppoeUser } from '../../data/schema';
import { usePppoeSecret } from '../../hooks/use-ppp';


type PppMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: PppoeUser
}
type PppForm = z.infer<typeof pppoeUserSchema>

// Default form values
const defaultFormValues: PppForm = {
  name: '',
  service: '',
  'caller-id': '',
  password: '',
  profile: '',
  routes: '',
  'ipv6-routes': '',
  'limit-bytes-in': '',
  'limit-bytes-out': '',
  disabled: false,
  'local-address': '',
  'remote-address': '',
  'remote-ipv6-prefix': '',
}

export function PppMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: PppMutateDrawerProps) {
  const isUpdate = !!currentRow
  const { addSecret, updateSecret, isCreating, isUpdating } = usePppoeSecret()

  const form = useForm<PppForm>({
    resolver: zodResolver(pppoeUserSchema),
    defaultValues: defaultFormValues,
  })

  // Update form values when currentRow changes
  useEffect(() => {
    if (currentRow) {
      form.reset({
        ...defaultFormValues,
        ...currentRow,
        disabled: currentRow.disabled ?? false,
      })
    } else {
      form.reset(defaultFormValues)
    }
  }, [currentRow, form])

  const onSubmit = async (data: PppForm) => {
    try {
      if (isUpdate && currentRow?.['.id']) {
        // Update existing secret
        const { '.id': _, ...updateData } = data
        await updateSecret.mutateAsync({
          userId: currentRow['.id'],
          secretData: updateData,
        })
      } else {
        // Create new secret
        const { '.id': _, ...createData } = data
        await addSecret.mutateAsync(createData)
      }

      // Close drawer and reset form on success
      onOpenChange(false)
      form.reset(defaultFormValues)
    } catch (error) {
      // Error is already handled by the mutation's onError
      console.error('Form submission error:', error)
    }
  }

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v)
    if (!v) {
      form.reset(defaultFormValues)
    }
  }

  const isSubmitting = isCreating || isUpdating

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className='flex flex-col sm:max-w-lg'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} PPPoE User</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the PPPoE user by providing necessary info.'
              : 'Add a new PPPoE user by providing necessary info.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='pppoe-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {/* Basic Information */}
            <div className='space-y-4'>
              <h3 className='text-muted-foreground border-b pb-2 text-sm font-medium'>
                Basic Information
              </h3>

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Enter username'
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='password'
                        placeholder='Enter password'
                        value={field.value || ''}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='service'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select service type'
                      disabled={isSubmitting}
                      items={[
                        { label: 'PPPoE', value: 'pppoe' },
                        { label: 'PPTP', value: 'pptp' },
                        { label: 'L2TP', value: 'l2tp' },
                        { label: 'OpenVPN', value: 'ovpn' },
                        { label: 'SSTP', value: 'sstp' },
                        { label: 'Async', value: 'async' },
                        { label: 'ISDN', value: 'isdn' },
                      ]}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='profile'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Enter profile name'
                        value={field.value || ''}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='disabled'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel>Account Status</FormLabel>
                      <div className='text-muted-foreground text-sm'>
                        {field.value
                          ? 'Account is disabled'
                          : 'Account is active'}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Network Configuration */}
            <div className='space-y-4'>
              <h3 className='text-muted-foreground border-b pb-2 text-sm font-medium'>
                Network Configuration
              </h3>

              <FormField
                control={form.control}
                name='caller-id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caller ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Enter caller ID'
                        value={field.value || ''}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='local-address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='e.g., 192.168.1.1'
                        value={field.value || ''}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='remote-address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remote Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='e.g., 192.168.1.100'
                        value={field.value || ''}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='remote-ipv6-prefix'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remote IPv6 Prefix</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='e.g., 2001:db8::/64'
                        value={field.value || ''}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Routes */}
            <div className='space-y-4'>
              <h3 className='text-muted-foreground border-b pb-2 text-sm font-medium'>
                Routes
              </h3>

              <FormField
                control={form.control}
                name='routes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IPv4 Routes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='Enter IPv4 routes (one per line)'
                        value={field.value || ''}
                        rows={3}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='ipv6-routes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IPv6 Routes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='Enter IPv6 routes (one per line)'
                        value={field.value || ''}
                        rows={3}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bandwidth Limits */}
            <div className='space-y-4'>
              <h3 className='text-muted-foreground border-b pb-2 text-sm font-medium'>
                Bandwidth Limits
              </h3>

              <FormField
                control={form.control}
                name='limit-bytes-in'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limit Bytes In</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='e.g., 1000000 (bytes)'
                        value={field.value || ''}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='limit-bytes-out'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limit Bytes Out</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='e.g., 1000000 (bytes)'
                        value={field.value || ''}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline' disabled={isSubmitting}>
              Close
            </Button>
          </SheetClose>
          <Button form='pppoe-form' type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}