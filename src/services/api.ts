import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const api = axios.create({
  baseURL: '/api'
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      const authStore = useAuthStore()
      if (error.config.url !== '/auth/refresh' && error.config.url !== '/auth/login') {
        error.config._retry = true
        try {
          await authStore.refreshAccessToken()
          // Retry the original request
          return api(error.config)
        } catch (refreshError) {
          authStore.logout()
          router.push('/login')
          return Promise.reject(refreshError)
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api