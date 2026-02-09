import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '@/lib/axios'

const API_URL = '/payments'

// Fetch all payment methods
export const fetchPaymentMethods = createAsyncThunk(
  'paymentMethods/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_URL}/get-all-methods`)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch payment methods',
      )
    }
  },
)

// Create a new payment method
export const createPaymentMethod = createAsyncThunk(
  'paymentMethods/create',
  async (methodData, { rejectWithValue }) => {
    try {
      const response = await api.post(`${API_URL}/create-method`, methodData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create payment method',
      )
    }
  },
)

// Update a payment method
export const updatePaymentMethod = createAsyncThunk(
  'paymentMethods/update',
  async ({ id, methodData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${API_URL}/update/${id}`, methodData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update payment method',
      )
    }
  },
)

// Delete a payment method
export const deletePaymentMethod = createAsyncThunk(
  'paymentMethods/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${API_URL}/delete/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete payment method',
      )
    }
  },
)

const paymentMethodSlice = createSlice({
  name: 'paymentMethods',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all payment methods
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create payment method
      .addCase(createPaymentMethod.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPaymentMethod.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
      })
      .addCase(createPaymentMethod.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update payment method
      .addCase(updatePaymentMethod.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePaymentMethod.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        )
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updatePaymentMethod.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete payment method
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
  },
})

export default paymentMethodSlice.reducer
