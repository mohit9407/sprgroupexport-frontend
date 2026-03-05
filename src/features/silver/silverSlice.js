import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { silverService } from './silverService'

export const fetchSilver = createAsyncThunk(
  'silver/fetchSilver',
  async (_, { rejectWithValue }) => {
    try {
      const res = await silverService.getAllSilver()
      return res
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch silver',
      )
    }
  },
)

export const fetchSilverPrices = createAsyncThunk(
  'silver/fetchSilverPrices',
  async (_, { rejectWithValue }) => {
    try {
      const res = await silverService.fetchSilverPrices()
      return res
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch silver prices',
      )
    }
  },
)

export const getSilverById = createAsyncThunk(
  'silver/getSilverById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await silverService.getSilverById(id)
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to get silver',
      )
    }
  },
)

export const createSilver = createAsyncThunk(
  'silver/createSilver',
  async (data, { rejectWithValue }) => {
    try {
      const res = await silverService.createSilver(data)
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to create silver',
      )
    }
  },
)

export const updateSilver = createAsyncThunk(
  'silver/updateSilver',
  async ({ id, silverData }, { rejectWithValue }) => {
    try {
      const res = await silverService.updateSilver(id, silverData)
      return res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update silver',
      )
    }
  },
)

export const deleteSilver = createAsyncThunk(
  'silver/deleteSilver',
  async (id, { rejectWithValue }) => {
    try {
      const response = await silverService.deleteSilver(id)
      return response.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete silver',
      )
    }
  },
)

const initialState = {
  data: [],
  singleSilver: null,
  loading: false,
  error: null,

  selectedPurity: null,
  silverRate: 0,
}

const silverSlice = createSlice({
  name: 'silver',
  initialState,
  reducers: {
    clearSilverById: (state) => {
      state.singleSilver = null
      state.error = null
    },

    setSelectedPurity: (state, action) => {
      const purity = action.payload
      state.selectedPurity = purity

      const selected = state.data.find((item) => item.purity === purity)

      if (selected) {
        state.silverRate = selected.pricePerGram
      } else {
        state.silverRate = 0
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSilver.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSilver.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload.data
      })
      .addCase(fetchSilver.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(fetchSilverPrices.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSilverPrices.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload.data
      })
      .addCase(fetchSilverPrices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(getSilverById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSilverById.fulfilled, (state, action) => {
        state.loading = false
        state.singleSilver = action.payload
      })
      .addCase(getSilverById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(createSilver.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSilver.fulfilled, (state, action) => {
        state.loading = false
        state.data.push(action.payload)
      })
      .addCase(createSilver.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(updateSilver.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSilver.fulfilled, (state, action) => {
        state.loading = false
        const index = state.data.findIndex(
          (item) => item._id === action.payload._id,
        )
        if (index !== -1) {
          state.data[index] = action.payload
        }
      })
      .addCase(updateSilver.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(deleteSilver.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteSilver.fulfilled, (state, action) => {
        state.loading = false
        state.data = state.data.filter((item) => item._id !== action.payload)
      })
      .addCase(deleteSilver.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearSilverById, setSelectedPurity } = silverSlice.actions
export default silverSlice.reducer
