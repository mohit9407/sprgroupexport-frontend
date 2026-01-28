import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { reviewService } from './reviewService'

export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (params, { rejectWithValue }) => {
    try {
      return await reviewService.getAllReviews(params)
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch reviews',
      )
    }
  },
)

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (
    { reviewId, productId, refreshParams },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await reviewService.deleteReview(productId, reviewId)
      dispatch(fetchReviews(refreshParams))
      return reviewId
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete review',
      )
    }
  },
)

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    allReviews: {
      data: null,
      pagination: null,
    },
    deleteReview: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.allReviews.isLoading = true
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.allReviews.isLoading = false
        state.allReviews.isSuccess = true
        state.allReviews.data = action.payload.data
        state.allReviews.pagination = action.payload.pagination
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.allReviews.isLoading = false
        state.allReviews.isError = true
        state.allReviews.message = action.payload
      })

      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.deleteReview.isLoading = true
      })
      .addCase(deleteReview.fulfilled, (state) => {
        state.deleteReview.isLoading = false
        state.deleteReview.isSuccess = true
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.deleteReview.isLoading = false
        state.deleteReview.isError = true
        state.deleteReview.message = action.payload
      })
  },
})

export default reviewsSlice.reducer
