import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '@/lib/axios'

const initialState = {
  allCarats: {
    data: [],
    isLoading: false,
    error: null,
  },
  selectedCarat: null,
  goldRate: 0,
  calculatedPrice: {
    data: null,
    isLoading: false,
    error: null,
  },
  status: 'idle',
  error: null,
}

// Fetch all carats
export const fetchCaratData = createAsyncThunk(
  'carat/fetchCaratData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/gold/latest')

      // Ensure we return a consistent structure
      if (Array.isArray(response.data)) {
        return {
          data: response.data,
        }
      }

      // Handle case where response is not an array
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        return {
          data: response.data.data,
        }
      }

      return { data: [] }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch carat data',
      )
    }
  },
)

// Calculate gold price based on carat and grams
export const calculateGoldPrice = createAsyncThunk(
  'carat/calculateGoldPrice',
  async ({ carat, gram }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/gold/calculate-price?carat=${carat}&gram=${gram}`,
      )
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to calculate gold price',
      )
    }
  },
)

// Only fetch carat data is required

const caratSlice = createSlice({
  name: 'carat',
  initialState,
  reducers: {
    setSelectedCarat: (state, action) => {
      const { carat, pricePerGram } = action.payload
      state.selectedCarat = carat
      state.goldRate = pricePerGram
    },
    clearCaratData: (state) => {
      state.allCarats.data = []
      state.allCarats.isLoading = false
      state.allCarats.error = null
      state.selectedCarat = null
      state.goldRate = 0
    },
    resetCaratStatus: (state) => {
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch carat data
    builder
      .addCase(fetchCaratData.pending, (state) => {
        state.allCarats.isLoading = true
        state.allCarats.error = null
      })
      .addCase(fetchCaratData.fulfilled, (state, action) => {
        state.allCarats.isLoading = false
        state.allCarats.data = action.payload.data || []

        // Set default selected carat to the first item if not already set
        if (state.allCarats.data.length > 0 && !state.selectedCarat) {
          const highestCarat = state.allCarats.data.reduce((prev, current) =>
            prev.carat > current.carat ? prev : current,
          )
          state.selectedCarat = highestCarat.carat
          state.goldRate = highestCarat.pricePerGram
        }
      })
      .addCase(fetchCaratData.rejected, (state, action) => {
        state.allCarats.isLoading = false
        state.allCarats.error = action.payload
      })

      // Calculate gold price
      .addCase(calculateGoldPrice.pending, (state) => {
        state.calculatedPrice.isLoading = true
        state.calculatedPrice.error = null
      })
      .addCase(calculateGoldPrice.fulfilled, (state, action) => {
        state.calculatedPrice.isLoading = false
        state.calculatedPrice.data = action.payload
        state.goldRate = action.payload.pricePerGram
      })
      .addCase(calculateGoldPrice.rejected, (state, action) => {
        state.calculatedPrice.isLoading = false
        state.calculatedPrice.error = action.payload
      })
  },
})

export const { setSelectedCarat, clearCaratData, resetCaratStatus } =
  caratSlice.actions

// Selectors
export const selectAllCarats = (state) => ({
  data: state.carat.allCarats.data,
  isLoading: state.carat.allCarats.isLoading,
  error: state.carat.allCarats.error,
})

export const selectSelectedCarat = (state) => ({
  carat: state.carat.selectedCarat,
  goldRate: state.carat.goldRate,
})

export const selectCaratStatus = (state) => state.carat.status
export const selectCaratError = (state) => state.carat.error

// Combined selector used in ProductFormPage
export const selectCaratData = (state) => ({
  data: state.carat.allCarats.data,
  loading: state.carat.allCarats.isLoading,
  error: state.carat.allCarats.error,
  selectedCarat: state.carat.selectedCarat,
  goldRate: state.carat.goldRate,
  calculatedPrice: state.carat.calculatedPrice.data,
  isCalculating: state.carat.calculatedPrice.isLoading,
  calculationError: state.carat.calculatedPrice.error,
})

export default caratSlice.reducer
