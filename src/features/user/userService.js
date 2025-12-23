import api from '@/lib/axios'

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user).accessToken : null
  }
  return null
}

export const getUserById = async (userId) => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await api.get(`/auth/get-user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response
}

export const updateUserProfile = async (formData) => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No authentication token found')
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      // Let the browser set the Content-Type with the correct boundary
      'Content-Type': 'multipart/form-data',
    },
  }

  const response = await api.put('/auth/edit-profile', formData, config)
  return response.data
}

export const userService = {
  getUserById,
  updateUserProfile,
}
