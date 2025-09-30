import HotspotUsersInactive from '@/features/hotspot/inactive'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/hotspot/users-inactive',
)({
  component: HotspotUsersNonActive,
})
