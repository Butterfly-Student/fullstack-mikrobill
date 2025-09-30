import { PppSecrets } from '@/features/ppp/secrets'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/ppp/secrets')({
  component: PppSecrets,
})

