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
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { type RoleRelation } from '../data/schema'

// Form schema yang disesuaikan dengan roleRelationSchema
const formSchema = z.object({
  id: z.number().int().optional(), // untuk edit mode
  name: z.string().min(1, 'Role name is required.'),
  description: z.string().nullable().optional(),
  userId: z.string().optional(),
  assignedBy: z.string().nullable().optional(), // sesuaikan dengan camelCase
  assignedAt: z.date().optional(),
  permissions: z.array(z.number().int()).min(1, 'At least one permission is required.'), // sesuai dengan skema (plural)
  grantedAt: z.date().optional(),
})

type RoleRelationForm = z.infer<typeof formSchema>

type RoleRelationActionDialogProps = {
  currentRow?: RoleRelation
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RolesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: RoleRelationActionDialogProps) {
  const isEdit = !!currentRow
  const form = useForm<RoleRelationForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
        id: currentRow.id,
        name: currentRow.name,
        description: currentRow.description || '',
        userId: currentRow.userId || '',
        assignedBy: currentRow.assignedBy || '',
        assignedAt: currentRow.assignedAt ? new Date(currentRow.assignedAt) : undefined,
        grantedAt: currentRow.grantedAt ? new Date(currentRow.grantedAt) : undefined,
        permissions: currentRow.permissions?.map(p => p.id) || [],
      }
      : {
        name: '',
        description: '',
        userId: '',
        assignedBy: '',
        assignedAt: undefined,
        grantedAt: undefined,
        permissions: [],
      },
  })

  const onSubmit = (values: RoleRelationForm) => {
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
          <DialogTitle>{isEdit ? 'Edit Role Relation' : 'Add New Role Relation'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the role relation here. ' : 'Create new role relation here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-[30rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='role-relation-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Role Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., Admin, User, Manager'
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
                    <FormLabel className='col-span-2 text-end pt-2'>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Role description (optional)'
                        className='col-span-4 min-h-20'
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='userId'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>User ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Leave empty for global role'
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
                name='assignedBy'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Assigned By
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., admin, system'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='assignedAt'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Assigned At
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'col-span-4 pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick assignment date</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='grantedAt'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Granted At
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'col-span-4 pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick grant date</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='permissions'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end pt-2'>Permissions</FormLabel>
                    <div className='col-span-4 space-y-2 max-h-32 overflow-y-auto'>
                      {/* TODO: Implement permission selector/checkboxes here */}
                      <div className='text-sm text-muted-foreground'>
                        Permission selection component to be implemented
                      </div>
                    </div>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='role-relation-form'>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}