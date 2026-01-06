import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { placeOrder, getUserOrders } from '@/features/order/orderService'

// Helper to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

// Async thunk for creating an order
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    const token = getAuthToken()
    if (!token) {
      return rejectWithValue('No authentication token found')
    }

    try {
      const response = await placeOrder(orderData)
      return response
    } catch (error) {
      console.error('Order creation error:', error)
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create order',
      )
    }
  },
)

// Async thunk for fetching user orders
export const fetchUserOrders = createAsyncThunk(
  'order/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserOrders()
      // The orders are in response.data
      return response.data || []
    } catch (error) {
      console.error('Error fetching user orders:', error)
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch orders',
      )
    }
  },
)

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    order: null,
    userOrders: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetOrderState: (state) => {
      state.loading = false
      state.error = null
      state.success = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle createOrder
      .addCase(createOrder.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.order = action.payload
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Handle fetchUserOrders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false
        state.userOrders = action.payload
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { resetOrderState } = orderSlice.actions
export default orderSlice.reducer
