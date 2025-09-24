// Enhanced Auth Store with Session Management
import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import { apiRequest } from '@/utils/helper'

const ACCESS_TOKEN = 'mikrobill_token'

interface AuthUser {
  id: string
  email: string
  username?: string
  name: string
  roles: string[]
  exp: number
  // Additional fields from your backend
  accountNo?: string
  first_name?: string
  last_name?: string
  phone?: string
  image?: string
  emailVerified?: boolean | string
  is_active?: boolean | string
  last_login?: string
  createdAt?: string
  updatedAt?: string
}

interface SessionInfo {
  id: string
  token: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  expiresAt: string
  impersonatedBy?: string
  isCurrent: boolean
}

interface SessionsResponse {
  sessions: SessionInfo[]
}

interface SignInResponse {
  message: string
  user: {
    id: string
    email: string
    username?: string
    name: string
    roles?: Array<{ name: string }>
    [key: string]: any
  }
  token: string
  expiresIn?: string
}

interface SignUpData {
  email: string
  username?: string
  password: string
  name: string
}

interface SignUpResponse {
  message: string
  user: {
    id: string
    email: string
    username?: string
    name: string
    [key: string]: any
  }
}

interface MeResponse {
  user: {
    id: string
    email: string
    username?: string
    name: string
    roles?: Array<{ name: string }>
    [key: string]: any
  }
}

interface RefreshResponse {
  message: string
  token: string
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
      identifier: string, // Changed from email to support username
      password: string
    ) => Promise<{ success: boolean; message?: string; user?: AuthUser }>
    register: (
      data: SignUpData
    ) => Promise<{ success: boolean; message?: string; user?: any }>
    logout: () => Promise<{ success: boolean; message?: string }>
    checkAuth: () => Promise<boolean>
    me: () => Promise<{ success: boolean; message?: string; user?: AuthUser }>
    verify: (
      token?: string
    ) => Promise<{ success: boolean; message?: string; user?: AuthUser }>
    refresh: () => Promise<{
      success: boolean
      message?: string
      token?: string
    }>
    // New session management functions
    getSessions: () => Promise<{
      success: boolean
      sessions?: SessionInfo[]
      message?: string
    }>
    deleteSession: (
      sessionId: string
    ) => Promise<{ success: boolean; message?: string }>
    revokeAllSessions: () => Promise<{ success: boolean; message?: string }>
    impersonateUser: (
      targetUserId: string
    ) => Promise<{ success: boolean; message?: string; token?: string }>
  }
}

// Helper to decode JWT payload
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

      isAuthenticated: () => {
        const { auth } = get()
        return true
      },

      isTokenExpired: () => {
        const { auth } = get()

        if (!auth.accessToken) return true

        const payload = decodeJWT(auth.accessToken)
        if (payload?.exp) {
          const currentTime = Math.floor(Date.now() / 1000)
          return payload.exp < currentTime
        }

        if (!auth.user?.exp) return true
        const currentTime = Math.floor(Date.now() / 1000)
        return auth.user.exp < currentTime
      },

      // Updated login function to handle email or username
      login: async (identifier: string, password: string) => {
        try {
          // Determine if identifier is email or username
          const isEmail = identifier.includes('@')
          const loginData = isEmail
            ? { email: identifier, password }
            : { email: identifier, password } // API expects email field, but backend should handle username

          const response: SignInResponse = await apiRequest(
            '/api/auth/sign-in',
            {
              method: 'POST',
              body: JSON.stringify(loginData),
            }
          )

          const tokenPayload = decodeJWT(response.token)

          const userData: AuthUser = {
            id: response.user.id,
            email: response.user.email,
            username: response.user.username,
            name: response.user.name,
            roles: response.user.roles?.map((role) => role.name) || [],
            exp:
              tokenPayload?.exp || Math.floor(Date.now() / 1000) + 24 * 60 * 60,
            accountNo: response.user.accountNo,
            first_name: response.user.first_name,
            last_name: response.user.last_name,
            phone: response.user.phone,
            image: response.user.image,
            emailVerified: response.user.emailVerified,
            is_active: response.user.is_active,
            last_login: response.user.last_login,
            createdAt: response.user.createdAt,
            updatedAt: response.user.updatedAt,
          }

          get().auth.setAccessToken(response.token)
          get().auth.setUser(userData)

          return {
            success: true,
            message: response.message,
            user: userData,
          }
        } catch (error) {
          console.error('Login error:', error)

          return {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : 'Login failed. Please try again.',
          }
        }
      },

      register: async (data: SignUpData) => {
        try {
          const response: SignUpResponse = await apiRequest(
            '/api/auth/sign-up',
            {
              method: 'POST',
              body: JSON.stringify(data),
            }
          )

          return {
            success: true,
            message: response.message,
            user: response.user,
          }
        } catch (error) {
          console.error('Registration error:', error)

          return {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : 'Registration failed. Please try again.',
          }
        }
      },

      // Updated logout to use new sign-out API
      logout: async () => {
        try {
          const { auth } = get()

          if (auth.accessToken) {
            await apiRequest('/api/auth/sign-out', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${auth.accessToken}`,
              },
            })
          }

          auth.reset()
          return { success: true, message: 'Logged out successfully' }
        } catch (error) {
          console.error('Logout error:', error)
          // Always clear local state even if API call fails
          get().auth.reset()
          return { success: true, message: 'Logged out locally' }
        }
      },

      me: async () => {
        try {
          const { auth } = get()

          if (!auth.accessToken) {
            return {
              success: false,
              message: 'No access token available',
            }
          }

          const response: MeResponse = await apiRequest('/api/auth/me', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
            },
          })

          const userData: AuthUser = {
            id: response.user.id,
            email: response.user.email,
            username: response.user.username,
            name: response.user.name,
            roles: response.user.roles?.map((role) => role.name) || [],
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
            accountNo: response.user.accountNo,
            first_name: response.user.first_name,
            last_name: response.user.last_name,
            phone: response.user.phone,
            image: response.user.image,
            emailVerified: response.user.emailVerified,
            is_active: response.user.is_active,
            last_login: response.user.last_login,
            createdAt: response.user.createdAt,
            updatedAt: response.user.updatedAt,
          }

          auth.setUser(userData)

          return {
            success: true,
            user: userData,
          }
        } catch (error) {
          console.error('Get user info error:', error)

          if (error instanceof Error && error.message.includes('401')) {
            get().auth.reset()
          }

          return {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to get user information.',
          }
        }
      },

      verify: async (token?: string) => {
        try {
          const { auth } = get()
          const tokenToVerify = token || auth.accessToken

          if (!tokenToVerify) {
            return {
              success: false,
              message: 'No token to verify',
            }
          }

          const response: MeResponse = await apiRequest('/api/auth/me', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${tokenToVerify}`,
            },
          })

          if (token && token !== auth.accessToken) {
            auth.setAccessToken(token)
          }

          const userData: AuthUser = {
            id: response.user.id,
            email: response.user.email,
            username: response.user.username,
            name: response.user.name,
            roles: response.user.roles?.map((role) => role.name) || [],
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
            accountNo: response.user.accountNo,
            first_name: response.user.first_name,
            last_name: response.user.last_name,
            phone: response.user.phone,
            image: response.user.image,
            emailVerified: response.user.emailVerified,
            is_active: response.user.is_active,
            last_login: response.user.last_login,
            createdAt: response.user.createdAt,
            updatedAt: response.user.updatedAt,
          }

          auth.setUser(userData)

          return {
            success: true,
            user: userData,
          }
        } catch (error) {
          console.error('Token verification error:', error)

          if (error instanceof Error && error.message.includes('401')) {
            get().auth.reset()
          }

          return {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : 'Token verification failed.',
          }
        }
      },

      refresh: async () => {
        try {
          const { auth } = get()

          if (!auth.accessToken) {
            return {
              success: false,
              message: 'No token to refresh',
            }
          }

          const response: RefreshResponse = await apiRequest(
            '/api/auth/refresh',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${auth.accessToken}`,
              },
            }
          )

          auth.setAccessToken(response.token)
          await auth.me()

          return {
            success: true,
            message: response.message,
            token: response.token,
          }
        } catch (error) {
          console.error('Token refresh error:', error)
          get().auth.reset()

          return {
            success: false,
            message:
              error instanceof Error ? error.message : 'Token refresh failed.',
          }
        }
      },

      checkAuth: async (): Promise<boolean> => {
        const { auth } = get()

        if (!auth.accessToken) {
          return false
        }

        if (auth.isTokenExpired()) {
          const refreshResult = await auth.refresh()
          if (refreshResult.success) {
            return true
          }

          auth.reset()
          return false
        }

        if (auth.user) {
          const verifyResult = await auth.verify()
          return verifyResult.success
        }

        const meResult = await auth.me()
        return meResult.success
      },

      // New session management functions
      getSessions: async () => {
        try {
          const { auth } = get()

          if (!auth.accessToken) {
            return {
              success: false,
              message: 'No access token available',
            }
          }

          const response: SessionsResponse = await apiRequest(
            '/api/auth/sessions',
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${auth.accessToken}`,
              },
            }
          )

          return {
            success: true,
            sessions: response.sessions,
          }
        } catch (error) {
          console.error('Get sessions error:', error)

          return {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to get sessions.',
          }
        }
      },

      deleteSession: async (sessionId: string) => {
        try {
          const { auth } = get()

          if (!auth.accessToken) {
            return {
              success: false,
              message: 'No access token available',
            }
          }

          await apiRequest(`/api/auth/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
            },
          })

          return {
            success: true,
            message: 'Session deleted successfully',
          }
        } catch (error) {
          console.error('Delete session error:', error)

          return {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to delete session.',
          }
        }
      },

      revokeAllSessions: async () => {
        try {
          const { auth } = get()

          if (!auth.accessToken) {
            return {
              success: false,
              message: 'No access token available',
            }
          }

          const response = await apiRequest('/api/auth/sessions/revoke-all', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
            },
          })

          return {
            success: true,
            message: response.message || 'All other sessions revoked',
          }
        } catch (error) {
          console.error('Revoke sessions error:', error)

          return {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to revoke sessions.',
          }
        }
      },

      impersonateUser: async (targetUserId: string) => {
        try {
          const { auth } = get()

          if (!auth.accessToken) {
            return {
              success: false,
              message: 'No access token available',
            }
          }

          const response = await apiRequest('/api/auth/impersonate', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${auth.accessToken}`,
            },
            body: JSON.stringify({ targetUserId }),
          })

          // Update token and user data for impersonation
          auth.setAccessToken(response.token)

          // Get updated user info
          await auth.me()

          return {
            success: true,
            message: response.message,
            token: response.token,
          }
        } catch (error) {
          console.error('Impersonation error:', error)

          return {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to impersonate user.',
          }
        }
      },
    },
  }
})

// Export helpers (unchanged)
export const getAuthState = () => useAuthStore.getState().auth
export const getCurrentUser = () => useAuthStore.getState().auth.user
export const getCurrentToken = () => useAuthStore.getState().auth.accessToken
export const checkAuthStatus = async () => {
  const auth = useAuthStore.getState().auth
  return await auth.checkAuth()
}
