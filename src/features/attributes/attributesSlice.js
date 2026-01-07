import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '@/lib/axios'

// Async thunk for fetching all attributes
export const fetchAllAttributes = createAsyncThunk(
  'attributes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/attributes/get-all-attributes')
      return response.data
    } catch (error) {
      console.error('Error fetching attributes')
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch attributes',
      )
    }
  },
)

const initialState = {
  data: { colors: [], sizes: [] },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

const attributesSlice = createSlice({
  name: 'attributes',
  initialState,
  reducers: {
    clearAttributes: (state) => {
      state.data = { colors: [], sizes: [] }
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAttributes.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAllAttributes.fulfilled, (state, action) => {
        state.status = 'succeeded'

        // The response is already the array we need
        const allAttributes = action.payload

        // Find color attribute (case insensitive)
        const colorAttr = allAttributes.find(
          (attr) =>
            attr?.name?.toLowerCase() === 'color' && Array.isArray(attr.values),
        )

        // Find size attribute (case insensitive)
        const sizeAttr = allAttributes.find(
          (attr) =>
            attr?.name?.toLowerCase() === 'size' && Array.isArray(attr.values),
        )

        state.data = {
          colors:
            colorAttr?.values?.map((color) => ({
              _id: color._id,
              value: color.value,
            })) || [],
          sizes:
            sizeAttr?.values?.map((size) => ({
              _id: size._id,
              value: size.value,
            })) || [],
        }
      })
      .addCase(fetchAllAttributes.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to fetch attributes'
      })
  },
})

export const { clearAttributes } = attributesSlice.actions
export default attributesSlice.reducer

// Selectors
export const selectAllAttributes = (state) => state.attributes.data
export const selectAttributeStatus = (state) => state.attributes.status
export const selectAttributeError = (state) => state.attributes.error
