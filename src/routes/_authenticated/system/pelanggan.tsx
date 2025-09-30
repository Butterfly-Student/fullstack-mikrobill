import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { priorities, statuses } from '@/features/tasks/data/data'
import { Pelanggan } from '@/features/system/pelanggan'

const taskSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.enum(statuses.map((status) => status.value)))
    .optional()
    .catch([]),
  priority: z
    .array(z.enum(priorities.map((priority) => priority.value)))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/system/pelanggan')({
  component: Pelanggan,
})
