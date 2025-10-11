import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2, Power, PowerOff, MonitorDot, ArrowRightCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { pppoeActiveSchema } from '../../data/schema'
import { usePppoeSecret } from '../hooks/ppp-active'
import { usePppActive } from './ppp-provider'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const pppActive = pppoeActiveSchema.parse(row.original)
  const { setOpen, setCurrentRow } = usePppActive()
  const { enableSecret, disableSecret } = usePppoeSecret()

  const handleOpen = () => {
    const url = pppActive.address?.startsWith('http')
      ? pppActive.address
      : `http://${pppActive.address}`
    window.open(url, '_blank')
  }

  const handleEnable = () => {
    enableSecret.mutate({ userId: pppActive['.id'] })
  }

  const handleDisable = () => {
    disableSecret.mutate({ userId: pppActive['.id'] })
  }

  return (
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
        onClick={handleOpen}>
          Open
          <DropdownMenuShortcut>
            <ArrowRightCircle size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(pppActive)
            setOpen('ping')
          }}
        >
          Ping
          <DropdownMenuShortcut>
            <MonitorDot size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleEnable}>
          Enable
          <DropdownMenuShortcut>
            <Power size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDisable}>
          Disable
          <DropdownMenuShortcut>
            <PowerOff size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(pppActive)
            setOpen('disconnect')
          }}
        >
          Disconnect
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
