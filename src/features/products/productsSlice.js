import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  fetchAllProducts,
  fetchAllProductsWithFilters,
  createProduct as createProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
} from './productService'
import { sortByCreatedAtDesc } from '@/utils/sortUtils'

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

// Async thunk for fetching products with advanced filters
export const fetchProductsWithFilters = createAsyncThunk(
  'products/fetchProductsWithFilters',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await fetchAllProductsWithFilters(filters)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to fetch products with filters',
      )
    }
  },
)

export const fetchAllProduct = createAsyncThunk(
  'products/fetchAllProduct',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAllProductsWithFilters()
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch products',
      )
    }
  },
)

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await createProductService(productData)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create product',
      )
    }
  },
)

// Async thunk for updating a product
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await updateProductService(productId, productData)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update product',
      )
    }
  },
)

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await deleteProductService(productId)
      return { productId, ...response }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete product',
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
    fetchAllProduct: {
      data: [],
      pagination: {},
      message: null,
      isLoading: false,
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
    // Handle fetchProducts
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const response = action.payload

        // Handle API response with pagination
        if (response && Array.isArray(response.data)) {
          state.items = response.data
          state.filters = {
            ...state.filters,
            totalItems: response.pagination?.total || 0,
            totalPages: response.pagination?.totalPages || 1,
            page: response.pagination?.page || 1,
            limit: response.pagination?.limit || state.filters.limit,
          }
        }
        // Handle other response formats for backward compatibility
        else if (response?.data?.data && Array.isArray(response.data.data)) {
          state.items = response.data.data
          state.filters = {
            ...state.filters,
            totalItems: response.data.total || 0,
            totalPages: response.data.pages || 1,
            page: response.data.page || 1,
          }
        } else if (Array.isArray(response)) {
          state.items = response
          state.filters = {
            ...state.filters,
            totalItems: response.length,
            totalPages: 1,
            page: 1,
          }
        } else {
          state.items = []
          state.filters = {
            ...state.filters,
            totalItems: 0,
            totalPages: 1,
            page: 1,
          }
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load products'
      })

    // Handle fetchProductsWithFilters
    builder
      .addCase(fetchProductsWithFilters.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProductsWithFilters.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const response = action.payload
        if (response.data && Array.isArray(response.data)) {
          state.items = response.data
          state.filters.totalItems = response.pagination.total || 0
          state.filters.page = response.page || 1
          state.filters.totalPages = response.pagination.totalPages || 1
        } else {
          state.items = []
        }
      })
      .addCase(fetchProductsWithFilters.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load products with filters'
      })

    // Handle createProduct
    builder
      .addCase(createProduct.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Add the new product to the beginning of the items array
        if (action.payload) {
          state.items.unshift(action.payload.data || action.payload)
          state.filters.totalItems += 1
          // Reset any filters to show the newly created product
          state.filters.page = 1
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to create product'
      })

    // Handle updateProduct
    builder
      .addCase(updateProduct.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Update the product in the items array
        if (action.payload) {
          const updatedProduct = action.payload.data || action.payload
          const index = state.items.findIndex(
            (item) => item._id === updatedProduct._id,
          )
          if (index !== -1) {
            state.items[index] = updatedProduct
          }
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to update product'
      })

    builder
      .addCase(fetchAllProduct.pending, (state) => {
        state.fetchAllProduct.isLoading = true
        state.fetchAllProduct.message = null
      })
      .addCase(fetchAllProduct.fulfilled, (state, action) => {
        const response = action.payload

        state.fetchAllProduct.isLoading = false
        state.fetchAllProduct.data = response.data || []
        state.fetchAllProduct.pagination = response.pagination || {}
        state.fetchAllProduct.message = response.message || null
      })
      .addCase(fetchAllProduct.rejected, (state, action) => {
        state.fetchAllProduct.isLoading = false
        state.fetchAllProduct.message =
          action.payload || 'Failed to load products with filters'
      })
  },
})

// Selectors
export const selectAllProducts = (state) => {
  const { items, filters, status, error } = state.products

  return {
    items: sortByCreatedAtDesc(items),
    status,
    error,
    filters,
    pagination: {
      currentPage: filters.page,
      totalPages: filters.totalPages,
      totalItems: filters.totalItems,
      itemsPerPage: filters.limit,
    },
  }
}

export default productsSlice.reducer
