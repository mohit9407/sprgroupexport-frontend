import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  getShippingMethods,
  getShippingMethodById,
} from './shippingMethodService'

// Async thunks
export const fetchShippingMethods = createAsyncThunk(
  'shipping/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getShippingMethods()
      return response.data // Assuming the API returns { data: [...] }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch shipping methods',
      )
    }
  },
)

const initialState = {
  methods: [],
  selectedMethod: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
}

const shippingSlice = createSlice({
  name: 'shipping',
  initialState,
  reducers: {
    selectShippingMethod: (state, action) => {
      state.selectedMethod = action.payload
    },
    clearShippingMethod: (state) => {
      state.selectedMethod = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShippingMethods.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchShippingMethods.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.methods = action.payload
      })
      .addCase(fetchShippingMethods.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { selectShippingMethod, clearShippingMethod } =
  shippingSlice.actions

export default shippingSlice.reducer

// Selectors
export const selectAllShippingMethods = (state) =>
  state.shipping.methods.filter((method) => method.isDefault === true)
export const selectSelectedShippingMethod = (state) =>
  state.shipping.selectedMethod
export const selectShippingStatus = (state) => state.shipping.status
export const selectShippingError = (state) => state.shipping.error
