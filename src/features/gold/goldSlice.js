import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { goldService } from './goldService'

export const fetchGold = createAsyncThunk(
  'gold/fetchGold',
  async (_, { rejectWithValue }) => {
    try {
      const response = await goldService.getAllGold()
      const data = response.data.data || response.data
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch gold',
      )
    }
  },
)

export const getGoldById = createAsyncThunk(
  'gold/getGoldById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await goldService.getGoldById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get gold by id',
      )
    }
  },
)

export const createGold = createAsyncThunk(
  'gold/createGold',
  async (goldData, { rejectWithValue }) => {
    try {
      const response = await goldService.createGold(goldData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create gold',
      )
    }
  },
)

export const updateGold = createAsyncThunk(
  'gold/updateGold',
  async ({ id, goldData }, { rejectWithValue }) => {
    try {
      const response = await goldService.updateGold(id, goldData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update gold',
      )
    }
  },
)

export const deleteGold = createAsyncThunk(
  'gold/deleteGold',
  async (id, { rejectWithValue }) => {
    try {
      const response = await goldService.deleteGold(id)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete gold',
      )
    }
  },
)

const goldSlice = createSlice({
  name: 'gold',
  initialState: {
    allGold: { data: [], isLoading: false, error: null },
    getGoldById: { data: null, isLoading: false, error: null },
    createGold: { isLoading: false, error: null },
    updateGold: { isLoading: false, error: null },
    deleteGold: { isLoading: false, error: null },
  },
  reducers: {
    clearGoldById: (state) => {
      state.getGoldById.data = null
      state.getGoldById.error = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchGold.pending, (state) => {
      state.allGold.isLoading = true
      state.allGold.error = null
    })
    builder.addCase(fetchGold.fulfilled, (state, action) => {
      state.allGold.isLoading = false
      state.allGold.data = action.payload
    })
    builder.addCase(fetchGold.rejected, (state, action) => {
      state.allGold.isLoading = false
      state.allGold.error = action.payload
    })

    builder.addCase(getGoldById.pending, (state) => {
      state.getGoldById.isLoading = true
      state.getGoldById.error = null
    })
    builder.addCase(getGoldById.fulfilled, (state, action) => {
      state.getGoldById.isLoading = false
      state.getGoldById.data = action.payload
    })
    builder.addCase(getGoldById.rejected, (state, action) => {
      state.getGoldById.isLoading = false
      state.getGoldById.error = action.payload
    })

    builder.addCase(createGold.pending, (state) => {
      state.createGold.isLoading = true
      state.createGold.error = null
    })
    builder.addCase(createGold.fulfilled, (state, action) => {
      state.createGold.isLoading = false
      state.allGold.data.push(action.payload)
    })
    builder.addCase(createGold.rejected, (state, action) => {
      state.createGold.isLoading = false
      state.createGold.error = action.payload
    })

    builder.addCase(updateGold.pending, (state) => {
      state.updateGold.isLoading = true
      state.updateGold.error = null
    })
    builder.addCase(updateGold.fulfilled, (state, action) => {
      state.updateGold.isLoading = false
      const index = state.allGold.data.findIndex(
        (item) => item._id === action.payload._id,
      )
      if (index !== -1) state.allGold.data[index] = action.payload
    })
    builder.addCase(updateGold.rejected, (state, action) => {
      state.updateGold.isLoading = false
      state.updateGold.error = action.payload
    })

    builder.addCase(deleteGold.pending, (state) => {
      state.deleteGold.isLoading = true
      state.deleteGold.error = null
    })
    builder.addCase(deleteGold.fulfilled, (state, action) => {
      state.deleteGold.isLoading = false
      state.allGold.data = state.allGold.data.filter(
        (item) => item._id !== action.meta.arg,
      )
    })
    builder.addCase(deleteGold.rejected, (state, action) => {
      state.deleteGold.isLoading = false
      state.deleteGold.error = action.payload
    })
  },
})

export const { clearGoldById } = goldSlice.actions

export default goldSlice.reducer
