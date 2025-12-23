import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { userService } from './userService'

// Async thunk for getting user by ID
export const getUserById = createAsyncThunk(
  'user/getUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.getUserById(userId)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user data',
      )
    }
  },
)

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userService.updateUserProfile(userData)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update profile',
      )
    }
  },
)

const initialState = {
  user: null,
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    resetUserState: (state) => {
      state.loading = false
      state.error = null
      state.updateLoading = false
      state.updateError = null
      state.updateSuccess = false
    },
  },
  extraReducers: (builder) => {
    // Get user by ID
    builder
      .addCase(getUserById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updateLoading = false
        state.updateSuccess = true
        state.user = { ...state.user, ...action.payload }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = action.payload
        state.updateSuccess = false
      })
  },
})

export const { resetUserState } = userSlice.actions
export default userSlice.reducer
