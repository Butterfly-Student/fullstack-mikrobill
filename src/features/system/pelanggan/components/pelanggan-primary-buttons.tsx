"use client"

import { Download, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePelanggan } from "./pelanggan-provider"

export function PelangganPrimaryButtons() {
  const { setOpen } = usePelanggan()
  return (
    <div className="flex gap-2">
      <Button variant="outline" className="space-x-1 bg-transparent" onClick={() => setOpen("import")}>
        <span>Import</span> <Download size={18} />
      </Button>
      <Button className="space-x-1" onClick={() => setOpen("create")}>
        <span>Create</span> <Plus size={18} />
      </Button>
    </div>
  )
}
