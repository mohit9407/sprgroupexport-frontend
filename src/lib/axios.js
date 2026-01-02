import axios from 'axios'
import { refreshAccessToken } from '@/features/user/userService'

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

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config

    // If error is not 401 or it's a refresh token request, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // If we're already refreshing token, add the request to the queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    // Set flag to prevent multiple refresh attempts
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

      // Get new access token
      const newAccessToken = await refreshAccessToken(refreshToken)
      if (!newAccessToken) {
        throw new Error('Failed to refresh token')
      }

      // Update stored token
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', newAccessToken)
      }

      // Update the Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

      // Process queued requests
      processQueue(null, newAccessToken)

      // Retry the original request
      return api(originalRequest)
    } catch (refreshError) {
      // Clear auth state and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      processQueue(refreshError, null)
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
