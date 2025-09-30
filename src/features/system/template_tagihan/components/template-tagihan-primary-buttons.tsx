"use client"

import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"
import { useTemplateTagihan } from "./template-tagihan-provider"

export function TemplateTagihanPrimaryButtons() {
  const { setOpen } = useTemplateTagihan()

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={() => setOpen("import")} variant="outline" size="sm">
        <Upload className="mr-2 h-4 w-4" />
        Import
      </Button>
      <Button onClick={() => setOpen("create")} size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Add Template
      </Button>
    </div>
  )
}
