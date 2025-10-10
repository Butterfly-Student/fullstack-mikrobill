'use client'

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
import {
  ChevronRight,
  ChevronDown,
  UserIcon,
  Server,
  Wifi,
  Timer,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { activeUsersColumns as columns } from './hs-user-active-column'
import { useActiveUser } from './hs-active-provider'
import { type ActiveUser } from '../../data/schema'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className?: string
  }
}

type ActiveUsersTableProps = {
  data: ActiveUser[]
  search: Record<string, unknown>
  navigate: NavigateFn
}

function mono(val?: string | null) {
  return val ? (
    <code className='font-mono text-xs'>{val}</code>
  ) : (
    <span className='text-muted-foreground'>-</span>
  )
}

export function ActiveUsersTable({
  data,
  search,
  navigate,
}: ActiveUsersTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({})
  const { setFilteredData } = useActiveUser()

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
      { columnId: 'user', searchKey: 'user', type: 'string' },
      { columnId: 'server', searchKey: 'server', type: 'array' },
      { columnId: 'login-by', searchKey: 'loginBy', type: 'array' },
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

  // Sync filtered rows to provider context
  const filteredRows = table.getFilteredRowModel().rows
  useEffect(() => {
    const filtered = filteredRows.map((r) => r.original)
    setFilteredData(filtered)
  }, [filteredRows, setFilteredData])

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  const toggleCollapsible = (index: number) => {
    setOpenItems((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const renderMobileCard = (row: Row<ActiveUser>, index: number) => {
    const item = row.original
    const isOpen = openItems[index]
    const isSelected = row.getIsSelected()

    return (
      <Card
        key={`active-mobile-card-${index}`}
        className={cn(
          'py-0 transition-all duration-200',
          isSelected && 'ring-primary ring-2 ring-offset-2'
        )}
      >
        <Collapsible
          className='py-0'
          open={isOpen}
          onOpenChange={() => toggleCollapsible(index)}
        >
          <CollapsibleTrigger asChild>
            <div className='w-full'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex min-w-0 flex-1 items-center space-x-3'>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked: boolean) => {
                        row.toggleSelected(checked)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className='flex-shrink-0'
                      aria-label={`Select ${item.user}`}
                    />
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center space-x-2'>
                        <UserIcon className='text-muted-foreground h-4 w-4 flex-shrink-0' />
                        <p className='truncate text-sm font-medium'>
                          {item.user}
                        </p>
                      </div>
                      <div className='mt-1 flex items-center space-x-2'>
                        <Server className='text-muted-foreground h-3 w-3 flex-shrink-0' />
                        <p className='text-muted-foreground truncate text-xs'>
                          {item.server}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='ml-2 flex flex-shrink-0 items-center space-x-2'>
                    {item['login-by'] && (
                      <Badge variant='outline' className='text-xs'>
                        {item['login-by']}
                      </Badge>
                    )}
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 w-8 flex-shrink-0 p-0'
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleCollapsible(index)
                      }}
                    >
                      {isOpen ? (
                        <ChevronDown className='h-4 w-4' />
                      ) : (
                        <ChevronRight className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className='px-4 pt-0 pb-4'>
              <div className='space-y-4 border-t pt-4'>
                <div className='grid grid-cols-1 gap-3 text-sm sm:grid-cols-2'>
                  {/* Address + MAC */}
                  <div className='flex items-center space-x-2'>
                    <Wifi className='text-muted-foreground h-4 w-4 flex-shrink-0' />
                    <span className='font-medium'>IP:</span>
                    {mono(item.address)}
                  </div>
                  {item['mac-address'] && (
                    <div className='flex items-center space-x-2'>
                      <span className='font-medium'>MAC:</span>
                      {mono(item['mac-address'])}
                    </div>
                  )}
                  {/* Timers */}
                  {item.uptime && (
                    <div className='flex items-center space-x-2'>
                      <Timer className='text-muted-foreground h-4 w-4 flex-shrink-0' />
                      <span className='font-medium'>Uptime:</span>
                      <span className='text-xs'>{item.uptime}</span>
                    </div>
                  )}
                  {item['idle-time'] && (
                    <div className='flex items-center space-x-2'>
                      <span className='font-medium'>Idle:</span>
                      <span className='text-xs'>{item['idle-time']}</span>
                    </div>
                  )}
                  {item['session-time-left'] && (
                    <div className='flex items-center space-x-2'>
                      <span className='font-medium'>Left:</span>
                      <span className='text-xs'>
                        {item['session-time-left']}
                      </span>
                    </div>
                  )}
                </div>

                <div className='flex items-center justify-end border-t pt-2'>
                  {/* Placeholder actions - you can wire to provider */}
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      console.log('[v0] ActiveUser mobile action:', item.user)
                    }}
                  >
                    Actions
                  </Button>
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
        searchPlaceholder='Filter active users...'
        searchKey='user'
        filters={[
          {
            columnId: 'server',
            title: 'Server',
            options: Array.from(new Set(data.map((i) => i.server))).map(
              (server) => ({ label: server, value: server })
            ),
          },
          {
            columnId: 'login-by',
            title: 'Login By',
            options: Array.from(
              new Set(data.map((i) => i['login-by']).filter(Boolean))
            ).map((lb) => ({
              label: String(lb),
              value: String(lb),
            })),
          },
        ]}
      />

      {/* Desktop */}
      <div className='hidden overflow-hidden rounded-md border md:block'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => (
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
                ))}
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

      {/* Mobile */}
      <div className='md:hidden'>
        {table.getRowModel().rows?.length ? (
          <div className='space-y-3'>
            {table
              .getRowModel()
              .rows.map((row, index) => renderMobileCard(row, index))}
          </div>
        ) : (
          <Card className='py-0'>
            <CardContent className='text-muted-foreground p-8 text-center'>
              <UserIcon className='text-muted-foreground/50 mx-auto mb-4 h-12 w-12' />
              <p className='text-sm'>No active users found.</p>
              <p className='text-muted-foreground/70 mt-1 text-xs'>
                Try adjusting your search or filter criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
