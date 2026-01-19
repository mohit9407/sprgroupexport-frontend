import {
  createAsyncThunk,
  createSlice,
  createEntityAdapter,
} from '@reduxjs/toolkit'
import api from '@/lib/axios'

const attributesAdapter = createEntityAdapter({
  selectId: (attribute) => attribute._id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})

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

export const fetchAttributeById = createAsyncThunk(
  'attributes/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/attributes/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching attribute:', error)
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch attribute',
      )
    }
  },
)

export const createAttribute = createAsyncThunk(
  'attributes/create',
  async (attributeData, { rejectWithValue }) => {
    try {
      const response = await api.post('/attributes/create', attributeData)
      return response.data
    } catch (error) {
      console.error('Error creating attribute:', error)
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create attribute',
      )
    }
  },
)

export const updateAttribute = createAsyncThunk(
  'attributes/update',
  async ({ id, ...attributeData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/attributes/update/${id}`, attributeData)
      return response.data
    } catch (error) {
      console.error('Error updating attribute:', error)
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update attribute',
      )
    }
  },
)

export const deleteAttribute = createAsyncThunk(
  'attributes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/attributes/delete/${id}`)
      return id // Return the ID of the deleted attribute
    } catch (error) {
      console.error('Error deleting attribute:', error)
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete attribute',
      )
    }
  },
)

const initialState = attributesAdapter.getInitialState({
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
})

const attributesSlice = createSlice({
  name: 'attributes',
  initialState,
  reducers: {
    clearAttributes: (state) => {
      attributesAdapter.removeAll(state)
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Delete
      .addCase(deleteAttribute.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(deleteAttribute.fulfilled, (state, action) => {
        state.status = 'succeeded'
        attributesAdapter.removeOne(state, action.payload)
      })
      .addCase(deleteAttribute.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to delete attribute'
      })

      // Fetch All
      .addCase(fetchAllAttributes.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAllAttributes.fulfilled, (state, action) => {
        state.status = 'succeeded'
        attributesAdapter.setAll(state, action.payload)
      })
      .addCase(fetchAllAttributes.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to fetch attributes'
      })

      // Fetch By ID
      .addCase(fetchAttributeById.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAttributeById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        attributesAdapter.upsertOne(state, action.payload)
      })
      .addCase(fetchAttributeById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to fetch attribute'
      })

      // Create
      .addCase(createAttribute.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createAttribute.fulfilled, (state, action) => {
        state.status = 'succeeded'
        attributesAdapter.addOne(state, action.payload)
      })
      .addCase(createAttribute.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to create attribute'
      })

      // Update
      .addCase(updateAttribute.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(updateAttribute.fulfilled, (state, action) => {
        state.status = 'succeeded'
        attributesAdapter.upsertOne(state, action.payload)
      })
      .addCase(updateAttribute.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to update attribute'
      })
  },
})

export const { clearAttributes } = attributesSlice.actions

export const {
  selectAll: selectAllAttributes,
  selectById: selectAttributeById,
  selectIds: selectAttributeIds,
} = attributesAdapter.getSelectors((state) => state.attributes)

export const selectAttributeStatus = (state) => state.attributes.status
export const selectAttributeError = (state) => state.attributes.error

export default attributesSlice.reducer
