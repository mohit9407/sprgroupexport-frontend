import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  getAllParallaxBanners,
  updateParallaxBanner,
} from './parallaxBannerService'

export const fetchParallaxBanners = createAsyncThunk(
  'parallaxBanner/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllParallaxBanners()
      return res.data
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  },
)

export const updateParallaxBannerById = createAsyncThunk(
  'parallaxBanner/updateById',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateParallaxBanner(id, data)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  },
)

const parallaxBannerSlice = createSlice({
  name: 'parallaxBanner',
  initialState: {
    banners: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchParallaxBanners.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchParallaxBanners.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.banners = action.payload?.data || action.payload || []
      })
      .addCase(fetchParallaxBanners.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })

      .addCase(updateParallaxBannerById.fulfilled, (state, action) => {
        const updatedBanner = action.payload?.data || action.payload
        if (!updatedBanner?._id) return

        const index = state.banners.findIndex(
          (b) => b._id === updatedBanner._id,
        )
        if (index !== -1) {
          state.banners[index] = updatedBanner
        }
      })
  },
})

export default parallaxBannerSlice.reducer

export const selectParallaxBanners = (state) =>
  state.parallaxBanner.banners ?? []
