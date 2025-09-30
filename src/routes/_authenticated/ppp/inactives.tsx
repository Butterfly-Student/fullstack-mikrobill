import { PppInactives } from '@/features/ppp/inactive'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/ppp/inactives')({
  component: PppInactives,
})

