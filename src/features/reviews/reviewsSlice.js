import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '@/lib/axios'

const initialState = {
  reviews: [],
  loading: false,
  error: null,
  pagination: {
    pageIndex: 0,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
  },
}

export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/product/get-all-product', { params })

      const products = response.data?.data || response.data || []
      const allReviews = []

      products.forEach((product) => {
        if (product.reviews && product.reviews.length > 0) {
          product.reviews.forEach((review) => {
            const mappedReview = {
              _id:
                review._id?.toString() ||
                `${product._id}_${review.user}_${review.createdAt}`,
              productId: product._id?.toString() || product._id,
              productName: product.productName,
              userId: review.user?.toString() || review.user,
              orderId: review.order?.toString() || review.order,
              rating: review.rating,
              comment: review.comment,
              createdAt: review.createdAt,
              updatedAt: review.updatedAt || review.createdAt,
            }
            allReviews.push(mappedReview)
          })
        }
      })

      let sortedReviews = allReviews
      if (params.sortBy && params.direction) {
        sortedReviews = [...allReviews].sort((a, b) => {
          let aValue = a[params.sortBy]
          let bValue = b[params.sortBy]

          // Handle different data types
          if (params.sortBy === 'createdAt') {
            aValue = new Date(aValue)
            bValue = new Date(bValue)
          } else {
            // Convert to string for text comparison
            aValue = String(aValue || '').toLowerCase()
            bValue = String(bValue || '').toLowerCase()
          }

          if (params.direction === 'asc') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
          } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
          }
        })
      }

      // Apply pagination (server-side if API supports it, otherwise client-side)
      const limit = params.limit || 10
      const page = params.page || 1
      const totalItems = sortedReviews.length
      const totalPages = Math.ceil(totalItems / limit)
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedReviews = sortedReviews.slice(startIndex, endIndex)
      return {
        reviews: paginatedReviews,
        pagination: {
          pageIndex: page - 1,
          pageSize: limit,
          totalPages,
          totalItems,
        },
      }
    } catch (error) {
      console.error('fetchReviews error:', error)
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch reviews',
      )
    }
  },
)

// Delete a review
export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async ({ productId, reviewId }, { rejectWithValue }) => {
    try {
      await api.delete(`/product/${productId}/deleteReview/${reviewId}`)
      return { productId, reviewId }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete review',
      )
    }
  },
)

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false
        state.reviews = action.payload.reviews
        state.pagination = action.payload.pagination
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(deleteReview.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false
        const { reviewId } = action.payload

        // Remove from current reviews
        state.reviews = state.reviews.filter(
          (review) => review._id !== reviewId,
        )

        // Update pagination
        state.pagination.totalItems = state.pagination.totalItems - 1
        state.pagination.totalPages = Math.ceil(
          state.pagination.totalItems / state.pagination.pageSize,
        )
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const selectAllReviews = (state) => ({
  data: state.reviews.reviews,
  pagination: state.reviews.pagination,
  isLoading: state.reviews.loading,
  error: state.reviews.error,
})

export default reviewsSlice.reducer
