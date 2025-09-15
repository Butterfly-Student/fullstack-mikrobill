import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { useEffect, useState } from 'react'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({location}) => {
    // Quick check - jika tidak ada token langsung redirect
    const { auth } = useAuthStore.getState()

    if (!auth.accessToken) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.pathname,
        },
      })
    }
  },
  component: AuthenticatedRoute,
})

function AuthenticatedRoute() {
  const { auth } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuthentication = async () => {
      const isValid = await auth.checkAuth()

      if (!isValid) {
        // Redirect to login if auth check fails
        window.location.href = '/sign-in'
        return
      }

      setIsChecking(false)
    }

    checkAuthentication()
  }, [auth])

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If authenticated, show the layout
  return <AuthenticatedLayout />
}