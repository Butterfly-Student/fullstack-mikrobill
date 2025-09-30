import { PppActives } from '@/features/ppp/active'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/ppp/actives')({
  component: PppActives,
})

