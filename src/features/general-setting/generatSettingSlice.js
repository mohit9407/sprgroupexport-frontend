import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { generalSetting } from './generatSettingService'

export const getGeneralSetting = createAsyncThunk(
  'generalSetting/getGeneralSetting',
  async (_, { rejectWithValue }) => {
    try {
      const response = await generalSetting.getGeneralSetting()
      return response
    } catch (error) {
      return rejectWithValue(
        error.response.data || 'Failed to get general setting',
      )
    }
  },
)

export const updateGeneralSetting = createAsyncThunk(
  'generalSetting/updateGeneralSetting',
  async (data, { rejectWithValue }) => {
    try {
      const response = await generalSetting.updateGeneralSetting(data)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response.data || 'Failed to update general setting',
      )
    }
  },
)

export const createGeneralSetting = createAsyncThunk(
  'generalSetting/createGeneralSetting',
  async (data, { rejectWithValue }) => {
    try {
      const response = await generalSetting.createGeneralSetting(data)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response.data || 'Failed to create general setting',
      )
    }
  },
)

const generalSettingSlice = createSlice({
  name: 'generalSetting',
  initialState: {
    data: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    clearGeneralSetting: (state) => {
      state.data = []
      state.status = 'idle'
      state.error = null
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getGeneralSetting.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(getGeneralSetting.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload
      })
      .addCase(getGeneralSetting.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(updateGeneralSetting.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(updateGeneralSetting.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload?.data || action.payload
      })
      .addCase(updateGeneralSetting.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearGeneralSetting } = generalSettingSlice.actions

export default generalSettingSlice.reducer
