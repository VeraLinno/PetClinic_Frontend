import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || ''

const resolveDefaultApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return '/api/v1'
  }

  const { protocol, hostname } = window.location
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/api/v1'
  }

  return `${protocol}//api.${hostname}/api/v1`
}

const apiBaseUrl = configuredBaseUrl ? configuredBaseUrl.replace(/\/+$/, '') : resolveDefaultApiBaseUrl()
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
let isLoggingOut = false
let refreshPromise: Promise<void> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any
    const requestUrl = String(originalRequest?.url || '')
    const isAuthEndpoint = requestUrl === '/auth/refresh' || requestUrl === '/auth/login' || requestUrl === '/auth/logout'
    const isTranslationEndpoint = requestUrl.startsWith('/translations/')
    const authStore = useAuthStore()

    // Don't retry if already logging out or if not authenticated
    if (isLoggingOut || !authStore.isAuthenticated) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint && !isTranslationEndpoint) {
      originalRequest._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = authStore.refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }

        await refreshPromise
        originalRequest._retry = false
        return api(originalRequest)
      } catch (refreshError) {
        originalRequest._retry = false
        if (!isLoggingOut) {
          isLoggingOut = true
          try {
            await authStore.logout()
          } finally {
            await router.push('/login')
          }
        }
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value
}

export default api