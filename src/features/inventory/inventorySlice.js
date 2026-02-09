import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { inventoryService } from './inventoryService'

export const applyInventory = createAsyncThunk(
  'inventory/apply',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await inventoryService.applyInventory(payload)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to apply inventory',
      )
    }
  },
)

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    loading: false,
    error: null,
  },
  reducers: {
    clearInventory: (state) => {
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(applyInventory.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(applyInventory.fulfilled, (state) => {
      state.loading = false
      state.error = null
    })
    builder.addCase(applyInventory.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })
  },
})

export const { clearInventory } = inventorySlice.actions

export default inventorySlice.reducer
