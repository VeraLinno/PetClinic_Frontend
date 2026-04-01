import { defineStore } from 'pinia'
import api from '@/services/api'
import { decodeToken } from '@/utils/jwt'

const ACCESS_TOKEN_STORAGE_KEY = 'petclinic.accessToken'

interface User {
  id: string
  email: string
  roles: string[]
}

interface AuthState {
  accessToken: string | null
  user: User | null
  initialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: null,
    user: null,
    initialized: false
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    roles: (state) => state.user?.roles || [],
    tokenExpiresAt: (state) => {
      if (!state.accessToken) return null
      const decoded = decodeToken(state.accessToken)
      return decoded.exp * 1000
    }
  },
  actions: {
    setAuthenticatedState(token: string | null) {
      if (!token) {
        this.accessToken = null
        this.user = null
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
        return
      }

      try {
        const decoded = decodeToken(token)
        this.accessToken = token
        this.user = decoded
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
      } catch {
        this.accessToken = null
        this.user = null
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
        throw new Error('Invalid access token')
      }
    },
    setAccessToken(token: string) {
      this.setAuthenticatedState(token)
    },
    clearAuthState() {
      this.setAuthenticatedState(null)
    },
    isTokenExpired(token: string): boolean {
      try {
        const decoded = decodeToken(token)
        if (!decoded?.exp) return true
        return decoded.exp * 1000 <= Date.now()
      } catch {
        return true
      }
    },
    async initializeAuth() {
      if (this.initialized) return

      const storedToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
      if (storedToken) {
        if (!this.isTokenExpired(storedToken)) {
          try {
            this.setAuthenticatedState(storedToken)
            this.initialized = true
            return
          } catch {
            this.clearAuthState()
          }
        } else {
          try {
            await this.refreshAccessToken()
          } catch {
            this.clearAuthState()
          } finally {
            this.initialized = true
          }
          return
        }
      }

      this.initialized = true
    },
    async refreshAccessToken() {
      const response = await api.post('/auth/refresh')
      this.setAccessToken(response.data.accessToken)
    },
    async logout() {
      // Make logout request BEFORE clearing auth state (so it includes token)
      try {
        if (this.accessToken) {
          await api.post('/auth/logout')
        }
      } catch (error) {
        // Ignore logout errors - still clear state
        console.debug('Logout request failed', error)
      }
      this.clearAuthState()
    }
  }
})