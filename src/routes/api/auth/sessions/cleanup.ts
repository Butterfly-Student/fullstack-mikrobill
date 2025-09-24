import { getUserById } from '@/db/utils/users'
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { jwtVerify } from 'jose'
import { getJWTSecret } from '.'
import { deleteExpiredSessions } from '@/db/utils/sessions'

export const ServerRoute = createServerFileRoute(
  '/api/auth/sessions/cleanup'
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

      // Check if user is admin
      const user = await getUserById(userId)
      if (!user || user.roles[0].name !== 'admin') {
        return json({ error: 'Admin access required' }, { status: 403 })
      }

      const deletedCount = await deleteExpiredSessions()

      return json({
        message: `${deletedCount} expired sessions have been cleaned up`,
        deletedCount,
      })
    } catch (error) {
      console.error('Error cleaning up sessions:', error)
      return json({ error: 'Failed to cleanup sessions' }, { status: 500 })
    }
  },
})
