"use client"

import React, { useState } from "react"
import useDialogState from "@/hooks/use-dialog-state"
import type { Tagihan } from "../data/schema"

type TagihanDialogType = "create" | "update" | "delete" | "import"

type TagihanContextType = {
  open: TagihanDialogType | null
  setOpen: (v: TagihanDialogType | null) => void
  currentRow: Tagihan | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Tagihan | null>>
}

const TagihanContext = React.createContext<TagihanContextType | null>(null)

export function TagihanProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<TagihanDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Tagihan | null>(null)

  return <TagihanContext value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</TagihanContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTagihan = () => {
  const ctx = React.useContext(TagihanContext)
  if (!ctx) throw new Error("useTagihan must be used within <TagihanProvider>")
  return ctx
}
