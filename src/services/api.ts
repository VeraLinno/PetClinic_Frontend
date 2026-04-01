import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || ''
const apiBaseUrl = configuredBaseUrl ? configuredBaseUrl.replace(/\/+$/, '') : '/api/v1'
const ACCESS_TOKEN_STORAGE_KEY = 'petclinic.accessToken'

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken || localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any
    const requestUrl = String(originalRequest?.url || '')
    const isAuthEndpoint = requestUrl === '/auth/refresh' || requestUrl === '/auth/login'
    const isTranslationEndpoint = requestUrl.startsWith('/translations/')

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint && !isTranslationEndpoint) {
      const authStore = useAuthStore()
      originalRequest._retry = true
      try {
        await authStore.refreshAccessToken()
        originalRequest._retry = false
        return api(originalRequest)
      } catch (refreshError) {
        originalRequest._retry = false
        authStore.logout()
        router.push('/login')
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default api