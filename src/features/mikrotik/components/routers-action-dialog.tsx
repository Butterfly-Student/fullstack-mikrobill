'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { formSchema, type RouterForm, type Router } from '../data/schema'
import { useRouterManagement } from '@/hooks/use-router'

type RouterActionDialogProps = {
  currentRow?: Router
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void // Optional callback after successful operation
}

export function RoutersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: RouterActionDialogProps) {
  const { isLoading, addRouter, updateRouter } = useRouterManagement();
  const isEdit = !!currentRow
  const form = useForm<RouterForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
        name: currentRow.name,
        hostname: currentRow.hostname,
        username: currentRow.username,
        password: '', // Don't prefill password for security
        port: currentRow.port || 8728,
        timeout: currentRow.timeout || 300000,
        keepalive: currentRow.keepalive || true,
        location: currentRow.location || '',
        description: currentRow.description || '',
        is_active: currentRow.is_active || true,
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

  const onSubmit = async (values: RouterForm) => {
    try {
      if (isEdit && currentRow) {
        // Update existing router
        await updateRouter(currentRow.id, values)
      } else {
        // Add new router
        await addRouter(values)
      }

      form.reset()
      onOpenChange(false)
      // Optional: Refresh data atau trigger refetch
      // onRefresh?.()
    } catch (error) {
      console.error('Error saving router:', error)
      // Handle error - show error message to user
      // setError('Failed to save router')
    }
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
                        maxLength={100}
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
                        maxLength={45}
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
                    <FormControl>
                      <Input
                        placeholder='8728'
                        className='col-span-4 font-mono'
                        autoComplete='off'
                        type='number'
                        min={1}
                        max={65535}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === '' ? undefined : parseInt(value, 10))
                        }}
                      />
                    </FormControl>
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
                        maxLength={50}
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
                        maxLength={255}
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
                    <FormLabel className='col-span-2 text-end'>Timeout (ms)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='300000'
                        className='col-span-4 font-mono'
                        autoComplete='off'
                        type='number'
                        min={1000}
                        max={600000}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === '' ? undefined : parseInt(value, 10))
                        }}
                      />
                    </FormControl>
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
                        maxLength={100}
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
          <Button
            type="submit"
            form="router-form"
            disabled={isLoading}
          >
            {isLoading
              ? (isEdit ? 'Updating...' : 'Adding...')
              : (isEdit ? 'Update Router' : 'Add Router')
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}