import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, Users, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { useRouterManagement } from '@/hooks/use-router';
import { Button } from '@/components/ui/button';
import { GenerateUsersActionDialog } from '../../components/generate-users-action-dialog';
import { getHotspotProfiles, hotspotProfilesKeys } from '../../server/hotspot-profiles';
import { renderTemplate } from '../../server/templates';
import { AddUserHotspotDialog } from './add-user-action-dialog';
import { useHotspotUser } from './hotspot-user-provider';


export function HotspotUsersPrimaryButtons() {
  const [isOpen, setIsOpen] = useState(false)
  const [openGenrate, setOpenGenrate] = useState(false)
  const { filteredData } = useHotspotUser()
  const { activeRouter } = useRouterManagement()
  const routerId = activeRouter?.id

  const { data: profiles } = useQuery({
    queryKey: hotspotProfilesKeys.byRouter(routerId),
    queryFn: () => getHotspotProfiles({ data: { routerId } }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false,
    enabled: !!routerId,
  })

  const handlePrint = async () => {
    try {
      if (!filteredData || filteredData.length === 0) {
        toast.error('Tidak ada user untuk di-print')
        return
      }

      // Siapkan data untuk template
      const templateData = filteredData.map((user) => {
        // Cari profile detail berdasarkan nama profil user
        const profileDetail = profiles?.data.find(
          (p) => p.name === user.profile
        )
        console.log(profileDetail)

        // Pecah nilai on-login, misalnya: "x,x,price,validity,x"
        const onLoginParts = profileDetail?.onLogin?.split(',') || []

        const price = onLoginParts[2] || ''
        const validity = onLoginParts[3] || ''

        return {
          hotspotName: activeRouter?.name || user.server || 'HOTSPOT',
          username: user.name,
          password: user.password || user.name,
          // Data hasil ekstraksi dari profile detail
          validity,
          limitUptime: user.limitUptime || '',
          limitBytesTotal: user.limitBytesTotal || '',
          price,
        }
      })


      console.log('Printing', templateData)

      // Render template
      const result = await renderTemplate({
        data: {
          file: 'voucher.eta',
          data: templateData,
        },
      })

      if (result.success && result.html) {
        // Buka tab baru dengan hasil render
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(result.html)
          printWindow.document.close()

          // Auto print setelah load
          printWindow.onload = () => {
            printWindow.focus()
            printWindow.print()
          }
        } else {
          toast.error(
            'Gagal membuka window print. Pastikan popup tidak diblokir.'
          )
        }
      }
    } catch (error) {
      console.error('Error printing vouchers:', error)
      toast.error('Gagal mencetak voucher')
    }
  }

  return (
    <>
      <div className='flex gap-2'>
        <Button
          variant='outline'
          className='space-x-1'
          onClick={handlePrint}
          disabled={!filteredData || filteredData.length === 0}
        >
          <span>
            Print {filteredData?.length > 0 ? `(${filteredData.length})` : ''}
          </span>
          <Printer size={18} />
        </Button>
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
      <AddUserHotspotDialog onOpenChange={setIsOpen} open={isOpen} />
      <GenerateUsersActionDialog
        onOpenChange={setOpenGenrate}
        open={openGenrate}
      />
    </>
  )
}