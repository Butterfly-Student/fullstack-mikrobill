'use client'

import React, { useState } from 'react'
import { type ActiveUser } from '../../data/schema'

type ActiveDialogType = 'view' | 'disconnect' | null

type ActiveUserContextType = {
  open: ActiveDialogType
  setOpen: (str: ActiveDialogType) => void
  currentRow: ActiveUser | null
  setCurrentRow: React.Dispatch<React.SetStateAction<ActiveUser | null>>
  filteredData: ActiveUser[]
  setFilteredData: React.Dispatch<React.SetStateAction<ActiveUser[]>>
}

const ActiveUserContext = React.createContext<ActiveUserContextType | null>(
  null
)

export function ActiveUserProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState<ActiveDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ActiveUser | null>(null)
  const [filteredData, setFilteredData] = useState<ActiveUser[]>([])

  return (
    <ActiveUserContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        filteredData,
        setFilteredData,
      }}
    >
      {children}
    </ActiveUserContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useActiveUser = () => {
  const ctx = React.useContext(ActiveUserContext)
  if (!ctx)
    throw new Error('useActiveUser must be used within <ActiveUserProvider>')
  return ctx
}
