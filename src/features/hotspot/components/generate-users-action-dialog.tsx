'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouterManagement } from '@/hooks/use-router';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SelectDropdown } from '@/components/select-dropdown';
import { useHotspotProfiles, useHotspotServers, useGenerateBatchUsers } from '../hooks/mikrotik-hotspot';


// Generate Users Configuration type interface
interface GenerateUsersConfig {
  qty: string
  server: string
  userMode: string
  nameLength: string
  prefix?: string
  characters: string
  profile: string
  timeLimit?: string
  comment?: string
  dataLimit?: string
}

interface GenerateUsersActionDialogProps {
  currentRow?: GenerateUsersConfig
  open: boolean
  onOpenChange: (open: boolean) => void
}

type CharType =
  | 'lower'
  | 'upper'
  | 'upplow'
  | 'mix'
  | 'mix1'
  | 'mix2'
  | 'num'
  | 'lower1'
  | 'upper1'
  | 'upplow1'

const FormSchema = z.object({
  qty: z
    .string()
    .min(1, {
      message: 'Quantity must be at least 1.',
    })
    .refine(
      (val) => {
        const num = parseInt(val)
        return num >= 1 && num <= 1000
      },
      {
        message: 'Quantity must be between 1 and 1000.',
      }
    ),
  server: z.string().optional(),
  userMode: z.string().min(1, {
    message: 'User mode must be selected.',
  }),
  nameLength: z
    .string()
    .min(1, {
      message: 'Name length must be specified.',
    })
    .refine(
      (val) => {
        const num = parseInt(val)
        return num >= 3 && num <= 20
      },
      {
        message: 'Name length must be between 3 and 20.',
      }
    ),
  prefix: z.string().optional(),
  charType: z.enum(['lower', 'upper', 'upplow', 'mix', 'mix1', 'mix2', 'num', 'lower1', 'upper1', 'upplow1']).optional(),
  profile: z.string().min(1, {
    message: 'Profile must be selected.',
  }),
  timeLimit: z.string().optional(),
  comment: z.string().optional(),
  dataLimit: z.string().optional(),
})

type GenerateUsersForm = z.infer<typeof FormSchema>

export function GenerateUsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: GenerateUsersActionDialogProps) {
  const { activeRouter } = useRouterManagement()
  const routerId = activeRouter?.id

  // Fetch servers
  const {
    data: serversData,
    isLoading: serversLoading,
    isError: serversError,
  } = useHotspotServers({ routerId })

  // Fetch profiles
  const {
    data: profilesData,
    isLoading: profilesLoading,
    isError: profilesError,
  } = useHotspotProfiles({ routerId })

  // Mutation for generating users
  const generateUsers = useGenerateBatchUsers()

  const isEdit = !!currentRow

  const form = useForm<GenerateUsersForm>({
    resolver: zodResolver(FormSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
        }
      : {
          qty: '1',
          server: 'all',
          userMode: 'up',
          nameLength: '8',
          prefix: '',
          characters: 'mix',
          profile: 'default',
          timeLimit: '',
          comment: '',
          dataLimit: '',
        },
  })

  // Map servers data ke format SelectDropdown
  const serverOptions = [
    { label: 'All Servers', value: 'all' },
    ...(serversData?.data.map((server: any) => ({
      label: server.name || server['.id'],
      value: server.name || server['.id'],
    })) || []),
  ]

  // Map profiles data ke format SelectDropdown
  const profileOptions = [
    ...(profilesData?.data.map((profile: any) => ({
      label: profile.name || profile['.id'],
      value: profile.name || profile['.id'],
    })) || []),
  ]

  const userModeOptions = [
    { label: 'Username = Password', value: 'up' },
    { label: 'Username Only (Voucher)', value: 'vc' },
  ]

  const charactersOptions = [
    { label: 'Lowercase (abcd)', value: 'lower' },
    { label: 'Uppercase (ABCD)', value: 'upper' },
    { label: 'Upper+Lower (AbCd)', value: 'upplow' },
    { label: 'Mix (abc123)', value: 'mix' },
    { label: 'Mix Alternative 1', value: 'mix1' },
    { label: 'Mix Alternative 2', value: 'mix2' },
    { label: 'Numbers Only (1234)', value: 'num' },
    { label: 'Lower with Num (abc1)', value: 'lower1' },
    { label: 'Upper with Num (ABC1)', value: 'upper1' },
    { label: 'Upper+Lower+Num (Ab1)', value: 'upplow1' },
  ]

  const onSubmit = async (values: GenerateUsersForm) => {
    if (!routerId) {
      toast.error('No active router selected')
      return
    }

    try {
      const result = await generateUsers.mutateAsync({
        routerId,
        qty: parseInt(values.qty),
        server: values.server !== 'all' ? values.server : undefined,
        userType: values.userMode as 'up' | 'vc',
        userLength: parseInt(values.nameLength),
        prefix: values.prefix || undefined,
        charType: values.charType as CharType,
        profile: values.profile,
        timeLimit: values.timeLimit || undefined,
        comment: values.comment || undefined,
        dataLimit: values.dataLimit || undefined,
      })

      toast.success(result.message, {
        description: `Generated ${result.data.count} users successfully`,
      })

      // Optional: Log or display generated users
      console.log('Generated users:', result.data.users)

      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to generate users', {
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
      })
    }
  }

  // Show loading state
  const isDataLoading = serversLoading || profilesLoading
  const isSubmitting = generateUsers.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isSubmitting) {
          form.reset()
          onOpenChange(state)
        }
      }}
    >
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle className='flex items-center gap-2'>
            <Zap className='h-4 w-4' />
            {isEdit ? 'Edit Generation Template' : 'Generate Users'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the generation template here. '
              : 'Configure user generation settings here. '}
            Click generate when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        {isDataLoading ? (
          <div className='flex h-[28rem] items-center justify-center'>
            <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
          </div>
        ) : serversError || profilesError ? (
          <div className='text-destructive flex h-[28rem] items-center justify-center'>
            <p>Failed to load data. Please try again.</p>
          </div>
        ) : (
          <div className='h-[28rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
            <Form {...form}>
              <form
                id='generate-users-form'
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4 px-0.5'
              >
                <Tabs defaultValue='general' className='w-full'>
                  <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value='general'>General</TabsTrigger>
                    <TabsTrigger value='limit'>Limit</TabsTrigger>
                  </TabsList>

                  <TabsContent value='general' className='mt-4 space-y-4'>
                    <FormField
                      control={form.control}
                      name='qty'
                      render={({ field }) => (
                        <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                          <FormLabel className='col-span-2 text-end'>
                            Quantity
                          </FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              placeholder='1'
                              min='1'
                              max='1000'
                              className='col-span-4'
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className='col-span-4 col-start-3' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='server'
                      render={({ field }) => (
                        <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                          <FormLabel className='col-span-2 text-end'>
                            Server
                          </FormLabel>
                          <SelectDropdown
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            placeholder='Select server'
                            className='col-span-4'
                            items={serverOptions}
                            disabled={serversLoading || isSubmitting}
                          />
                          <FormMessage className='col-span-4 col-start-3' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='userMode'
                      render={({ field }) => (
                        <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                          <FormLabel className='col-span-2 text-end'>
                            User Mode
                          </FormLabel>
                          <SelectDropdown
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            placeholder='Select user mode'
                            className='col-span-4'
                            items={userModeOptions}
                            disabled={isSubmitting}
                          />
                          <FormMessage className='col-span-4 col-start-3' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='nameLength'
                      render={({ field }) => (
                        <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                          <FormLabel className='col-span-2 text-end'>
                            Name Length
                          </FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              placeholder='8'
                              min='3'
                              max='20'
                              className='col-span-4'
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className='col-span-4 col-start-3' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='prefix'
                      render={({ field }) => (
                        <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                          <FormLabel className='col-span-2 text-end'>
                            Prefix
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Optional prefix'
                              className='col-span-4'
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className='col-span-4 col-start-3' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='charType'
                      render={({ field }) => (
                        <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                          <FormLabel className='col-span-2 text-end'>
                            Characters
                          </FormLabel>
                          <SelectDropdown
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            placeholder='Select character set'
                            className='col-span-4'
                            items={charactersOptions}
                            disabled={isSubmitting}
                          />
                          <FormMessage className='col-span-4 col-start-3' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='profile'
                      render={({ field }) => (
                        <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                          <FormLabel className='col-span-2 text-end'>
                            Profile
                          </FormLabel>
                          <SelectDropdown
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            placeholder='Select profile'
                            className='col-span-4'
                            items={profileOptions}
                            disabled={profilesLoading || isSubmitting}
                          />
                          <FormMessage className='col-span-4 col-start-3' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='timeLimit'
                      render={({ field }) => (
                        <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                          <FormLabel className='col-span-2 text-end'>
                            Time Limit
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='e.g., 3h or 45m'
                              className='col-span-4'
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className='col-span-4 col-start-3' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='comment'
                      render={({ field }) => (
                        <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                          <FormLabel className='col-span-2 text-end'>
                            Comment
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Optional comment'
                              className='col-span-4'
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className='col-span-4 col-start-3' />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value='limit' className='mt-4 space-y-4'>
                    <FormField
                      control={form.control}
                      name='dataLimit'
                      render={({ field }) => (
                        <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                          <FormLabel className='col-span-2 text-end'>
                            Data Limit
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='e.g., 1GB, 500MB'
                              className='col-span-4'
                              disabled={isSubmitting}
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
        )}

        <DialogFooter>
          <Button
            type='submit'
            form='generate-users-form'
            disabled={isDataLoading || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Generating...
              </>
            ) : isEdit ? (
              'Save changes'
            ) : (
              'Generate'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}