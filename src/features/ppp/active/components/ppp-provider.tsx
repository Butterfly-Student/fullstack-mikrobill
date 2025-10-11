import React, { useState } from 'react'
import { type PppoeActive } from '../../data/schema'

type PppActiveDialogType = 'open' | 'ping' | 'disconnect'

type PppActiveContextType = {
  open: PppActiveDialogType | null
  setOpen: (str: PppActiveDialogType | null) => void
  currentRow: PppoeActive | null
  setCurrentRow: React.Dispatch<React.SetStateAction<PppoeActive | null>>
}

const PppActiveContext = React.createContext<PppActiveContextType | null>(null)

export function PppProvider({ children }: { children: React.ReactNode }) {
  // FIXED: Gunakan useState biasa, bukan useDialogState custom
  const [open, setOpen] = useState<PppActiveDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<PppoeActive | null>(null)
  console.log("open", open)
  console.log("Cureent Row", currentRow)

  return (
    <PppActiveContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </PppActiveContext.Provider>
  )
}

export const usePppActive = () => {
  const pppActiveContext = React.useContext(PppActiveContext)

  if (!pppActiveContext) {
    throw new Error('usePppActive has to be used within <PppProvider>')
  }

  return pppActiveContext
}
