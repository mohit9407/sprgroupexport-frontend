import api from '@/lib/axios'

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

export const getRefreshToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refreshToken')
}

export const setAuthTokens = (accessToken, refreshToken) => {
  if (typeof window === 'undefined') return
  if (accessToken) localStorage.setItem('accessToken', accessToken)
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
}

export const clearAuthTokens = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await api.post('/auth/refresh', { refreshToken })

    // If the response is not ok, throw an error
    if (!response.data || !response.data.accessToken) {
      throw new Error('Invalid response from refresh token endpoint')
    }

    const { accessToken, refreshToken: newRefreshToken } = response.data

    setAuthTokens(accessToken, newRefreshToken || refreshToken)

    // Update user data if it exists
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      user.accessToken = accessToken
      if (newRefreshToken) user.refreshToken = newRefreshToken
      localStorage.setItem('user', JSON.stringify(user))
    }

    return accessToken
  } catch (error) {
    console.error('Token refresh failed:', error)
    // Clear all auth data
    clearAuthTokens()

    // If we're on the client side, redirect to login
    if (typeof window !== 'undefined') {
      // Use window.location instead of Next.js router to ensure full page reload
      window.location.href = '/login?session=expired'
    }

    return null
  }
}

export const getUserById = async (userId) => {
  const response = await api.get(`/auth/get-user/${userId}`)
  return response
}

export const updateUserProfile = async (formData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }
  const response = await api.put('/auth/edit-profile', formData, config)
  return response
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
