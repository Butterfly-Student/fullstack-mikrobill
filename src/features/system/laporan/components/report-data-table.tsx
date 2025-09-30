"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Search, Download, Filter } from "lucide-react"

interface ReportDataTableProps {
  type: "sales" | "inventory" | "financial"
}

const salesData = [
  {
    id: "TXN-001",
    tanggal: "2024-01-15",
    pelanggan: "PT. Maju Jaya",
    produk: "Laptop Dell XPS 13",
    jumlah: 2,
    harga: 25000000,
    total: 50000000,
    status: "Selesai",
  },
  {
    id: "TXN-002",
    tanggal: "2024-01-14",
    pelanggan: "CV. Berkah Sentosa",
    produk: "iPhone 15 Pro",
    jumlah: 1,
    harga: 18000000,
    total: 18000000,
    status: "Pending",
  },
  {
    id: "TXN-003",
    tanggal: "2024-01-13",
    pelanggan: "Toko Elektronik Jaya",
    produk: "Samsung Galaxy S24",
    jumlah: 3,
    harga: 12000000,
    total: 36000000,
    status: "Selesai",
  },
]

const inventoryData = [
  {
    id: "PRD-001",
    nama: "Laptop Dell XPS 13",
    kategori: "Laptop",
    stok: 15,
    minimum: 10,
    harga: 25000000,
    supplier: "PT. Dell Indonesia",
    status: "Tersedia",
  },
  {
    id: "PRD-002",
    nama: "iPhone 15 Pro",
    kategori: "Smartphone",
    stok: 5,
    minimum: 8,
    harga: 18000000,
    supplier: "PT. Apple Indonesia",
    status: "Stok Rendah",
  },
  {
    id: "PRD-003",
    nama: "Samsung Galaxy S24",
    kategori: "Smartphone",
    stok: 25,
    minimum: 15,
    harga: 12000000,
    supplier: "PT. Samsung Electronics",
    status: "Tersedia",
  },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Selesai":
    case "Tersedia":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          {status}
        </Badge>
      )
    case "Pending":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          {status}
        </Badge>
      )
    case "Stok Rendah":
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          {status}
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function ReportDataTable({ type }: ReportDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const data = type === "sales" ? salesData : inventoryData
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const renderSalesTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID Transaksi</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Pelanggan</TableHead>
          <TableHead>Produk</TableHead>
          <TableHead>Jumlah</TableHead>
          <TableHead>Harga Satuan</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginatedData.map((item: any) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.id}</TableCell>
            <TableCell>{new Date(item.tanggal).toLocaleDateString("id-ID")}</TableCell>
            <TableCell>{item.pelanggan}</TableCell>
            <TableCell>{item.produk}</TableCell>
            <TableCell>{item.jumlah}</TableCell>
            <TableCell>{formatCurrency(item.harga)}</TableCell>
            <TableCell className="font-medium">{formatCurrency(item.total)}</TableCell>
            <TableCell>{getStatusBadge(item.status)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const renderInventoryTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID Produk</TableHead>
          <TableHead>Nama Produk</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead>Stok</TableHead>
          <TableHead>Minimum</TableHead>
          <TableHead>Harga</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginatedData.map((item: any) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.id}</TableCell>
            <TableCell>{item.nama}</TableCell>
            <TableCell>{item.kategori}</TableCell>
            <TableCell>{item.stok}</TableCell>
            <TableCell>{item.minimum}</TableCell>
            <TableCell>{formatCurrency(item.harga)}</TableCell>
            <TableCell>{item.supplier}</TableCell>
            <TableCell>{getStatusBadge(item.status)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">{type === "sales" ? renderSalesTable() : renderInventoryTable()}</div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredData.length)} dari{" "}
          {filteredData.length} data
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </Button>
          <span className="text-sm">
            Halaman {currentPage} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
