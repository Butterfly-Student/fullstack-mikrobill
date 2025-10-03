// File: routes/(auth)/sign-in.tsx
import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { SignIn } from '@/features/auth/sign-in'

// Schema untuk search params
const signInSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  validateSearch: signInSearchSchema,

  beforeLoad: ({ search }) => {
    const { auth } = useAuthStore.getState()

    // Jika sudah login, redirect ke URL yang diminta atau dashboard
    if (auth.isAuthenticated() && !auth.isTokenExpired()) {
      const redirectTo = search.redirect || '/'

      console.log('✅ Already logged in, redirecting to:', redirectTo)

      throw redirect({
        to: redirectTo,
        replace: true,
      })
    }

    console.log('👤 Not authenticated, showing sign in page')
  },

  component: SignIn,
})
