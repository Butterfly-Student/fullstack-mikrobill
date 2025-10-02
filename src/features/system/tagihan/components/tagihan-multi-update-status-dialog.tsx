'use client';

import { useState } from 'react';
import type { Table } from '@tanstack/react-table';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useTagihan } from '@/features/system/tagihan/hooks/tagihan';


type TagihanData = {
  id: string
  [key: string]: unknown
}

type TagihanMultiUpdateStatusDialogProps<TData extends TagihanData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const statusOptions = [
  { value: 'lunas', label: 'Lunas' },
  { value: 'belum_lunas', label: 'Belum Lunas' },
  { value: 'sebagian', label: 'Sebagian' },
  { value: 'jatuh_tempo', label: 'Jatuh Tempo' },
] as const

export function TagihanMultiUpdateStatusDialog<TData extends TagihanData>({
  open,
  onOpenChange,
  table,
}: TagihanMultiUpdateStatusDialogProps<TData>) {
  const [selectedStatus, setSelectedStatus] = useState<
    'lunas' | 'belum_lunas' | 'sebagian' | 'jatuh_tempo'
  >('lunas')

  // Gunakan hook dan mutation yang sudah ada
  const { updateStatus, isUpdatingStatus } = useTagihan()

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleUpdateStatus = () => {
    if (!selectedStatus) {
      toast.error('Pilih status terlebih dahulu')
      return
    }

    // Extract IDs dari selected rows
    const tagihanIds = selectedRows.map((row) => row.original.id)

    if (tagihanIds.length === 0) {
      toast.error('Tidak ada tagihan yang dipilih')
      return
    }

    // Jalankan mutation dengan array IDs
    updateStatus.mutate(
      { tagihanId: tagihanIds, status: selectedStatus },
      {
        onSuccess: () => {
          // Reset selection dan close dialog
          table.resetRowSelection()
          onOpenChange(false)
          setSelectedStatus('lunas') // Reset select
        },
        onError: () => {
          // Error handling sudah ada di hook
          // Dialog tetap terbuka agar user bisa retry
        },
      }
    )
  }

  // Reset value saat dialog ditutup
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedStatus('lunas')
    }
    onOpenChange(newOpen)
  }

  const selectedStatusLabel =
    statusOptions.find((opt) => opt.value === selectedStatus)?.label || 'Lunas'

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      handleConfirm={handleUpdateStatus}
      disabled={!selectedStatus || isUpdatingStatus}
      title={
        <span className='text-primary'>
          <CheckCircle2
            className='stroke-primary me-1 inline-block'
            size={18}
          />
          Update Status {selectedRows.length} Tagihan
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Apakah Anda yakin ingin mengubah status {selectedRows.length}{' '}
            tagihan terpilih menjadi{' '}
            <span className='font-semibold'>{selectedStatusLabel}</span>?
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span>Pilih Status Baru:</span>
            <Select
              value={selectedStatus}
              onValueChange={(value) =>
                setSelectedStatus(
                  value as 'lunas' | 'belum_lunas' | 'sebagian' | 'jatuh_tempo'
                )
              }
              disabled={isUpdatingStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder='Pilih status' />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Label>

          <Alert>
            <AlertTitle>Informasi</AlertTitle>
            <AlertDescription>
              Status {selectedRows.length} tagihan akan diubah menjadi{' '}
              <span className='font-semibold'>{selectedStatusLabel}</span>.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isUpdatingStatus ? 'Memproses...' : 'Update Status'}
      destructive={false}
    />
  )
}