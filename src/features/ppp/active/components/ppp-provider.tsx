import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type PppoeActive } from '../../data/schema'

type PppActiveDialogType = 'create' | 'update' | 'delete' | 'import'

type TasksContextType = {
  open: PppActiveDialogType | null
  setOpen: (str: PppActiveDialogType | null) => void
  currentRow: PppoeActive | null
  setCurrentRow: React.Dispatch<React.SetStateAction<PppoeActive | null>>
}

const PppActiveContext = React.createContext<TasksContextType | null>(null)

export function PppProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<PppActiveDialogType>(null)
  const [currentRow, setCurrentRow] = useState<PppoeActive | null>(null)

  return (
    <PppActiveContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </PppActiveContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePppActive = () => {
  const pppActiveContext = React.useContext(PppActiveContext)

  if (!pppActiveContext) {
    throw new Error('useTasks has to be used within <TasksContext>')
  }

  return pppActiveContext
}
