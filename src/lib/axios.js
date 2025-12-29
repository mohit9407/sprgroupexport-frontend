import axios, { AxiosError } from 'axios'
import { getAuthToken } from '@/features/user/userService'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor
 * - Attaches Authorization header IF token exists
 * - Still allows cookie-based auth
 */
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken?.() // safe optional call

    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

/**
 * Response interceptor
 * - Normalizes response
 * - Handles 401 globally
 */
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      if (status === 401) {
        console.error('Unauthorized – token expired or invalid')
      }

      return Promise.reject(data)
    }

    if (error.request) {
      return Promise.reject({ message: 'No response from server' })
    }

    return Promise.reject({ message: error.message })
  },
)

export default api
