"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { TemplateTagihan } from "../data/schema"
import { DataTableRowActions } from "./data-table-row-actions"
import { Badge } from "@/components/ui/badge"

export const templateTagihanColumns: ColumnDef<TemplateTagihan>[] = [
  {
    accessorKey: "nama",
    header: "Nama Template",
  },
  {
    accessorKey: "deskripsi",
    header: "Deskripsi",
    cell: ({ row }) => {
      const deskripsi = row.getValue("deskripsi") as string
      return deskripsi ? (
        <div className="max-w-[200px] truncate" title={deskripsi}>
          {deskripsi}
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: "jumlah",
    header: "Jumlah",
    cell: ({ row }) => {
      const jumlah = Number.parseFloat(row.getValue("jumlah"))
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(jumlah)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "periode",
    header: "Periode",
    cell: ({ row }) => {
      const periode = row.getValue("periode") as string
      return (
        <Badge variant="outline" className="capitalize">
          {periode}
        </Badge>
      )
    },
  },
  {
    accessorKey: "tanggalMulai",
    header: "Tanggal Mulai",
    cell: ({ row }) => {
      const tanggal = row.getValue("tanggalMulai") as string
      return new Date(tanggal).toLocaleDateString("id-ID")
    },
  },
  {
    accessorKey: "jatuhTempo",
    header: "Jatuh Tempo",
    cell: ({ row }) => {
      const tanggal = row.getValue("jatuhTempo") as string
      return new Date(tanggal).toLocaleDateString("id-ID")
    },
  },
  {
    accessorKey: "aktif",
    header: "Status",
    cell: ({ row }) => {
      const aktif = row.getValue("aktif") as boolean
      return <Badge variant={aktif ? "default" : "secondary"}>{aktif ? "Aktif" : "Nonaktif"}</Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
