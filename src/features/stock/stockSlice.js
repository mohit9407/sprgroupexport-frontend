import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import stockService from './stockService'

export const fetchStockProducts = createAsyncThunk(
  'stock/fetchStockProducts',
  async (params, { rejectWithValue }) => {
    try {
      return await stockService.fetchStockProducts(params)
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch stock products',
      )
    }
  },
)

const stockSlice = createSlice({
  name: 'stock',
  initialState: {
    lowStock: {
      data: [],
      pagination: {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
      },
      status: 'idle',
      error: null,
    },
    outOfStock: {
      data: [],
      pagination: {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
      },
      status: 'idle',
      error: null,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStockProducts.pending, (state, action) => {
        const stockType = action.meta.arg?.stockType || 'lowStock'
        state[stockType].status = 'loading'
      })
      .addCase(fetchStockProducts.fulfilled, (state, action) => {
        const stockType = action.meta.arg?.stockType || 'lowStock'
        state[stockType].status = 'succeeded'

        const { data, pagination } = action.payload

        state[stockType].data = data || []
        state[stockType].pagination = {
          totalItems: pagination?.total || 0,
          totalPages: pagination?.totalPages || 1,
          currentPage: pagination?.page || 1,
          limit: pagination?.limit || 10,
        }
      })
      .addCase(fetchStockProducts.rejected, (state, action) => {
        const stockType = action.meta.arg?.stockType || 'lowStock'
        state[stockType].status = 'failed'
        state[stockType].error = action.payload
      })
  },
})

export default stockSlice.reducer

// Low Stock Selectors
export const selectLowStockData = (state) => state.stock.lowStock.data
export const selectLowStockPagination = (state) =>
  state.stock.lowStock.pagination
export const selectLowStockStatus = (state) => state.stock.lowStock.status
export const selectLowStockError = (state) => state.stock.lowStock.error

// Out of Stock Selectors
export const selectOutOfStockData = (state) => state.stock.outOfStock.data
export const selectOutOfStockPagination = (state) =>
  state.stock.outOfStock.pagination
export const selectOutOfStockStatus = (state) => state.stock.outOfStock.status
export const selectOutOfStockError = (state) => state.stock.outOfStock.error

// Helper thunks for specific use cases
export const fetchLowStock = (params) =>
  fetchStockProducts({ ...params, stockType: 'lowStock' })
export const fetchOutOfStock = (params) =>
  fetchStockProducts({ ...params, stockType: 'outOfStock' })
