// profile-action-dialog.tsx

'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings } from 'lucide-react';
import { showSubmittedData } from '@/lib/show-submitted-data';
import { useRouterManagement } from '@/hooks/use-router';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SelectDropdown } from '@/components/select-dropdown';
import { type Profile } from '../../data/schema';
import { useHotspotPools } from '../../hooks/mikrotik-hotspot';
import { useHotspotProfile } from '../../user-profiles/hooks/profile';


// profile-action-dialog.tsx



// profile-action-dialog.tsx



// profile-action-dialog.tsx




// profile-action-dialog.tsx

// Import hook pools

// Profile type interface
export type ExpiredMode = z.infer<typeof expiredMode>

// Lock setting  - untuk profile
// enum/union biar strict
const expiredMode = z.enum(['rem', 'remc', 'ntf', 'ntfc', '0'])
const lockSetting = z.enum(['Enable', 'Disable'])

interface ProfileActionDialogProps {
  currentRow?: Profile
  open: boolean
  onOpenChange: (open: boolean) => void
  routerId?: string // Tambahkan routerId sebagai prop
}

const FormSchema = z.object({
  name: z
    .string()
    .min(1, 'Profile name is required.')
    .transform((name) => name.trim()),
  sharedUsers: z.number().min(0, 'Shared users must be 0 or greater.'),
  rateLimit: z.string().transform((rate) => rate.trim()),
  expMode: expiredMode,
  validity: z.string().transform((val) => val.trim()),
  price: z.string().transform((price) => price.trim()),
  sellingPrice: z.string().transform((price) => price.trim()),
  addressPool: z.string().transform((pool) => pool.trim()),
  lockUser: lockSetting,
  lockServer: lockSetting,
  parentQueue: z.string().transform((queue) => queue.trim()),

  // field tambahan kalau mau extend
  statusAutoRefresh: z.string().transform((status) => status.trim()),
  onLogin: z.string().transform((login) => login.trim()),

  // tambahan dari schema lama (opsional)
  bandwidth: z
    .string()
    .transform((bw) => bw.trim())
    .refine((bw) => {
      if (bw === '') return true
      // Validate format like "1M/1M" or "500K/2M"
      const bandwidthRegex = /^\d+[KMG]?\/\d+[KMG]?$/i
      return bandwidthRegex.test(bw)
    }, 'Bandwidth format should be like "1M/1M" or "500K/2M".'),
  sessionTimeout: z
    .string()
    .transform((timeout) => timeout.trim())
    .refine((timeout) => {
      if (timeout === '') return true
      // Validate format like "30m", "1h", "120s"
      const timeRegex = /^\d+[smhd]$/i
      return timeRegex.test(timeout)
    }, 'Session timeout format should be like "30m", "1h", or "120s".'),
  idleTimeout: z
    .string()
    .transform((timeout) => timeout.trim())
    .refine((timeout) => {
      if (timeout === '') return true
      const timeRegex = /^\d+[smhd]$/i
      return timeRegex.test(timeout)
    }, 'Idle timeout format should be like "10m", "1h", or "300s".'),
  downloadLimit: z
    .string()
    .transform((limit) => limit.trim())
    .refine((limit) => {
      if (limit === '') return true
      // Validate format like "1G", "500M", "1024K"
      const sizeRegex = /^\d+[KMGT]?B?$/i
      return sizeRegex.test(limit)
    }, 'Download limit format should be like "1G", "500M", or "1024K".'),
  uploadLimit: z
    .string()
    .transform((limit) => limit.trim())
    .refine((limit) => {
      if (limit === '') return true
      const sizeRegex = /^\d+[KMGT]?B?$/i
      return sizeRegex.test(limit)
    }, 'Upload limit format should be like "1G", "500M", or "1024K".'),
  maxSessions: z
    .string()
    .transform((sessions) => sessions.trim())
    .refine((sessions) => {
      if (sessions === '') return true
      const num = parseInt(sessions)
      return !isNaN(num) && num > 0
    }, 'Max sessions must be a positive number.'),
})

type ProfileForm = z.infer<typeof FormSchema>

export function ProfileActionsDialog({
  currentRow,
  open,
  onOpenChange,
}: ProfileActionDialogProps) {
  const { addProfile } = useHotspotProfile()
  const { activeRouter } = useRouterManagement()
  const routerId = activeRouter?.id

  // Fetch pools data
  const { data: poolsData, isLoading: isLoadingPools } = useHotspotPools({
    routerId: routerId,
    enabled: open && !!routerId, // Hanya fetch ketika dialog terbuka dan routerId ada
  })

  const isEdit = !!currentRow

  const form = useForm<ProfileForm>({
    resolver: zodResolver(FormSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
        }
      : {
          name: '',
          sharedUsers: 0,
          rateLimit: '',
          expMode: '0',
          validity: '',
          price: '',
          sellingPrice: '',
          addressPool: '',
          lockUser: 'Disable',
          lockServer: 'Disable',
          parentQueue: '',
          statusAutoRefresh: '',
          onLogin: '',
          bandwidth: '',
          sessionTimeout: '',
          idleTimeout: '',
          downloadLimit: '',
          uploadLimit: '',
          maxSessions: '',
        },
  })

  // Options untuk select components
  const expiredModeOptions = [
    { label: 'None', value: '0' },
    { label: 'Remove', value: 'rem' },
    { label: 'Remove & Record', value: 'remc' },
    { label: 'Notice', value: 'ntf' },
    { label: 'Notice & Record', value: 'ntfc' },
  ]

  const lockOptions = [
    { label: 'Disable', value: 'Disable' },
    { label: 'Enable', value: 'Enable' },
  ]
  console.log('pool',poolsData)

  // Generate address pool options dari data yang diambil
  const addressPoolOptions = [
    { label: "None", value: "none" },
    ...(poolsData?.data.map((pool: any) => ({
      label: pool.name || pool.poolName || pool.id,
      value: pool.name || pool.poolName || pool.id,
    })) || [])]

  const onSubmit = (values: ProfileForm) => {
    form.reset()
    showSubmittedData(values)
    addProfile.mutate(values)
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
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <Settings className='h-4 w-4' />
            {isEdit ? 'Edit Profile' : 'Add Profile'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the profile here. ' : 'Create new profile here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <div className='h-[28rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='profile-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <Tabs defaultValue='general' className='w-full'>
                <TabsList className='grid w-full grid-cols-3'>
                  <TabsTrigger value='general'>General</TabsTrigger>
                  <TabsTrigger value='limits'>Limits</TabsTrigger>
                  <TabsTrigger value='advanced'>Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value='general' className='mt-4 space-y-4'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Profile Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter profile name'
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
                    name='sharedUsers'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Shared Users
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='0'
                            className='col-span-4'
                            {...field}
                            value={field.value || ''}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='rateLimit'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Rate Limit
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g., 1M/1M'
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
                    name='expMode'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Expired Mode
                        </FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='Select expired mode'
                          className='col-span-4'
                          items={expiredModeOptions}
                        />
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='validity'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Validity
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g., 30d'
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
                    name='price'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Price
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='0'
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
                    name='sellingPrice'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Selling Price
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='0'
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
                    name='addressPool'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Address Pool
                        </FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder={
                            isLoadingPools
                              ? 'Loading pools...'
                              : 'Select address pool'
                          }
                          className='col-span-4'
                          items={addressPoolOptions}
                          disabled={isLoadingPools}
                        />
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='lockUser'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Lock User
                        </FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='Select lock user'
                          className='col-span-4'
                          items={lockOptions}
                        />
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='lockServer'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Lock Server
                        </FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='Select lock server'
                          className='col-span-4'
                          items={lockOptions}
                        />
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value='limits' className='mt-4 space-y-4'>
                  <FormField
                    control={form.control}
                    name='bandwidth'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Bandwidth Limit
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g., 1M/1M'
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
                    name='sessionTimeout'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Session Timeout
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g., 30m'
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
                    name='idleTimeout'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Idle Timeout
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g., 10m'
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
                    name='downloadLimit'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Download Limit
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g., 1G'
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
                    name='uploadLimit'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Upload Limit
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='e.g., 1G'
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
                    name='maxSessions'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Max Sessions
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='1'
                            className='col-span-4'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value='advanced' className='mt-4 space-y-4'>
                  <FormField
                    control={form.control}
                    name='parentQueue'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Parent Queue
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Parent queue name'
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
                    name='statusAutoRefresh'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          Status Auto Refresh
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Auto refresh setting'
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
                    name='onLogin'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>
                          On Login
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='On login action'
                            className='col-span-4'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button type='submit' form='profile-form'>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}