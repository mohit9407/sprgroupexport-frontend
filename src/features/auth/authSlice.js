import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from './authService'

// Async thunk for OTP verification
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOTP(email, otp)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'OTP verification failed',
      )
    }
  },
)

// Async thunk for resetting password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword({ email, newPassword })
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reset password',
      )
    }
  },
)

// Async thunk for forgot password
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send OTP',
      )
    }
  },
)

// Async thunk for resending OTP
export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.resendOTP(email)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to resend OTP',
      )
    }
  },
)

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      return response
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Login failed')
    }
  },
)

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response.data.message || 'Registration failed',
      )
    }
  },
)

// Async thunk for changing password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword({
        oldPassword,
        newPassword,
      })
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to change password',
      )
    }
  },
)

export const manualUser = createAsyncThunk(
  'auth/manualUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authService.manualUserCreateByAdmin(payload)
      return response
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Login failed')
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    success: false,
    forgotPassword: {
      loading: false,
      success: false,
      error: null,
    },
    verifyOTP: {
      loading: false,
      success: false,
      error: null,
    },
    changePassword: {
      loading: false,
      success: false,
      error: null,
    },
    manualUser: {
      loading: false,
      success: false,
      error: null,
    },
  },
  reducers: {
    resetAuthState: (state) => {
      state.loading = false
      state.error = null
      state.success = false
      state.user = null
      state.forgotPassword.loading = false
      state.forgotPassword.success = false
      state.forgotPassword.error = null
      state.changePassword.loading = false
      state.changePassword.success = false
      state.changePassword.error = null
    },
    resetForgotPasswordState: (state) => {
      state.forgotPassword = {
        loading: false,
        success: false,
        error: null,
      }
    },
    resetVerifyOTPState: (state) => {
      state.verifyOTP = {
        loading: false,
        success: false,
        error: null,
      }
    },
    resetPasswordState: (state) => {
      state.loading = false
      state.error = null
      state.success = false
    },
    resetChangePasswordState: (state) => {
      state.changePassword = {
        loading: false,
        success: false,
        error: null,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register user cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.user = action.payload.user
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Registration failed'
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.user = action.payload.user
        // Store the token if it's included in the response
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token)
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Login failed'
      })
      // Forgot Password cases
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPassword.loading = true
        state.forgotPassword.error = null
        state.forgotPassword.success = false
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotPassword.loading = false
        state.forgotPassword.success = true
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPassword.loading = false
        state.forgotPassword.error = action.payload || 'Failed to send OTP'
      })
      // Verify OTP cases
      .addCase(verifyOTP.pending, (state) => {
        state.verifyOTP.loading = true
        state.verifyOTP.error = null
        state.verifyOTP.success = false
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.verifyOTP.loading = false
        state.verifyOTP.success = true
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.verifyOTP.loading = false
        state.verifyOTP.error = action.payload || 'OTP verification failed'
      })
      // Reset Password cases
      .addCase(resetPassword.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false
        state.success = true
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to reset password'
      })

      .addCase(manualUser.pending, (state) => {
        state.manualUser.loading = true
        state.manualUser.error = null
        state.manualUser.success = false
      })
      .addCase(manualUser.fulfilled, (state) => {
        state.manualUser.loading = false
        state.manualUser.success = true
        state.user = action.payload.user
      })
      .addCase(manualUser.rejected, (state, action) => {
        state.manualUser.loading = false
        state.manualUser.error = action.payload || 'Failed to create user'
      })
  },
})

export const {
  resetAuthState,
  resetForgotPasswordState,
  resetVerifyOTPState,
  resetPasswordState,
  resetChangePasswordState,
} = authSlice.actions
export default authSlice.reducer
