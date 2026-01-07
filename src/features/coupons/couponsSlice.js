import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '@/lib/axios'

// Async thunk for fetching all coupons
export const fetchAllCoupons = createAsyncThunk(
  'coupons/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/coupon/get-all-coupon')
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch coupons',
      )
    }
  },
)

// Get product offers based on coupons
export const fetchProductOffers = createAsyncThunk(
  'coupons/fetchProductOffers',
  async (product, { rejectWithValue }) => {
    try {
      if (!product?._id) {
        return []
      }

      const response = await api.get('/coupon/get-all-coupon')

      // The coupons are directly in response.data, not in response.data.data
      const allCoupons = Array.isArray(response.data) ? response.data : []

      // Filter coupons that match the product's ID in the products array
      return allCoupons.filter(
        (coupon) =>
          coupon.products?.includes(product._id) &&
          coupon.offerType === 'offer' &&
          coupon.isActive,
      )
    } catch (error) {
      console.error('Error fetching product offers:', error)
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch product offers',
      )
    }
  },
)

const couponsSlice = createSlice({
  name: 'coupons',
  initialState: {
    coupons: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    offers: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCoupons.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAllCoupons.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.coupons = action.payload
      })
      .addCase(fetchAllCoupons.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchProductOffers.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchProductOffers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        if (action.meta.arg?._id) {
          state.offers[action.meta.arg._id] = action.payload
        }
      })
      .addCase(fetchProductOffers.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const selectAllCoupons = (state) => state.coupons.coupons
export const selectCouponsStatus = (state) => state.coupons.status
export const selectProductOffers = (productId) => (state) =>
  state.coupons.offers[productId] || []

export default couponsSlice.reducer
