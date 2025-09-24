import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState().auth
    if (!isAuthenticated()) {
      throw redirect({
        to: '/sign-in',
      })
    }
  },
  component: AuthenticatedLayout,
})