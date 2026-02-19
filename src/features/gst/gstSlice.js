import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Create a custom axios instance without a baseURL for relative paths
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

export const verifyGST = createAsyncThunk(
  'gst/verify',
  async (gstNumber, { rejectWithValue }) => {
    try {
      // Use relative path for Next.js API route
      const response = await api.get(`/api/verify-gst/${gstNumber}`)

      // Check if the API returned flag: false
      if (response.data && response.data.flag === false) {
        return rejectWithValue(
          response.data.message || 'Invalid GST number or verification failed',
        )
      }

      // Check for error response from our API
      if (response.data && response.data.error) {
        return rejectWithValue(
          response.data.message || 'GST verification failed',
        )
      }

      return response.data
    } catch (error) {
      console.error('GST Verification Error:', error)
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to verify GST. Please try again.',
      )
    }
  },
)

const gstSlice = createSlice({
  name: 'gst',
  initialState: {
    loading: false,
    verifiedData: null,
    error: null,
  },
  reducers: {
    clearGSTData: (state) => {
      state.verifiedData = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyGST.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyGST.fulfilled, (state, action) => {
        state.loading = false
        state.verifiedData = action.payload
      })
      .addCase(verifyGST.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearGSTData } = gstSlice.actions
export default gstSlice.reducer
