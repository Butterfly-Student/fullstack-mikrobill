"use client"

import React, { useState } from "react"
import useDialogState from "@/hooks/use-dialog-state"
import type { TemplateTagihan } from "../data/schema"

type TemplateTagihanDialogType = "create" | "update" | "delete" | "import"

type TemplateTagihanContextType = {
  open: TemplateTagihanDialogType | null
  setOpen: (v: TemplateTagihanDialogType | null) => void
  currentRow: TemplateTagihan | null
  setCurrentRow: React.Dispatch<React.SetStateAction<TemplateTagihan | null>>
}

const TemplateTagihanContext = React.createContext<TemplateTagihanContextType | null>(null)

export function TemplateTagihanProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<TemplateTagihanDialogType>(null)
  const [currentRow, setCurrentRow] = useState<TemplateTagihan | null>(null)

  return (
    <TemplateTagihanContext value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</TemplateTagihanContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTemplateTagihan = () => {
  const ctx = React.useContext(TemplateTagihanContext)
  if (!ctx) throw new Error("useTemplateTagihan must be used within <TemplateTagihanProvider>")
  return ctx
}
