import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type HotspotType } from '../data/schema'


type HotspotDialogType = 'connect' | 'add' | 'edit' | 'delete' | 'test-connection'

type HotspotContextType = {
  open: HotspotDialogType | null
  setOpen: (str: HotspotDialogType | null) => void
  currentRow: HotspotType | null
  setCurrentRow: React.Dispatch<React.SetStateAction<HotspotType | null>>
}

const HotspotContext = React.createContext<HotspotContextType | null>(null)

export function HotspotProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<HotspotDialogType>(null)
  const [currentRow, setCurrentRow] = useState<HotspotType | null>(null)

  return (
    <HotspotContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </HotspotContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useHotspot = () => {
  const hotspotContext = React.useContext(HotspotContext)

  if (!hotspotContext) {
    throw new Error('useHotspot has to be used within <HotspotProvider>')
  }

  return HotspotContext
}