import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type HotspotUser } from '../../data/schema'

type HotspotDialogType =
  | 'connect'
  | 'add'
  | 'edit'
  | 'delete'
  | 'test-connection'

type HotspotUserContextType = {
  open: HotspotDialogType | null
  setOpen: (str: HotspotDialogType | null) => void
  currentRow: HotspotUser | null
  setCurrentRow: React.Dispatch<React.SetStateAction<HotspotUser | null>>
  // ✅ Tambahan baru
  filteredData: HotspotUser[]
  setFilteredData: React.Dispatch<React.SetStateAction<HotspotUser[]>>
}

const HotspotUserContext = React.createContext<HotspotUserContextType | null>(
  null
)

export function HotspotUserProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<HotspotDialogType>(null)
  const [currentRow, setCurrentRow] = useState<HotspotUser | null>(null)

  // ✅ State baru untuk menyimpan data yang sudah difilter
  const [filteredData, setFilteredData] = useState<HotspotUser[]>([])

  return (
    <HotspotUserContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        filteredData,
        setFilteredData, // ✅ Jangan lupa dioper ke context
      }}
    >
      {children}
    </HotspotUserContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useHotspotUser = () => {
  const hotspotUserContext = React.useContext(HotspotUserContext)

  if (!hotspotUserContext) {
    throw new Error(
      'useHotspotUser has to be used within <HotspotUserProvider>'
    )
  }

  return hotspotUserContext
}
