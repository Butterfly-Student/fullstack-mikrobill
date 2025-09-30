"use client"

import { Download, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTagihan } from "./tagihan-provider"

export function TagihanPrimaryButtons() {
  const { setOpen } = useTagihan()
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
