import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { adminDashboardService } from './adminDashboardService'

export const fetchAdminDashboard = createAsyncThunk(
  'adminDashboard/fetchAdminDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminDashboardService.getAdminDashboard()
      if (response && response.data) {
        return response.data
      } else if (response) {
        return response
      } else {
        throw new Error('No data found in response')
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch admin dashboard',
      )
    }
  },
)

export const fetchRecentOrders = createAsyncThunk(
  'adminDashboard/fetchRecentOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminDashboardService.getRecentOrders()
      if (response && response.data) {
        return response.data
      } else if (response) {
        return response
      } else {
        return []
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch recent orders',
      )
    }
  },
)

export const fetchRecentCustomers = createAsyncThunk(
  'adminDashboard/fetchRecentCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminDashboardService.getRecentCustomers()
      if (response && response.data) {
        return response.data
      } else if (response) {
        return response
      } else {
        return []
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch recent customers',
      )
    }
  },
)

export const fetchRecentProducts = createAsyncThunk(
  'adminDashboard/fetchRecentProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminDashboardService.getRecentProducts()
      if (response && response.data) {
        return response.data
      } else if (response) {
        return response
      } else {
        return []
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch recent products',
      )
    }
  },
)

export const fetchGoalCompletion = createAsyncThunk(
  'adminDashboard/fetchGoalCompletion',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminDashboardService.getGoalCompletion()
      if (response && response.data) {
        return response.data
      } else if (response) {
        return response
      } else {
        return {}
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch goal completion',
      )
    }
  },
)

export const fetchAddedSaleReport = createAsyncThunk(
  'adminDashboard/fetchAddedSaleReport',
  async (
    { filter = 'thisMonth', startDate = '', endDate = '' },
    { rejectWithValue },
  ) => {
    try {
      const response = await adminDashboardService.getAddedSaleReport(
        filter,
        startDate,
        endDate,
      )
      if (response && response.data) {
        return response.data
      } else if (response) {
        return response
      } else {
        return []
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch added sale report',
      )
    }
  },
)

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState: {
    adminDashboard: null,
    recentOrders: [],
    recentCustomers: [],
    recentProducts: [],
    goalCompletion: null,
    addedSaleReport: [],
    addedSaleReportLoading: false,
    addedSaleReportError: null,
  },
  reducers: {
    resetAdminDashboardState: (state) => {
      state.adminDashboard = null
      state.recentOrders = []
      state.recentCustomers = []
      state.recentProducts = []
      state.goalCompletion = null
      state.addedSaleReport = []
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Main dashboard statistics
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.adminDashboard = action.payload
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Recent orders
      .addCase(fetchRecentOrders.fulfilled, (state, action) => {
        state.recentOrders = action.payload
      })
      .addCase(fetchRecentOrders.rejected, (state, action) => {
        state.error = action.payload
      })
      // Recent customers
      .addCase(fetchRecentCustomers.fulfilled, (state, action) => {
        state.recentCustomers = action.payload
      })
      .addCase(fetchRecentCustomers.rejected, (state, action) => {
        state.error = action.payload
      })
      // Recent products
      .addCase(fetchRecentProducts.fulfilled, (state, action) => {
        state.recentProducts = action.payload
      })
      .addCase(fetchRecentProducts.rejected, (state, action) => {
        state.error = action.payload
      })
      // Goal completion
      .addCase(fetchGoalCompletion.fulfilled, (state, action) => {
        state.goalCompletion = action.payload
      })
      .addCase(fetchGoalCompletion.rejected, (state, action) => {
        state.error = action.payload
      })
      // Added Sale Report
      .addCase(fetchAddedSaleReport.pending, (state) => {
        state.addedSaleReportLoading = true
        state.addedSaleReportError = null
      })
      .addCase(fetchAddedSaleReport.fulfilled, (state, action) => {
        state.addedSaleReportLoading = false
        state.addedSaleReport = action.payload.data || action.payload || []
      })
      .addCase(fetchAddedSaleReport.rejected, (state, action) => {
        state.addedSaleReportLoading = false
        state.addedSaleReportError = action.payload
      })
  },
})

export const { resetAdminDashboardState } = adminDashboardSlice.actions
export default adminDashboardSlice.reducer
