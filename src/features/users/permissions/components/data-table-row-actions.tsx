import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2, Edit, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Permission } from '../data/schema'
import { usePermissions } from './permissions-provider'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'

type DataTableRowActionsProps = {
  row: Row<Permission>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = usePermissions()

  const handleDuplicate = () => {
    toast.promise(sleep(1500), {
      loading: 'Duplicating permission...',
      success: `Permission "${row.original.name}" duplicated successfully`,
      error: 'Error duplicating permission',
    })
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('edit')
            }}
          >
            Edit
            <DropdownMenuShortcut>
              <Edit size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleDuplicate}>
            Duplicate
            <DropdownMenuShortcut>
              <Copy size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('delete')
            }}
            className='text-red-500!'
          >
            Delete
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}