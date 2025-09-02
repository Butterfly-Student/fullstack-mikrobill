'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
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
import { PasswordInput } from '@/components/password-input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { SelectDropdown } from '@/components/select-dropdown'
import { commonPorts, timeoutOptions } from '../data/data'
import { type Router } from '../data/schema'

const formSchema = z.object({
  name: z.string().min(1, 'Router name is required.').max(100),
  hostname: z
    .string()
    .regex(
      /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/,
      'Invalid IP address'
    ),
  username: z.string().min(1, 'Username is required.').max(50),
  password: z.string().min(1, 'Password is required.').max(255),
  port: z.coerce.number().int().min(1).max(65535, 'Port must be between 1-65535').default(8728),
  timeout: z.coerce.number().int().positive().default(300000),
  keepalive: z.boolean().default(true),
  location: z.string().max(100).optional(),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
})

type RouterForm = z.infer<typeof formSchema>

type RouterActionDialogProps = {
  currentRow?: Router
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoutersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: RouterActionDialogProps) {
  const isEdit = !!currentRow
  const form = useForm<RouterForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
        name: currentRow.name,
        hostname: currentRow.hostname,
        username: currentRow.username,
        password: '', // Don't prefill password for security
        port: currentRow.port,
        timeout: currentRow.timeout,
        keepalive: currentRow.keepalive,
        location: currentRow.location || '',
        description: currentRow.description || '',
        is_active: currentRow.is_active,
      }
      : {
        name: '',
        hostname: '',
        username: 'admin',
        password: '',
        port: 8728,
        timeout: 300000,
        keepalive: true,
        location: '',
        description: '',
        is_active: true,
      },
  })

  const onSubmit = (values: RouterForm) => {
    form.reset()
    showSubmittedData(values)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Router' : 'Add New Router'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the router configuration here. ' : 'Add a new router to your network. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='router-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Router Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., MikroTik-Main-Gateway'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='hostname'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      IP Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='192.168.1.1'
                        className='col-span-4 font-mono'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='port'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Port</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      placeholder='Select port'
                      className='col-span-4'
                      items={commonPorts.map(({ label, value }) => ({
                        label,
                        value: value.toString(),
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='admin'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder={isEdit ? 'Leave empty to keep current' : 'Enter password'}
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='timeout'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Timeout</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      placeholder='Select timeout'
                      className='col-span-4'
                      items={timeoutOptions.map(({ label, value }) => ({
                        label,
                        value: value.toString(),
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='location'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., Main Office, Jakarta'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end pt-2'>
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Router description and notes...'
                        className='col-span-4 resize-none'
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='keepalive'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Keep Alive
                    </FormLabel>
                    <FormControl>
                      <div className='col-span-4 flex items-center space-x-2'>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className='text-sm text-muted-foreground'>
                          Enable keep-alive connection
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='is_active'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Active
                    </FormLabel>
                    <FormControl>
                      <div className='col-span-4 flex items-center space-x-2'>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className='text-sm text-muted-foreground'>
                          Router is active and monitored
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='router-form'>
            {isEdit ? 'Update Router' : 'Add Router'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}