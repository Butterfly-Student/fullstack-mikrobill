"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Filter, X, Download, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface FilterState {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  category: string
  status: string
  customer: string
  minAmount: string
  maxAmount: string
}

export function ReportFilters() {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      from: undefined,
      to: undefined,
    },
    category: "all",
    status: "all",
    customer: "",
    minAmount: "",
    maxAmount: "",
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      dateRange: { from: undefined, to: undefined },
      category: "all",
      status: "all",
      customer: "",
      minAmount: "",
      maxAmount: "",
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.dateRange.from || filters.dateRange.to) count++
    if (filters.category !== "all") count++
    if (filters.status !== "all") count++
    if (filters.customer) count++
    if (filters.minAmount || filters.maxAmount) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <h3 className="text-sm font-medium">Filter Laporan</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} filter aktif
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? "Sembunyikan" : "Lanjutan"}
          </Button>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Hapus Filter
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label>Rentang Tanggal</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "dd MMM yyyy", { locale: id })} -{" "}
                      {format(filters.dateRange.to, "dd MMM yyyy", { locale: id })}
                    </>
                  ) : (
                    format(filters.dateRange.from, "dd MMM yyyy", { locale: id })
                  )
                ) : (
                  <span>Pilih tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from}
                selected={filters.dateRange}
                onSelect={(range) => handleFilterChange("dateRange", range)}
                numberOfMonths={2}
                locale={id}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Kategori</Label>
          <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Semua kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua kategori</SelectItem>
              <SelectItem value="laptop">Laptop</SelectItem>
              <SelectItem value="smartphone">Smartphone</SelectItem>
              <SelectItem value="tablet">Tablet</SelectItem>
              <SelectItem value="aksesoris">Aksesoris</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua status</SelectItem>
              <SelectItem value="selesai">Selesai</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Label>Aksi Cepat</Label>
          <div className="flex space-x-2">
            <Button size="sm" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <Label>Pelanggan</Label>
            <Input
              placeholder="Nama pelanggan..."
              value={filters.customer}
              onChange={(e) => handleFilterChange("customer", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Jumlah Minimum</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange("minAmount", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Jumlah Maksimum</Label>
            <Input
              type="number"
              placeholder="Tidak terbatas"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
