import { useState } from 'react'
import { UserPlus, Users, Clock } from 'lucide-react'
import { useRouterManagement } from '@/hooks/use-router'
import { Button } from '@/components/ui/button'
import { GenerateUsersActionDialog } from '../../components/generate-users-action-dialog'
import { ProfileActionsDialog } from './profile-actions-dialog'
import { useSetExpiredMonitor } from '../../hooks/mikrotik-hotspot'
import { toast } from 'sonner'

export function HotspotProfilePrimaryButtons() {
  const [isOpen, setIsOpen] = useState(false)
  const [openGenrate, setOpenGenrate] = useState(false)
  const { activeRouter } = useRouterManagement()
  const routerId = activeRouter?.id

  const { mutate: setupExpiredMonitor, isPending } = useSetExpiredMonitor()

  const handleSetupExpiredMonitor = () => {
    if (!routerId) {
      toast('Error: No active router found. Please select a router first')
      return
    }

    setupExpiredMonitor(
  { routerId },
  {
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  }
);
  }

  return (
    <>
      <div className='flex gap-2'>
        <Button
          variant='outline'
          className='space-x-1'
          onClick={handleSetupExpiredMonitor}
          disabled={isPending || !routerId}
        >
          <span>{isPending ? 'Setting up...' : 'Setup Expired Monitor'}</span>
          <Clock size={18} />
        </Button>
        <Button
          variant='outline'
          className='space-x-1'
          onClick={() => setOpenGenrate(true)}
        >
          <span>Generate</span> <Users size={18} />
        </Button>
        <Button className='space-x-1' onClick={() => setIsOpen(true)}>
          <span>Add Profile</span> <UserPlus size={18} />
        </Button>
      </div>
      <ProfileActionsDialog onOpenChange={setIsOpen} open={isOpen} />
      <GenerateUsersActionDialog
        onOpenChange={setOpenGenrate}
        open={openGenrate}
      />
    </>
  )
}
