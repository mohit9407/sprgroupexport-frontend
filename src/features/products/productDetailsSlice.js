import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchProductById } from './productService'

// Async thunk for fetching product details
export const fetchProductDetails = createAsyncThunk(
  'productDetails/fetchProductDetails',
  async (productId, { rejectWithValue }) => {
    try {
      return await fetchProductById(productId)
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch product details',
      )
    }
  },
)

const productDetailsSlice = createSlice({
  name: 'productDetails',
  initialState: {
    data: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearProductDetails: (state) => {
      state.data = null
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductDetails.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearProductDetails } = productDetailsSlice.actions
export default productDetailsSlice.reducer
