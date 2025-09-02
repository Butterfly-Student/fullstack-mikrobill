import { Button } from '@/components/ui/button'
import { useRouters } from './routers-provider'
import { Plus } from 'lucide-react'


export function RoutersPrimaryButtons() {
  const { setOpen } = useRouters()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Mikrotik</span> <Plus size={18} />
      </Button>
    </div>
  )
} 
