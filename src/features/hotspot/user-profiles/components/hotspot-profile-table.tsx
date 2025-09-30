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
  type Row,
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
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import {
  ChevronRight,
  ChevronDown,
  Clock,
  Activity,
  Lock,
  Unlock,
  Download,
  Upload,
  Users,
  DollarSign,
  Settings,
  Timer,
  Gauge
} from 'lucide-react'
import { type Profile } from '../../data/schema'
import { hotspotProfileColumns as columns } from './hotspot-profile-column'
import { HotspotDataTableBulkActions } from './data-table-bulk-action'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className: string
  }
}

type HotspotUsersTableProps = {
  data: Profile[]
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function HotspotProfilesTable({ data, search, navigate }: HotspotUsersTableProps) {
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
      { columnId: 'name', searchKey: 'name', type: 'string' },
      { columnId: 'expiredMode', searchKey: 'expiredMode', type: 'array' },
      { columnId: 'lockUser', searchKey: 'lockUser', type: 'array' },
      { columnId: 'lockServer', searchKey: 'lockServer', type: 'array' },
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

  const renderMobileCard = (row: Row<Profile>, index: number) => {
    const item = row.original
    const isOpen = openItems[index]
    const isSelected = row.getIsSelected()

    return (
      <Card key={`mobile-card-${index}`} className={cn(
        "transition-all duration-200 py-0",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}>
        <Collapsible
          className='py-0'
          open={isOpen}
          onOpenChange={() => toggleCollapsible(index)}
        >
          <CollapsibleTrigger asChild>
            <div className="w-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked: boolean) => {
                        row.toggleSelected(checked)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0"
                      aria-label={`Select ${item.name}`}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <p className="font-medium text-sm truncate">{item.name}</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <p className="text-xs text-muted-foreground truncate">{item.expiredMode}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    {item.price && (
                      <Badge variant="outline" className="text-xs text-green-600">
                        {item.price}
                      </Badge>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleCollapsible(index)
                      }}
                    >
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0 pb-4 px-4">
              <div className="border-t pt-4 space-y-4">
                {/* Profile Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {/* Price */}
                  {item.price && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="font-medium">Price:</span>
                      <span className="text-green-600 font-medium">{item.price}</span>
                    </div>
                  )}

                  {/* Selling Price */}
                  {item.sellingPrice && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="font-medium">Selling Price:</span>
                      <span className="text-blue-600 font-medium">{item.sellingPrice}</span>
                    </div>
                  )}

                  {/* Lock User */}
                  <div className="flex items-center space-x-2">
                    {item.lockUser === 'Enable' ? (
                      <Lock className="h-4 w-4 text-red-600 flex-shrink-0" />
                    ) : (
                      <Unlock className="h-4 w-4 text-green-600 flex-shrink-0" />
                    )}
                    <span className="font-medium">User Lock:</span>
                    <span className={cn(
                      "text-xs",
                      (item.lockUser === 'Enable') ? "text-red-600" : "text-green-600"
                    )}>
                      {item.lockUser || 'Unlocked'}
                    </span>
                  </div>

                  {/* Lock Server */}
                  <div className="flex items-center space-x-2">
                    {item.lockServer === 'Enable' ? (
                      <Lock className="h-4 w-4 text-red-600 flex-shrink-0" />
                    ) : (
                      <Unlock className="h-4 w-4 text-green-600 flex-shrink-0" />
                    )}
                    <span className="font-medium">Server Lock:</span>
                    <span className={cn(
                      "text-xs",
                      (item.lockServer === 'Enable') ? "text-red-600" : "text-green-600"
                    )}>
                      {item.lockServer || 'Unlocked'}
                    </span>
                  </div>

                  {/* Bandwidth */}
                  {item.bandwidth && (
                    <div className="flex items-center space-x-2">
                      <Gauge className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">Bandwidth:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {item.bandwidth}
                      </code>
                    </div>
                  )}

                  {/* Session Timeout */}
                  {item.sessionTimeout && (
                    <div className="flex items-center space-x-2">
                      <Timer className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">Session Timeout:</span>
                      <span className="text-xs">{item.sessionTimeout}</span>
                    </div>
                  )}

                  {/* Idle Timeout */}
                  {item.idleTimeout && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">Idle Timeout:</span>
                      <span className="text-xs">{item.idleTimeout}</span>
                    </div>
                  )}

                  {/* Max Sessions */}
                  {item.maxSessions && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">Max Sessions:</span>
                      <span className="text-xs">{item.maxSessions}</span>
                    </div>
                  )}

                </div>

                {/* Limits Section */}
                {(item.downloadLimit || item.uploadLimit) && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      Data Limits
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs bg-muted/50 p-3 rounded-md">
                      {item.downloadLimit && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center">
                            <Download className="h-3 w-3 mr-1" />
                            Download:
                          </span>
                          <code className="font-mono text-green-600">{item.downloadLimit}</code>
                        </div>
                      )}
                      {item.uploadLimit && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center">
                            <Upload className="h-3 w-3 mr-1" />
                            Upload:
                          </span>
                          <code className="font-mono text-blue-600">{item.uploadLimit}</code>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions Section */}
                <div className="flex items-center justify-end pt-2 border-t">
                  {(() => {
                    // Find the actions cell from the row
                    const actionCell = row.getVisibleCells().find(cell => cell.column.id === 'actions')
                    if (actionCell) {
                      return (
                        <div className="flex-shrink-0">
                          {flexRender(
                            actionCell.column.columnDef.cell,
                            actionCell.getContext()
                          )}
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    )
  }

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter profiles...'
        searchKey='name'
        filters={[
          {
            columnId: 'expiredMode',
            title: 'Expired Mode',
            options: Array.from(new Set(data.map(item => item.expiredMode))).map(mode => ({
              label: mode,
              value: mode
            }))
          },
          {
            columnId: 'lockUser',
            title: 'User Lock',
            options: [
              { label: 'Locked', value: 'locked' },
              { label: 'Enabled', value: 'enabled' },
              { label: 'Unlocked', value: 'unlocked' },
              { label: 'Disabled', value: 'disabled' }
            ]
          },
          {
            columnId: 'lockServer',
            title: 'Server Lock',
            options: [
              { label: 'Locked', value: 'locked' },
              { label: 'Enabled', value: 'enabled' },
              { label: 'Unlocked', value: 'unlocked' },
              { label: 'Disabled', value: 'disabled' }
            ]
          }
        ]}
      />

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        header.column.columnDef.meta?.className ?? ''
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
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
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {table.getRowModel().rows?.length ? (
          <div className="space-y-3">
            {table.getRowModel().rows.map((row, index) =>
              renderMobileCard(row, index)
            )}
          </div>
        ) : (
          <Card className='py-0'>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-sm">No profiles found.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Try adjusting your search or filter criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <DataTablePagination table={table} />
      <HotspotDataTableBulkActions table={table} />
    </div>
  )
}