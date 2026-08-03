import axios from 'axios'
import {
  clearAuthTokens,
  refreshAccessToken,
} from '@/features/user/userService'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const isAuthRefreshRequest = (config) => {
  const url = config?.url || ''
  return url.includes('/auth/refresh')
}

const redirectToLogin = () => {
  if (typeof window === 'undefined') return
  if (window.location.pathname.startsWith('/login')) return
  window.location.href = '/login?session=expired'
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers?.['Content-Type']
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config || {}

    // Never try to refresh the refresh call itself
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthRefreshRequest(originalRequest)
    ) {
      return Promise.reject(error)
    }

    // If we're already refreshing token, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const refreshToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('refreshToken')
          : null
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const newAccessToken = await refreshAccessToken(refreshToken)
      if (!newAccessToken) {
        throw new Error('Failed to refresh token')
      }

      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
      originalRequest.headers = originalRequest.headers || {}
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

      processQueue(null, newAccessToken)
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearAuthTokens()
      redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
