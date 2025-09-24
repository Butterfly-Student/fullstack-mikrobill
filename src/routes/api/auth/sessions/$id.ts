// /api/auth/sessions/[sessionId].ts - Delete specific session
import { z } from 'zod'
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { jwtVerify } from 'jose'
import { deleteUserSession, getSessionById } from '@/db/utils/sessions'
import { getJWTSecret } from '.'

const deleteSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required')
})

export const ServerRoute = createServerFileRoute('/api/auth/sessions/$id').methods({
  DELETE: async ({ request, params }) => {
    try {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return json({ error: 'No token provided' }, { status: 401 })
      }

      const token = authHeader.substring(7)
      const { payload } = await jwtVerify(token, getJWTSecret())
      const userId = payload.userId as string

      const { sessionId } = deleteSessionSchema.parse(params)

      // Check if session belongs to user
      const session = await getSessionById(sessionId)
      if (!session) {
        return json({ error: 'Session not found' }, { status: 404 })
      }

      if (session.userId !== userId) {
        return json({ error: 'Unauthorized' }, { status: 403 })
      }

      // Don't allow deletion of current session
      if (session.token === token) {
        return json({ error: 'Cannot delete current session' }, { status: 400 })
      }

      await deleteUserSession(sessionId)

      return json({ message: 'Session deleted successfully' })
    } catch (error) {
      console.error('Error deleting session:', error)
      
      if (error instanceof z.ZodError) {
        return json({
          error: 'Validation error',
          details: error.message
        }, { status: 400 })
      }

      return json({ error: 'Failed to delete session' }, { status: 500 })
    }
  }
})

