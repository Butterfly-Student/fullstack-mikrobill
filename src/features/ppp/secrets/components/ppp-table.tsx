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
  Network,
  Server,
  User,
  MapPin,
  Router,
  Phone,
  Globe
} from 'lucide-react'
import { type PppoeUser } from '../../data/schema'
import { pppColumns as columns } from './ppp-columns'
import { DataTableBulkActions } from './data-table-bulk-actions'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className: string
  }
}

type PppTableProps = {
  data: PppoeUser[]
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function PppTable({ data, search, navigate }: PppTableProps) {
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
      { columnId: 'service', searchKey: 'service', type: 'array' },
      { columnId: 'disabled', searchKey: 'status', type: 'array' },
      { columnId: 'profile', searchKey: 'profile', type: 'string' },
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

  const formatLastLogout = (lastLogout: string | undefined) => {
    if (!lastLogout) return '-'
    try {
      return new Date(lastLogout).toLocaleString()
    } catch {
      return lastLogout
    }
  }

  const renderMobileCard = (row: Row<PppoeUser>, index: number) => {
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
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <p className="font-medium text-sm truncate">{item.name}</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Network className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <p className="text-xs text-muted-foreground truncate">
                          {item.service?.toUpperCase() || 'PPPoE'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    <Badge
                      variant={item.disabled ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {item.disabled ? 'Disabled' : 'Active'}
                    </Badge>

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
                {/* PPPoE Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {/* ID */}
                  {item['.id'] && (
                    <div className="flex items-center space-x-2">
                      <Server className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">ID:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {item['.id']}
                      </code>
                    </div>
                  )}

                  {/* Profile */}
                  {item.profile && (
                    <div className="flex items-center space-x-2">
                      <Router className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="font-medium">Profile:</span>
                      <span className="text-blue-600 font-medium">{item.profile}</span>
                    </div>
                  )}

                  {/* Caller ID */}
                  {item['caller-id'] && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">Caller ID:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {item['caller-id']}
                      </code>
                    </div>
                  )}

                  {/* Local Address */}
                  {item['local-address'] && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="font-medium">Local IP:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {item['local-address']}
                      </code>
                    </div>
                  )}

                  {/* Remote Address */}
                  {item['remote-address'] && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-orange-600 flex-shrink-0" />
                      <span className="font-medium">Remote IP:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {item['remote-address']}
                      </code>
                    </div>
                  )}

                  {/* IPv6 Prefix */}
                  {item['remote-ipv6-prefix'] && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <span className="font-medium">IPv6 Prefix:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {item['remote-ipv6-prefix']}
                      </code>
                    </div>
                  )}

                  {/* Last Logout */}
                  {item['last-logged-out'] && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">Last Logout:</span>
                      <span className="text-xs">{formatLastLogout(item['last-logged-out'])}</span>
                    </div>
                  )}
                </div>

                {/* Limits Section */}
                {(item['limit-bytes-in'] || item['limit-bytes-out']) && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm flex items-center">
                      <Network className="h-4 w-4 mr-2" />
                      Data Limits
                    </h4>
                    <div className="grid grid-cols-1 gap-3 text-xs bg-muted/50 p-3 rounded-md">
                      {item['limit-bytes-in'] && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Bytes In:
                          </span>
                          <code className="font-mono text-green-600">{item['limit-bytes-in']}</code>
                        </div>
                      )}
                      {item['limit-bytes-out'] && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Bytes Out:
                          </span>
                          <code className="font-mono text-blue-600">{item['limit-bytes-out']}</code>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Routes Section */}
                {(item.routes || item['ipv6-routes']) && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm flex items-center">
                      <Router className="h-4 w-4 mr-2" />
                      Routes
                    </h4>
                    <div className="space-y-2 text-xs bg-muted/50 p-3 rounded-md">
                      {item.routes && (
                        <div>
                          <span className="text-muted-foreground font-medium">IPv4:</span>
                          <code className="block mt-1 font-mono text-green-600 break-all">{item.routes}</code>
                        </div>
                      )}
                      {item['ipv6-routes'] && (
                        <div>
                          <span className="text-muted-foreground font-medium">IPv6:</span>
                          <code className="block mt-1 font-mono text-blue-600 break-all">{item['ipv6-routes']}</code>
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
        searchPlaceholder='Filter PPPoE users...'
        searchKey='name'
        filters={[
          {
            columnId: 'service',
            title: 'Service',
            options: [
              { label: 'PPPoE', value: 'pppoe' },
              { label: 'PPTP', value: 'pptp' },
              { label: 'L2TP', value: 'l2tp' },
              { label: 'OpenVPN', value: 'ovpn' },
              { label: 'SSTP', value: 'sstp' }
            ]
          },
          {
            columnId: 'disabled',
            title: 'Status',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Disabled', value: 'disabled' }
            ]
          },
          {
            columnId: 'profile',
            title: 'Profile',
            options: Array.from(new Set(data.filter(item => item.profile).map(item => item.profile!))).map(profile => ({
              label: profile,
              value: profile
            }))
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
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-sm">No PPPoE users found.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Try adjusting your search or filter criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <DataTablePagination table={table} />
      <DataTableBulkActions table={table} />
    </div>
  )
}