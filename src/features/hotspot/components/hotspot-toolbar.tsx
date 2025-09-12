"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import {
  RefreshCw,
  Filter,
  Plus,
  Zap,
  ChevronDown,
  UserPlus,
  Settings,
  Trash2,
} from "lucide-react"
import { SearchBar } from "./search-bar"

interface HotspotToolbarProps {
  activeTab: string
  connectionCount: number
  sampleProfilesLength: number
  selectedItems: string[]
  searchTerm: string
  onSearchChange: (searchTerm: string) => void
  onRemoveSelected: () => void
  onOpenAddUser: () => void
  onOpenAddProfile: () => void
  onOpenGenerate: () => void
}

export function HotspotToolbar({
  activeTab,
  connectionCount,
  sampleProfilesLength,
  selectedItems,
  searchTerm,
  onSearchChange,
  onRemoveSelected,
  onOpenAddUser,
  onOpenAddProfile,
  onOpenGenerate,
}: HotspotToolbarProps) {
  const getToolbarButtons = () => {
    const baseButtons = [
      <Button key="refresh" variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
        <RefreshCw className="w-4 h-4" />
      </Button>,
      <DropdownMenu key="filter">
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent flex-shrink-0">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>All</DropdownMenuItem>
          <DropdownMenuItem>Active</DropdownMenuItem>
          <DropdownMenuItem>Inactive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    ]

    const removeButton =
      selectedItems.length > 0 &&
        (activeTab === "Users" || activeTab === "User Profile" || activeTab === "Non-Active") ? (
        <Button
          key="remove"
          variant="outline"
          size="sm"
          className="gap-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 flex-shrink-0"
          onClick={onRemoveSelected}
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Remove ({selectedItems.length})</span>
          <span className="sm:hidden">({selectedItems.length})</span>
        </Button>
      ) : null

    if (activeTab === "User Profile") {
      return [
        ...baseButtons,
        removeButton,
        <Dialog key="add-profile">
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent flex-shrink-0" onClick={onOpenAddProfile}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </DialogTrigger>
        </Dialog>,
        <Dialog key="generate">
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent flex-shrink-0" onClick={onOpenGenerate}>
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Generate</span>
            </Button>
          </DialogTrigger>
        </Dialog>,
      ].filter(Boolean)
    }

    if (activeTab === "Users" || activeTab === "Active" || activeTab === "Non-Active") {
      return [
        ...baseButtons,
        removeButton,
        <Dialog key="add-user">
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent flex-shrink-0" onClick={onOpenAddUser}>
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add User</span>
            </Button>
          </DialogTrigger>
        </Dialog>,
        <Dialog key="generate">
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent flex-shrink-0" onClick={onOpenGenerate}>
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Generate</span>
            </Button>
          </DialogTrigger>
        </Dialog>,
        <Button key="expire" variant="outline" size="sm" className="gap-2 bg-transparent flex-shrink-0">
          <Settings className="w-4 h-4" />
          <span className="hidden lg:inline">Set Expire Monitor</span>
          <span className="lg:hidden">Expire</span>
        </Button>,
      ].filter(Boolean)
    }

    return [
      ...baseButtons,
      <Button key="add" variant="outline" size="sm" className="gap-2 bg-transparent flex-shrink-0">
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add</span>
      </Button>,
      <Button key="generate" variant="outline" size="sm" className="gap-2 bg-transparent flex-shrink-0">
        <Zap className="w-4 h-4" />
        <span className="hidden sm:inline">Generate</span>
      </Button>,
    ]
  }

  return (
    <div className="bg-white border-b border-gray-200 p-3">
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-lg font-mono">
            {activeTab === "User Profile" ? sampleProfilesLength : connectionCount}
          </span>
        </div>
        {getToolbarButtons()}
        <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
      </div>
    </div>
  )
}