import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePppActive } from './ppp-provider'

export function PrimaryButtons() {
  const { setOpen } = usePppActive()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Create</span> <Plus size={18} />
      </Button>
    </div>
  )
}
