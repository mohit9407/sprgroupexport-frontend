import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  getAllHomeSliders,
  createHomeSlider,
  updateHomeSlider,
  deleteHomeSlider,
} from './homeSliderService'

export const fetchHomeSliders = createAsyncThunk(
  'homeSlider/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllHomeSliders()
      return res.data
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  },
)

export const createHomeSliderAsync = createAsyncThunk(
  'homeSlider/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await createHomeSlider(data)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  },
)

export const updateHomeSliderAsync = createAsyncThunk(
  'homeSlider/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateHomeSlider(id, data)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  },
)

export const deleteHomeSliderAsync = createAsyncThunk(
  'homeSlider/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await deleteHomeSlider(id)
      return { ...res.data, id }
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  },
)

const homeSliderSlice = createSlice({
  name: 'homeSlider',
  initialState: {
    sliders: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeSliders.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchHomeSliders.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.sliders = action.payload.data || action.payload
      })
      .addCase(fetchHomeSliders.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })

      .addCase(createHomeSliderAsync.fulfilled, (state, action) => {
        const newSlider = action.payload.data || action.payload
        if (newSlider) {
          state.sliders.push(newSlider)
        }
      })

      .addCase(updateHomeSliderAsync.fulfilled, (state, action) => {
        const updatedSlider = action.payload.data || action.payload
        if (updatedSlider && updatedSlider._id) {
          const index = state.sliders.findIndex(
            (s) => s._id === updatedSlider._id,
          )
          if (index !== -1) {
            state.sliders[index] = updatedSlider
          }
        }
      })

      .addCase(deleteHomeSliderAsync.fulfilled, (state, action) => {
        const id = action.payload.id
        state.sliders = state.sliders.filter((s) => s._id !== id)
      })
  },
})

export default homeSliderSlice.reducer

export const selectHomeSliders = (state) => state.homeSlider.sliders ?? []
export const selectHomeSliderStatus = (state) =>
  state.homeSlider.status ?? 'idle'
