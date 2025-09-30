import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SelectDropdown } from '@/components/select-dropdown'
import { type PppoeUser } from '../../data/schema'

type PppMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: PppoeUser
}

// Fixed form schema to match the data schema structure
const formSchema = z.object({
  name: z.string().min(1, 'Username is required.'),
  service: z.enum(["async", "isdn", "l2tp", "pppoe", "pptp", "ovpn", "sstp"]).default('pppoe'),
  'caller-id': z.string().optional(),
  password: z.string().optional(),
  profile: z.string().optional(),
  routes: z.string().optional(),
  'ipv6-routes': z.string().optional(),
  'limit-bytes-in': z.string().optional(),
  'limit-bytes-out': z.string().optional(),
  disabled: z.boolean().default(false), // Removed .optional() to match data schema
  'local-address': z.string().optional(),
  'remote-address': z.string().optional(),
  'remote-ipv6-prefix': z.string().optional(),
})

type PppForm = z.infer<typeof formSchema>

export function PppMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: PppMutateDrawerProps) {
  const isUpdate = !!currentRow

  const form = useForm<PppForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow ?? {
      name: '',
      service: 'pppoe',
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
    },
    // Update the type of options to match the expected type
    resolverOptions: {
      name: 'service',
      defaultValues: {
        service: 'pppoe',
      },
    },
  });

  const onSubmit = (data: PppForm) => {
    // do something with the form data
    onOpenChange(false)
    form.reset()
    showSubmittedData(data)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
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
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
                Basic Information
              </h3>

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Enter username' />
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
                        type="password"
                        placeholder='Enter password'
                        value={field.value || ''}
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Account Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        {field.value ? 'Account is disabled' : 'Account is active'}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Network Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Routes */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bandwidth Limits */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
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
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button form='pppoe-form' type='submit'>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}