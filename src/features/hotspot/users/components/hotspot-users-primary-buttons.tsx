import { UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { AddUserHotspotDialog } from './add-user-action-dialog';
import { GenerateUsersActionDialog } from '../../components/generate-users-action-dialog';


export function HotspotUsersPrimaryButtons() {
  const [isOpen, setIsOpen] = useState(false);
  const [openGenrate, setOpenGenrate] = useState(false);
  return (
    <>
      <div className='flex gap-2'>
        <Button
          variant='outline'
          className='space-x-1'
          onClick={() => setOpenGenrate(true)}
        >
          <span>Generate</span> <Users size={18} />
        </Button>
        <Button className='space-x-1' onClick={() => setIsOpen(true)}>
          <span>Add User</span> <UserPlus size={18} />
        </Button>
      </div>
      <AddUserHotspotDialog onOpenChange={setIsOpen} open={isOpen}/>
      <GenerateUsersActionDialog onOpenChange={setOpenGenrate} open={openGenrate}/>
    </>
  )
}
