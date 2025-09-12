import HotspotServer from '@/features/hotspot/server'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/hotspot/server')({
  component: HotspotServer,
})

