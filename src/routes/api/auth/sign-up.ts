import { z } from 'zod'
import { createUser, getUserByEmail, getUserByUsername } from '@/db/utils/users'
import { json } from '@tanstack/react-start'
import { createServerFileRoute } from '@tanstack/react-start/server'
import bcrypt from 'bcryptjs'

const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

export const ServerRoute = createServerFileRoute('/api/auth/sign-up').methods({
  POST: async ({ request }) => {
    try {
      const body = await request.json()
      const validatedData = signUpSchema.parse(body)

      // Check if user already exists
      const existingUser = await getUserByEmail(validatedData.email)
      if (existingUser) {
        return json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }

      // Check username if provided
      if (validatedData.username) {
        const existingUsername = await getUserByUsername(validatedData.username)
        if (existingUsername) {
          return json({ error: 'Username already taken' }, { status: 400 })
        }
      }

      // Hash password dengan bcryptjs
      const saltRounds = 12 // Recommended salt rounds untuk keamanan yang baik
      const hashedPassword = await bcrypt.hash(
        validatedData.password,
        saltRounds
      )

      // Create new user dengan hashed password
      const newUser = await createUser(
        validatedData.email,
        validatedData.username,
        hashedPassword, // Menggunakan hashed password
        validatedData.name
      )

      // Return user data without password
      const { password, ...userWithoutPassword } = newUser

      return json(
        {
          message: 'User created successfully',
          user: userWithoutPassword,
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('Error creating user:', error)

      if (error instanceof z.ZodError) {
        return json(
          {
            error: 'Validation error',
            details: error.errors, // Menggunakan error.errors untuk detail yang lebih jelas
          },
          { status: 400 }
        )
      }

      return json({ error: 'Failed to create user' }, { status: 500 })
    }
  },
})
