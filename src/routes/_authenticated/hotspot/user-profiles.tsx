import HotspotUserProfiles from '@/features/hotspot/user-profiles'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/hotspot/user-profiles')({
  component: HotspotUserProfiles,
})