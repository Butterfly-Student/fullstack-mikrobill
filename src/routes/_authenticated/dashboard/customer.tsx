import { Customer } from '@/features/dashboard/customer'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard/customer')({
  component: Customer,
})

