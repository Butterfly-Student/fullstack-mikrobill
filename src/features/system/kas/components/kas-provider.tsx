"use client"

import React, { useState } from "react"
import useDialogState from "@/hooks/use-dialog-state"
import type { Kas } from "../data/schema"

type KasDialogType = "create" | "update" | "delete" | "import"

type KasContextType = {
  open: KasDialogType | null
  setOpen: (v: KasDialogType | null) => void
  currentRow: Kas | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Kas | null>>
}

const KasContext = React.createContext<KasContextType | null>(null)

export function KasProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<KasDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Kas | null>(null)

  return <KasContext value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</KasContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useKas = () => {
  const ctx = React.useContext(KasContext)
  if (!ctx) throw new Error("useKas must be used within <KasProvider>")
  return ctx
}
