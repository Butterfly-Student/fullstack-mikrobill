// /api/auth/sessions.ts - Get all user sessions
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { jwtVerify } from 'jose'
import { getUserSessions } from '@/db/utils/sessions'

// Helper function to create JWT secret key
export const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return new TextEncoder().encode(secret)
}

export const ServerRoute = createServerFileRoute('/api/auth/sessions/').methods({
  GET: async ({ request }) => {
    try {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return json({ error: 'No token provided' }, { status: 401 })
      }

      const token = authHeader.substring(7)
      const { payload } = await jwtVerify(token, getJWTSecret())
      const userId = payload.userId as string

      const sessions = await getUserSessions(userId)

      return json({
        sessions: sessions.map(session => ({
          id: session.id,
          token: session.token.substring(0, 10) + '...', // Hide full token
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          impersonatedBy: session.impersonatedBy,
          isCurrent: session.token === token
        }))
      })
    } catch (error) {
      console.error('Error getting sessions:', error)
      return json({ error: 'Failed to get sessions' }, { status: 500 })
    }
  }
})