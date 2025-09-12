import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type HotspotUser } from '../../data/schema'


type HotspotDialogType = 'connect' | 'add' | 'edit' | 'delete' | 'test-connection'

type HotspotUserContextType = {
  open: HotspotDialogType | null
  setOpen: (str: HotspotDialogType | null) => void
  currentRow: HotspotUser | null
  setCurrentRow: React.Dispatch<React.SetStateAction<HotspotUser | null>>
}

const HotspotUserContext = React.createContext<HotspotUserContextType | null>(null)

export function HotspotUserProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<HotspotDialogType>(null)
  const [currentRow, setCurrentRow] = useState<HotspotUser | null>(null)

  return (
    <HotspotUserContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </HotspotUserContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useHotspotUser = () => {
  const hotspotUserContext = React.useContext(HotspotUserContext)

  if (!hotspotUserContext) {
    throw new Error('useHotspot has to be used within <HotspotProvider>')
  }

  return hotspotUserContext
}