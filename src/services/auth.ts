import api from './api'
import { useAuthStore } from '@/stores/auth'

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password })
    const authStore = useAuthStore()
    authStore.setAccessToken(response.data.accessToken)
    return response.data
  },
  async register(email: string, password: string, name: string) {
    const response = await api.post('/auth/register', { email, password, name })
    return response.data
  },
  async refresh() {
    const response = await api.post('/auth/refresh')
    const authStore = useAuthStore()
    authStore.setAccessToken(response.data.accessToken)
    return response.data
  },
  async logout() {
    await api.post('/auth/logout')
    const authStore = useAuthStore()
    authStore.logout()
  }
}