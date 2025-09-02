import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'mikrobill_token'
const BASE_URL = 'http://localhost:5000/api/mikrobill/auth'

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

      // Login function
      login: async (email: string, password: string) => {
        try {
          const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          if (response.ok) {
            const data = await response.json()

            // Map backend user data to frontend format
            const userData: AuthUser = {
              id: data.user.id,
              accountNo: data.user.accountNo || data.user.id,
              email: data.user.email,
              name: data.user.name,
              username: data.user.username,
              first_name: data.user.first_name,
              last_name: data.user.last_name,
              phone: data.user.phone,
              role: Array.isArray(data.user.role)
                ? data.user.role
                : [data.user.role],
              image: data.user.image,
              emailVerified: data.user.emailVerified,
              is_active: data.user.is_active,
              last_login: data.user.last_login,
              createdAt: data.user.createdAt,
              exp:
                decodeJWT(data.token)?.exp ||
                Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
            }

            get().auth.setAccessToken(data.token)
            get().auth.setUser(userData)

            return { success: true }
          } else {
            const error = await response.json()
            return {
              success: false,
              message: error.error || error.message || 'Login failed',
            }
          }
        } catch {
          return {
            success: false,
            message: 'Network error. Please try again.',
          }
        }
      },

      // Logout function
      logout: async () => {
        const { auth } = get()

        if (auth.accessToken) {
          // Call logout API to clear session from database
          try {
            await fetch(`${BASE_URL}/logout`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${auth.accessToken}`,
              },
            })
          } catch {
            // Silently handle logout API errors
          }
        }

        // Clear state and cookie
        auth.reset()
      },

      // Check authentication status
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

        // Try to validate token and fetch user data from API
        try {
          const response = await fetch(`${BASE_URL}/validate`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const data = await response.json()

            // Map backend user data
            const userData: AuthUser = {
              id: data.user.id,
              accountNo: data.user.accountNo || data.user.id,
              email: data.user.email,
              name: data.user.name,
              username: data.user.username,
              first_name: data.user.first_name,
              last_name: data.user.last_name,
              phone: data.user.phone,
              role: Array.isArray(data.user.role)
                ? data.user.role
                : [data.user.role],
              image: data.user.image,
              emailVerified: data.user.emailVerified,
              is_active: data.user.is_active,
              last_login: data.user.last_login,
              createdAt: data.user.createdAt,
              exp:
                decodeJWT(auth.accessToken)?.exp ||
                Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
            }

            auth.setUser(userData)
            return true
          } else {
            // Token invalid or session not found, clear auth
            auth.reset()
            return false
          }
        } catch {
          // Network error, clear auth to be safe
          auth.reset()
          return false
        }
      },
    },
  }
})
