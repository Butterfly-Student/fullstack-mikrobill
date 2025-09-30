import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table"
import type { Kas } from "../data/schema"
import { DataTableRowActions } from "./data-table-row-actions"
import { format } from "date-fns"

const toRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)

export const kasColumns: ColumnDef<Kas>[] = [
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
    header: "Tanggal",
    accessorKey: "tanggal",
    cell: ({ row }) => {
      const tanggal: Date = row.getValue("tanggal")
      return (
        <span>
          {tanggal ? format(new Date(tanggal), "dd-MM-yyyy HH:mm") : "-"}
        </span>
      )
    },
  },
  {
    accessorKey: "keterangan",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Keterangan" />,
    cell: ({ row }) => <span className="">{row.getValue("keterangan") as string}</span>,
  },
  {
    accessorKey: "jenis",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Jenis" />,
    cell: ({ row }) => {
      const v = row.getValue("jenis") as string
      return <span className="">{v === "masuk" ? "Masuk" : "Keluar"}</span>
    },
  },
  {
    accessorKey: "jumlah",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Jumlah" />,
    cell: ({ row }) => {
      const v = Number(row.getValue("jumlah") ?? 0)
      return <span className="font-medium">{toRupiah(v)}</span>
    },
  },
  {
    header: "Created At",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const createdAt: Date = row.getValue("createdAt")
      return (
        <span>
          {createdAt ? format(new Date(createdAt), "dd-MM-yyyy HH:mm") : "-"}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
