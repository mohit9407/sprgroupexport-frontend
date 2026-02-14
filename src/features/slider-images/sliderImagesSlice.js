import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { sliderImagesService } from './sliderImagesService'

export const fetchSliderImages = createAsyncThunk(
  'sliderImages/fetchSliderImages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sliderImagesService.fetchSliderImages()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch slider images',
      )
    }
  },
)

export const fetchByIdSliderImages = createAsyncThunk(
  'sliderImages/fetchByIdSliderImages',
  async (id, { rejectWithValue }) => {
    try {
      const response = await sliderImagesService.getByIdSliderImages(id)

      const sliderData = response.data?.data || response.data
      return sliderData
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch slider images',
      )
    }
  },
)

export const deleteSliderImages = createAsyncThunk(
  'sliderImages/deleteSliderImages',
  async (id, { rejectWithValue }) => {
    try {
      const response = await sliderImagesService.deleteSliderImages(id)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete slider images',
      )
    }
  },
)

export const updateSliderImages = createAsyncThunk(
  'sliderImages/updateSliderImages',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const response = await sliderImagesService.updateSliderImages(id, params)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update slider images',
      )
    }
  },
)

export const createSliderImages = createAsyncThunk(
  'sliderImages/createSliderImages',
  async (params, { rejectWithValue }) => {
    try {
      const response = await sliderImagesService.createSliderImages(params)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create slider images',
      )
    }
  },
)

const sliderImagesSlice = createSlice({
  name: 'sliderImages',
  initialState: {
    allSliderImages: {
      data: [],
      pagination: {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
      },
      status: 'idle',
      error: null,
    },
    getByIdSliderImages: {
      data: null,
      isLoading: false,
      error: null,
    },
    createSliderImages: { isLoading: false, error: null },
    updateSliderImages: { isLoading: false, error: null },
    deleteSliderImages: { isLoading: false, error: null },
  },
  reducers: {
    clearSliderImages: (state) => {
      state.getByIdSliderImages.data = null
      state.getByIdSliderImages.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSliderImages.pending, (state) => {
        state.allSliderImages.status = 'loading'
        state.allSliderImages.error = null
      })
      .addCase(fetchSliderImages.fulfilled, (state, action) => {
        state.allSliderImages.status = 'succeeded'

        const dataArray = action.payload?.data || action.payload || []
        state.allSliderImages.data = dataArray
        state.allSliderImages.pagination = action.payload.pagination

      })
      .addCase(fetchSliderImages.rejected, (state, action) => {
        state.allSliderImages.status = 'failed'
        state.allSliderImages.error = action.payload
      })

    builder
      .addCase(fetchByIdSliderImages.pending, (state) => {
        state.getByIdSliderImages.isLoading = true
        state.getByIdSliderImages.error = null
      })
      .addCase(fetchByIdSliderImages.fulfilled, (state, action) => {
        state.getByIdSliderImages.isLoading = false
        state.getByIdSliderImages.data = action.payload
      })
      .addCase(fetchByIdSliderImages.rejected, (state, action) => {
        state.getByIdSliderImages.isLoading = false
        state.getByIdSliderImages.error = action.payload
      })

    builder
      .addCase(createSliderImages.pending, (state) => {
        state.createSliderImages.isLoading = true
        state.createSliderImages.error = null
      })
      .addCase(createSliderImages.fulfilled, (state, action) => {
        state.createSliderImages.isLoading = false

        const newSlider = action.payload?.data || action.payload
        if (newSlider && newSlider._id) {
          state.allSliderImages.data.push(newSlider)
        }
      })
      .addCase(createSliderImages.rejected, (state, action) => {
        state.createSliderImages.isLoading = false
        state.createSliderImages.error = action.payload
      })

    builder
      .addCase(updateSliderImages.pending, (state) => {
        state.updateSliderImages.isLoading = true
        state.updateSliderImages.error = null
      })
      .addCase(updateSliderImages.fulfilled, (state, action) => {
        state.updateSliderImages.isLoading = false

        let updatedData = action.payload?.data || action.payload

        if (updatedData && updatedData._id) {
          const index = state.allSliderImages.data.findIndex(
            (item) => item._id === action.meta.arg.id,
          )
          if (index !== -1) {
            state.allSliderImages.data[index] = updatedData
            console.log('Updated slider in Redux state at index:', index)
          }
        } else {
          console.log('No updated data in response, but update was successful')
        }
      })
      .addCase(updateSliderImages.rejected, (state, action) => {
        state.updateSliderImages.isLoading = false
        state.updateSliderImages.error = action.payload
      })

    builder
      .addCase(deleteSliderImages.pending, (state) => {
        state.deleteSliderImages.isLoading = true
        state.deleteSliderImages.error = null
      })
      .addCase(deleteSliderImages.fulfilled, (state) => {
        state.deleteSliderImages.isLoading = false
        state.allSliderImages.data = state.allSliderImages.data.filter(
          (item) => item._id !== action.meta.arg,
        )
      })
      .addCase(deleteSliderImages.rejected, (state, action) => {
        state.deleteSliderImages.isLoading = false
        state.deleteSliderImages.error = action.payload
      })
  },
})

export const { clearSliderImages } = sliderImagesSlice.actions

export default sliderImagesSlice.reducer
