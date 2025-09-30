"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, FileSpreadsheet, Printer, Share2 } from "lucide-react"

export function ReportExport() {
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeSummary: true,
    includeRawData: true,
    includeFilters: true,
  })

  const handleExport = (format: string) => {
    console.log(`[v0] Exporting report in ${format} format with options:`, exportOptions)
    // Simulate export process
    setTimeout(() => {
      console.log(`[v0] Export completed for ${format}`)
      setShowExportDialog(false)
    }, 1000)
  }

  const handleQuickExport = (format: string) => {
    console.log(`[v0] Quick export in ${format} format`)
    // Simulate quick export
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Export Laporan</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => handleQuickExport("pdf")}>
            <FileText className="h-4 w-4 mr-2" />
            Export ke PDF
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleQuickExport("excel")}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export ke Excel
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleQuickExport("csv")}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export ke CSV
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print Laporan
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
            <Share2 className="h-4 w-4 mr-2" />
            Export Lanjutan...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Laporan Lanjutan</DialogTitle>
            <DialogDescription>Pilih format dan opsi export yang diinginkan</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Konten yang Disertakan</Label>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="charts"
                    checked={exportOptions.includeCharts}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({ ...prev, includeCharts: checked as boolean }))
                    }
                  />
                  <Label htmlFor="charts" className="text-sm">
                    Sertakan grafik dan visualisasi
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="summary"
                    checked={exportOptions.includeSummary}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({ ...prev, includeSummary: checked as boolean }))
                    }
                  />
                  <Label htmlFor="summary" className="text-sm">
                    Sertakan ringkasan eksekutif
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rawdata"
                    checked={exportOptions.includeRawData}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({ ...prev, includeRawData: checked as boolean }))
                    }
                  />
                  <Label htmlFor="rawdata" className="text-sm">
                    Sertakan data mentah
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filters"
                    checked={exportOptions.includeFilters}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({ ...prev, includeFilters: checked as boolean }))
                    }
                  />
                  <Label htmlFor="filters" className="text-sm">
                    Sertakan informasi filter
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0">
            <div className="flex space-x-2 w-full">
              <Button variant="outline" onClick={() => handleExport("pdf")} className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" onClick={() => handleExport("excel")} className="flex-1">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => handleExport("csv")} className="flex-1">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
