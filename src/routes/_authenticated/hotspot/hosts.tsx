import HotspotHosts from '@/features/hotspot/hosts'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/hotspot/hosts')({
  component: HotspotHosts,
})
