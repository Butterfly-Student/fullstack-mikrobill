import { Laporan } from '@/features/system/laporan'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/system/laporan')({
  component: Laporan,
})