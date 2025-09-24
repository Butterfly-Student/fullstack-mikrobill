import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Session } from '../data/schema'

type SessionsDialogType = 'revoke' | 'extend' | 'delete' | 'details'

type SessionsContextType = {
  open: SessionsDialogType | null
  setOpen: (str: SessionsDialogType | null) => void
  currentRow: Session | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Session | null>>
}

const SessionsContext = React.createContext<SessionsContextType | null>(null)

export function SessionsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<SessionsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Session | null>(null)

  return (
    <SessionsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </SessionsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSessions = () => {
  const sessionsContext = React.useContext(SessionsContext)

  if (!sessionsContext) {
    throw new Error('useSessions has to be used within <SessionsProvider>')
  }

  return sessionsContext
}