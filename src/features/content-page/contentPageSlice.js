import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import contentPageService from './contentPageService'

export const fetchContentPages = createAsyncThunk(
  'contentPage/fetchContentPages',
  async (params, { rejectWithValue }) => {
    try {
      const response = await contentPageService.getAllContentPage(params)
      const data = response.data.data || response.data
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch content pages',
      )
    }
  },
)

export const getContentPageById = createAsyncThunk(
  'contentPage/getContentPageById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await contentPageService.getContentPageById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get content page by id',
      )
    }
  },
)

export const createContentPage = createAsyncThunk(
  'contentPage/createContentPage',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await contentPageService.createContentPage(payload)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create content page',
      )
    }
  },
)

export const updateContentPage = createAsyncThunk(
  'contentPage/updateContentPage',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await contentPageService.updateContentPage(id, payload)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update content page',
      )
    }
  },
)

export const deleteContentPage = createAsyncThunk(
  'contentPage/deleteContentPage',
  async (id, { rejectWithValue }) => {
    try {
      const response = await contentPageService.deleteContentPage(id)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete content page',
      )
    }
  },
)

const contentPageSlice = createSlice({
  name: 'contentPage',
  initialState: {
    allContentPages: { data: [], isLoading: false, error: null },
    getContentPageById: { data: null, isLoading: false, error: null },
    createContentPage: { isLoading: false, error: null },
    updateContentPage: { isLoading: false, error: null },
    deleteContentPage: { isLoading: false, error: null },
  },
  reducers: {
    clearContentPageById: (state) => {
      state.getContentPageById.data = null
      state.getContentPageById.error = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchContentPages.pending, (state) => {
      state.allContentPages.isLoading = true
      state.allContentPages.error = null
    })
    builder.addCase(fetchContentPages.fulfilled, (state, action) => {
      state.allContentPages.isLoading = false
      state.allContentPages.data = action.payload
    })
    builder.addCase(fetchContentPages.rejected, (state, action) => {
      state.allContentPages.isLoading = false
      state.allContentPages.error = action.payload
    })

    builder.addCase(getContentPageById.pending, (state) => {
      state.getContentPageById.isLoading = true
      state.getContentPageById.error = null
    })
    builder.addCase(getContentPageById.fulfilled, (state, action) => {
      state.getContentPageById.isLoading = false
      state.getContentPageById.data = action.payload
    })
    builder.addCase(getContentPageById.rejected, (state, action) => {
      state.getContentPageById.isLoading = false
      state.getContentPageById.error = action.payload
    })

    builder.addCase(createContentPage.pending, (state) => {
      state.createContentPage.isLoading = true
      state.createContentPage.error = null
    })
    builder.addCase(createContentPage.fulfilled, (state, action) => {
      state.createContentPage.isLoading = false
      state.allContentPages.data.push(action.payload)
    })
    builder.addCase(createContentPage.rejected, (state, action) => {
      state.createContentPage.isLoading = false
      state.createContentPage.error = action.payload
    })

    builder.addCase(updateContentPage.pending, (state) => {
      state.updateContentPage.isLoading = true
      state.updateContentPage.error = null
    })
    builder.addCase(updateContentPage.fulfilled, (state, action) => {
      state.updateContentPage.isLoading = false
      const index = state.allContentPages.data.findIndex(
        (item) => item._id === action.payload._id,
      )
      if (index !== -1) {
        state.allContentPages.data[index] = action.payload
      }
    })
    builder.addCase(updateContentPage.rejected, (state, action) => {
      state.updateContentPage.isLoading = false
      state.updateContentPage.error = action.payload
    })

    builder.addCase(deleteContentPage.pending, (state) => {
      state.deleteContentPage.isLoading = true
      state.deleteContentPage.error = null
    })
    builder.addCase(deleteContentPage.fulfilled, (state, action) => {
      state.deleteContentPage.isLoading = false
      state.allContentPages.data = state.allContentPages.data.filter(
        (item) => item._id !== action.meta.arg,
      )
    })
    builder.addCase(deleteContentPage.rejected, (state, action) => {
      state.deleteContentPage.isLoading = false
      state.deleteContentPage.error = action.payload
    })
  },
})

export const { clearContentPageById } = contentPageSlice.actions

export default contentPageSlice.reducer
