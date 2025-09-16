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

interface SignInResponse {
  message: string
  user: {
    id: string
    email: string
    username?: string
    name: string
    roles?: Array<{ name: string }>
    [key: string]: string
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
    [key: string]: string
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
      email: string,
      password: string
    ) => Promise<{ success: boolean; message?: string; user?: AuthUser }>
    register: (
      data: SignUpData
    ) => Promise<{ success: boolean; message?: string; user?: any }>
    logout: () => void
    checkAuth: () => Promise<boolean>
    // New functions
    me: () => Promise<{ success: boolean; message?: string; user?: AuthUser }>
    verify: (
      token?: string
    ) => Promise<{ success: boolean; message?: string; user?: AuthUser }>
    refresh: () => Promise<{
      success: boolean
      message?: string
      token?: string
    }>
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
          const response: SignInResponse = await apiRequest(
            '/api/auth/sign-in',
            {
              method: 'POST',
              body: JSON.stringify({ email, password }),
            }
          )

          // Extract JWT payload for additional info
          const tokenPayload = decodeJWT(response.token)

          // Map API response to frontend format
          const userData: AuthUser = {
            id: response.user.id,
            email: response.user.email,
            username: response.user.username,
            name: response.user.name,
            roles: response.user.roles?.map((role) => role.name) || [],
            exp:
              tokenPayload?.exp || Math.floor(Date.now() / 1000) + 24 * 60 * 60,

            // Additional fields (adjust based on your API response)
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

          // Set token and user data
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

      // Register function
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

      // Logout function
      logout: async () => {
        try {
          // Optional: Call logout API endpoint if you have one
          await apiRequest('/api/auth/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${get().auth.accessToken}`,
            },
          })

          // Clear state and cookie
          get().auth.reset()
        } catch (error) {
          console.error('Logout error:', error)
          // Always clear local state even if API call fails
          get().auth.reset()
        }
      },

      // Get current user info from server
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

          // Map API response to frontend format
          const userData: AuthUser = {
            id: response.user.id,
            email: response.user.email,
            username: response.user.username,
            name: response.user.name,
            roles: response.user.roles?.map((role) => role.name) || [],
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // Set default exp

            // Additional fields
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

          // Update user data in store
          auth.setUser(userData)

          return {
            success: true,
            user: userData,
          }
        } catch (error) {
          console.error('Get user info error:', error)

          // If unauthorized, clear auth state
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

      // Verify token validity (similar to checkAuth but with server verification)
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

          // Try to get user info to verify token
          const response: MeResponse = await apiRequest('/api/auth/me', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${tokenToVerify}`,
            },
          })

          // If token parameter was provided, update the stored token
          if (token && token !== auth.accessToken) {
            auth.setAccessToken(token)
          }

          // Map API response to frontend format
          const userData: AuthUser = {
            id: response.user.id,
            email: response.user.email,
            username: response.user.username,
            name: response.user.name,
            roles: response.user.roles?.map((role) => role.name) || [],
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,

            // Additional fields
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

          // Update user data in store
          auth.setUser(userData)

          return {
            success: true,
            user: userData,
          }
        } catch (error) {
          console.error('Token verification error:', error)

          // If unauthorized, clear auth state
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

      // Refresh token
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

          // Update token in store
          auth.setAccessToken(response.token)

          // Optionally, get updated user info
          const userResult = await auth.me()

          return {
            success: true,
            message: response.message,
            token: response.token,
          }
        } catch (error) {
          console.error('Token refresh error:', error)

          // If refresh fails, clear auth state
          get().auth.reset()

          return {
            success: false,
            message:
              error instanceof Error ? error.message : 'Token refresh failed.',
          }
        }
      },

      // Enhanced checkAuth that uses the new verify function
      checkAuth: async (): Promise<boolean> => {
        const { auth } = get()

        if (!auth.accessToken) {
          return false
        }

        // Check if token expired
        if (auth.isTokenExpired()) {
          // Try to refresh token first
          const refreshResult = await auth.refresh()
          if (refreshResult.success) {
            return true
          }

          auth.reset()
          return false
        }

        // If user exists and token not expired, verify with server
        if (auth.user) {
          const verifyResult = await auth.verify()
          return verifyResult.success
        }

        // If no user data, try to get it from server
        const meResult = await auth.me()
        return meResult.success
      },
    },
  }
})

// Export helper for getting current auth state
export const getAuthState = () => useAuthStore.getState().auth

// Export helper for getting current user
export const getCurrentUser = () => useAuthStore.getState().auth.user

// Export helper for getting current token
export const getCurrentToken = () => useAuthStore.getState().auth.accessToken

// Export helper for checking auth status
export const checkAuthStatus = async () => {
  const auth = useAuthStore.getState().auth
  return await auth.checkAuth()
}
