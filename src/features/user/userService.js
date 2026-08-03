import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

export const getRefreshToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refreshToken')
}

const setAuthCookies = (accessToken, refreshToken) => {
  if (typeof document === 'undefined') return

  if (accessToken) {
    document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`
  }
  if (refreshToken) {
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax`
  }
}

const clearAuthCookies = () => {
  if (typeof document === 'undefined') return
  document.cookie =
    'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie =
    'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

export const setAuthTokens = (accessToken, refreshToken) => {
  if (typeof window === 'undefined') return
  if (accessToken) localStorage.setItem('accessToken', accessToken)
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
  setAuthCookies(accessToken, refreshToken)
}

export const clearAuthTokens = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  clearAuthCookies()
}

/**
 * Refresh access token using the stored refresh token.
 * Uses a plain axios call (no interceptors) to avoid 401 refresh loops.
 */
export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  // Plain axios — do NOT use the shared `api` instance (its interceptor
  // would recurse on 401 from /auth/refresh)
  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    },
  )

  // Plain axios returns { data: body }. Backend body is { accessToken, refreshToken }.
  const payload = response?.data?.data || response?.data || response
  const accessToken = payload?.accessToken
  const newRefreshToken = payload?.refreshToken

  if (!accessToken) {
    throw new Error('Invalid response from refresh token endpoint')
  }

  setAuthTokens(accessToken, newRefreshToken || refreshToken)

  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      user.accessToken = accessToken
      if (newRefreshToken) user.refreshToken = newRefreshToken
      localStorage.setItem('user', JSON.stringify(user))
    } catch {
      // ignore corrupt user JSON
    }
  }

  return accessToken
}

export const getUserById = async (userId) => {
  const { default: api } = await import('@/lib/axios')
  return api.get(`/auth/get-user/${userId}`)
}

export const updateUserProfile = async (formData) => {
  const { default: api } = await import('@/lib/axios')
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }
  return api.put('/auth/edit-profile', formData, config)
}

export const userService = {
  getAuthToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthTokens,
  refreshAccessToken,
  getUserById,
  updateUserProfile,
}
