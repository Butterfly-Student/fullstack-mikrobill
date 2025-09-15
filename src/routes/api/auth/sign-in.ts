import { z } from 'zod'
import { getUserByEmail } from '@/db/utils/users'
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
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

export const ServerRoute = createServerFileRoute('/api/auth/sign-in').methods({
  POST: async ({ request }) => {
    try {
      const body = await request.json()
      const validatedData = signInSchema.parse(body)

      // Find user by email
      const user = await getUserByEmail(validatedData.email)
      if (!user) {
        // Menggunakan pesan error yang sama untuk mencegah email enumeration
        return json({ error: 'Invalid email or password' }, { status: 401 })
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

      // Verify password dengan bcrypt
      const isValidPassword = await bcrypt.compare(
        validatedData.password,
        user.password
      )
      if (!isValidPassword) {
        return json({ error: 'Invalid email or password' }, { status: 401 })
      }

      // Check if user account is active/verified (opsional)
      // if (user.status && user.status !== 'active') {
      //   return json(
      //     {
      //       error:
      //         'Account is not active. Please verify your email or contact support.',
      //     },
      //     { status: 401 }
      //   )
      // }

      // Generate JWT token using jose
      const jwtPayload = createJWTPayload(user)

      const token = await new SignJWT(jwtPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .setIssuer('your-app-name') // Ganti dengan nama aplikasi Anda
        .setAudience('your-app-users') // Ganti dengan audience yang sesuai
        .sign(getJWTSecret())

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
          },
        }
      )
    } catch (error) {
      console.error('Error signing in:', error)

      if (error instanceof z.ZodError) {
        return json(
          {
            error: 'Validation error',
            details: error.errors,
          },
          { status: 400 }
        )
      }

      // Jangan expose detail error ke client untuk keamanan
      return json(
        {
          error: 'An error occurred during sign in. Please try again.',
        },
        { status: 500 }
      )
    }
  },
})
