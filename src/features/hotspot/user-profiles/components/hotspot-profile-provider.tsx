import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Profile } from '../../data/schema'


type HotspotDialogType = 'connect' | 'add' | 'edit' | 'delete' | 'test-connection'

type HotspotUserContextType = {
  open: HotspotDialogType | null
  setOpen: (str: HotspotDialogType | null) => void
  currentRow: Profile | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Profile | null>>
}

const HotspotProfileContext = React.createContext<HotspotUserContextType | null>(null)

export function HotspotProfileProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<HotspotDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Profile | null>(null)

  return (
    <HotspotProfileContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </HotspotProfileContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useHotspotProfile = () => {
  const hotspotProfileContext = React.useContext(HotspotProfileContext)

  if (!hotspotProfileContext) {
    throw new Error('useHotspot has to be used within <HotspotProvider>')
  }

  return hotspotProfileContext
}