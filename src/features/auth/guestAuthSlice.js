import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from './authService'

// Async thunk for guest login
export const guestLogin = createAsyncThunk(
  'guestAuth/login',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.guestLogin(email)
      return { ...response, email } // Include email in the response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Guest login failed',
      )
    }
  },
)

const initialState = {
  accessToken: null,
  email: null,
  isGuest: false,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  otpError: null,
}

const guestAuthSlice = createSlice({
  name: 'guestAuth',
  initialState,
  reducers: {
    resetGuestAuthState: (state) => {
      state.isLoading = false
      state.isError = false
      state.isSuccess = false
      state.message = ''
      state.otpError = null
    },
    clearOtpError: (state) => {
      state.otpError = null
    },
    logoutGuest: (state) => {
      state.accessToken = null
      state.email = null
      state.isGuest = false
      // Clear guest data from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('email')
        document.cookie =
          'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(guestLogin.pending, (state) => {
        state.isLoading = true
      })
      .addCase(guestLogin.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.isGuest = false // Don't set as guest until OTP is verified
      })
      .addCase(guestLogin.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload || 'Failed to send OTP'
      })
      .addCase(verifyGuestOTP.pending, (state) => {
        state.isLoading = true
        state.otpError = null
      })
      .addCase(verifyGuestOTP.fulfilled, (state, action) => {
        const { user, accessToken, refreshToken } = action.payload || {}

        state.isLoading = false
        state.isSuccess = true
        state.isGuest = true
        state.accessToken = accessToken
        state.email = user?.email || action.meta.arg.email
        state.user = user

        // Store in localStorage and cookies
        if (typeof window !== 'undefined' && user) {
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)
          localStorage.setItem('user', JSON.stringify(user))
          localStorage.setItem('email', user.email)
          document.cookie = `accessToken=${accessToken}; path=/; max-age=86400` // 24 hours
        }
      })
      .addCase(verifyGuestOTP.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.otpError = action.payload || 'Invalid OTP'
      })
  },
})

// Async thunk for verifying guest OTP
export const verifyGuestOTP = createAsyncThunk(
  'guestAuth/verifyOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await authService.guestVerifyOTP(email, otp)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'OTP verification failed',
      )
    }
  },
)

export const { resetGuestAuthState, logoutGuest, clearOtpError } =
  guestAuthSlice.actions
export default guestAuthSlice.reducer
