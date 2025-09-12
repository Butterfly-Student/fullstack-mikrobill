import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { ChevronRight, ChevronDown, Power, PowerOff } from 'lucide-react'
import { HotspotType as columns } from '../data/schema'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className: string
    mobileLabel?: string
    mobileRender?: (value: TValue, row: TData) => React.ReactNode
  }
}

type ResponsiveDataTableProps<TData> = {
  data: TData[]
  search: Record<string, unknown>
  navigate: NavigateFn
}

type MobileCardHelpers<TData> = {
  isSelected: boolean
  onSelect: (checked: boolean) => void
  onToggleStatus: (enabled: boolean) => void
  onRowClick: () => void
  openItems: Record<number, boolean>
  toggleCollapsible: (index: number) => void
}

export function ResponsiveDataTable<TData>({
  data,
  search,
  navigate,
}: ResponsiveDataTableProps<TData>) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({})

  // Synced with URL states
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: searchKey, searchKey: searchKey, type: 'string' },
      ...filters.map(filter => ({
        columnId: filter.columnId,
        searchKey: filter.columnId,
        type: 'array' as const
      }))
    ],
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  const toggleCollapsible = (index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const rowIndex = data.findIndex(item => getItemId(item) === itemId)
    if (rowIndex !== -1) {
      setRowSelection(prev => ({
        ...prev,
        [rowIndex]: checked
      }))
    }
  }

  const handleToggleStatus = (item: TData, enabled: boolean) => {
    onToggleStatus?.(item, enabled)
  }

  const handleRowClick = (item: TData) => {
    onRowClick?.(item)
  }

  // Default mobile card renderer
  const defaultMobileCardRenderer = (item: TData, index: number) => {
    const itemId = getItemId(item)
    const isSelected = rowSelection[index] || false
    const itemAny = item as any

    const helpers: MobileCardHelpers<TData> = {
      isSelected,
      onSelect: (checked) => handleSelectItem(itemId, checked),
      onToggleStatus: (enabled) => handleToggleStatus(item, enabled),
      onRowClick: () => handleRowClick(item),
      openItems,
      toggleCollapsible,
    }

    return (
      <Card key={index} className="mb-2">
        <Collapsible open={openItems[index] || false} onOpenChange={() => toggleCollapsible(index)}>
          <CollapsibleTrigger asChild>
            <CardContent className="p-3 cursor-pointer hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => helpers.onSelect(checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0"
                  />
                  {onToggleStatus && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        helpers.onToggleStatus(!itemAny.enabled)
                      }}
                      className="p-1 h-auto"
                    >
                      {itemAny.enabled !== false ? (
                        <Power className="w-3 h-3 text-green-600" />
                      ) : (
                        <PowerOff className="w-3 h-3 text-red-600" />
                      )}
                    </Button>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">
                      {itemAny.name || itemAny.user || itemAny.title || String(item)}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {itemAny.description || itemAny.email || itemAny.address || ''}
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${openItems[index] ? "rotate-90" : ""}`} />
              </div>
            </CardContent>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-3 px-3">
              <div className="grid grid-cols-1 gap-1 text-xs">
                {columns.map((column, colIndex) => {
                  if (column.id === 'select' || column.id === 'actions') return null
                  const value = column.accessorFn ? column.accessorFn(item) : itemAny[column.accessorKey || column.id]
                  const label = column.meta?.mobileLabel || column.header || column.id

                  return (
                    <div key={colIndex} className="flex justify-between py-1">
                      <span className="text-gray-600">{label}:</span>
                      <span className="truncate ml-2">
                        {column.meta?.mobileRender ? column.meta.mobileRender(value, item) : String(value || '-')}
                      </span>
                    </div>
                  )
                })}
              </div>
              {onRowClick && (
                <Button
                  className="w-full mt-2 bg-transparent"
                  variant="outline"
                  size="sm"
                  onClick={() => helpers.onRowClick()}
                >
                  View Details
                </Button>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    )
  }

  const renderMobileCard = mobileCardRenderer || defaultMobileCardRenderer

  const isAllSelected = table.getIsAllPageRowsSelected()
  const isIndeterminate = table.getIsSomePageRowsSelected() && !isAllSelected

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        searchKey={searchKey}
        filters={filters}
      />

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-50 group/row">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className={cn(
                          'text-left font-medium text-gray-700 whitespace-nowrap px-4 py-3',
                          'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                          header.column.columnDef.meta?.className ?? ''
                        )}
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center gap-1">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </div>
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      'hover:bg-gray-50 group/row',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'px-4 py-3',
                          'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                          cell.column.columnDef.meta?.className ?? ''
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-96 text-center text-gray-500 px-4 py-3"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {table.getRowModel().rows?.length ? (
          <div className="space-y-2">
            {table.getRowModel().rows.map((row, index) =>
              renderMobileCard(row.original, index)
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No data available
            </CardContent>
          </Card>
        )}
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}