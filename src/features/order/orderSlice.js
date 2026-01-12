import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  placeOrder,
  getUserOrders,
  getAdminOrders,
  updateOrderStatus as updateOrderStatusApi,
} from '@/features/order/orderService'

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

// Async thunk for fetching admin orders with pagination
export const fetchAdminOrders = createAsyncThunk(
  'order/fetchAdminOrders',
  async (
    { page = 1, limit = 10, status = '', searchValue = '', filterBy = '' },
    { rejectWithValue },
  ) => {
    try {
      const response = await getAdminOrders(
        page,
        limit,
        status,
        searchValue,
        filterBy,
      )
      return {
        orders: response.data.orders || [],
        total: response.pagination.total || 0,
        page: response.pagination.page || 1,
        totalPages: response.pagination.totalPages || 1,
        limit: response.pagination.limit || 10,
        status,
        searchValue,
        filterBy,
      }
    } catch (error) {
      console.error('Error fetching admin orders:', error)
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch orders',
      )
    }
  },
)

// Async thunk for updating order status
export const updateOrderStatus = createAsyncThunk(
  'order/updateStatus',
  async ({ orderId, status, comment = '' }, { rejectWithValue }) => {
    try {
      const response = await updateOrderStatusApi(orderId, {
        id: status,
        comment,
      })
      return response.data
    } catch (error) {
      console.error('Error updating order status:', error)
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update order status',
      )
    }
  },
)

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    order: null,
    userOrders: [],
    // Admin orders state
    adminOrders: {
      items: [],
      loading: false,
      error: null,
      pagination: {
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        itemsPerPage: 10,
      },
      filters: {
        status: '',
        search: '',
      },
    },
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
      // Handle fetchAdminOrders
      .addCase(fetchAdminOrders.pending, (state) => {
        state.adminOrders.loading = true
        state.adminOrders.error = null
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.adminOrders.loading = false
        state.adminOrders.items = action.payload.orders
        state.adminOrders.pagination = {
          currentPage: action.payload.page,
          totalItems: action.payload.total,
          totalPages: action.payload.totalPages,
          itemsPerPage: action.payload.limit,
        }
        state.adminOrders.filters = {
          status: action.payload.status,
          search: action.payload.search,
        }
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.adminOrders.loading = false
        state.adminOrders.error = action.payload
      })
      // Handle updateOrderStatus
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false
        state.success = true

        // Update the order in the admin orders list if it exists
        const updatedOrder = action.payload
        const orderIndex = state.adminOrders.items.findIndex(
          (order) =>
            order._id === updatedOrder._id || order.id === updatedOrder.id,
        )

        if (orderIndex !== -1) {
          state.adminOrders.items[orderIndex] = {
            ...state.adminOrders.items[orderIndex],
            status: updatedOrder.status,
            // Update other fields if needed
          }
        }

        // If we're currently viewing this order, update it
        if (
          state.order &&
          (state.order._id === updatedOrder._id ||
            state.order.id === updatedOrder.id)
        ) {
          state.order = {
            ...state.order,
            status: updatedOrder.status,
            statusHistory: [
              ...(state.order.statusHistory || []),
              {
                date: new Date().toISOString(),
                status: updatedOrder.status,
                comment: updatedOrder.comment || 'Status updated',
              },
            ],
          }
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { resetOrderState } = orderSlice.actions
export default orderSlice.reducer
