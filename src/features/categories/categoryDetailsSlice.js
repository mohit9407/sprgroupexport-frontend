import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '@/lib/axios'

const initialState = {
  data: null,
  status: 'idle',
  error: null,
}

export const fetchCategoryById = createAsyncThunk(
  'categoryDetails/fetchCategoryById',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/category/${categoryId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch category',
      )
    }
  },
)

const categoryDetailsSlice = createSlice({
  name: 'categoryDetails',
  initialState,
  reducers: {
    clearCategoryDetails: (state) => {
      state.data = null
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // The payload is already the data object from the response
        state.data = action.payload
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearCategoryDetails } = categoryDetailsSlice.actions
export default categoryDetailsSlice.reducer
