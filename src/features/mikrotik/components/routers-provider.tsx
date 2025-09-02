import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Router } from '../data/schema'

type RoutersDialogType = 'connect' | 'add' | 'edit' | 'delete' | 'test-connection'

type RoutersContextType = {
  open: RoutersDialogType | null
  setOpen: (str: RoutersDialogType | null) => void
  currentRow: Router | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Router | null>>
}

const RoutersContext = React.createContext<RoutersContextType | null>(null)

export function RoutersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<RoutersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Router | null>(null)

  return (
    <RoutersContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </RoutersContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRouters = () => {
  const routersContext = React.useContext(RoutersContext)

  if (!routersContext) {
    throw new Error('useRouters has to be used within <RoutersProvider>')
  }

  return routersContext
}