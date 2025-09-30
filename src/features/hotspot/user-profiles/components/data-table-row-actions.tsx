import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import {
  Trash2,
  Settings,
  Eye,
  Power,
  PowerOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Profile } from '../../data/schema'
import { useState } from 'react'
import { ProfileActionsDialog } from './profile-actions-dialog'


type DataTableRowActionsProps = {
  row: Row<Profile>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [open, setOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<Profile>(row.original)
  const profile = row.original

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
        <DropdownMenuContent align='end' className='w-[200px]'>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(profile)
              setOpen('view-details')
            }}
          >
            View Details
            <DropdownMenuShortcut>
              <Eye size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(profile)
              setOpen('enable-profile')
            }}
            className='text-green-600!'
          >
            Enable Profile
            <DropdownMenuShortcut>
              <Power size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(profile)
              setOpen('disable-profile')
            }}
            className='text-orange-600!'
          >
            Disable Profile
            <DropdownMenuShortcut>
              <PowerOff size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(profile)
              setOpen(true)
            }}
          >
            Edit Profile
            <DropdownMenuShortcut>
              <Settings size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(profile)
              setOpen('delete')
            }}
            className='text-red-500!'
          >
            Delete Profile
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ProfileActionsDialog onOpenChange={setOpen} open={open} currentRow={currentRow}/>
    </>
  )
}