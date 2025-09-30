"use client"

import React, { useState } from "react"
import useDialogState from "@/hooks/use-dialog-state"
import type { Pelanggan } from "../data/schema"

type PelangganDialogType = "create" | "update" | "delete" | "import"

type PelangganContextType = {
  open: PelangganDialogType | null
  setOpen: (v: PelangganDialogType | null) => void
  currentRow: Pelanggan | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Pelanggan | null>>
}

const PelangganContext = React.createContext<PelangganContextType | null>(null)

export function PelangganProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<PelangganDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Pelanggan | null>(null)

  return <PelangganContext value={{ open, setOpen, currentRow, setCurrentRow }}>{children}</PelangganContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePelanggan = () => {
  const ctx = React.useContext(PelangganContext)
  if (!ctx) throw new Error("usePelanggan must be used within <PelangganProvider>")
  return ctx
}
