// /api/auth/sign-out.ts - Sign out (delete current session)
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { jwtVerify } from 'jose'
import { deleteSessionByToken } from '@/db/utils/sessions'

export const ServerRoute = createServerFileRoute('/api/auth/sign-out').methods({
  POST: async ({ request }) => {
    try {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return json({ error: 'No token provided' }, { status: 401 })
      }

      const token = authHeader.substring(7)

      // Verify token first
      try {
        await jwtVerify(token, getJWTSecret())
      } catch (error) {
        // Even if token is invalid/expired, try to delete it
        console.log('Token verification failed during sign out:', error)
      }

      // Delete the session
      await deleteSessionByToken(token)

      return json({ message: 'Signed out successfully' })
    } catch (error) {
      console.error('Error signing out:', error)
      return json({ error: 'Failed to sign out' }, { status: 500 })
    }
  }
})

