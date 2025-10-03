// File: routes/_authenticated.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';


export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { auth } = useAuthStore.getState()

    // Cek apakah ada token
    if (!auth.accessToken) {
      console.log('❌ No access token found')
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    // Cek apakah token expired
    if (auth.isTokenExpired()) {
      console.log('⏰ Token expired, attempting refresh...')

      // Coba refresh token
      const refreshResult = await auth.refresh()

      if (!refreshResult.success) {
        console.log('❌ Refresh failed, redirecting to login')
        auth.reset()
        throw redirect({
          to: '/sign-in',
          search: {
            redirect: location.href,
          },
        })
      }

      console.log('✅ Token refreshed successfully')
    }

    // Cek user data, jika belum ada ambil dari server
    if (!auth.user) {
      console.log('👤 No user data, fetching from server...')
      const meResult = await auth.me()

      if (!meResult.success) {
        console.log('❌ Failed to fetch user data')
        auth.reset()
        throw redirect({
          to: '/sign-in',
          search: {
            redirect: location.href,
          },
        })
      }

      console.log('✅ User data loaded successfully')
    }
  },
  component: AuthenticatedLayout,
})