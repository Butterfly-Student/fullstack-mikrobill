// /api/auth/sessions/revoke-all.ts - Revoke all sessions except current
import { deleteAllUserSessionsExcept } from '@/db/utils/sessions'
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { jwtVerify } from 'jose'

export const ServerRoute = createServerFileRoute(
  '/api/auth/sessions/revoke-all'
).methods({
  POST: async ({ request }) => {
    try {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return json({ error: 'No token provided' }, { status: 401 })
      }

      const token = authHeader.substring(7)
      const { payload } = await jwtVerify(token, getJWTSecret())
      const userId = payload.userId as string

      // Delete all sessions except the current one
      const deletedCount = await deleteAllUserSessionsExcept(userId, token)

      return json({
        message: `${deletedCount} sessions have been revoked`,
        deletedCount,
      })
    } catch (error) {
      console.error('Error revoking sessions:', error)
      return json({ error: 'Failed to revoke sessions' }, { status: 500 })
    }
  },
})
