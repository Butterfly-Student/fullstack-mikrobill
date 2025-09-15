import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'mikrobill_token'

// Mock data untuk testing
const MOCK_USERS = [
  {
    id: 'user-001',
    accountNo: 'ACC001',
    email: 'admin@mikrobill.com',
    password: 'admin123', // Untuk mock saja, jangan gunakan di production
    name: 'Admin User',
    username: 'admin',
    first_name: 'Admin',
    last_name: 'User',
    phone: '+62812345678',
    role: ['admin', 'user'],
    image: 'https://via.placeholder.com/150?text=Admin',
    emailVerified: true,
    is_active: true,
    last_login: '2024-09-13T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-002',
    accountNo: 'ACC002',
    email: 'user@mikrobill.com',
    password: 'user123',
    name: 'Regular User',
    username: 'user',
    first_name: 'Regular',
    last_name: 'User',
    phone: '+62887654321',
    role: ['user'],
    image: 'https://via.placeholder.com/150?text=User',
    emailVerified: true,
    is_active: true,
    last_login: '2024-09-12T14:20:00Z',
    createdAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'user-003',
    accountNo: 'ACC003',
    email: 'manager@mikrobill.com',
    password: 'manager123',
    name: 'Manager User',
    username: 'manager',
    first_name: 'Manager',
    last_name: 'User',
    phone: '+62811223344',
    role: ['manager', 'user'],
    image: 'https://via.placeholder.com/150?text=Manager',
    emailVerified: false,
    is_active: true,
    last_login: '2024-09-10T09:15:00Z',
    createdAt: '2024-03-01T00:00:00Z',
  },
]

// Mock JWT token generator
const generateMockToken = (userId: string) => {
  const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }))
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days from now
  const payload = btoa(
    JSON.stringify({
      userId,
      exp,
      iat: Math.floor(Date.now() / 1000),
    })
  )
  const signature = btoa('mock-signature')
  return `${header}.${payload}.${signature}`
}

interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  exp: number
  // Additional fields from your backend
  id?: string
  name?: string
  username?: string
  first_name?: string
  last_name?: string
  phone?: string
  image?: string
  emailVerified?: boolean
  is_active?: boolean
  last_login?: string
  createdAt?: string
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
    isAuthenticated: () => boolean
    isTokenExpired: () => boolean
    login: (
      email: string,
      password: string
    ) => Promise<{ success: boolean; message?: string }>
    logout: () => void
    checkAuth: () => Promise<boolean>
  }
}

// Helper to decode JWT payload (for exp field)
const decodeJWT = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>()((set, get) => {
  // Initialize token from cookie
  const cookieToken = getCookie(ACCESS_TOKEN)
  const initToken = cookieToken || ''

  return {
    auth: {
      user: null,
      accessToken: initToken,

      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),

      setAccessToken: (accessToken) =>
        set((state) => {
          if (accessToken) {
            setCookie(ACCESS_TOKEN, accessToken, 60 * 60 * 24 * 7) // 7 days
          } else {
            removeCookie(ACCESS_TOKEN)
          }
          return { ...state, auth: { ...state.auth, accessToken } }
        }),

      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),

      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),

      // Check if user is authenticated
      isAuthenticated: () => {
        const { auth } = get()
        return !!(auth.accessToken && auth.user && !auth.isTokenExpired())
      },

      // Check if token is expired
      isTokenExpired: () => {
        const { auth } = get()

        if (!auth.accessToken) return true

        // Decode JWT and check exp
        const payload = decodeJWT(auth.accessToken)
        if (payload?.exp) {
          const currentTime = Math.floor(Date.now() / 1000)
          return payload.exp < currentTime
        }

        // Fallback: check user exp field
        if (!auth.user?.exp) return true
        const currentTime = Math.floor(Date.now() / 1000)
        return auth.user.exp < currentTime
      },

      // Mock Login function
      login: async (email: string, password: string) => {
        try {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Find user in mock data
          const mockUser = MOCK_USERS.find(
            (user) => user.email === email && user.password === password
          )

          if (mockUser) {
            // Generate mock token
            const mockToken = generateMockToken(mockUser.id)

            // Map mock user data to frontend format
            const userData: AuthUser = {
              id: mockUser.id,
              accountNo: mockUser.accountNo,
              email: mockUser.email,
              name: mockUser.name,
              username: mockUser.username,
              first_name: mockUser.first_name,
              last_name: mockUser.last_name,
              phone: mockUser.phone,
              role: mockUser.role,
              image: mockUser.image,
              emailVerified: mockUser.emailVerified,
              is_active: mockUser.is_active,
              last_login: new Date().toISOString(), // Update last login
              createdAt: mockUser.createdAt,
              exp:
                decodeJWT(mockToken)?.exp ||
                Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
            }

            get().auth.setAccessToken(mockToken)
            get().auth.setUser(userData)

            return { success: true }
          } else {
            return {
              success: false,
              message: 'Email atau password salah',
            }
          }
        } catch {
          return {
            success: false,
            message: 'Network error. Please try again.',
          }
        }
      },

      // Mock Logout function
      logout: async () => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Clear state and cookie
        get().auth.reset()
      },

      // Mock Check authentication status
      checkAuth: async (): Promise<boolean> => {
        const { auth } = get()

        if (!auth.accessToken) {
          return false
        }

        // Check if token expired
        if (auth.isTokenExpired()) {
          auth.reset()
          return false
        }

        // If user exists and token not expired, consider valid
        if (auth.user) {
          return true
        }

        // Mock token validation
        try {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 500))

          const payload = decodeJWT(auth.accessToken)
          const mockUser = MOCK_USERS.find(
            (user) => user.id === payload?.userId
          )

          if (
            mockUser &&
            payload?.exp &&
            payload.exp > Math.floor(Date.now() / 1000)
          ) {
            // Map mock user data
            const userData: AuthUser = {
              id: mockUser.id,
              accountNo: mockUser.accountNo,
              email: mockUser.email,
              name: mockUser.name,
              username: mockUser.username,
              first_name: mockUser.first_name,
              last_name: mockUser.last_name,
              phone: mockUser.phone,
              role: mockUser.role,
              image: mockUser.image,
              emailVerified: mockUser.emailVerified,
              is_active: mockUser.is_active,
              last_login: mockUser.last_login,
              createdAt: mockUser.createdAt,
              exp: payload.exp,
            }

            auth.setUser(userData)
            return true
          } else {
            // Token invalid, clear auth
            auth.reset()
            return false
          }
        } catch {
          // Error during validation, clear auth to be safe
          auth.reset()
          return false
        }
      },
    },
  }
})

// Export mock data untuk referensi (bisa dihapus di production)
export const MOCK_LOGIN_CREDENTIALS = {
  admin: { email: 'admin@mikrobill.com', password: 'admin123' },
  user: { email: 'user@mikrobill.com', password: 'user123' },
  manager: { email: 'manager@mikrobill.com', password: 'manager123' },
}
