import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Routers } from '@/features/mikrotik'

const mikrotikSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
})

export const Route = createFileRoute('/_authenticated/mikrotik/')({
  validateSearch: mikrotikSearchSchema,
  component: Routers,
})
