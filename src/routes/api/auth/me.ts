// /api/auth/me.ts
import { getUserById } from '@/db/utils/users'
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import { jwtVerify } from 'jose'

// Helper function to create JWT secret key
const getJWTSecret = () => {
  const secret =
    process.env.JWT_SECRET || 'your-secret-key-make-this-longer-for-production'
  return new TextEncoder().encode(secret)
}

export const ServerRoute = createServerFileRoute('/api/auth/me').methods({
  GET: async ({ request }) => {
    try {
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return json({ error: 'No token provided' }, { status: 401 })
      }

      const token = authHeader.substring(7)

      // Verify JWT token using jose
      const { payload } = await jwtVerify(token, getJWTSecret())

      const user = await getUserById(payload.userId as string)
      if (!user) {
        return json({ error: 'User not found' }, { status: 404 })
      }

      // Return user data without password
      const { password, ...userWithoutPassword } = user
      return json({ user: userWithoutPassword })
    } catch (error) {
      console.error('Error getting user info:', error)
      return json({ error: 'Invalid token' }, { status: 401 })
    }
  },
})
