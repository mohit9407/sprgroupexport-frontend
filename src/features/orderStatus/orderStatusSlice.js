import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '@/lib/axios'

const initialState = {
  statuses: [],
  loading: false,
  error: null,
}

export const fetchOrderStatuses = createAsyncThunk(
  'orderStatus/fetchOrderStatuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/order-status/get-all')
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch order statuses',
      )
    }
  },
)

export const addNewOrderStatus = createAsyncThunk(
  'orderStatus/addNewOrderStatus',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/order-status/create', data)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add new order status',
      )
    }
  },
)

export const updateOrderStatus = createAsyncThunk(
  'orderStatus/updateOrderStatus',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/order-status/update/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update order status',
      )
    }
  },
)

export const deleteOrderStatus = createAsyncThunk(
  'orderStatus/deleteOrderStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/order-status/delete/${id}`)
      return id // Return the deleted ID to update the state
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete order status',
      )
    }
  },
)

const orderStatusSlice = createSlice({
  name: 'orderStatus',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderStatuses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderStatuses.fulfilled, (state, action) => {
        state.loading = false
        state.statuses = action.payload
      })
      .addCase(fetchOrderStatuses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false
        const updatedStatus = action.payload
        state.statuses = state.statuses.map((status) =>
          status._id === updatedStatus._id ? updatedStatus : status,
        )
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(deleteOrderStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteOrderStatus.fulfilled, (state, action) => {
        state.loading = false
        const deletedId = action.payload
        state.statuses = state.statuses.filter(
          (status) => status._id !== deletedId,
        )
      })
      .addCase(deleteOrderStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default orderStatusSlice.reducer
