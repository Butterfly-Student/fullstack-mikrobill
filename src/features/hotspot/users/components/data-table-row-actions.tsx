import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import {
  Trash2,
  Settings,
  UserX,
  Eye,
  RefreshCw,
  Download,
  Copy,
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
import { type HotspotUser } from '../../data/schema'
import { useState } from 'react'
import { useHotspotUser } from './hotspot-user-provider'


type DataTableRowActionsProps = {
  row: Row<HotspotUser>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const {setOpen, setCurrentRow} = useHotspotUser();
  const user = row.original

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
              setCurrentRow(user)
              setOpen('view-details')
            }}
          >
            View Details
            <DropdownMenuShortcut>
              <Eye size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(user)
              setOpen('copy-credentials')
            }}
          >
            Copy Credentials
            <DropdownMenuShortcut>
              <Copy size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(user)
              setOpen('download-voucher')
            }}
          >
            Download Voucher
            <DropdownMenuShortcut>
              <Download size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(user)
              setOpen('enable-user')
            }}
            className='text-green-600!'
          >
            Enable User
            <DropdownMenuShortcut>
              <Power size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(user)
              setOpen('disable-user')
            }}
            className='text-orange-600!'
          >
            Disable User
            <DropdownMenuShortcut>
              <PowerOff size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(user)
              setOpen('disconnect-user')
            }}
            className='text-red-500!'
          >
            Disconnect User
            <DropdownMenuShortcut>
              <UserX size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(user)
              setOpen('reset-counters')
            }}
          >
            Reset Counters
            <DropdownMenuShortcut>
              <RefreshCw size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(user)
              setOpen("edit")
            }}
          >
            Edit User
            <DropdownMenuShortcut>
              <Settings size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(user)
              setOpen('delete')
            }}
            className='text-red-500!'
          >
            Delete User
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}