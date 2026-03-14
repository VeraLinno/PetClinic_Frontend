import { defineStore } from 'pinia'
import api from '@/services/api'
import { decodeToken } from '@/utils/jwt'

interface User {
  id: string
  email: string
  roles: string[]
}

interface AuthState {
  accessToken: string | null
  user: User | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: null,
    user: null
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
    setAccessToken(token: string) {
      this.accessToken = token
      this.user = decodeToken(token)
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
      this.accessToken = null
      this.user = null
      // Optionally call backend logout
      api.post('/auth/logout').catch(() => {})
    }
  }
})