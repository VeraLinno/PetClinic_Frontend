import api from './api'
import { useAuthStore } from '@/stores/auth'

interface AuthService {
  login(email: string, password: string, mfaCode?: string): Promise<any>
  register(email: string, password: string, firstName: string, lastName: string, roles: string[]): Promise<any>
  createVetAccount(payload: {
    email: string
    password: string
    firstName: string
    lastName: string
    licenseNumber: string
    phoneNumber?: string
  }): Promise<any>
  refresh(): Promise<any>
  logout(): Promise<void>
}

export const authService: AuthService = {
  async login(email: string, password: string, mfaCode?: string) {
    const response = await api.post('/auth/login', { email, password, mfaCode })
    const authStore = useAuthStore()
    if (response.data?.accessToken) {
      authStore.setAccessToken(response.data.accessToken)
    }
    return response.data
  },
  async register(email: string, password: string, firstName: string, lastName: string, roles: string[]) {
    const response = await api.post('/auth/register', { email, password, firstName, lastName, roles })
    return response.data
  },
  async createVetAccount(payload: {
    email: string
    password: string
    firstName: string
    lastName: string
    licenseNumber: string
    phoneNumber?: string
  }) {
    const response = await api.post('/auth/register-vet', payload)
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