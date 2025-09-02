'use client'

import { useState } from 'react'
import { z } from 'zod'
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
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle, Wifi } from 'lucide-react'
import { type Router } from '../data/schema'

const testConnectionSchema = z.object({
  hostname: z
    .string()
    .regex(
      /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/,
      'Invalid IP address'
    ),
  port: z.coerce.number().int().min(1).max(65535),
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
  timeout: z.coerce.number().int().positive().default(5000),
})

type TestConnectionForm = z.infer<typeof testConnectionSchema>

type RouterTestConnectionDialogProps = {
  currentRow: Router
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoutersTestConnectionDialog({
  currentRow,
  open,
  onOpenChange,
}: RouterTestConnectionDialogProps) {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean
    message: string
    latency?: number
  } | null>(null)

  const form = useForm<TestConnectionForm>({
    resolver: zodResolver(testConnectionSchema),
    defaultValues: {
      hostname: currentRow.hostname,
      port: currentRow.port,
      username: currentRow.username,
      password: '',
      timeout: 5000,
    },
  })

  const onTestConnection = async (values: TestConnectionForm) => {
    setIsTestingConnection(true)
    setConnectionResult(null)

    try {
      // Simulate connection test (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock result - replace with actual connection test logic
      const success = Math.random() > 0.3 // 70% success rate for demo
      const latency = Math.floor(Math.random() * 100) + 10

      setConnectionResult({
        success,
        message: success
          ? `Successfully connected to ${values.hostname}:${values.port}`
          : `Failed to connect to ${values.hostname}:${values.port} - Connection timeout`,
        latency: success ? latency : undefined
      })
    } catch (error) {
      setConnectionResult({
        success: false,
        message: 'Network error occurred during connection test'
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        setConnectionResult(null)
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <Wifi size={20} />
            Test Router Connection
          </DialogTitle>
          <DialogDescription>
            Test connectivity to {currentRow.name} ({currentRow.hostname})
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <Form {...form}>
            <form
              id='test-connection-form'
              onSubmit={form.handleSubmit(onTestConnection)}
              className='space-y-4'
            >
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
                        className='col-span-4 font-mono'
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
                        type='number'
                        className='col-span-4 font-mono'
                        {...field}
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
                        placeholder='Enter password for test'
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
                    <FormLabel className='col-span-2 text-end'>
                      Timeout (ms)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          {/* Connection Result */}
          {connectionResult && (
            <div className='rounded-lg border p-4 space-y-2'>
              <div className='flex items-center gap-2'>
                {connectionResult.success ? (
                  <CheckCircle size={20} className='text-green-500' />
                ) : (
                  <XCircle size={20} className='text-red-500' />
                )}
                <Badge variant={connectionResult.success ? 'default' : 'destructive'}>
                  {connectionResult.success ? 'Connected' : 'Failed'}
                </Badge>
                {connectionResult.latency && (
                  <span className='text-sm text-muted-foreground'>
                    {connectionResult.latency}ms
                  </span>
                )}
              </div>
              <p className='text-sm text-muted-foreground'>
                {connectionResult.message}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type='submit'
            form='test-connection-form'
            disabled={isTestingConnection}
          >
            {isTestingConnection && <Loader2 size={16} className='mr-2 animate-spin' />}
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}