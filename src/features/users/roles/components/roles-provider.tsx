import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type RoleRelation } from '../data/schema'

type RolesDialogType = 'assign' | 'add' | 'edit' | 'delete' | 'revoke'

type RolesContextType = {
  open: RolesDialogType | null
  setOpen: (str: RolesDialogType | null) => void
  currentRow: RoleRelation | null
  setCurrentRow: React.Dispatch<React.SetStateAction<RoleRelation | null>>
}

const RolesContext = React.createContext<RolesContextType | null>(null)

export function RolesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<RolesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<RoleRelation | null>(null)

  return (
    <RolesContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </RolesContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRoles = () => {
  const rolesContext = React.useContext(RolesContext)

  if (!rolesContext) {
    throw new Error('useRoles has to be used within <RolesProvider>')
  }

  return rolesContext
}