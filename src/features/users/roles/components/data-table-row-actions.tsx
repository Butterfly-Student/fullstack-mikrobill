import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2, Edit, UserMinus, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type RoleRelation } from '../data/schema'
import { useRoles } from './roles-provider'

type DataTableRowActionsProps = {
  row: Row<RoleRelation>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useRoles()

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
        <DropdownMenuContent align='end' className='w-[180px]'>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('edit')
            }}
          >
            Edit Assignment
            <DropdownMenuShortcut>
              <Edit size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('assign')
            }}
          >
            Manage Permissions
            <DropdownMenuShortcut>
              <Shield size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('revoke')
            }}
            className='text-orange-600!'
          >
            Revoke Role
            <DropdownMenuShortcut>
              <UserMinus size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('delete')
            }}
            className='text-red-500!'
          >
            Delete Record
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}