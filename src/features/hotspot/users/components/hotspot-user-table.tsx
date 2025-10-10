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
import { ChevronRight, ChevronDown, User, Server, Wifi, Timer, Database, MessageSquare } from 'lucide-react'
import { type HotspotUser } from '../../data/schema'
import { hotspotUsersColumns as columns } from './hotspot-user-column'
import { HotspotDataTableBulkActions } from './data-table-bulk-action'
import { useHotspotUser } from './hotspot-user-provider'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className: string
  }
}

type HotspotUsersTableProps = {
  data: HotspotUser[]
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function HotspotUsersTable({ data, search, navigate }: HotspotUsersTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({})
  const { setFilteredData } = useHotspotUser()

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
      { columnId: 'server', searchKey: 'server', type: 'array' },
      { columnId: 'profile', searchKey: 'profile', type: 'array' },
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

    // Setiap kali hasil filter berubah, update ke context
  const filteredRows = table.getFilteredRowModel().rows;
  useEffect(() => {
    const filtered = filteredRows.map(r => r.original);
    setFilteredData(filtered);
  }, [filteredRows, setFilteredData, table]);

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  const toggleCollapsible = (index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }


  const renderMobileCard = (row: Row<HotspotUser>, index: number) => {
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
                        <Server className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <p className="text-xs text-muted-foreground truncate">{item.server}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    <Badge variant="outline" className="text-xs">
                      {item.profile}
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
                {/* User Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

                  {/* MAC Address */}
                  {item.macAddress && (
                    <div className="flex items-center space-x-2">
                      <Wifi className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">MAC:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {item.macAddress}
                      </code>
                    </div>
                  )}

                  {/* Time Limit */}
                  {item.timeLimit && (
                    <div className="flex items-center space-x-2">
                      <Timer className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">Time Limit:</span>
                      <span className="text-xs">{item.timeLimit}</span>
                    </div>
                  )}

                  {/* Data Limit */}
                  {item.dataLimit && (
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">Data Limit:</span>
                      <span className="text-xs">{item.dataLimit}</span>
                    </div>
                  )}

                  {/* Comment */}
                  {item.comment && (
                    <div className="sm:col-span-2 flex items-start space-x-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">Comment:</span>
                        <p className="text-xs text-muted-foreground mt-1 break-words">
                          {item.comment}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Section */}
                <div className="flex items-center justify-end pt-2 border-t">
                  {/* DataTableRowActions from column */}
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
        searchPlaceholder='Filter users...'
        searchKey='name'
        filters={[
          {
            columnId: 'server',
            title: 'Server',
            options: Array.from(new Set(data.map(item => item.server))).map(server => ({
              label: server,
              value: server
            }))
          },
          {
            columnId: 'profile',
            title: 'Profile',
            options: Array.from(new Set(data.map(item => item.profile))).map(profile => ({
              label: profile,
              value: profile
            }))
          },
          {
            columnId: 'comment',
            title: 'Comment',
            options: Array.from(new Set(data.map(item => item.comment))).map(comment => ({
              label: comment,
              value: comment
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
              <p className="text-sm">No users found.</p>
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