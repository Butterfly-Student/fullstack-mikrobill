// /api/auth/sign-in.ts - Updated with session management
import { z } from 'zod'
import { getUserByEmail } from '@/db/utils/users'
import { createSession, cleanupUserSessions } from '@/db/utils/sessions'
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const signInSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

// Helper function to create JWT secret key
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }

  if (secret.length < 32) {
    console.warn(
      'JWT_SECRET should be at least 32 characters long for better security'
    )
  }

  return new TextEncoder().encode(secret)
}

// Helper function to create JWT payload
const createJWTPayload = (user: any) => {
  return {
    userId: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    roles: user.roles?.map((role: any) => role.name) || [],
  }
}

// Helper function to extract client info
const getClientInfo = (request: Request) => {
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
  
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return { ipAddress, userAgent }
}

export const ServerRoute = createServerFileRoute('/api/auth/sign-in').methods({
  POST: async ({ request }) => {
    try {
      const body = await request.json()
      const validatedData = signInSchema.parse(body)

      // Find user by email
      const user = await getUserByEmail(validatedData.email)
      if (!user) {
        return json({ error: 'No user found.' }, { status: 401 })
      }

      // Check if user has a password (in case of OAuth users)
      if (!user.password) {
        return json(
          {
            error:
              'This account was created using social login. Please sign in with your social provider.',
          },
          { status: 401 }
        )
      }

      // Check if user is banned
      if (user.banned) {
        const banMessage = user.banExpires 
          ? `Account is banned until ${user.banExpires.toISOString()}. Reason: ${user.banReason || 'No reason provided'}`
          : `Account is permanently banned. Reason: ${user.banReason || 'No reason provided'}`
        
        return json({ error: banMessage }, { status: 403 })
      }

      // Check if user is active
      // if (!user.isActive) {
      //   return json({ error: 'Account is inactive. Please contact support.' }, { status: 403 })
      // }

      // Verify password dengan bcrypt
      const isValidPassword = await bcrypt.compare(
        validatedData.password,
        user.password
      )
      if (!isValidPassword) {
        return json({ error: 'Invalid email or password' }, { status: 401 })
      }

      // Generate JWT token using jose
      const jwtPayload = createJWTPayload(user)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      const token = await new SignJWT(jwtPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .setIssuer('your-app-name')
        .setAudience('your-app-users')
        .sign(getJWTSecret())

      // Get client information
      const { ipAddress, userAgent } = getClientInfo(request)

      // Create session in database
      await createSession(
        user.id,
        token,
        expiresAt,
        ipAddress,
        userAgent
      )

      // Optional: Cleanup old sessions (keep only 5 most recent)
      await cleanupUserSessions(user.id, 5)

      // Optional: Update last login timestamp
      // await updateUserLastLogin(user.id);

      // Return user data without password and sensitive information
      const { password, ...userWithoutPassword } = user

      return json(
        {
          message: 'Sign in successful',
          user: userWithoutPassword,
          token,
          expiresIn: '24h',
        },
        {
          status: 200,
          headers: {
            // Security headers
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
          },
        }
      )
    } catch (error) {
      console.error('Error signing in:', error)

      if (error instanceof z.ZodError) {
        return json(
          {
            error: 'Validation error',
            details: error.message,
          },
          { status: 400 }
        )
      }

      // Don't expose detailed error to client for security
      return json(
        {
          error: 'An error occurred during sign in. Please try again.',
        },
        { status: 500 }
      )
    }
  },
})

