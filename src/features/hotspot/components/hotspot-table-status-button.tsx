// components/hotspot/hotspot-table-status-button.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Power, PowerOff } from "lucide-react"

interface HotspotTableStatusButtonProps {
  enabled: boolean
  onToggle: (enable: boolean) => void
}

export function HotspotTableStatusButton({ enabled, onToggle }: HotspotTableStatusButtonProps) {
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={(e) => {
        e.stopPropagation()
        onToggle(!enabled)
      }}
      className="p-1 h-auto"
    >
      {enabled ? (
        <Power className="w-4 h-4 text-green-600" />
      ) : (
        <PowerOff className="w-4 h-4 text-red-600" />
      )}
    </Button>
  )
}