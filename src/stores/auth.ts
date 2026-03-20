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

      this.accessToken = token
      this.user = decodeToken(token)
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
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
      if (storedToken && !this.isTokenExpired(storedToken)) {
        try {
          this.setAuthenticatedState(storedToken)
          this.initialized = true
          return
        } catch {
          this.clearAuthState()
        }
      }

      try {
        await this.refreshAccessToken()
      } catch {
        this.clearAuthState()
      } finally {
        this.initialized = true
      }
    },
    async login(email: string, password: string) {
      const response = await api.post('/auth/login', { email, password })
      this.setAccessToken(response.data.accessToken)
    },
    async refreshAccessToken() {
      const response = await api.post('/auth/refresh')
      this.setAccessToken(response.data.accessToken)
    },
    logout() {
      this.clearAuthState()
      // Optionally call backend logout
      api.post('/auth/logout').catch(() => {})
    }
  }
})