import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table"
import type { Tagihan } from "../data/schema"
import { idr } from "../data/tagihan"
import { DataTableRowActions } from "./data-table-row-actions"

export const tagihanColumns: ColumnDef<Tagihan>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div className="w-[120px] truncate">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "noTagihan",
    header: ({ column }) => <DataTableColumnHeader column={column} title="No. Tagihan" />,
    cell: ({ row }) => <span className="font-medium">{row.getValue("noTagihan")}</span>,
  },
  {
    accessorKey: "tanggal",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal" />,
    // Data sudah diformat di parent, langsung tampilkan
    cell: ({ row }) => <span>{row.getValue("tanggal")}</span>,
  },
  {
    accessorKey: "jatuhTempo",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Jatuh Tempo" />,
    // Data sudah diformat di parent, langsung tampilkan
    cell: ({ row }) => <span>{row.getValue("jatuhTempo")}</span>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const s = String(row.getValue("status"))
      const variant = s === "lunas" ? "default" : s === "jatuh_tempo" ? "destructive" : "secondary"
      return <Badge variant={variant}>{s.replace("_", " ")}</Badge>
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
    cell: ({ row }) => <span className="tabular-nums">{idr(Number(row.getValue("total")))}</span>,
  },
  {
    accessorKey: "pelangganId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Pelanggan ID" />,
    cell: ({ row }) => <div className="w-[120px] truncate">{row.getValue("pelangganId")}</div>,
  },
  {
    header: "Created At",
    accessorKey: "createdAt",
    // Data sudah diformat di parent, langsung tampilkan
    cell: ({ row }) => <span>{row.getValue("createdAt")}</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  }
]