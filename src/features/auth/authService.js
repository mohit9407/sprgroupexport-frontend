import api from '@/lib/axios'
import { getAuthToken } from '../user/userService'

const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email })
  return response
}

const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials)
  return response
}

const register = async (userData) => {
  const response = await api.post('/auth/signup', userData)
  return response
}

const verifyOTP = async (email, otp) => {
  const response = await api.post('/auth/verify-otp', { email, otp })
  return response
}

const resetPassword = async ({ email, newPassword }) => {
  const response = await api.post('/auth/reset-password', {
    email,
    newPassword,
  })
  return response.data
}

const resendOTP = async ({ email }) => {
  const response = await api.post('/auth/resend-otp', { email })
  return response.data
}

const changePassword = async ({ oldPassword, newPassword }) => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await api({
    method: 'put',
    url: '/auth/change-password',
    data: { oldPassword, newPassword },
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  return response.data
}

const guestLogin = async (email) => {
  const response = await api.post('/auth/guest/request-otp', { email })
  return response.data
}

const guestVerifyOTP = async (email, otp) => {
  const response = await api.post('/auth/guest/verify-otp', { email, otp })
  return response
}

const resendGuestOTP = async (email) => {
  const response = await api.post('/auth/guest/resend-otp', { email })
  return response.data
}

export const authService = {
  forgotPassword,
  login,
  register,
  guestLogin,
  guestVerifyOTP,
  verifyOTP,
  resetPassword,
  resendOTP,
  changePassword,
  resendGuestOTP,
}
