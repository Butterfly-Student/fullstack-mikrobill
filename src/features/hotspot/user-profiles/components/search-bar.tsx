// components/hotspot/search-bar.tsx
"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  searchTerm: string
  onSearchChange: (searchTerm: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
  className = ""
}: SearchBarProps) {
  return (
    <div className={`relative flex-1 max-w-sm ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 bg-transparent"
      />
    </div>
  )
}