import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  createSetting,
  getAllSettings,
  getSettingById,
  updateSetting,
  deleteSetting,
} from './settingService'

export const fetchSettings = createAsyncThunk(
  'settings/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllSettings()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch settings',
      )
    }
  },
)

export const fetchSettingById = createAsyncThunk(
  'settings/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getSettingById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch setting',
      )
    }
  },
)

export const createNewSetting = createAsyncThunk(
  'settings/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await createSetting(data)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create setting',
      )
    }
  },
)

export const updateExistingSetting = createAsyncThunk(
  'settings/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateSetting(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update setting',
      )
    }
  },
)

export const deleteExistingSetting = createAsyncThunk(
  'settings/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteSetting(id)
      return id
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete setting',
      )
    }
  },
)


const initialState = {
  settings: [],
  selectedSetting: null,
  status: 'idle', 
  error: null,
}

const settingSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSelectedSetting: (state) => {
      state.selectedSetting = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchSettings.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.settings = action.payload
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })

      // Fetch by ID
      .addCase(fetchSettingById.fulfilled, (state, action) => {
        state.selectedSetting = action.payload
      })

      // Create
      .addCase(createNewSetting.fulfilled, (state, action) => {
        state.settings.push(action.payload)
      })

      // Update
      .addCase(updateExistingSetting.fulfilled, (state, action) => {
        const index = state.settings.findIndex(
          (item) => item._id === action.payload._id,
        )
        if (index !== -1) {
          state.settings[index] = action.payload
        }
        state.selectedSetting = action.payload
      })

      // Delete
      .addCase(deleteExistingSetting.fulfilled, (state, action) => {
        state.settings = state.settings.filter(
          (item) => item._id !== action.payload,
        )
      })
  },
})

export const { clearSelectedSetting } = settingSlice.actions
export default settingSlice.reducer

export const selectAllSettings = (state) => state.settings.settings
export const selectSelectedSetting = (state) =>
  state.settings.selectedSetting
export const selectSettingsStatus = (state) => state.settings.status
export const selectSettingsError = (state) => state.settings.error
