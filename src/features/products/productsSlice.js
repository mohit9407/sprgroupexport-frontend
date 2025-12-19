import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchAllProducts } from './productService'

// Async thunk for fetching products with filters
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await fetchAllProducts(filters)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch products',
      )
    }
  },
)

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    filters: {
      minPrice: 0,
      maxPrice: 1000000,
      categories: [],
      sortBy: '',
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 1,
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = {
        minPrice: 0,
        maxPrice: 1000000,
        categories: [],
        sortBy: '',
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Handle different response structures
        const response = action.payload

        if (response.data && Array.isArray(response.data.data)) {
          // For paginated response: { data: { data: [...], total, page, pages } }
          state.items = response.data.data
          state.filters.totalItems = response.data.total || 0
          state.filters.totalPages = response.data.pages || 1
          state.filters.page = response.data.page || 1
        } else if (Array.isArray(response.data)) {
          // For non-paginated array response: { data: [...] }
          state.items = response.data
        } else if (Array.isArray(response)) {
          // For direct array response: [...]
          state.items = response
        } else {
          state.items = []
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load products'
      })
  },
})

export default productsSlice.reducer
