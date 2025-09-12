import HotspotUsersActive from '@/features/hotspot/active'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/hotspot/users-active')({
  component: HotspotUsersActive,
})
