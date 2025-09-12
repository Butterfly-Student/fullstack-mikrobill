import HotspotUser from '@/features/hotspot/users'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/hotspot/users')({
  component: HotspotUser,
})

