import HotspotUsersNonActive from '@/features/hotspot/non-active'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/hotspot/users-non-active',
)({
  component: HotspotUsersNonActive,
})
