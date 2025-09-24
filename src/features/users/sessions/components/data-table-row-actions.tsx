import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2, Clock, Eye, Copy, ClockFading } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Session } from '../data/schema'
import { useSessions } from './sessions-provider'

type DataTableRowActionsProps = {
  row: Row<Session>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useSessions()
  const session = row.original
  const isExpired = session.expiresAt < new Date()

  const handleCopySessionId = () => {
    navigator.clipboard.writeText(session.id)
    toast.success('Session ID copied to clipboard')
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(session.token)
    toast.success('Token copied to clipboard')
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
        <DropdownMenuContent align='end' className='w-[180px]'>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(session)
              setOpen('details')
            }}
          >
            View Details
            <DropdownMenuShortcut>
              <Eye size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleCopySessionId}>
            Copy Session ID
            <DropdownMenuShortcut>
              <Copy size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleCopyToken}>
            Copy Token
            <DropdownMenuShortcut>
              <Copy size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {!isExpired && (
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(session)
                setOpen('extend')
              }}
            >
              Extend Session
              <DropdownMenuShortcut>
                <Clock size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          {!isExpired && (
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(session)
                setOpen('revoke')
              }}
              className='text-orange-600 focus:text-orange-600'
            >
              Revoke Session
              <DropdownMenuShortcut>
                <ClockFading size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(session)
              setOpen('delete')
            }}
            className='text-red-500 focus:text-red-500'
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