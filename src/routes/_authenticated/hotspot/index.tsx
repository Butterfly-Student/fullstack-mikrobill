import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import Hotspot from '@/features/hotspot'

const hotspotSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
})

export const Route = createFileRoute('/_authenticated/hotspot/')({
  validateSearch: hotspotSearchSchema,
  component: Hotspot,
})
