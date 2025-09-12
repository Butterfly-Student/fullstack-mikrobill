// components/hotspot/hotspot-tabs.tsx
"use client"

import {
  Wifi,
  Users,
  User,
  Activity,
  Server,
} from "lucide-react"

interface HotspotTabsProps {
  activeTab: string
  onTabChange: (tabName: string) => void
}

const tabs = [
  { name: "Hotspot", icon: Wifi },
  { name: "Users", icon: Users },
  { name: "User Profile", icon: User },
  { name: "Active", icon: Activity },
  { name: "Hosts", icon: Server },
  { name: "Non-Active", icon: Users },
]

export function HotspotTabs({ activeTab, onTabChange }: HotspotTabsProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.name}
              onClick={() => onTabChange(tab.name)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-r border-gray-200 hover:bg-gray-50 whitespace-nowrap flex-shrink-0 ${activeTab === tab.name ? "bg-gray-100 text-gray-900" : "text-gray-600"
                }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}