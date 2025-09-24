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
import { SelectDropdown } from '@/components/select-dropdown'
import { type Permission, type Resource, type Action } from '../data/schema'

const formSchema = z.object({
  name: z.string().min(1, 'Permission name is required.').max(50, 'Name must be 50 characters or less.'),
  description: z.string().optional().or(z.literal('')),
  resourceId: z.number().int().min(1, 'Resource is required.'),
  actionId: z.number().int().min(1, 'Action is required.'),
})

type PermissionForm = z.infer<typeof formSchema>

type PermissionsActionDialogProps = {
  currentRow?: Permission
  resources?: Resource[]
  actions?: Action[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PermissionsActionDialog({
  currentRow,
  resources = [],
  actions = [],
  open,
  onOpenChange,
}: PermissionsActionDialogProps) {
  const isEdit = !!currentRow
  
  const form = useForm<PermissionForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          description: currentRow.description || '',
          resourceId: currentRow.resourceId,
          actionId: currentRow.actionId,
        }
      : {
          name: '',
          description: '',
          resourceId: 0,
          actionId: 0,
        },
  })

  const onSubmit = (values: PermissionForm) => {
    const submissionData = {
      ...values,
      description: values.description || null,
      id: isEdit ? currentRow.id : Date.now(), // Mock ID for demo
      createdAt: isEdit ? currentRow.createdAt : new Date(),
    }
    
    form.reset()
    showSubmittedData(submissionData, `Permission ${isEdit ? 'updated' : 'created'} successfully:`)
    onOpenChange(false)
  }

  const resourceOptions = resources.map(resource => ({
    label: resource.name,
    value: resource.id.toString(),
  }))

  const actionOptions = actions.map(action => ({
    label: action.name,
    value: action.id.toString(),
  }))

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
          <DialogTitle>{isEdit ? 'Edit Permission' : 'Add New Permission'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the permission here. ' : 'Create new permission here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        
        <div className='max-h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='permission-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., Read Users'
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
                        placeholder='Optional description for this permission...'
                        className='col-span-4 min-h-[80px] resize-none'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='resourceId'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Resource
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value ? field.value.toString() : ''}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      placeholder='Select a resource'
                      className='col-span-4'
                      items={resourceOptions}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='actionId'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Action
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value ? field.value.toString() : ''}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      placeholder='Select an action'
                      className='col-span-4'
                      items={actionOptions}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        
        <DialogFooter>
          <Button type='submit' form='permission-form'>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}