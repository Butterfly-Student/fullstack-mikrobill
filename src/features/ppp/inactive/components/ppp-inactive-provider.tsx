import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type PppoeUser } from '../../data/schema'

type PppDialogType = 'create' | 'update' | 'delete' | 'import'

type TasksContextType = {
  open: PppDialogType | null
  setOpen: (str: PppDialogType | null) => void
  currentRow: PppoeUser | null
  setCurrentRow: React.Dispatch<React.SetStateAction<PppoeUser | null>>
}

const PppContext = React.createContext<TasksContextType | null>(null)

export function PppProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<PppDialogType>(null)
  const [currentRow, setCurrentRow] = useState<PppoeUser | null>(null)

  return (
    <PppContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </PppContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePpp = () => {
  const pppContext = React.useContext(PppContext)

  if (!pppContext) {
    throw new Error('useTasks has to be used within <TasksContext>')
  }

  return pppContext
}
